import { useJarvisStore } from '@/store/jarvisStore';
import { Film, FolderOpen, Scissors } from 'lucide-react';

export const ClipsView = () => {
  const { clips, settings } = useJarvisStore();

  return (
    <div className="flex-1 p-5 overflow-y-auto grid-bg relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,hsl(222,28%,5%)_100%)] pointer-events-none" />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xs text-primary/80 tracking-[0.2em]">CLIPS</h2>
          <div className="flex gap-1.5">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[hsl(222,20%,9%)] text-muted-foreground/50 text-[10px] font-mono border border-[hsl(222,15%,12%)] hover:text-muted-foreground transition-colors">
              <FolderOpen className="w-3 h-3" />
              Folder
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/8 text-primary/70 text-[10px] font-mono border border-primary/10 hover:bg-primary/12 hover:text-primary transition-colors">
              <Scissors className="w-3 h-3" />
              Clip
            </button>
          </div>
        </div>

        {clips.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[65vh] text-center">
            <div className="w-14 h-14 rounded-xl bg-[hsl(222,20%,9%)] border border-[hsl(222,15%,12%)] flex items-center justify-center mb-4">
              <Film className="w-6 h-6 text-muted-foreground/15" />
            </div>
            <p className="text-muted-foreground/40 font-mono text-[11px]">No clips saved</p>
            <p className="text-muted-foreground/20 font-mono text-[9px] mt-1 max-w-[200px]">
              Say "{settings.wakeName}, clip that" to save a replay
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {clips.map((clip) => (
              <div key={clip.id} className="glass-hover rounded-md p-2.5 flex items-center gap-3 cursor-pointer">
                <div className="w-12 h-9 rounded bg-primary/5 border border-primary/8 flex items-center justify-center shrink-0">
                  <Film className="w-4 h-4 text-primary/30" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-mono text-foreground/70 truncate">{clip.filename}</p>
                  <p className="text-[9px] text-muted-foreground/30 font-mono">{clip.duration}s · {clip.size}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
