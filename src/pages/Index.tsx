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
      <Sidebar />
      <View />
    </div>
  );
};

export default Index;
