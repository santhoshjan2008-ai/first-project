const sliderStyles = `
  .df-slider {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 6px;
    border-radius: 9999px;
    background: var(--color-border);
    outline: none;
    transition: background 0.2s;
    cursor: pointer;
  }
  .df-slider:focus-visible {
    box-shadow: 0 0 0 3px var(--color-primary-light);
  }
  .df-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--color-primary);
    border: 2px solid white;
    cursor: pointer;
    box-shadow: var(--shadow-sm);
    transition: transform 0.15s, box-shadow 0.15s;
  }
  .df-slider::-webkit-slider-thumb:hover {
    transform: scale(1.15);
    box-shadow: var(--shadow-md);
  }
  .df-slider::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--color-primary);
    border: 2px solid white;
    cursor: pointer;
    box-shadow: var(--shadow-sm);
    transition: transform 0.15s, box-shadow 0.15s;
  }
  .df-slider::-moz-range-thumb:hover {
    transform: scale(1.15);
  }
  .df-slider::-moz-range-track {
    height: 6px;
    border-radius: 9999px;
    background: var(--color-border);
  }
  @media (pointer: coarse) {
    .df-slider::-webkit-slider-thumb {
      width: 28px;
      height: 28px;
    }
    .df-slider::-moz-range-thumb {
      width: 28px;
      height: 28px;
    }
    .df-slider {
      height: 8px;
      padding: 10px 0;
    }
  }
`;

export default function SliderField({ label, value, min = 0, max = 100, step = 1, onChange, unit = '', id }) {
  const displayValue = Number.isInteger(step) ? value : value.toFixed(2);

  return (
    <div className="w-full">
      <style>{sliderStyles}</style>
      <div className="flex items-center justify-between mb-2">
        <label
          htmlFor={id}
          className="text-sm font-medium text-[var(--color-text-primary)]"
        >
          {label}
        </label>
        <span className="text-sm font-mono text-[var(--color-text-secondary)] bg-[var(--color-surface)] px-2 py-0.5 rounded-md">
          {displayValue}{unit}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="df-slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label={label}
      />
    </div>
  );
}
