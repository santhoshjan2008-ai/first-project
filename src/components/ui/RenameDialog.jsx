import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RenameDialog({ open, onClose, onRename, currentName = '' }) {
  const [name, setName] = useState(currentName);
  const inputRef = useRef(null);

  // Sync name with currentName when dialog opens
  useEffect(() => {
    if (open) {
      setName(currentName);
    }
  }, [open, currentName]);

  // Auto-focus and select text on open
  useEffect(() => {
    if (open && inputRef.current) {
      // Small delay to ensure the input is rendered
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed) {
      onRename(trimmed);
      onClose();
    }
  };

  const isValid = name.trim().length > 0;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Dialog */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="rename-dialog-title"
            className="glass-card-elevated relative max-w-sm w-full p-6 z-10"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <h2
              id="rename-dialog-title"
              className="font-heading font-bold text-lg text-[var(--color-text-primary)] mb-4"
            >
              Rename
            </h2>

            <form onSubmit={handleSubmit}>
              <label
                htmlFor="rename-input"
                className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5"
              >
                Name
              </label>
              <input
                ref={inputRef}
                id="rename-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field w-full mb-6"
                placeholder="Enter a name..."
                autoComplete="off"
                maxLength={100}
              />

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isValid}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
                >
                  Rename
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
