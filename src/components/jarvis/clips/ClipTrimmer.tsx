import { useState, useCallback } from 'react';
import { X, Scissors, Save, RotateCcw } from 'lucide-react';
import type { Clip } from '@/types/jarvis';

type ClipTrimmerProps = {
  clip: Clip;
  onClose: () => void;
  onSave: (clip: Clip, startTime: number, endTime: number) => void;
};

export const ClipTrimmer = ({ clip, onClose, onSave }: ClipTrimmerProps) => {
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(clip.duration);
  const [dragging, setDragging] = useState<'start' | 'end' | null>(null);

  const trimmedDuration = endTime - startTime;
  const startPercent = (startTime / clip.duration) * 100;
  const endPercent = (endTime / clip.duration) * 100;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${m}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  const handleTrackClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = ((e.clientX - rect.left) / rect.width) * 100;
    const time = (percent / 100) * clip.duration;

    const distToStart = Math.abs(percent - startPercent);
    const distToEnd = Math.abs(percent - endPercent);

    if (distToStart < distToEnd) {
      setStartTime(Math.max(0, Math.min(time, endTime - 1)));
    } else {
      setEndTime(Math.max(startTime + 1, Math.min(time, clip.duration)));
    }
  }, [clip.duration, startPercent, endPercent, startTime, endTime]);

  const handleReset = () => {
    setStartTime(0);
    setEndTime(clip.duration);
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-background/80 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-border bg-card/95 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h3 className="font-display text-sm tracking-[0.12em] text-foreground/90 uppercase">Trim Clip</h3>
            <p className="text-[10px] font-mono text-muted-foreground mt-0.5 truncate max-w-[300px]">{clip.filename}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Timeline */}
        <div className="px-5 py-6">
          {/* Waveform placeholder */}
          <div className="relative h-16 rounded-lg bg-muted/30 border border-border overflow-hidden mb-3">
            {/* Selected region */}
            <div
              className="absolute top-0 bottom-0 bg-primary/10 border-x-2 border-primary/40"
              style={{ left: `${startPercent}%`, width: `${endPercent - startPercent}%` }}
            />
            {/* Waveform bars (decorative) */}
            <div className="absolute inset-0 flex items-center gap-[2px] px-1">
              {Array.from({ length: 60 }, (_, i) => {
                const height = 20 + Math.sin(i * 0.5) * 30 + Math.random() * 20;
                const inRange = (i / 60) * 100 >= startPercent && (i / 60) * 100 <= endPercent;
                return (
                  <div
                    key={i}
                    className={`flex-1 rounded-full transition-colors ${inRange ? 'bg-primary/50' : 'bg-muted-foreground/15'}`}
                    style={{ height: `${height}%` }}
                  />
                );
              })}
            </div>
            {/* Click target */}
            <div className="absolute inset-0 cursor-pointer" onClick={handleTrackClick} />
          </div>

          {/* Slider track */}
          <div className="relative h-6 flex items-center">
            <div className="absolute inset-x-0 h-1 rounded-full bg-muted">
              <div
                className="absolute h-full bg-primary/40 rounded-full"
                style={{ left: `${startPercent}%`, width: `${endPercent - startPercent}%` }}
              />
            </div>
            {/* Start handle */}
            <input
              type="range"
              min={0}
              max={clip.duration}
              step={0.1}
              value={startTime}
              onChange={(e) => setStartTime(Math.min(Number(e.target.value), endTime - 1))}
              className="absolute inset-x-0 appearance-none bg-transparent pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-primary-foreground [&::-webkit-slider-thumb]:cursor-grab"
            />
            {/* End handle */}
            <input
              type="range"
              min={0}
              max={clip.duration}
              step={0.1}
              value={endTime}
              onChange={(e) => setEndTime(Math.max(Number(e.target.value), startTime + 1))}
              className="absolute inset-x-0 appearance-none bg-transparent pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-primary-foreground [&::-webkit-slider-thumb]:cursor-grab"
            />
          </div>

          {/* Time labels */}
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] font-mono text-primary">{formatTime(startTime)}</span>
            <span className="text-[10px] font-mono text-muted-foreground">
              Duration: {formatTime(trimmedDuration)}
            </span>
            <span className="text-[10px] font-mono text-primary">{formatTime(endTime)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-border">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-[11px] font-mono rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(clip, startTime, endTime)}
              className="flex items-center gap-1.5 px-4 py-2 text-[11px] font-mono rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              Save Trim
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
