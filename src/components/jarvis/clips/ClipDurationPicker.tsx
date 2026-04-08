import { Minus, Plus } from 'lucide-react';

const presets = [15, 30, 45, 60, 90, 120, 180, 300];

type ClipDurationPickerProps = {
  value: number;
  onChange: (duration: number) => void;
};

export const ClipDurationPicker = ({ value, onChange }: ClipDurationPickerProps) => {
  const formatLabel = (s: number) => {
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return rem ? `${m}m ${rem}s` : `${m}m`;
  };

  const decrease = () => {
    const idx = presets.indexOf(value);
    if (idx > 0) onChange(presets[idx - 1]);
    else if (value > presets[0]) onChange(presets[presets.length - 1]);
  };

  const increase = () => {
    const idx = presets.indexOf(value);
    if (idx >= 0 && idx < presets.length - 1) onChange(presets[idx + 1]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button
          onClick={decrease}
          disabled={value <= presets[0]}
          className="w-8 h-8 rounded-lg flex items-center justify-center border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <div className="flex-1 text-center">
          <p className="text-lg font-display text-foreground/90">{formatLabel(value)}</p>
          <p className="text-[9px] font-mono text-muted-foreground/60 uppercase tracking-wider">Buffer Length</p>
        </div>
        <button
          onClick={increase}
          disabled={value >= presets[presets.length - 1]}
          className="w-8 h-8 rounded-lg flex items-center justify-center border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {presets.map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`px-2.5 py-1 rounded-md text-[10px] font-mono border transition-colors ${
              p === value
                ? 'bg-primary/15 text-primary border-primary/30'
                : 'bg-muted/30 text-muted-foreground border-border hover:bg-muted hover:text-foreground'
            }`}
          >
            {formatLabel(p)}
          </button>
        ))}
      </div>
    </div>
  );
};
