import { useRef, useCallback, useEffect } from 'react';
import { useConvertStore } from '../store/convertStore';

/**
 * Hook that manages the depth estimation Web Worker.
 * Returns { estimate, cancel, isProcessing }.
 */
export function useDepthEstimator() {
  const workerRef = useRef(null);
  const { setDepthResult, setError, setStatus, setProgress, status } =
    useConvertStore();

  const isProcessing = status === 'processing';

  const createWorker = useCallback(() => {
    const worker = new Worker(
      new URL('../workers/depth.worker.js', import.meta.url),
      { type: 'module' }
    );
    return worker;
  }, []);

  const estimate = useCallback(
    (blob) => {
      // Terminate any existing worker
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }

      setStatus('processing');
      setProgress(0, 'Starting...');

      const worker = createWorker();
      workerRef.current = worker;

      worker.onmessage = (e) => {
        const { type, progress, message, depthData, width, height } = e.data;

        switch (type) {
          case 'progress':
            setProgress(progress, message);
            break;

          case 'result': {
            const float32 = new Float32Array(depthData);
            setDepthResult(float32, width, height);
            // Worker is done; keep it alive for potential reuse but
            // we could also terminate. Here we keep it for cached pipeline.
            break;
          }

          case 'error':
            setError(message || 'Depth estimation failed.');
            break;

          default:
            break;
        }
      };

      worker.onerror = (err) => {
        setError(err.message || 'An unexpected worker error occurred.');
      };

      worker.postMessage({ type: 'estimate', blob });
    },
    [createWorker, setDepthResult, setError, setStatus, setProgress]
  );

  const cancel = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    setStatus('idle');
    setProgress(0, '');
  }, [setStatus, setProgress]);

  // Clean up worker on unmount
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  return { estimate, cancel, isProcessing };
}
