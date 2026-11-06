import { useState, useRef, useEffect, useCallback } from 'react';
import { MoreVertical, FolderOpen, Pencil, Download, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

function formatDate(dateValue) {
  if (!dateValue) return '';
  const date = new Date(dateValue);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function ModelCard({ model, onOpen, onRename, onDelete, onExport }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    function handleClickOutside(e) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        closeMenu();
      }
    }

    function handleEscape(e) {
      if (e.key === 'Escape') closeMenu();
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [menuOpen, closeMenu]);

  const thumb = model.thumbnail || model.thumbnailBlob || model.imageBlob;
  const [thumbnailUrl, setThumbnailUrl] = useState(() => {
    if (!thumb) return null;
    return typeof thumb === 'string' ? thumb : URL.createObjectURL(thumb);
  });

  useEffect(() => {
    if (!thumb) {
      setThumbnailUrl(null);
      return;
    }
    if (typeof thumb === 'string') {
      setThumbnailUrl(thumb);
      return;
    }
    const url = URL.createObjectURL(thumb);
    setThumbnailUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [thumb]);

  const menuItems = [
    {
      label: 'Open',
      icon: FolderOpen,
      action: () => {
        closeMenu();
        onOpen?.(model);
      },
    },
    {
      label: 'Rename',
      icon: Pencil,
      action: () => {
        closeMenu();
        onRename?.(model);
      },
    },
    {
      label: 'Download GLB',
      icon: Download,
      action: () => {
        closeMenu();
        onExport?.(model);
      },
    },
    {
      label: 'Delete',
      icon: Trash2,
      action: () => {
        closeMenu();
        onDelete?.(model);
      },
      danger: true,
    },
  ];

  return (
    <motion.div
      className="glass-card overflow-hidden relative group cursor-pointer"
      whileHover={{ y: -2, boxShadow: 'var(--shadow-lg)' }}
      transition={{ duration: 0.2 }}
    >
      {/* Thumbnail */}
      <div
        className="aspect-video overflow-hidden bg-black/10"
        onClick={() => onOpen?.(model)}
        role="button"
        tabIndex={0}
        aria-label={`Open ${model.title || 'Untitled model'}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpen?.(model);
          }
        }}
      >
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={model.title || 'Model thumbnail'}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FolderOpen
              size={32}
              className="opacity-30"
              style={{ color: 'var(--color-text-tertiary)' }}
              aria-hidden="true"
            />
          </div>
        )}
      </div>

      {/* Info bar */}
      <div className="p-3 flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-sm truncate">
            {model.title || 'Untitled'}
          </h3>
          <p
            className="text-xs mt-0.5"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            {formatDate(model.createdAt)}
          </p>
        </div>

        {/* Menu trigger */}
        <button
          ref={buttonRef}
          className="btn-icon flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((prev) => !prev);
          }}
          aria-label="Model actions"
          aria-expanded={menuOpen}
          aria-haspopup="true"
        >
          <MoreVertical size={16} aria-hidden="true" />
        </button>
      </div>

      {/* Dropdown menu */}
      {menuOpen && (
        <div
          ref={menuRef}
          className="glass-card-elevated absolute right-3 top-auto bottom-14 rounded-xl py-1 z-10 min-w-[160px] shadow-lg"
          role="menu"
        >
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-left transition-colors hover:bg-white/10 ${
                  item.danger ? 'text-red-500' : ''
                }`}
                onClick={item.action}
                role="menuitem"
              >
                <Icon size={15} aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
