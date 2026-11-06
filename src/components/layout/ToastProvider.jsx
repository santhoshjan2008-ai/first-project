import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ToastContext = createContext(null);

const TOAST_ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const TOAST_COLORS = {
  success: {
    icon: 'text-[var(--color-success)]',
    border: 'border-l-[3px] border-l-[var(--color-success)]',
  },
  error: {
    icon: 'text-[var(--color-danger)]',
    border: 'border-l-[3px] border-l-[var(--color-danger)]',
  },
  info: {
    icon: 'text-[var(--color-primary)]',
    border: 'border-l-[3px] border-l-[var(--color-primary)]',
  },
};

const MAX_TOASTS = 3;
const AUTO_DISMISS_MS = 4000;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idCounter = useRef(0);
  const timersRef = useRef(new Map());

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const addToast = useCallback(
    (message, type = 'info') => {
      const id = ++idCounter.current;

      setToasts((prev) => {
        const updated = [...prev, { id, message, type }];
        // If exceeding max, remove oldest
        if (updated.length > MAX_TOASTS) {
          const removed = updated.shift();
          if (removed) {
            const timer = timersRef.current.get(removed.id);
            if (timer) {
              clearTimeout(timer);
              timersRef.current.delete(removed.id);
            }
          }
        }
        return updated;
      });

      // Auto-dismiss
      const timer = setTimeout(() => {
        removeToast(id);
      }, AUTO_DISMISS_MS);
      timersRef.current.set(id, timer);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      {/* Toast container */}
      <div
        className="fixed bottom-6 right-6 z-[100] flex flex-col-reverse gap-3 max-w-sm w-full pointer-events-none"
        aria-live="polite"
        aria-label="Notifications"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => {
            const Icon = TOAST_ICONS[toast.type] || Info;
            const colors = TOAST_COLORS[toast.type] || TOAST_COLORS.info;

            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 80, scale: 0.95 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className={`glass-card-elevated pointer-events-auto flex items-start gap-3 p-4 ${colors.border}`}
                role="alert"
              >
                <Icon
                  className={`w-5 h-5 flex-shrink-0 mt-0.5 ${colors.icon}`}
                  aria-hidden="true"
                />
                <p className="flex-1 text-sm text-[var(--color-text-primary)] leading-snug">
                  {toast.message}
                </p>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="btn-icon flex-shrink-0 !w-7 !h-7 !min-w-0 !min-h-0"
                  aria-label="Dismiss notification"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export default ToastProvider;
