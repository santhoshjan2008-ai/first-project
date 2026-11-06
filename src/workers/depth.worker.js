import { pipeline, RawImage } from '@huggingface/transformers';

let depthPipeline = null;

function postProgress(progress, message) {
  self.postMessage({ type: 'progress', progress, message });
}

self.onmessage = async (e) => {
  const { type, blob } = e.data;

  if (type !== 'estimate') return;

  try {
    postProgress(5, 'Preparing image...');

    // Create or reuse the depth estimation pipeline
    if (!depthPipeline) {
      postProgress(10, 'Downloading depth model (~25–50 MB)...');

      depthPipeline = await pipeline(
        'depth-estimation',
        'Xenova/depth-anything-small-hf',
        {
          progress_callback: (progressInfo) => {
            // progressInfo may have { status, progress, ... }
            if (
              progressInfo &&
              typeof progressInfo.progress === 'number' &&
              progressInfo.status === 'progress'
            ) {
              // Map download progress (0-100) to our 10-60 range
              const mapped = 10 + (progressInfo.progress / 100) * 50;
              postProgress(
                Math.round(mapped),
                'Downloading depth model (~25–50 MB)...'
              );
            }
          },
        }
      );
    }

    postProgress(65, 'Estimating depth...');

    // Convert blob to RawImage
    const rawImage = await RawImage.fromBlob(blob);

    // Run depth estimation
    const result = await depthPipeline(rawImage);

    // Extract depth tensor data
    const depthTensor = result.predicted_depth;
    const rawData = depthTensor.data; // Float32Array or similar typed array

    // Determine dimensions — tensor shape could be [1, H, W] or [H, W]
    let width, height;
    const dims = depthTensor.dims || depthTensor.size;

    if (dims.length === 3) {
      // [1, H, W]
      height = dims[1];
      width = dims[2];
    } else if (dims.length === 2) {
      // [H, W]
      height = dims[0];
      width = dims[1];
    } else {
      throw new Error(`Unexpected depth tensor dimensions: [${dims.join(', ')}]`);
    }

    postProgress(85, 'Normalizing depth map...');

    // Min-max normalize to 0-1
    const float32 = new Float32Array(rawData.length);
    let minVal = Infinity;
    let maxVal = -Infinity;

    for (let i = 0; i < rawData.length; i++) {
      const v = rawData[i];
      if (v < minVal) minVal = v;
      if (v > maxVal) maxVal = v;
    }

    const range = maxVal - minVal || 1;
    for (let i = 0; i < rawData.length; i++) {
      float32[i] = (rawData[i] - minVal) / range;
    }

    postProgress(95, 'Finalizing...');

    // Transfer the buffer for zero-copy performance
    self.postMessage(
      {
        type: 'result',
        depthData: float32.buffer,
        width,
        height,
      },
      [float32.buffer]
    );
  } catch (err) {
    self.postMessage({
      type: 'error',
      message: err.message || 'Depth estimation failed.',
    });
  }
};
