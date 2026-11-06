const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

/**
 * Load and validate an image file.
 * @param {File} file
 * @returns {Promise<{blob: Blob, url: string, width: number, height: number}>}
 */
export function loadImage(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('No file provided.'));
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return reject(
        new Error(
          `Unsupported image format "${file.type || 'unknown'}". Please use JPEG, PNG, or WebP.`
        )
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      return reject(
        new Error(
          `File is too large (${sizeMB} MB). Maximum allowed size is 10 MB.`
        )
      );
    }

    const blob = new Blob([file], { type: file.type });
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      if (img.naturalWidth === 0 || img.naturalHeight === 0) {
        URL.revokeObjectURL(url);
        return reject(new Error('Image appears to be corrupt or has zero dimensions.'));
      }
      resolve({
        blob,
        url,
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to decode the image. The file may be corrupt.'));
    };

    img.src = url;
  });
}

/**
 * Resize an ImageBitmap to fit within maxSize, preserving aspect ratio.
 * Only resizes if the image is larger than maxSize in either dimension.
 * @param {ImageBitmap} imageBitmap
 * @param {number} maxSize
 * @returns {Promise<{canvas: OffscreenCanvas|HTMLCanvasElement, width: number, height: number, blob: Blob}>}
 */
export async function resizeImage(imageBitmap, maxSize = 1024) {
  let targetWidth = imageBitmap.width;
  let targetHeight = imageBitmap.height;

  if (targetWidth > maxSize || targetHeight > maxSize) {
    const scale = maxSize / Math.max(targetWidth, targetHeight);
    targetWidth = Math.round(targetWidth * scale);
    targetHeight = Math.round(targetHeight * scale);
  }

  let canvas;
  let ctx;

  if (typeof OffscreenCanvas !== 'undefined') {
    canvas = new OffscreenCanvas(targetWidth, targetHeight);
    ctx = canvas.getContext('2d');
  } else {
    canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    ctx = canvas.getContext('2d');
  }

  ctx.drawImage(imageBitmap, 0, 0, targetWidth, targetHeight);

  let blob;
  if (canvas instanceof OffscreenCanvas) {
    blob = await canvas.convertToBlob({ type: 'image/png' });
  } else {
    blob = await canvasToBlob(canvas, 'image/png');
  }

  return {
    canvas,
    width: targetWidth,
    height: targetHeight,
    blob,
  };
}

/**
 * Generate a small thumbnail blob from an image blob.
 * @param {Blob} blob
 * @param {number} size - Max dimension in px
 * @returns {Promise<Blob>}
 */
export async function generateThumbnail(blob, size = 200) {
  const imageBitmap = await createImageBitmap(blob);
  const { blob: thumbnailBlob } = await resizeImage(imageBitmap, size);
  imageBitmap.close();
  return thumbnailBlob;
}

/**
 * Promise wrapper around HTMLCanvasElement.toBlob.
 * @param {HTMLCanvasElement} canvas
 * @param {string} type
 * @returns {Promise<Blob>}
 */
export function canvasToBlob(canvas, type = 'image/png') {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert canvas to blob.'));
        }
      },
      type,
      0.92
    );
  });
}

/**
 * Safely revoke an object URL.
 * @param {string|null|undefined} url
 */
export function revokeURL(url) {
  if (url && typeof url === 'string' && url.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(url);
    } catch {
      // Already revoked or invalid — ignore
    }
  }
}
