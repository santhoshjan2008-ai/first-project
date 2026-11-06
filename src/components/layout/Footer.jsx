import { Shield, Github, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="glass-card rounded-2xl mx-4 mb-4 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Top row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Left: Privacy statement */}
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
            <Shield className="w-4 h-4 flex-shrink-0 text-[var(--color-success)]" aria-hidden="true" />
            <span>Built with depth. No data leaves your device.</span>
          </div>

          {/* Right: Links */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors duration-200"
              aria-label="View source on GitHub"
            >
              <Github className="w-4 h-4" aria-hidden="true" />
              <span>GitHub</span>
            </a>
            <Link
              to="/about"
              className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors duration-200"
            >
              About
            </Link>
          </div>
        </div>

        {/* Divider */}
        <div className="divider my-4" />

        {/* Bottom row */}
        <div className="flex items-center justify-center gap-1 text-xs text-[var(--color-text-tertiary)]">
          <span>© 2024 DepthForge</span>
          <span>—</span>
          <span className="flex items-center gap-1">
            100% client-side
            <Heart className="w-3 h-3 text-pink-400" aria-hidden="true" />
          </span>
        </div>
      </div>
    </footer>
  );
}
