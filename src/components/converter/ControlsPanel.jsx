import { useState, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  ChevronDown,
  Download,
  Save,
  Plus,
} from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import { useConvertStore } from '../../store/convertStore';
import { useThemeStore } from '../../store/themeStore';
import PresetPicker from './PresetPicker';
import DepthPreview from './DepthPreview';

/* ---------- Reusable sub-components ---------- */

function CollapsibleSection({ title, defaultOpen = true, children }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const shouldReduceMotion = useReducedMotion();

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between py-2 group"
        aria-expanded={isOpen}
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-secondary)] transition-colors">
          {title}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 0 : -90 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
        >
          <ChevronDown className="h-4 w-4 text-[var(--color-text-tertiary)]" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={shouldReduceMotion ? { opacity: 1 } : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pb-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SliderField({ label, value, min, max, step, onChange, disabled = false, unit = '' }) {
  const displayValue =
    step < 1 ? value.toFixed(2) : String(Math.round(value));

  return (
    <div className={`mb-3 ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm text-[var(--color-text-secondary)]">{label}</label>
        <span className="text-xs font-medium text-[var(--color-text-tertiary)] tabular-nums">
          {displayValue}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        disabled={disabled}
        className="w-full h-2 rounded-full appearance-none cursor-pointer bg-[var(--color-surface)]
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-[var(--color-primary)]
          [&::-webkit-slider-thumb]:shadow-sm
          [&::-webkit-slider-thumb]:cursor-pointer
          [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4
          [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:bg-[var(--color-primary)]
          [&::-moz-range-thumb]:border-0
          [&::-moz-range-thumb]:cursor-pointer
        "
        aria-label={label}
      />
    </div>
  );
}

function ToggleField({ label, checked, onChange, disabled = false }) {
  return (
    <div className={`flex items-center justify-between mb-3 ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
      <span className="text-sm text-[var(--color-text-secondary)]">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`
          relative inline-flex h-6 w-11 shrink-0 items-center rounded-full
          transition-colors duration-200 focus:outline-none focus-visible:ring-2
          focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2
          ${checked ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-surface-solid)]'}
        `}
      >
        <span
          className={`
            inline-block h-4 w-4 rounded-full bg-white shadow-sm
            transition-transform duration-200
            ${checked ? 'translate-x-[22px]' : 'translate-x-[3px]'}
          `}
        />
      </button>
    </div>
  );
}

function SegmentedControl({ label, options, value, onChange }) {
  return (
    <div className="mb-3">
      <span className="block text-sm text-[var(--color-text-secondary)] mb-1.5">{label}</span>
      <div
        className="flex rounded-xl bg-[var(--color-surface)] p-0.5"
        role="radiogroup"
        aria-label={label}
      >
        {options.map((option) => {
          const isActive = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => onChange(option.value)}
              className={`
                flex-1 text-xs font-medium py-1.5 px-2 rounded-lg
                transition-all duration-150 text-center
                ${
                  isActive
                    ? 'bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)] shadow-sm'
                    : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'
                }
              `}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ThemeToggleRow() {
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  return (
    <ToggleField
      label="Dark mode"
      checked={theme === 'dark'}
      onChange={toggleTheme}
    />
  );
}

/* ---------- Main Component ---------- */

export default function ControlsPanel({
  onExportGLB,
  onExportOBJ,
  onSave,
  onConvertAnother,
  onSnapshot,
}) {
  const settings = useSettingsStore((s) => s.settings);
  const updateSetting = useSettingsStore((s) => s.updateSetting);
  const status = useConvertStore((s) => s.status);

  const hasMesh = status === 'ready' || status === 'done';

  return (
    <div className="glass-panel rounded-2xl overflow-y-auto max-h-full">
      <div className="p-4 space-y-0">
        {/* Presets */}
        <CollapsibleSection title="Presets" defaultOpen={true}>
          <PresetPicker />
        </CollapsibleSection>

        <div className="divider" />

        {/* Depth */}
        <CollapsibleSection title="Depth" defaultOpen={true}>
          <SliderField
            label="Depth Strength"
            value={settings.depthStrength}
            min={0}
            max={1}
            step={0.01}
            onChange={(v) => updateSetting('depthStrength', v)}
          />
          <SliderField
            label="Smoothing"
            value={settings.smoothing}
            min={0}
            max={10}
            step={1}
            onChange={(v) => updateSetting('smoothing', v)}
          />
          <ToggleField
            label="Invert Depth"
            checked={settings.invertDepth}
            onChange={(v) => updateSetting('invertDepth', v)}
          />
        </CollapsibleSection>

        <div className="divider" />

        {/* Mesh */}
        <CollapsibleSection title="Mesh" defaultOpen={true}>
          <SegmentedControl
            label="Resolution"
            options={[
              { label: '128', value: 128 },
              { label: '256', value: 256 },
              { label: '384', value: 384 },
            ]}
            value={settings.resolution}
            onChange={(v) => updateSetting('resolution', v)}
          />
          <ToggleField
            label="Solid Body"
            checked={settings.solidBody}
            onChange={(v) => updateSetting('solidBody', v)}
          />
          <SliderField
            label="Thickness"
            value={settings.thickness}
            min={0.01}
            max={0.3}
            step={0.01}
            onChange={(v) => updateSetting('thickness', v)}
            disabled={!settings.solidBody}
          />
        </CollapsibleSection>

        <div className="divider" />

        {/* Appearance */}
        <CollapsibleSection title="Appearance" defaultOpen={true}>
          <ToggleField
            label="Wireframe"
            checked={settings.wireframe}
            onChange={(v) => updateSetting('wireframe', v)}
          />
          <SegmentedControl
            label="Background"
            options={[
              { label: 'Neutral', value: 'neutral' },
              { label: 'Gradient', value: 'gradient' },
              { label: 'Transparent', value: 'transparent' },
            ]}
            value={settings.background}
            onChange={(v) => updateSetting('background', v)}
          />
          <ThemeToggleRow />
        </CollapsibleSection>

        <div className="divider" />

        {/* Depth Preview */}
        <CollapsibleSection title="Depth Preview" defaultOpen={false}>
          <DepthPreview />
        </CollapsibleSection>

        <div className="divider" />

        {/* Actions */}
        <CollapsibleSection title="Actions" defaultOpen={true}>
          <div className="space-y-2">
            <button
              type="button"
              onClick={onExportGLB}
              disabled={!hasMesh}
              className="btn-secondary w-full inline-flex items-center justify-center gap-2 text-sm disabled:opacity-40 disabled:pointer-events-none"
            >
              <Download className="h-4 w-4" />
              Download GLB
            </button>
            <button
              type="button"
              onClick={onExportOBJ}
              disabled={!hasMesh}
              className="btn-secondary w-full inline-flex items-center justify-center gap-2 text-sm disabled:opacity-40 disabled:pointer-events-none"
            >
              <Download className="h-4 w-4" />
              Download OBJ
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={!hasMesh}
              className="btn-primary w-full inline-flex items-center justify-center gap-2 text-sm disabled:opacity-40 disabled:pointer-events-none"
            >
              <Save className="h-4 w-4" />
              Save to Library
            </button>
            <button
              type="button"
              onClick={onConvertAnother}
              className="btn-ghost w-full inline-flex items-center justify-center gap-2 text-sm"
            >
              <Plus className="h-4 w-4" />
              Convert Another
            </button>
          </div>
        </CollapsibleSection>
      </div>
    </div>
  );
}
