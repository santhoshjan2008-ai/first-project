import { useRef, useEffect } from 'react';
import { useConvertStore } from '../../store/convertStore';

export default function DepthPreview() {
  const depthData = useConvertStore((s) => s.depthData);
  const depthWidth = useConvertStore((s) => s.depthWidth);
  const depthHeight = useConvertStore((s) => s.depthHeight);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!depthData || !depthWidth || !depthHeight) return;

    canvas.width = depthWidth;
    canvas.height = depthHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.createImageData(depthWidth, depthHeight);
    const pixels = imageData.data;

    for (let i = 0; i < depthData.length; i++) {
      const val = Math.round(depthData[i] * 255);
      const clamped = Math.max(0, Math.min(255, val));
      const offset = i * 4;
      pixels[offset] = clamped;       // R
      pixels[offset + 1] = clamped;   // G
      pixels[offset + 2] = clamped;   // B
      pixels[offset + 3] = 255;       // A
    }

    ctx.putImageData(imageData, 0, 0);
  }, [depthData, depthWidth, depthHeight]);

  if (!depthData || !depthWidth || !depthHeight) {
    return (
      <div>
        <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-2">
          Depth Map
        </p>
        <div className="skeleton w-full rounded-xl aspect-video" />
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-2">
        Depth Map
      </p>
      <canvas
        ref={canvasRef}
        className="w-full rounded-xl aspect-video object-cover"
        aria-label="Depth map grayscale preview"
      />
    </div>
  );
}
