import { useState, useEffect } from 'react';

/**
 * Detect whether the primary pointing device is coarse (e.g. touch screen).
 * Updates reactively if the media query result changes (e.g. hybrid device switching mode).
 * @returns {boolean} true if the primary pointer is coarse
 */
export function useCoarsePointer() {
  const [isCoarse, setIsCoarse] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(pointer: coarse)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mql = window.matchMedia('(pointer: coarse)');

    const handler = (e) => {
      setIsCoarse(e.matches);
    };

    // Modern browsers
    if (mql.addEventListener) {
      mql.addEventListener('change', handler);
    } else if (mql.addListener) {
      // Safari < 14 fallback
      mql.addListener(handler);
    }

    // Sync initial state
    setIsCoarse(mql.matches);

    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener('change', handler);
      } else if (mql.removeListener) {
        mql.removeListener(handler);
      }
    };
  }, []);

  return isCoarse;
}
