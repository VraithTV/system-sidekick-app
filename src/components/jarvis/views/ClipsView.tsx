import { useJarvisStore } from '@/store/jarvisStore';
import { Film, Clock, FolderOpen, Scissors } from 'lucide-react';
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

      {/* Clip settings summary */}
      <div className="glass rounded-lg p-4 flex flex-wrap gap-6">
        <div>
          <span className="text-[10px] text-muted-foreground font-mono uppercase">Buffer Length</span>
          <p className="text-sm font-mono text-foreground">{settings.clipDuration}s</p>
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground font-mono uppercase">Save Folder</span>
          <p className="text-sm font-mono text-foreground truncate max-w-[200px]">{settings.clipFolder}</p>
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground font-mono uppercase">Total Clips</span>
          <p className="text-sm font-mono text-foreground">{clips.length}</p>
        </div>
      </div>

      {/* Clips list */}
      <div className="space-y-2">
        {clips.map((clip) => (
          <div key={clip.id} className="glass rounded-lg p-4 flex items-center gap-4 hover:border-primary/30 transition-colors cursor-pointer">
            <div className="w-16 h-12 rounded bg-primary/5 border border-primary/10 flex items-center justify-center">
              <Film className="w-5 h-5 text-primary/50" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-mono text-foreground">{clip.filename}</p>
              <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground font-mono">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{clip.duration}s</span>
                <span>{clip.size}</span>
                <span>{clip.timestamp.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
