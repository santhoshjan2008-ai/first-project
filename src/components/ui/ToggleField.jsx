import { motion } from 'framer-motion';

export default function ToggleField({ label, checked, onChange, id, description }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onChange(!checked);
    }
  };

  return (
    <div className="flex items-start justify-between gap-4 py-1">
      {/* Label + description */}
      <div className="flex-1 min-w-0">
        <label
          htmlFor={id}
          className="text-sm font-medium text-[var(--color-text-primary)] cursor-pointer select-none"
        >
          {label}
        </label>
        {description && (
          <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Toggle switch */}
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        tabIndex={0}
        onClick={() => onChange(!checked)}
        onKeyDown={handleKeyDown}
        className={`
          relative flex-shrink-0 inline-flex items-center
          w-11 h-6 rounded-full transition-colors duration-200 ease-in-out
          focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2
          ${checked ? '' : 'bg-[var(--color-border-strong)]'}
        `}
        style={checked ? { background: 'var(--gradient-primary)' } : undefined}
        aria-label={label}
      >
        <motion.span
          className="inline-block w-4 h-4 rounded-full bg-white shadow-sm"
          animate={{
            x: checked ? 22 : 4,
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
          }}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}
