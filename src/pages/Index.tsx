import { Sidebar } from '@/components/jarvis/Sidebar';
import { WindowControls } from '@/components/jarvis/WindowControls';
import { OnboardingWizard, useOnboarding } from '@/components/jarvis/OnboardingWizard';
import { MaintenanceScreen } from '@/components/jarvis/MaintenanceScreen';
import { MAINTENANCE_MODE } from '@/config/maintenance';
import { DashboardView } from '@/components/jarvis/views/DashboardView';
import { AppsView } from '@/components/jarvis/views/AppsView';
import { ClipsView } from '@/components/jarvis/views/ClipsView';
import { RoutinesView } from '@/components/jarvis/views/RoutinesView';
import { SettingsView } from '@/components/jarvis/views/SettingsView';
import { SystemView } from '@/components/jarvis/views/SystemView';
import { useJarvisStore } from '@/store/jarvisStore';

const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI;

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

  // Show maintenance only on Electron when flag is true
  if (isElectron && MAINTENANCE_MODE) {
    return <MaintenanceScreen />;
  }

  if (!complete) {
    return <OnboardingWizard onComplete={finish} />;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <WindowControls />
        <View />
      </div>
    </div>
  );
};

export default Index;
