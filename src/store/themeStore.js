import { create } from 'zustand';

function getInitialTheme() {
  try {
    const stored = localStorage.getItem('depthforge-theme');
    if (stored === 'dark' || stored === 'light') {
      return stored;
    }
  } catch {
    // localStorage unavailable
  }

  if (
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark';
  }

  return 'light';
}

const initialTheme = getInitialTheme();

// Apply the initial theme class immediately so there's no flash
if (typeof document !== 'undefined') {
  if (initialTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export const useThemeStore = create((set, get) => ({
  theme: initialTheme,

  toggleTheme: () => {
    const current = get().theme;
    const next = current === 'dark' ? 'light' : 'dark';

    if (typeof document !== 'undefined') {
      if (next === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }

    try {
      localStorage.setItem('depthforge-theme', next);
    } catch {
      // localStorage unavailable — theme still applies for this session
    }

    set({ theme: next });
  },
}));

export default useThemeStore;

