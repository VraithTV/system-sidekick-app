import { useJarvisStore } from '@/store/jarvisStore';
import { Film, FolderOpen, Scissors } from 'lucide-react';

export const ClipsView = () => {
  const { clips, settings } = useJarvisStore();

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-sm text-primary tracking-[0.15em]">CLIPS</h2>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-secondary text-foreground/60 text-[12px] font-mono border border-border hover:text-foreground transition-colors">
              <FolderOpen className="w-4 h-4" />
              Folder
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary/10 text-primary text-[12px] font-mono border border-primary/20 hover:bg-primary/15 transition-colors">
              <Scissors className="w-4 h-4" />
              Clip Now
            </button>
          </div>
        </div>

        {clips.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[55vh] text-center">
            <div className="w-20 h-20 rounded-2xl bg-card border border-border flex items-center justify-center mb-5">
              <Film className="w-8 h-8 text-muted-foreground/30" />
            </div>
            <p className="text-foreground/50 text-sm font-medium">No clips saved</p>
            <p className="text-muted-foreground font-mono text-[11px] mt-2 max-w-[260px]">
              Say "{settings.wakeName}, clip that" to save a replay buffer
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {clips.map((clip) => (
              <div key={clip.id} className="bg-card rounded-xl p-4 flex items-center gap-4 border border-border hover:border-primary/20 transition-colors cursor-pointer">
                <div className="w-14 h-10 rounded-lg bg-primary/8 border border-primary/15 flex items-center justify-center shrink-0">
                  <Film className="w-5 h-5 text-primary/40" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-mono text-foreground/85 truncate">{clip.filename}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">{clip.duration}s · {clip.size}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
