import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Download,
  FileBox,
  FileText,
  Camera,
  Bookmark,
} from 'lucide-react';

export default function ExportMenu({ onExportGLB, onExportOBJ, onSnapshot, onSave }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  const toggleMenu = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const handleSelect = useCallback(
    (action) => {
      setOpen(false);
      action?.();
    },
    []
  );

  // Close on outside click
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const menuItems = [
    {
      label: 'Download GLB',
      icon: FileBox,
      action: onExportGLB,
    },
    {
      label: 'Download OBJ',
      icon: FileText,
      action: onExportOBJ,
    },
    {
      label: 'Save PNG Snapshot',
      icon: Camera,
      action: onSnapshot,
    },
    {
      label: 'Save to Library',
      icon: Bookmark,
      action: onSave,
    },
  ];

  return (
    <div className="relative inline-block" ref={menuRef}>
      {/* Trigger */}
      <button
        type="button"
        onClick={toggleMenu}
        className="btn-secondary inline-flex items-center gap-2 text-sm"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Export options"
      >
        <Download className="h-4 w-4" />
        Export
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={
              shouldReduceMotion
                ? { opacity: 1 }
                : { opacity: 0, scale: 0.95, y: -4 }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={
              shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.95, y: -4 }
            }
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="glass-card-elevated absolute bottom-full mb-2 right-0 rounded-xl py-1 min-w-[12rem] z-50"
            role="menu"
          >
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  type="button"
                  role="menuitem"
                  onClick={() => handleSelect(item.action)}
                  className="
                    w-full px-4 py-2.5 flex items-center gap-3
                    text-sm text-[var(--color-text-primary)]
                    hover:bg-[var(--color-surface-hover)]
                    transition-colors duration-100
                    text-left
                  "
                >
                  <Icon className="h-4 w-4 text-[var(--color-text-secondary)] shrink-0" strokeWidth={1.75} />
                  {item.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
