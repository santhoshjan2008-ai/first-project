import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { OBJExporter } from 'three/addons/exporters/OBJExporter.js';

/**
 * Create a temporary anchor element, trigger a download, then clean up.
 * @param {Blob} blob
 * @param {string} filename
 */
function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();

  // Clean up after a tick to ensure the download starts
  requestAnimationFrame(() => {
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  });
}

/**
 * Export a THREE.Scene (or Object3D) as a binary .glb file and trigger download.
 * @param {THREE.Object3D} scene
 * @returns {Promise<Blob>}
 */
export async function exportGLB(scene) {
  const exporter = new GLTFExporter();

  const glbBuffer = await new Promise((resolve, reject) => {
    exporter.parse(
      scene,
      (result) => resolve(result),
      (error) => reject(error),
      { binary: true }
    );
  });

  const blob = new Blob([glbBuffer], { type: 'model/gltf-binary' });
  triggerDownload(blob, 'model.glb');
  return blob;
}

/**
 * Export a THREE.Scene (or Object3D) as an .obj text file and trigger download.
 * @param {THREE.Object3D} scene
 * @returns {string}
 */
export function exportOBJ(scene) {
  const exporter = new OBJExporter();
  const objString = exporter.parse(scene);

  const blob = new Blob([objString], { type: 'text/plain' });
  triggerDownload(blob, 'model.obj');
  return objString;
}

/**
 * Export the current WebGL renderer canvas as a .png screenshot and trigger download.
 * @param {THREE.WebGLRenderer} renderer
 * @returns {Promise<Blob>}
 */
export async function exportPNG(renderer) {
  const canvas = renderer?.domElement || renderer;
  if (!canvas || typeof canvas.toBlob !== 'function') {
    throw new Error('Invalid renderer or canvas provided to exportPNG.');
  }

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) {
          resolve(b);
        } else {
          reject(new Error('Failed to capture screenshot from renderer canvas.'));
        }
      },
      'image/png'
    );
  });

  triggerDownload(blob, 'snapshot.png');
  return blob;
}
