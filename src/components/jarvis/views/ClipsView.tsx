import { useJarvisStore } from '@/store/jarvisStore';
import { Film, FolderOpen, Scissors } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ClipsView = () => {
  const { clips, settings } = useJarvisStore();

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg text-primary glow-text tracking-wider">CLIPS</h2>
          <p className="text-xs text-muted-foreground font-mono mt-1">Medal-style replay & clipping system</p>
        </div>
        <div className="flex gap-2">
          <Button variant="jarvis" size="sm"><FolderOpen className="w-3 h-3 mr-1" />Open Folder</Button>
          <Button variant="default" size="sm"><Scissors className="w-3 h-3 mr-1" />Clip Now</Button>
        </div>
      </div>

      {clips.length === 0 ? (
        <div className="glass rounded-lg p-8 text-center">
          <Film className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-mono text-sm">No clips saved yet.</p>
          <p className="text-muted-foreground/60 font-mono text-xs mt-1">
            Say "{settings.wakeName}, clip that" to save a replay clip.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {clips.map((clip) => (
            <div key={clip.id} className="glass rounded-lg p-4 flex items-center gap-4 hover:border-primary/30 transition-colors cursor-pointer">
              <div className="w-16 h-12 rounded bg-primary/5 border border-primary/10 flex items-center justify-center">
                <Film className="w-5 h-5 text-primary/50" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-mono text-foreground">{clip.filename}</p>
                <p className="text-[10px] text-muted-foreground font-mono">{clip.duration}s · {clip.size}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
