import { create } from 'zustand';

export const useConvertStore = create((set) => ({
  status: 'idle', // 'idle' | 'processing' | 'ready' | 'error'
  image: null, // null | { blob, url, width, height }
  depthData: null, // null | Float32Array
  depthWidth: 0,
  depthHeight: 0,
  error: null,
  progress: 0,
  progressMessage: '',

  setImage: (image) =>
    set({
      image,
      depthData: null,
      depthWidth: 0,
      depthHeight: 0,
      error: null,
      status: image ? 'idle' : 'idle',
      progress: 0,
      progressMessage: '',
    }),

  setDepthResult: (depthData, depthWidth, depthHeight) =>
    set({
      depthData,
      depthWidth,
      depthHeight,
      status: 'ready',
      progress: 100,
      progressMessage: 'Done',
      error: null,
    }),

  setStatus: (status) => set({ status }),

  setError: (error) =>
    set({
      error,
      status: 'error',
      progress: 0,
      progressMessage: '',
    }),

  setProgress: (progress, progressMessage = '') =>
    set({ progress, progressMessage }),

  reset: () =>
    set({
      status: 'idle',
      image: null,
      depthData: null,
      depthWidth: 0,
      depthHeight: 0,
      error: null,
      progress: 0,
      progressMessage: '',
    }),
}));

export default useConvertStore;

