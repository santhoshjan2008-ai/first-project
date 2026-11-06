import { motion, useReducedMotion } from 'framer-motion';
import {
  RotateCcw,
  RefreshCw,
  Grid3X3,
  Maximize2,
  Minimize2,
  Camera,
} from 'lucide-react';

export default function ViewerToolbar({
  onResetView,
  onToggleAutoRotate,
  onToggleWireframe,
  onToggleFullscreen,
  onSnapshot,
  autoRotate,
  wireframe,
  isFullscreen,
}) {
  const shouldReduceMotion = useReducedMotion();

  const buttons = [
    {
      icon: RotateCcw,
      label: 'Reset View',
      onClick: onResetView,
      active: false,
    },
    {
      icon: RefreshCw,
      label: 'Auto-rotate',
      onClick: onToggleAutoRotate,
      active: autoRotate,
    },
    {
      icon: Grid3X3,
      label: 'Wireframe',
      onClick: onToggleWireframe,
      active: wireframe,
    },
    {
      icon: isFullscreen ? Minimize2 : Maximize2,
      label: isFullscreen ? 'Exit Fullscreen' : 'Fullscreen',
      onClick: onToggleFullscreen,
      active: false,
    },
    {
      icon: Camera,
      label: 'Snapshot PNG',
      onClick: onSnapshot,
      active: false,
    },
  ];

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay: 0.2 }}
      className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10"
    >
      <div className="glass-card-elevated rounded-full px-2 py-1.5 flex items-center gap-1">
        {buttons.map((btn) => {
          const Icon = btn.icon;
          return (
            <button
              key={btn.label}
              type="button"
              onClick={btn.onClick}
              title={btn.label}
              aria-label={btn.label}
              aria-pressed={btn.active || undefined}
              className={`
                btn-icon flex items-center justify-center
                h-9 w-9 rounded-xl transition-colors duration-150
                ${
                  btn.active
                    ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]'
                }
              `}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
