import { useJarvisStore } from '@/store/jarvisStore';
import { Film, FolderOpen, Scissors } from 'lucide-react';

export const ClipsView = () => {
  const { clips, settings } = useJarvisStore();

  return (
    <div className="flex-1 p-5 overflow-y-auto">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-sm text-primary glow-text tracking-wider">CLIPS</h2>
        <div className="flex gap-1.5">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-secondary/60 text-muted-foreground text-xs font-mono border border-border/50 hover:text-foreground transition-colors">
            <FolderOpen className="w-3 h-3" />
            Folder
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 text-primary text-xs font-mono border border-primary/20 hover:bg-primary/15 transition-colors">
            <Scissors className="w-3 h-3" />
            Clip Now
          </button>
        </div>
      </div>

      {clips.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <Film className="w-8 h-8 text-muted-foreground/20 mb-3" />
          <p className="text-muted-foreground/60 font-mono text-xs">No clips saved yet</p>
          <p className="text-muted-foreground/30 font-mono text-[10px] mt-1">
            Say "{settings.wakeName}, clip that" to save a replay
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {clips.map((clip) => (
            <div key={clip.id} className="flex items-center gap-3 p-2.5 rounded-md bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer border border-border/20">
              <div className="w-12 h-9 rounded bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0">
                <Film className="w-4 h-4 text-primary/40" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono text-foreground truncate">{clip.filename}</p>
                <p className="text-[9px] text-muted-foreground/50 font-mono">{clip.duration}s · {clip.size}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
