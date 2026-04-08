import { forwardRef, useCallback, useEffect, useState } from 'react';
import { Check, Eye, Layers3, Monitor, Moon, Palette, RotateCcw, SlidersHorizontal, Sparkles, Sun, Type } from 'lucide-react';
import {
  themePresets,
  accentOptions,
  fontOptions,
  loadThemePreference,
  applyTheme,
} from '@/lib/themes';
import { useJarvisStore } from '@/store/jarvisStore';
import { createT } from '@/lib/i18n';

const sectionLabel = 'flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground/60';

const PresetCard = forwardRef<HTMLButtonElement, {
  preset: (typeof themePresets)[number];
  selected: boolean;
  onSelect: () => void;
}>(function PresetCard({ preset, selected, onSelect }, ref) {
  return (
    <button
      ref={ref}
      onClick={onSelect}
      className={`group rounded-2xl border p-4 text-left transition-all duration-200 ${
        selected
          ? 'border-primary/40 bg-primary/5 shadow-[0_0_24px_hsl(var(--primary)/0.14)]'
          : 'border-border bg-card/40 hover:border-primary/20 hover:bg-card/70'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-[13px] tracking-[0.08em] text-foreground">{preset.name}</p>
          <p className="mt-1 text-[10px] font-mono text-muted-foreground">{preset.description}</p>
        </div>
        <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
          selected ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-transparent group-hover:border-primary/30'
        }`}>
          <Check className="h-3 w-3" />
        </div>
      </div>

      {/* Mini window preview */}
      <div className="mt-4 overflow-hidden rounded-xl border border-border/40" style={{ backgroundColor: preset.preview.bg }}>
        <div className="flex items-center justify-between border-b px-3 py-2" style={{ backgroundColor: preset.preview.card, borderColor: 'hsla(0,0%,100%,0.08)' }}>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: 'hsl(0 72% 58%)' }} />
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: 'hsl(43 95% 58%)' }} />
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: 'hsl(142 70% 45%)' }} />
          </div>
          <div className="h-2 w-16 rounded-full" style={{ backgroundColor: 'hsla(0,0%,100%,0.08)' }} />
        </div>
        <div className="grid grid-cols-[56px_1fr]">
          <div className="border-r px-2 py-3" style={{ backgroundColor: preset.preview.card, borderColor: 'hsla(0,0%,100%,0.08)' }}>
            <div className="space-y-2">
              <div className="h-1.5 rounded-full" style={{ backgroundColor: preset.preview.accent, opacity: 0.82 }} />
              <div className="h-1.5 rounded-full" style={{ backgroundColor: 'hsla(0,0%,100%,0.08)' }} />
              <div className="h-1.5 rounded-full" style={{ backgroundColor: 'hsla(0,0%,100%,0.08)' }} />
            </div>
          </div>
          <div className="space-y-2.5 p-3">
            <div className="h-2.5 w-20 rounded-full" style={{ backgroundColor: preset.preview.accent, opacity: 0.78 }} />
            <div className="grid grid-cols-2 gap-2">
              <div className="h-8 rounded-lg" style={{ backgroundColor: 'hsla(0,0%,100%,0.05)' }} />
              <div className="h-8 rounded-lg" style={{ backgroundColor: 'hsla(0,0%,100%,0.05)' }} />
            </div>
          </div>
        </div>
      </div>
    </button>
  );
});

export const ThemesView = () => {
  const [activePreset, setActivePreset] = useState('default');
  const [activeAccent, setActiveAccent] = useState('cyan');
  const [activeFont, setActiveFont] = useState('default');
  const { settings } = useJarvisStore();
  const t = createT(settings.language || 'en');

  useEffect(() => {
    const { presetId, accentId, fontId } = loadThemePreference();
    setActivePreset(presetId);
    setActiveAccent(accentId);
    setActiveFont(fontId);
  }, []);

  const selectPreset = (id: string) => { setActivePreset(id); applyTheme(id, activeAccent, activeFont); };
  const selectAccent = (id: string) => { setActiveAccent(id); applyTheme(activePreset, id, activeFont); };
  const selectFont = (id: string) => { setActiveFont(id); applyTheme(activePreset, activeAccent, id); };
  const resetAll = useCallback(() => { setActivePreset('default'); setActiveAccent('cyan'); setActiveFont('default'); applyTheme('default', 'cyan', 'default'); }, []);

  const darkPresets = themePresets.filter((p) => !p.light);
  const lightPresets = themePresets.filter((p) => p.light);
  const currentPreset = themePresets.find((p) => p.id === activePreset) || themePresets[0];
  const currentAccent = accentOptions.find((a) => a.id === activeAccent) || accentOptions[0];
  const currentFont = fontOptions.find((f) => f.id === activeFont) || fontOptions[0];

  const paletteSwatches = [
    { label: 'BG', cls: 'bg-background' },
    { label: 'Card', cls: 'bg-card' },
    { label: 'Primary', cls: 'bg-primary' },
    { label: 'Muted', cls: 'bg-muted' },
    { label: 'Border', cls: 'bg-border' },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 shadow-[0_0_18px_hsl(var(--primary)/0.14)]">
              <Palette className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-sm tracking-[0.15em] text-primary">{t('themes.title')}</h2>
              <p className="mt-1 text-[11px] font-mono text-muted-foreground">{t('themes.subtitle')}</p>
            </div>
          </div>
          <button onClick={resetAll} className="flex items-center gap-2 rounded-xl border border-border bg-card/40 px-4 py-2 text-[11px] font-mono text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground">
            <RotateCcw className="h-3 w-3" /> {t('themes.reset')}
          </button>
        </div>

        {/* Hero cockpit card */}
        <section className="rounded-[1.75rem] border border-border bg-card/45 p-6 backdrop-blur-sm">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_300px]">
            {/* Left: cockpit summary + live preview */}
            <div className="space-y-5">
              <div>
                <p className={sectionLabel}><Sparkles className="h-3.5 w-3.5" /> Theme cockpit</p>
                <h3 className="mt-3 font-display text-[28px] tracking-[0.12em] text-foreground">{currentPreset.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">Surface depth, glow colour, and typography all update together.</p>
              </div>

              {/* Live preview panel */}
              <div className="rounded-[1.5rem] border border-border/60 bg-background/80 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
                  <div>
                    <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-primary/70">Live shell preview</p>
                    <p className="mt-1 text-xs text-muted-foreground">How the assistant and sidebar feel with the active mix.</p>
                  </div>
                  <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.18em] text-primary">Active</div>
                </div>

                <div className="mt-5 overflow-hidden rounded-[1.35rem] border border-border/60 bg-card/80">
                  <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15">
                        <div className="h-4 w-4 rounded-full bg-primary shadow-[0_0_16px_hsl(var(--primary)/0.35)]" />
                      </div>
                      <div>
                        <p className="text-[12px] text-foreground" style={{ fontFamily: currentFont.heading }}>Jarvis Shell</p>
                        <p className="text-[10px] font-mono text-muted-foreground">Theme preview</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-primary/80" />
                      <div className="h-2.5 w-2.5 rounded-full bg-muted" />
                      <div className="h-2.5 w-2.5 rounded-full bg-secondary" />
                    </div>
                  </div>

                  <div className="grid gap-4 p-4 lg:grid-cols-[80px_minmax(0,1fr)]">
                    <div className="rounded-2xl border border-border/60 bg-background/80 p-3">
                      <div className="space-y-3">
                        {['Orb', 'Apps', 'Scenes', 'System'].map((item, i) => (
                          <div key={item} className={`rounded-xl px-2.5 py-2 text-[10px] font-mono uppercase tracking-[0.18em] ${i === 0 ? 'bg-primary/12 text-primary' : 'bg-card/60 text-muted-foreground'}`}>{item}</div>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.08fr)_200px]">
                      <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-primary/70">Chat</p>
                          <Eye className="h-4 w-4 text-primary" />
                        </div>
                        <div className="mt-4 space-y-3">
                          <div className="max-w-[78%] rounded-2xl bg-secondary px-4 py-3 text-[12px] text-secondary-foreground">Hey Jarvis, queue my playlist.</div>
                          <div className="ml-auto max-w-[82%] rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-[12px] text-foreground">Playlist ready. Everything is previewing live.</div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                          <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">Accent</p>
                          <div className="mt-4 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary" style={{ width: '72%' }} /></div>
                          <p className="mt-3 text-[11px] text-foreground">{currentAccent.name}</p>
                        </div>
                        <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                          <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">Font</p>
                          <p className="mt-3 text-lg text-foreground" style={{ fontFamily: currentFont.heading }}>JARVIS</p>
                          <p className="text-[11px] text-muted-foreground" style={{ fontFamily: currentFont.body }}>{currentFont.name}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right sidebar: active stack + what changes */}
            <div className="space-y-4">
              <div className="rounded-[1.4rem] border border-border bg-background/75 p-5">
                <p className={sectionLabel}><Layers3 className="h-3.5 w-3.5" /> Active stack</p>
                <div className="mt-5 space-y-3">
                  {[
                    { label: 'Preset', value: currentPreset.name },
                    { label: 'Accent', value: currentAccent.name, swatch: currentAccent.hsl },
                    { label: 'Font', value: currentFont.name },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-border/60 bg-card/70 px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">{item.label}</p>
                          <p className="mt-1 text-[14px] text-foreground">{item.value}</p>
                        </div>
                        {item.swatch && (
                          <div className="h-8 w-8 rounded-full border border-border/60" style={{ backgroundColor: `hsl(${item.swatch})`, boxShadow: `0 0 18px hsl(${item.swatch} / 0.3)` }} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.4rem] border border-border bg-background/75 p-5">
                <p className={sectionLabel}><Monitor className="h-3.5 w-3.5" /> What changes</p>
                <div className="mt-4 space-y-3">
                  {[
                    { label: 'Panels', detail: 'Cards, drawers, and control stacks pick up the preset surfaces.' },
                    { label: 'Signals', detail: 'Buttons, focus rings, and listening states use the active accent.' },
                    { label: 'Typography', detail: 'Headings and data labels swap together for a cleaner shell feel.' },
                  ].map((a) => (
                    <div key={a.label} className="rounded-2xl border border-border/60 bg-card/70 px-4 py-3">
                      <p className="text-[12px] text-foreground">{a.label}</p>
                      <p className="mt-1 text-[10px] font-mono leading-5 text-muted-foreground">{a.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Presets grid */}
        <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.18fr)_minmax(0,0.92fr)]">
          <section className="rounded-[1.6rem] border border-border bg-card/40 p-6">
            <p className={sectionLabel}><Moon className="h-3.5 w-3.5" /> Dark themes</p>
            <p className="mt-2 mb-5 text-sm text-muted-foreground">The main desktop personalities for Jarvis after dark.</p>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {darkPresets.map((p) => <PresetCard key={p.id} preset={p} selected={p.id === activePreset} onSelect={() => selectPreset(p.id)} />)}
            </div>
          </section>

          <section className="rounded-[1.6rem] border border-border bg-card/40 p-6">
            <p className={sectionLabel}><Sun className="h-3.5 w-3.5" /> Light themes</p>
            <p className="mt-2 mb-5 text-sm text-muted-foreground">Cleaner daytime options with the same Jarvis hierarchy.</p>
            <div className="grid gap-4 md:grid-cols-2">
              {lightPresets.map((p) => <PresetCard key={p.id} preset={p} selected={p.id === activePreset} onSelect={() => selectPreset(p.id)} />)}
            </div>
            <div className="mt-5 rounded-2xl border border-border/60 bg-background/75 p-4">
              <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-primary/70">Quick note</p>
              <p className="mt-2 text-[12px] leading-6 text-muted-foreground">Day mode keeps the Jarvis structure intact, so the desktop still looks intentional instead of flipping into a generic app skin.</p>
            </div>
          </section>
        </div>

        {/* Accent + Font + Palette row */}
        <div className="grid gap-6 xl:grid-cols-3">
          {/* Accent */}
          <section className="rounded-[1.6rem] border border-border bg-card/40 p-6">
            <p className={sectionLabel}><SlidersHorizontal className="h-3.5 w-3.5" /> Accent colour</p>
            <p className="mt-2 mb-5 text-sm text-muted-foreground">Signal colour for focus, highlights, and live states.</p>
            <div className="grid grid-cols-4 gap-3">
              {accentOptions.map((accent) => {
                const sel = accent.id === activeAccent;
                return (
                  <button key={accent.id} onClick={() => selectAccent(accent.id)} className={`flex flex-col items-center rounded-2xl border p-3 transition-all duration-200 ${sel ? 'border-primary/40 bg-primary/5' : 'border-border bg-background/70 hover:border-primary/20 hover:bg-card/80'}`}>
                    <div className="h-10 w-10 rounded-full border border-border/60" style={{ backgroundColor: `hsl(${accent.hsl})`, boxShadow: sel ? `0 0 20px hsl(${accent.hsl} / 0.35)` : undefined }} />
                    <p className={`mt-2 text-[10px] font-mono uppercase tracking-[0.14em] ${sel ? 'text-foreground' : 'text-muted-foreground'}`}>{accent.name}</p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Font */}
          <section className="rounded-[1.6rem] border border-border bg-card/40 p-6">
            <p className={sectionLabel}><Type className="h-3.5 w-3.5" /> Typography</p>
            <p className="mt-2 mb-5 text-sm text-muted-foreground">Pick the voice of the UI.</p>
            <div className="space-y-3">
              {fontOptions.map((font) => {
                const sel = font.id === activeFont;
                return (
                  <button key={font.id} onClick={() => selectFont(font.id)} className={`relative w-full rounded-2xl border p-4 text-left transition-all duration-200 ${sel ? 'border-primary/40 bg-primary/5 shadow-[0_0_18px_hsl(var(--primary)/0.12)]' : 'border-border bg-background/70 hover:border-primary/20 hover:bg-card/80'}`}>
                    <div className="absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
                      {sel ? <Check className="h-3 w-3" /> : <span className="h-2 w-2 rounded-full bg-primary/40" />}
                    </div>
                    <p className="text-[14px] text-foreground" style={{ fontFamily: font.heading }}>{font.name}</p>
                    <p className="mt-2 text-[11px] text-muted-foreground" style={{ fontFamily: font.body }}>The quick brown fox jumps over the lazy dog.</p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Palette */}
          <section className="rounded-[1.6rem] border border-border bg-card/40 p-6">
            <p className={sectionLabel}><Palette className="h-3.5 w-3.5" /> Surface palette</p>
            <p className="mt-2 mb-5 text-sm text-muted-foreground">A live read on the semantic colours behind the current preset.</p>
            <div className="grid grid-cols-5 gap-3">
              {paletteSwatches.map((s) => (
                <div key={s.label} className="space-y-2 text-center">
                  <div className={`aspect-square rounded-2xl border border-border/60 ${s.cls}`} />
                  <p className="text-[9px] font-mono uppercase tracking-[0.16em] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-2xl border border-border/60 bg-background/75 p-4">
              <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-primary/70">Current recipe</p>
              <p className="mt-2 text-[12px] leading-6 text-muted-foreground">{currentPreset.name} surfaces, {currentAccent.name.toLowerCase()} signal colour, and {currentFont.name.toLowerCase()} typography.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
