import { useState, useEffect, useCallback } from 'react';
import { Check, Sun, Moon, RotateCcw, Palette, Type, Sparkles, Eye } from 'lucide-react';
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
}: {
  preset: (typeof themePresets)[0];
  selected: boolean;
  onSelect: () => void;
}) => (
  <button
    onClick={onSelect}
    className={`relative rounded-xl border p-4 text-left transition-all duration-200 group ${
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
    {/* Mini window preview */}
    <div className="rounded-lg overflow-hidden border border-black/20 mb-3">
      <div className="h-3 flex items-center gap-1 px-2" style={{ background: preset.preview.card }}>
        <div className="w-1.5 h-1.5 rounded-full bg-red-500/60" />
        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/60" />
        <div className="w-1.5 h-1.5 rounded-full bg-green-500/60" />
      </div>
      <div className="flex h-14" style={{ background: preset.preview.bg }}>
        <div className="w-8 border-r border-black/10" style={{ background: preset.preview.card }}>
          <div className="mt-2 mx-1 space-y-1">
            <div className="h-1 rounded-full" style={{ background: preset.preview.accent, opacity: 0.7 }} />
            <div className="h-1 rounded-full bg-white/10" />
            <div className="h-1 rounded-full bg-white/10" />
          </div>
        </div>
        <div className="flex-1 p-2">
          <div className="h-2 w-12 rounded-sm mb-1.5" style={{ background: preset.preview.accent, opacity: 0.5 }} />
          <div className="grid grid-cols-2 gap-1">
            <div className="h-4 rounded-sm" style={{ background: preset.preview.card }} />
            <div className="h-4 rounded-sm" style={{ background: preset.preview.card }} />
          </div>
        </div>
      </div>
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
  const currentPreset = themePresets.find((p) => p.id === activePreset) || themePresets[0];
  const currentAccent = accentOptions.find((a) => a.id === activeAccent) || accentOptions[0];
  const currentFont = fontOptions.find((f) => f.id === activeFont) || fontOptions[0];

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Palette className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-sm text-primary tracking-[0.15em]">THEMES</h2>
              <p className="text-[10px] text-muted-foreground font-mono mt-0.5">Customise the look and feel of Jarvis</p>
            </div>
          </div>
          <button
            onClick={resetAll}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-mono text-muted-foreground border border-border hover:border-primary/30 hover:text-foreground transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Left column: presets + accents + fonts */}
          <div className="space-y-8">
            {/* Dark themes */}
            <section>
              <h3 className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground/60 tracking-widest uppercase mb-4">
                <Moon className="w-3.5 h-3.5" /> Dark Themes
              </h3>
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
                {darkPresets.map((p) => (
                  <PresetCard key={p.id} preset={p} selected={p.id === activePreset} onSelect={() => selectPreset(p.id)} />
                ))}
              </div>
            </section>

            {/* Light themes */}
            <section>
              <h3 className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground/60 tracking-widest uppercase mb-4">
                <Sun className="w-3.5 h-3.5" /> Light Themes
              </h3>
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
                {lightPresets.map((p) => (
                  <PresetCard key={p.id} preset={p} selected={p.id === activePreset} onSelect={() => selectPreset(p.id)} />
                ))}
              </div>
            </section>

            {/* Accent + Font side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Accent colour */}
              <section>
                <h3 className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground/60 tracking-widest uppercase mb-4">
                  <Sparkles className="w-3.5 h-3.5" /> Accent Colour
                </h3>
                <div className="bg-card rounded-xl p-5 border border-border">
                  <div className="grid grid-cols-6 gap-3">
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
                            className={`w-8 h-8 rounded-full transition-all duration-200 ${
                              selected ? 'ring-2 ring-offset-2 ring-offset-background scale-110' : 'hover:scale-110'
                            }`}
                            style={{
                              background: accent.preview,
                              ...(selected ? { boxShadow: `0 0 14px ${accent.preview}66` } : {}),
                            }}
                          />
                          <span className={`text-[8px] font-mono tracking-wide ${selected ? 'text-foreground' : 'text-muted-foreground/50'}`}>
                            {accent.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* Font selection */}
              <section>
                <h3 className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground/60 tracking-widest uppercase mb-4">
                  <Type className="w-3.5 h-3.5" /> Font
                </h3>
                <div className="space-y-2">
                  {fontOptions.map((font) => {
                    const selected = font.id === activeFont;
                    return (
                      <button
                        key={font.id}
                        onClick={() => selectFont(font.id)}
                        className={`w-full relative rounded-xl border p-3.5 text-left transition-all duration-200 ${
                          selected ? 'border-primary/40 bg-primary/5' : 'border-border hover:border-primary/20 hover:bg-card/60'
                        }`}
                      >
                        {selected && (
                          <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-primary-foreground" />
                          </div>
                        )}
                        <p className="text-[13px] text-foreground/85 font-medium" style={{ fontFamily: font.heading }}>
                          {font.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5" style={{ fontFamily: font.body }}>
                          The quick brown fox jumps over the lazy dog
                        </p>
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>
          </div>

          {/* Right column: sticky live preview + current selection summary */}
          <div className="space-y-5 lg:sticky lg:top-8 self-start">
            {/* Current selection summary */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground/60 tracking-widest uppercase mb-4">
                <Sparkles className="w-3.5 h-3.5" /> Active Theme
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground font-mono">Preset</span>
                  <span className="text-[12px] text-foreground/85 font-medium">{currentPreset.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground font-mono">Accent</span>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: currentAccent.preview }} />
                    <span className="text-[12px] text-foreground/85 font-medium">{currentAccent.name}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground font-mono">Font</span>
                  <span className="text-[12px] text-foreground/85 font-medium">{currentFont.name}</span>
                </div>
              </div>
            </div>

            {/* Live preview */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground/60 tracking-widest uppercase mb-4">
                <Eye className="w-3.5 h-3.5" /> Live Preview
              </h3>
              <div className="rounded-xl border border-border bg-background p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-primary" />
                  </div>
                  <div>
                    <p className="text-[12px] font-display text-foreground">Jarvis AI</p>
                    <p className="text-[9px] font-mono text-muted-foreground">Active</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="rounded-lg bg-secondary px-3 py-2">
                    <p className="text-[11px] text-secondary-foreground">Hey Jarvis, what's the weather like?</p>
                  </div>
                  <div className="rounded-lg bg-primary/10 border border-primary/20 px-3 py-2">
                    <p className="text-[11px] text-foreground">It's currently 18 degrees and partly cloudy.</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <div className="h-1.5 flex-1 rounded-full bg-primary/30" />
                  <div className="h-1.5 w-14 rounded-full bg-muted" />
                </div>
              </div>
            </div>

            {/* Colour tokens preview */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="text-[11px] font-mono text-muted-foreground/60 tracking-widest uppercase mb-4">
                Palette
              </h3>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { label: 'BG', cls: 'bg-background' },
                  { label: 'Card', cls: 'bg-card' },
                  { label: 'Primary', cls: 'bg-primary' },
                  { label: 'Muted', cls: 'bg-muted' },
                  { label: 'Border', cls: 'bg-border' },
                ].map((swatch) => (
                  <div key={swatch.label} className="flex flex-col items-center gap-1">
                    <div className={`w-full aspect-square rounded-lg border border-border/50 ${swatch.cls}`} />
                    <span className="text-[8px] font-mono text-muted-foreground/60">{swatch.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
