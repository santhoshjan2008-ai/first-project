/**
 * Generate a procedural image + depth map for demo/testing purposes.
 * Creates a 512x512 abstract landscape with overlapping shapes.
 * @returns {Promise<{imageBlob: Blob, imageUrl: string, depthData: Float32Array, width: number, height: number}>}
 */
export async function generateProceduralSample() {
  const SIZE = 512;
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d');

  // === Draw image ===

  // Background gradient — warm sunset
  const bgGrad = ctx.createLinearGradient(0, 0, 0, SIZE);
  bgGrad.addColorStop(0, '#1a0533');
  bgGrad.addColorStop(0.25, '#3d1259');
  bgGrad.addColorStop(0.5, '#c44e3c');
  bgGrad.addColorStop(0.75, '#e8964f');
  bgGrad.addColorStop(1, '#f7d794');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Procedural shapes
  const shapes = [
    { x: 130, y: 350, r: 120, color: 'rgba(70, 30, 80, 0.7)', depth: 0.3 },
    { x: 380, y: 320, r: 90, color: 'rgba(180, 60, 50, 0.6)', depth: 0.5 },
    { x: 256, y: 200, r: 150, color: 'rgba(220, 120, 60, 0.5)', depth: 0.7 },
    { x: 100, y: 150, r: 60, color: 'rgba(255, 180, 80, 0.4)', depth: 0.85 },
    { x: 400, y: 130, r: 70, color: 'rgba(255, 200, 120, 0.5)', depth: 0.8 },
    { x: 256, y: 380, r: 180, color: 'rgba(40, 15, 60, 0.6)', depth: 0.2 },
    { x: 200, y: 100, r: 40, color: 'rgba(255, 230, 180, 0.7)', depth: 0.95 },
    { x: 350, y: 420, r: 100, color: 'rgba(90, 30, 60, 0.5)', depth: 0.15 },
    { x: 180, y: 260, r: 80, color: 'rgba(200, 90, 60, 0.4)', depth: 0.6 },
    { x: 320, y: 220, r: 55, color: 'rgba(240, 160, 90, 0.5)', depth: 0.75 },
  ];

  // Draw shapes with soft radial gradients for an organic feel
  for (const shape of shapes) {
    const grad = ctx.createRadialGradient(
      shape.x,
      shape.y,
      0,
      shape.x,
      shape.y,
      shape.r
    );
    grad.addColorStop(0, shape.color);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(shape.x, shape.y, shape.r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Add some subtle "star" dots in the upper region
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  const starSeed = [
    [50, 30],
    [150, 50],
    [300, 20],
    [420, 60],
    [80, 80],
    [460, 40],
    [230, 45],
    [370, 75],
    [490, 25],
    [30, 65],
    [280, 55],
    [440, 90],
  ];
  for (const [sx, sy] of starSeed) {
    ctx.beginPath();
    ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw a large "moon/sun" circle
  const moonGrad = ctx.createRadialGradient(380, 100, 0, 380, 100, 45);
  moonGrad.addColorStop(0, 'rgba(255, 240, 200, 0.9)');
  moonGrad.addColorStop(0.7, 'rgba(255, 200, 140, 0.5)');
  moonGrad.addColorStop(1, 'rgba(255, 180, 100, 0)');
  ctx.fillStyle = moonGrad;
  ctx.beginPath();
  ctx.arc(380, 100, 45, 0, Math.PI * 2);
  ctx.fill();

  // === Generate depth data ===
  const depthData = new Float32Array(SIZE * SIZE);

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const idx = y * SIZE + x;

      // Base depth: gradient from top (far) to bottom (near)
      let depth = (y / SIZE) * 0.3;

      // Add gaussian bumps for each shape
      for (const shape of shapes) {
        const dx = x - shape.x;
        const dy = y - shape.y;
        const distSq = dx * dx + dy * dy;
        const sigma = shape.r * 0.6;
        const sigmaSq = sigma * sigma;
        const influence = shape.depth * Math.exp(-distSq / (2 * sigmaSq));
        depth += influence;
      }

      // Moon glow bump
      {
        const dx = x - 380;
        const dy = y - 100;
        const distSq = dx * dx + dy * dy;
        const sigma = 35;
        depth += 0.9 * Math.exp(-distSq / (2 * sigma * sigma));
      }

      // Concentric ring pattern — adds subtle wave texture
      const cx = x - SIZE / 2;
      const cy = y - SIZE / 2;
      const dist = Math.sqrt(cx * cx + cy * cy);
      depth += 0.05 * Math.sin(dist * 0.05) * 0.5 + 0.025;

      depthData[idx] = depth;
    }
  }

  // Normalize depth to 0-1
  let minD = Infinity;
  let maxD = -Infinity;
  for (let i = 0; i < depthData.length; i++) {
    if (depthData[i] < minD) minD = depthData[i];
    if (depthData[i] > maxD) maxD = depthData[i];
  }
  const range = maxD - minD || 1;
  for (let i = 0; i < depthData.length; i++) {
    depthData[i] = (depthData[i] - minD) / range;
  }

  // === Convert canvas to blob ===
  const imageBlob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to create procedural sample blob.'));
      },
      'image/png'
    );
  });

  const imageUrl = URL.createObjectURL(imageBlob);

  return {
    imageBlob,
    imageUrl,
    depthData,
    width: SIZE,
    height: SIZE,
  };
}
