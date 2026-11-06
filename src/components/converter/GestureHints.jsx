import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

const MOUSE_HINTS = ['Drag to rotate', 'Scroll to zoom', 'Right-drag to pan'];
const TOUCH_HINTS = ['Drag to rotate', 'Pinch to zoom', 'Two fingers to pan'];

const DISPLAY_DURATION = 4000;

export default function GestureHints({ isCoarsePointer }) {
  const [visible, setVisible] = useState(true);
  const hasShown = useRef(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (hasShown.current) {
      setVisible(false);
      return;
    }

    hasShown.current = true;
    const timer = setTimeout(() => {
      setVisible(false);
    }, DISPLAY_DURATION);

    return () => clearTimeout(timer);
  }, []);

  const hints = isCoarsePointer ? TOUCH_HINTS : MOUSE_HINTS;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 flex-wrap justify-center"
          aria-live="polite"
        >
          {hints.map((hint) => (
            <span
              key={hint}
              className="glass-card px-3 py-1.5 text-xs text-[var(--color-text-secondary)] rounded-full whitespace-nowrap"
            >
              {hint}
            </span>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
