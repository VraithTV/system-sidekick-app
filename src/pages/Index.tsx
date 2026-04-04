import { Sidebar } from '@/components/jarvis/Sidebar';
import { TitleBar } from '@/components/jarvis/TitleBar';
import { DashboardView } from '@/components/jarvis/views/DashboardView';
import { AppsView } from '@/components/jarvis/views/AppsView';
import { ClipsView } from '@/components/jarvis/views/ClipsView';
import { RoutinesView } from '@/components/jarvis/views/RoutinesView';
import { SettingsView } from '@/components/jarvis/views/SettingsView';
import { SystemView } from '@/components/jarvis/views/SystemView';
import { useJarvisStore } from '@/store/jarvisStore';

const views: Record<string, React.ComponentType> = {
  dashboard: DashboardView,
  apps: AppsView,
  clips: ClipsView,
  routines: RoutinesView,
  system: SystemView,
  settings: SettingsView,
};

const Index = () => {
  const { activeView } = useJarvisStore();
  const View = views[activeView] || DashboardView;

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <TitleBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <View />
      </div>
    </div>
  );
};

export default Index;
