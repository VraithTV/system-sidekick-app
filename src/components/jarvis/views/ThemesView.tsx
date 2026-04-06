import { useState, useEffect, useCallback } from 'react';
import { Check, Sun, Moon, RotateCcw } from 'lucide-react';
import {
  themePresets,
  accentOptions,
  fontOptions,
  loadThemePreference,
  applyTheme,
} from '@/lib/themes';

const PresetCard = ({
  preset,
  selected,
  onSelect,
  lightBorder,
}: {
  preset: (typeof themePresets)[0];
  selected: boolean;
  onSelect: () => void;
  lightBorder?: boolean;
}) => (
  <button
    onClick={onSelect}
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
    <div className="flex gap-1.5 mb-3">
      <div
        className={`w-10 h-7 rounded ${lightBorder ? 'border border-black/10' : ''}`}
        style={{ background: preset.preview.bg }}
      />
      <div
        className={`w-10 h-7 rounded ${lightBorder ? 'border border-black/10' : ''}`}
        style={{ background: preset.preview.card }}
      />
      <div className="w-4 h-7 rounded" style={{ background: preset.preview.accent }} />
    </div>
    <p className="text-[13px] text-foreground/85 font-medium">{preset.name}</p>
    <p className="text-[10px] text-muted-foreground mt-0.5">{preset.description}</p>
  </button>
);

export const ThemesView = () => {
  const [activePreset, setActivePreset] = useState('default');
  const [activeAccent, setActiveAccent] = useState('cyan');
  const [activeFont, setActiveFont] = useState('default');

  useEffect(() => {
    const { presetId, accentId, fontId } = loadThemePreference();
    setActivePreset(presetId);
    setActiveAccent(accentId);
    setActiveFont(fontId);
  }, []);

  const selectPreset = (id: string) => {
    setActivePreset(id);
    applyTheme(id, activeAccent, activeFont);
  };

  const selectAccent = (id: string) => {
    setActiveAccent(id);
    applyTheme(activePreset, id, activeFont);
  };

  const selectFont = (id: string) => {
    setActiveFont(id);
    applyTheme(activePreset, activeAccent, id);
  };

  const resetAll = useCallback(() => {
    setActivePreset('default');
    setActiveAccent('cyan');
    setActiveFont('default');
    applyTheme('default', 'cyan', 'default');
  }, []);

  const darkPresets = themePresets.filter((p) => !p.light);
  const lightPresets = themePresets.filter((p) => p.light);

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-8 max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-sm text-primary tracking-[0.15em]">THEMES</h2>
          <button
            onClick={resetAll}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-mono text-muted-foreground border border-border hover:border-primary/30 hover:text-foreground transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset to Default
          </button>
        </div>

        {/* Dark themes */}
        <section className="mb-10">
          <h3 className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground/60 tracking-widest uppercase mb-4">
            <Moon className="w-3.5 h-3.5" /> Dark Themes
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {darkPresets.map((p) => (
              <PresetCard key={p.id} preset={p} selected={p.id === activePreset} onSelect={() => selectPreset(p.id)} />
            ))}
          </div>
        </section>

        {/* Light themes */}
        <section className="mb-10">
          <h3 className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground/60 tracking-widest uppercase mb-4">
            <Sun className="w-3.5 h-3.5" /> Light Themes
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {lightPresets.map((p) => (
              <PresetCard key={p.id} preset={p} selected={p.id === activePreset} onSelect={() => selectPreset(p.id)} lightBorder />
            ))}
          </div>
        </section>

        {/* Accent colour */}
        <section className="mb-10">
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
                      selected ? 'ring-2 ring-offset-2 ring-offset-background scale-110' : 'hover:scale-110'
                    }`}
                    style={{
                      background: accent.preview,
                      ...(selected ? { boxShadow: `0 0 14px ${accent.preview}66` } : {}),
                    }}
                  />
                  <span className={`text-[9px] font-mono tracking-wide ${selected ? 'text-foreground' : 'text-muted-foreground/50'}`}>
                    {accent.name}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Font selection */}
        <section className="mb-10">
          <h3 className="text-[11px] font-mono text-muted-foreground/60 tracking-widest uppercase mb-4">
            Font
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {fontOptions.map((font) => {
              const selected = font.id === activeFont;
              return (
                <button
                  key={font.id}
                  onClick={() => selectFont(font.id)}
                  className={`relative rounded-xl border p-4 text-left transition-all duration-200 ${
                    selected ? 'border-primary/40 bg-primary/5' : 'border-border hover:border-primary/20 hover:bg-card/60'
                  }`}
                >
                  {selected && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                  <p className="text-[13px] text-foreground/85 font-medium" style={{ fontFamily: font.heading }}>
                    {font.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1" style={{ fontFamily: font.body }}>
                    The quick brown fox jumps over the lazy dog
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Live preview */}
        <section>
          <h3 className="text-[11px] font-mono text-muted-foreground/60 tracking-widest uppercase mb-4">
            Preview
          </h3>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <div className="w-5 h-5 rounded-full bg-primary" />
              </div>
              <div>
                <p className="text-[13px] font-display text-foreground">Jarvis AI</p>
                <p className="text-[10px] font-mono text-muted-foreground">Active · Online</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="rounded-lg bg-secondary px-3 py-2">
                <p className="text-[12px] text-secondary-foreground">Hey Jarvis, what's the weather like?</p>
              </div>
              <div className="rounded-lg bg-primary/10 border border-primary/20 px-3 py-2">
                <p className="text-[12px] text-foreground">It's currently 18°C and partly cloudy. Expect light rain later this evening.</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <div className="h-2 flex-1 rounded-full bg-primary/30" />
              <div className="h-2 w-16 rounded-full bg-muted" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};