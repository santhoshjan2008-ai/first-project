import { useState, useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ThemeToggle';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/convert', label: 'Convert' },
  { to: '/library', label: 'Library' },
  { to: '/about', label: 'About' },
];

function NavLinkItem({ to, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `text-sm font-medium transition-colors duration-200 px-3 py-2 rounded-lg ${
          isActive
            ? 'text-[var(--color-primary)] bg-[var(--color-primary-light)]'
            : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]'
        }`
      }
    >
      {label}
    </NavLink>
  );
}

export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef(null);

  // Close drawer on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && drawerOpen) {
        setDrawerOpen(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [drawerOpen]);

  // Lock body scroll when drawer open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  // Focus trap inside drawer
  useEffect(() => {
    if (drawerOpen && drawerRef.current) {
      const firstFocusable = drawerRef.current.querySelector('button, a');
      if (firstFocusable) firstFocusable.focus();
    }
  }, [drawerOpen]);

  return (
    <nav className="sticky top-0 z-50 mx-4 mt-4 mb-0">
      <div className="glass-panel rounded-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group" aria-label="DepthForge home">
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="flex-shrink-0"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--color-primary)" />
                  <stop offset="100%" stopColor="var(--color-accent-cyan)" />
                </linearGradient>
              </defs>
              <path
                d="M16 4L28 26H4L16 4Z"
                fill="url(#logo-gradient)"
                opacity="0.9"
              />
              <path
                d="M16 10L22 22H10L16 10Z"
                fill="var(--color-bg-base)"
                opacity="0.5"
              />
            </svg>
            <span className="font-heading font-bold text-lg gradient-text">
              DepthForge
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLinkItem key={link.to} to={link.to} label={link.label} />
            ))}
          </div>

          {/* Desktop right section */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {/* Mobile hamburger */}
            <button
              className="btn-icon md:hidden"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={drawerOpen}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setDrawerOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer */}
            <motion.div
              ref={drawerRef}
              className="fixed top-0 right-0 bottom-0 w-72 max-w-[80vw] glass-panel z-50 flex flex-col"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
                <span className="font-heading font-bold gradient-text">Menu</span>
                <button
                  className="btn-icon"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close navigation menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer links */}
              <div className="flex flex-col gap-1 p-4 flex-1">
                {navLinks.map((link) => (
                  <NavLinkItem
                    key={link.to}
                    to={link.to}
                    label={link.label}
                    onClick={() => setDrawerOpen(false)}
                  />
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
