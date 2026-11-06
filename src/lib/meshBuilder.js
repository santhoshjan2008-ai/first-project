import * as THREE from 'three';

/**
 * Apply an averaged box blur to a Float32Array representing 2D data.
 * @param {Float32Array} data
 * @param {number} w - width
 * @param {number} h - height
 * @param {number} radius - blur radius in pixels
 * @returns {Float32Array}
 */
export function boxBlur(data, w, h, radius) {
  if (radius <= 0) return new Float32Array(data);

  const out = new Float32Array(data.length);
  const temp = new Float32Array(data.length);

  // Horizontal pass
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0;
      let count = 0;
      const x0 = Math.max(0, x - radius);
      const x1 = Math.min(w - 1, x + radius);
      for (let ix = x0; ix <= x1; ix++) {
        sum += data[y * w + ix];
        count++;
      }
      temp[y * w + x] = sum / count;
    }
  }

  // Vertical pass
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      let sum = 0;
      let count = 0;
      const y0 = Math.max(0, y - radius);
      const y1 = Math.min(h - 1, y + radius);
      for (let iy = y0; iy <= y1; iy++) {
        sum += temp[iy * w + x];
        count++;
      }
      out[y * w + x] = sum / count;
    }
  }

  return out;
}

/**
 * Bilinear sample from a Float32Array grid.
 */
function sampleBilinear(data, w, h, u, v) {
  const x = u * (w - 1);
  const y = v * (h - 1);

  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = Math.min(x0 + 1, w - 1);
  const y1 = Math.min(y0 + 1, h - 1);

  const fx = x - x0;
  const fy = y - y0;

  const v00 = data[y0 * w + x0];
  const v10 = data[y0 * w + x1];
  const v01 = data[y1 * w + x0];
  const v11 = data[y1 * w + x1];

  const top = v00 * (1 - fx) + v10 * fx;
  const bottom = v01 * (1 - fx) + v11 * fx;

  return top * (1 - fy) + bottom * fy;
}

/**
 * Build a 3D mesh group from an image and its depth data.
 * @param {object} params
 * @param {string} params.imageUrl - URL of the original image texture
 * @param {Float32Array} params.depthData - Normalized 0-1 depth values
 * @param {number} params.depthWidth
 * @param {number} params.depthHeight
 * @param {number} params.imageWidth
 * @param {number} params.imageHeight
 * @param {object} params.settings - From settingsStore
 * @returns {THREE.Group}
 */
export function buildMesh({
  imageUrl,
  depthData,
  depthWidth,
  depthHeight,
  imageWidth,
  imageHeight,
  settings,
}) {
  const {
    depthStrength,
    resolution,
    smoothing,
    invertDepth,
    solidBody,
    thickness,
  } = settings;

  const group = new THREE.Group();

  // Determine aspect ratio and geometry dimensions
  const aspect = imageWidth / imageHeight;
  const planeWidth = aspect >= 1 ? 1 : aspect;
  const planeHeight = aspect >= 1 ? 1 / aspect : 1;

  const segX = resolution;
  const segY = Math.round(resolution / aspect) || resolution;

  // Process depth data
  let processedDepth = new Float32Array(depthData);

  if (invertDepth) {
    for (let i = 0; i < processedDepth.length; i++) {
      processedDepth[i] = 1.0 - processedDepth[i];
    }
  }

  if (smoothing > 0) {
    processedDepth = boxBlur(processedDepth, depthWidth, depthHeight, smoothing);
  }

  // === Front face ===
  const frontGeo = new THREE.PlaneGeometry(planeWidth, planeHeight, segX, segY);
  const posAttr = frontGeo.attributes.position;

  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const y = posAttr.getY(i);

    // Map vertex position to UV (0-1 range)
    const u = (x / planeWidth) + 0.5;
    const v = 1.0 - ((y / planeHeight) + 0.5); // flip Y for image coordinates

    const depth = sampleBilinear(processedDepth, depthWidth, depthHeight, u, v);
    posAttr.setZ(i, depth * depthStrength);
  }

  frontGeo.computeVertexNormals();

  // Load texture
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(imageUrl);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;

  const frontMat = new THREE.MeshStandardMaterial({
    map: texture,
    side: THREE.FrontSide,
  });

  const frontMesh = new THREE.Mesh(frontGeo, frontMat);
  group.add(frontMesh);

  // === Solid body (back face + side walls) ===
  if (solidBody) {
    const backZ = -thickness;

    const sideMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#444444'),
      side: THREE.FrontSide,
    });

    // Back face — flat plane at z = -thickness, flipped
    const backGeo = new THREE.PlaneGeometry(planeWidth, planeHeight);
    const backMesh = new THREE.Mesh(backGeo, sideMat);
    backMesh.rotation.y = Math.PI; // face backward
    backMesh.position.z = backZ;
    group.add(backMesh);

    // === Side walls ===
    // Extract edge vertices from front geometry
    const pw = planeWidth;
    const ph = planeHeight;

    // Helper to build a side wall strip
    function buildSideWall(edgeVertices, isFlipped) {
      const vertCount = edgeVertices.length;
      const positions = new Float32Array(vertCount * 2 * 3); // top & bottom rows
      const indices = [];

      for (let i = 0; i < vertCount; i++) {
        const [ex, ey, ez] = edgeVertices[i];

        // Front edge vertex
        positions[i * 3 + 0] = ex;
        positions[i * 3 + 1] = ey;
        positions[i * 3 + 2] = ez;

        // Back edge vertex (same x, y but at z = backZ)
        positions[(vertCount + i) * 3 + 0] = ex;
        positions[(vertCount + i) * 3 + 1] = ey;
        positions[(vertCount + i) * 3 + 2] = backZ;
      }

      for (let i = 0; i < vertCount - 1; i++) {
        const a = i;
        const b = i + 1;
        const c = vertCount + i;
        const d = vertCount + i + 1;

        if (isFlipped) {
          indices.push(a, c, b);
          indices.push(b, c, d);
        } else {
          indices.push(a, b, c);
          indices.push(b, d, c);
        }
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geo.setIndex(indices);
      geo.computeVertexNormals();

      return new THREE.Mesh(geo, sideMat);
    }

    // Collect edge vertices from the front geometry
    // PlaneGeometry vertices go left-to-right, top-to-bottom
    // Grid dimensions: (segX + 1) columns, (segY + 1) rows
    const cols = segX + 1;
    const rows = segY + 1;

    // Top edge: first row (y = +planeHeight/2), left to right
    const topEdge = [];
    for (let c = 0; c < cols; c++) {
      const idx = c; // first row
      topEdge.push([
        posAttr.getX(idx),
        posAttr.getY(idx),
        posAttr.getZ(idx),
      ]);
    }

    // Bottom edge: last row, left to right
    const bottomEdge = [];
    for (let c = 0; c < cols; c++) {
      const idx = (rows - 1) * cols + c;
      bottomEdge.push([
        posAttr.getX(idx),
        posAttr.getY(idx),
        posAttr.getZ(idx),
      ]);
    }

    // Left edge: first column, top to bottom
    const leftEdge = [];
    for (let r = 0; r < rows; r++) {
      const idx = r * cols;
      leftEdge.push([
        posAttr.getX(idx),
        posAttr.getY(idx),
        posAttr.getZ(idx),
      ]);
    }

    // Right edge: last column, top to bottom
    const rightEdge = [];
    for (let r = 0; r < rows; r++) {
      const idx = r * cols + (cols - 1);
      rightEdge.push([
        posAttr.getX(idx),
        posAttr.getY(idx),
        posAttr.getZ(idx),
      ]);
    }

    // Build walls with correct face winding for outward normals
    group.add(buildSideWall(topEdge, true));      // top wall: faces up/outward
    group.add(buildSideWall(bottomEdge, false));   // bottom wall: faces down/outward
    group.add(buildSideWall(leftEdge, false));     // left wall: faces left/outward
    group.add(buildSideWall(rightEdge, true));     // right wall: faces right/outward
  }

  // Center the group so the object is roughly at the origin
  const box = new THREE.Box3().setFromObject(group);
  const center = box.getCenter(new THREE.Vector3());
  group.position.sub(center);

  return group;
}
