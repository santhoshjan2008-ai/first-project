import { useState, useEffect } from 'react';

/**
 * Check whether the browser supports WebGL (2 or 1).
 * Runs once on mount, returns a boolean.
 * @returns {boolean} true if WebGL is supported
 */
export function useWebGLSupport() {
  const [supported, setSupported] = useState(true); // optimistic default

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl =
        canvas.getContext('webgl2') ||
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl');

      setSupported(!!gl);

      // Clean up context if possible
      if (gl) {
        const ext = gl.getExtension('WEBGL_lose_context');
        if (ext) {
          ext.loseContext();
        }
      }
    } catch {
      setSupported(false);
    }
  }, []);

  return supported;
}
