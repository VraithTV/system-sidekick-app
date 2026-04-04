import { Sidebar } from '@/components/jarvis/Sidebar';
import { DashboardView } from '@/components/jarvis/views/DashboardView';
import { AppsView } from '@/components/jarvis/views/AppsView';
import { ClipsView } from '@/components/jarvis/views/ClipsView';
import { RoutinesView } from '@/components/jarvis/views/RoutinesView';
import { SettingsView } from '@/components/jarvis/views/SettingsView';
import { useJarvisStore } from '@/store/jarvisStore';

const views: Record<string, React.ComponentType> = {
  dashboard: DashboardView,
  apps: AppsView,
  clips: ClipsView,
  routines: RoutinesView,
  settings: SettingsView,
};

const Index = () => {
  const { activeView } = useJarvisStore();
  const View = views[activeView] || DashboardView;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Fake title bar for desktop app feel */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-[hsl(222,28%,4%)] border-b border-[hsl(222,15%,8%)] flex items-center px-3 z-50 titlebar-drag">
        <div className="flex gap-1.5 titlebar-no-drag">
          <div className="w-2.5 h-2.5 rounded-full bg-destructive/60 hover:bg-destructive transition-colors cursor-pointer" />
          <div className="w-2.5 h-2.5 rounded-full bg-warning/60 hover:bg-warning transition-colors cursor-pointer" />
          <div className="w-2.5 h-2.5 rounded-full bg-success/60 hover:bg-success transition-colors cursor-pointer" />
        </div>
        <p className="flex-1 text-center text-[9px] font-mono text-muted-foreground/20 tracking-widest uppercase">
          {useJarvisStore.getState().settings.wakeName} AI
        </p>
      </div>

      <div className="flex w-full pt-8">
        <Sidebar />
        <View />
      </div>
    </div>
  );
};

export default Index;
