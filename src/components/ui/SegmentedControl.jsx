import { useId } from 'react';
import { motion } from 'framer-motion';

export default function SegmentedControl({ options, value, onChange, id }) {
  const groupId = id || useId();
  const activeIndex = options.findIndex((opt) => opt.value === value);

  return (
    <div
      role="radiogroup"
      aria-label="Segmented control"
      id={groupId}
      className="glass-card !p-1 rounded-xl flex w-full relative"
    >
      {/* Animated active indicator */}
      {activeIndex >= 0 && (
        <motion.div
          className="absolute top-1 bottom-1 rounded-lg"
          style={{
            background: 'var(--gradient-primary)',
            width: `calc(${100 / options.length}% - 0px)`,
          }}
          animate={{
            x: `calc(${activeIndex * 100}%)`,
          }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 30,
          }}
          aria-hidden="true"
        />
      )}

      {/* Segment buttons */}
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            role="radio"
            aria-checked={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(e) => {
              let newIndex;
              if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                newIndex = (activeIndex + 1) % options.length;
                onChange(options[newIndex].value);
              } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                newIndex = (activeIndex - 1 + options.length) % options.length;
                onChange(options[newIndex].value);
              }
            }}
            className={`
              relative z-10 flex-1 px-3 py-2 text-sm font-medium rounded-lg
              transition-colors duration-200 select-none
              focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-1
              ${
                isActive
                  ? 'text-white'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }
            `}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
