import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence, useReducedMotion } from 'framer-motion';

const PEEK_HEIGHT = 80;
const SNAP_HALF = 0.5;
const SNAP_FULL_OFFSET = 60;

function getSnapPoints(windowHeight) {
  return {
    peek: windowHeight - PEEK_HEIGHT,
    half: windowHeight * (1 - SNAP_HALF),
    full: SNAP_FULL_OFFSET,
  };
}

export default function BottomSheet({ children }) {
  const [windowHeight, setWindowHeight] = useState(
    typeof window !== 'undefined' ? window.innerHeight : 800
  );
  const shouldReduceMotion = useReducedMotion();

  const snap = getSnapPoints(windowHeight);
  const [currentSnap, setCurrentSnap] = useState('peek');
  const y = useMotionValue(snap.peek);
  const sheetRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      const h = window.innerHeight;
      setWindowHeight(h);
      const newSnap = getSnapPoints(h);
      y.set(newSnap[currentSnap]);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentSnap, y]);

  const backdropOpacity = useTransform(
    y,
    [snap.full, snap.half, snap.peek],
    [0.3, 0.2, 0]
  );

  const handleDragEnd = useCallback(
    (_, info) => {
      const currentY = y.get();
      const velocity = info.velocity.y;

      // Fast swipe detection
      if (velocity < -500) {
        if (currentSnap === 'peek') {
          setCurrentSnap('half');
          y.set(snap.half);
        } else {
          setCurrentSnap('full');
          y.set(snap.full);
        }
        return;
      }
      if (velocity > 500) {
        if (currentSnap === 'full') {
          setCurrentSnap('half');
          y.set(snap.half);
        } else {
          setCurrentSnap('peek');
          y.set(snap.peek);
        }
        return;
      }

      // Nearest snap point
      const distances = [
        { name: 'peek', dist: Math.abs(currentY - snap.peek) },
        { name: 'half', dist: Math.abs(currentY - snap.half) },
        { name: 'full', dist: Math.abs(currentY - snap.full) },
      ];
      distances.sort((a, b) => a.dist - b.dist);
      const nearest = distances[0].name;
      setCurrentSnap(nearest);
      y.set(snap[nearest]);
    },
    [currentSnap, snap, y]
  );

  const handleBackdropClick = useCallback(() => {
    setCurrentSnap('peek');
    y.set(snap.peek);
  }, [snap, y]);

  const isExpanded = currentSnap === 'half' || currentSnap === 'full';

  return (
    <>
      {/* Backdrop overlay */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            key="sheet-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
            onClick={handleBackdropClick}
            className="fixed inset-0 z-[29] bg-black/20"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Bottom sheet */}
      <motion.div
        ref={sheetRef}
        className="fixed left-0 right-0 z-30 glass-panel rounded-t-2xl flex flex-col"
        style={{
          y,
          height: windowHeight,
          top: 0,
          touchAction: 'none',
        }}
        drag="y"
        dragConstraints={{
          top: snap.full,
          bottom: snap.peek,
        }}
        dragElastic={0.1}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { type: 'spring', stiffness: 300, damping: 30 }
        }
      >
        {/* Drag handle */}
        <div className="flex items-center justify-center py-3 cursor-grab active:cursor-grabbing shrink-0">
          <div className="w-10 h-1 rounded-full bg-[var(--color-text-tertiary)] opacity-60" />
        </div>

        {/* Content */}
        <div
          className={`
            flex-1 px-4 pb-safe-area-bottom
            ${currentSnap === 'full' ? 'overflow-y-auto' : 'overflow-hidden'}
          `}
        >
          {children}
        </div>
      </motion.div>
    </>
  );
}
