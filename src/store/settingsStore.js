import { create } from 'zustand';

export const DEFAULT_SETTINGS = {
  depthStrength: 0.35,
  resolution: 256,
  smoothing: 2,
  invertDepth: false,
  solidBody: true,
  thickness: 0.08,
  wireframe: false,
  autoRotate: false,
  background: 'gradient',
};

function loadSettings() {
  try {
    const raw = localStorage.getItem('depthforge-settings');
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch {
    // localStorage unavailable or corrupt JSON
  }
  return { ...DEFAULT_SETTINGS };
}

function persistSettings(settings) {
  try {
    localStorage.setItem('depthforge-settings', JSON.stringify(settings));
  } catch {
    // localStorage unavailable
  }
}

export const useSettingsStore = create((set, get) => ({
  settings: loadSettings(),

  updateSetting: (key, value) => {
    const next = { ...get().settings, [key]: value };
    persistSettings(next);
    set({ settings: next });
  },

  applyPreset: (presetObj) => {
    const next = { ...DEFAULT_SETTINGS, ...presetObj };
    persistSettings(next);
    set({ settings: next });
  },

  resetSettings: () => {
    const next = { ...DEFAULT_SETTINGS };
    persistSettings(next);
    set({ settings: next });
  },
}));

export default useSettingsStore;

