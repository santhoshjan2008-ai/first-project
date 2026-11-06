import { useMemo } from 'react';
import { User, Package, Mountain, Palette, Type, Sliders } from 'lucide-react';
import { PRESETS } from '../../lib/presets';
import { useSettingsStore } from '../../store/settingsStore';

const PRESET_ICONS = {
  Portrait: User,
  Product: Package,
  Landscape: Mountain,
  Artwork: Palette,
  Logo: Type,
  Balanced: Sliders,
};

const PRESET_ICON_FALLBACK = Sliders;

export default function PresetPicker() {
  const settings = useSettingsStore((s) => s.settings);
  const applyPreset = useSettingsStore((s) => s.applyPreset);

  const presetEntries = useMemo(
    () =>
      Object.entries(PRESETS).map(([name, values]) => ({
        name,
        values,
      })),
    []
  );

  const activePresetName = useMemo(() => {
    for (const entry of presetEntries) {
      const vals = entry.values;
      const keys = Object.keys(vals);
      const isMatch = keys.every((key) => {
        if (typeof vals[key] === 'number') {
          return Math.abs(settings[key] - vals[key]) < 0.001;
        }
        return settings[key] === vals[key];
      });
      if (isMatch) return entry.name;
    }
    return null;
  }, [settings, presetEntries]);

  return (
    <div className="grid grid-cols-2 xl:grid-cols-3 gap-2">
      {presetEntries.map((entry) => {
        const Icon = PRESET_ICONS[entry.name] || PRESET_ICON_FALLBACK;
        const isActive = activePresetName === entry.name;

        return (
          <button
            key={entry.name}
            type="button"
            onClick={() => applyPreset(entry.values)}
            className={`
              glass-card px-3 py-2 text-sm rounded-xl
              flex items-center gap-2 transition-all duration-150
              hover:bg-[var(--color-surface-hover)]
              ${
                isActive
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                  : 'text-[var(--color-text-secondary)]'
              }
            `}
            aria-pressed={isActive}
            aria-label={`Apply ${entry.name} preset`}
          >
            <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            <span className="truncate">{entry.name}</span>
          </button>
        );
      })}
    </div>
  );
}
