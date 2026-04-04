import { Sidebar } from '@/components/jarvis/Sidebar';
import { WindowControls } from '@/components/jarvis/WindowControls';
import { OnboardingWizard, useOnboarding } from '@/components/jarvis/OnboardingWizard';
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
  const { complete, finish } = useOnboarding();
  const View = views[activeView] || DashboardView;

  if (!complete) {
    return <OnboardingWizard onComplete={finish} />;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <WindowControls />
        <View />
      </div>
    </div>
  );
};

export default Index;
