import { useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';
import { useConvertStore } from '../../store/convertStore';

const STEPS = [
  { key: 'preparing', label: 'Preparing image' },
  { key: 'downloading', label: 'Downloading depth model' },
  { key: 'estimating', label: 'Estimating depth' },
  { key: 'building', label: 'Building mesh' },
];

function getActiveStepIndex(progress, progressMessage) {
  const msg = (progressMessage || '').toLowerCase();
  if (msg.includes('build') || msg.includes('mesh')) return 3;
  if (msg.includes('estimat') || msg.includes('depth') || msg.includes('running')) return 2;
  if (msg.includes('download') || msg.includes('model') || msg.includes('load')) return 1;
  if (progress > 75) return 3;
  if (progress > 30) return 2;
  if (progress > 5) return 1;
  return 0;
}

export default function ProcessingOverlay({ onCancel }) {
  const progress = useConvertStore((s) => s.progress);
  const progressMessage = useConvertStore((s) => s.progressMessage);
  const shouldReduceMotion = useReducedMotion();

  const activeStep = useMemo(
    () => getActiveStepIndex(progress, progressMessage),
    [progress, progressMessage]
  );

  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <AnimatePresence>
      <motion.div
        key="processing-overlay"
        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        role="alert"
        aria-live="polite"
        aria-label="Processing in progress"
      >
        <motion.div
          initial={shouldReduceMotion ? {} : { scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={shouldReduceMotion ? {} : { scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="glass-card-elevated w-full max-w-sm mx-4 p-6"
        >
          {/* Step indicators */}
          <div className="space-y-3 mb-6">
            {STEPS.map((step, index) => {
              const isCompleted = index < activeStep;
              const isCurrent = index === activeStep;

              return (
                <div
                  key={step.key}
                  className="flex items-center gap-3"
                >
                  {/* Step icon */}
                  <div
                    className={`
                      flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold
                      transition-colors duration-300
                      ${
                        isCompleted
                          ? 'bg-[var(--color-success)] text-white'
                          : isCurrent
                            ? 'bg-[var(--color-primary)] text-white'
                            : 'bg-[var(--color-surface)] text-[var(--color-text-tertiary)]'
                      }
                    `}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : isCurrent ? (
                      <motion.div
                        animate={shouldReduceMotion ? {} : { rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      >
                        <Loader2 className="h-4 w-4" />
                      </motion.div>
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>

                  {/* Step label */}
                  <span
                    className={`
                      text-sm transition-colors duration-300
                      ${
                        isCompleted
                          ? 'text-[var(--color-success)] line-through'
                          : isCurrent
                            ? 'text-[var(--color-primary)] font-medium'
                            : 'text-[var(--color-text-tertiary)]'
                      }
                    `}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-[var(--color-text-secondary)] truncate mr-2">
                {progressMessage || 'Processing…'}
              </span>
              <span className="text-xs font-semibold text-[var(--color-text-primary)] tabular-nums shrink-0">
                {Math.round(clampedProgress)}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-[var(--color-surface)] overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: 'var(--gradient-primary)',
                }}
                initial={{ width: 0 }}
                animate={{ width: `${clampedProgress}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* First run note */}
          <p className="text-[11px] text-[var(--color-text-tertiary)] text-center mb-4">
            First run downloads ~25–50 MB model weights
          </p>

          {/* Cancel button */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary text-sm px-5"
              aria-label="Cancel depth estimation"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
