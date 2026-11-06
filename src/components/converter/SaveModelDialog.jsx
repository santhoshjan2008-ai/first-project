import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Bookmark, Save, X } from 'lucide-react';
import { useConvertStore } from '../../store/convertStore';

export default function SaveModelDialog({ open, onClose, onSave }) {
  const [title, setTitle] = useState('Untitled model');
  const inputRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();
  const image = useConvertStore((s) => s.image);

  useEffect(() => {
    if (open) {
      setTitle('Untitled model');
      // Auto-focus and select all after a short delay for animation
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleSubmit = useCallback(
    (e) => {
      e?.preventDefault();
      const trimmed = title.trim();
      if (trimmed) {
        onSave(trimmed);
      }
    },
    [title, onSave]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  const thumbnailUrl = image?.url || image || null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="save-dialog-overlay"
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
          onKeyDown={handleKeyDown}
          role="dialog"
          aria-modal="true"
          aria-label="Save to Library"
        >
          <motion.div
            initial={shouldReduceMotion ? {} : { scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={shouldReduceMotion ? {} : { scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="glass-card-elevated w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-primary-light)]">
                  <Bookmark className="h-4 w-4 text-[var(--color-primary)]" />
                </div>
                <h2 className="font-heading text-lg font-semibold text-[var(--color-text-primary)]">
                  Save to Library
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="btn-icon h-9 w-9 flex items-center justify-center rounded-xl text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] transition-colors"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Thumbnail preview */}
            {thumbnailUrl && (
              <div className="mb-4 rounded-xl overflow-hidden bg-[var(--color-surface)]">
                <img
                  src={thumbnailUrl}
                  alt="Model preview"
                  className="w-full h-32 object-cover"
                />
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <label
                htmlFor="model-title"
                className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5"
              >
                Model title
              </label>
              <input
                ref={inputRef}
                id="model-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field w-full mb-5"
                placeholder="Enter a name for your model"
                maxLength={100}
                required
              />

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-sm inline-flex items-center gap-2"
                  disabled={!title.trim()}
                >
                  <Save className="h-4 w-4" />
                  Save
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
