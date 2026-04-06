import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import {
  themePresets,
  accentOptions,
  loadThemePreference,
  applyTheme,
} from '@/lib/themes';

export const ThemesView = () => {
  const [activePreset, setActivePreset] = useState('default');
  const [activeAccent, setActiveAccent] = useState('cyan');

  useEffect(() => {
    const { presetId, accentId } = loadThemePreference();
    setActivePreset(presetId);
    setActiveAccent(accentId);
  }, []);

  const selectPreset = (id: string) => {
    setActivePreset(id);
    applyTheme(id, activeAccent);
  };

  const selectAccent = (id: string) => {
    setActiveAccent(id);
    applyTheme(activePreset, id);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-8 max-w-3xl">
        <h2 className="font-display text-sm text-primary tracking-[0.15em] mb-8">THEMES</h2>

        {/* Colour schemes */}
        <section className="mb-10">
          <h3 className="text-[11px] font-mono text-muted-foreground/60 tracking-widest uppercase mb-4">
            Colour Scheme
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {themePresets.map((preset) => {
              const selected = preset.id === activePreset;
              return (
                <button
                  key={preset.id}
                  onClick={() => selectPreset(preset.id)}
                  className={`relative rounded-xl border p-4 text-left transition-all duration-200 ${
                    selected
                      ? 'border-primary/40 bg-primary/5 shadow-[0_0_16px_hsl(var(--primary)/0.1)]'
                      : 'border-border hover:border-primary/20 hover:bg-card/60'
                  }`}
                >
                  {selected && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}

                  {/* Mini preview */}
                  <div className="flex gap-1.5 mb-3">
                    <div
                      className="w-10 h-7 rounded"
                      style={{ background: preset.preview.bg }}
                    />
                    <div
                      className="w-10 h-7 rounded"
                      style={{ background: preset.preview.card }}
                    />
                    <div
                      className="w-4 h-7 rounded"
                      style={{ background: preset.preview.accent }}
                    />
                  </div>

                  <p className="text-[13px] text-foreground/85 font-medium">{preset.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{preset.description}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Accent colour */}
        <section>
          <h3 className="text-[11px] font-mono text-muted-foreground/60 tracking-widest uppercase mb-4">
            Accent Colour
          </h3>
          <div className="flex flex-wrap gap-3">
            {accentOptions.map((accent) => {
              const selected = accent.id === activeAccent;
              return (
                <button
                  key={accent.id}
                  onClick={() => selectAccent(accent.id)}
                  className="group flex flex-col items-center gap-1.5"
                  title={accent.name}
                >
                  <div
                    className={`w-9 h-9 rounded-full transition-all duration-200 ${
                      selected
                        ? 'ring-2 ring-offset-2 ring-offset-background scale-110'
                        : 'hover:scale-110'
                    }`}
                    style={{
                      background: accent.preview,
                      ...(selected ? { boxShadow: `0 0 14px ${accent.preview}66` } : {}),
                      ...(selected ? { ringColor: accent.preview } as any : {}),
                    }}
                  />
                  <span
                    className={`text-[9px] font-mono tracking-wide ${
                      selected ? 'text-foreground' : 'text-muted-foreground/50'
                    }`}
                  >
                    {accent.name}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};