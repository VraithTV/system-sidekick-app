import { useState } from 'react';
import { Sidebar } from '@/components/jarvis/Sidebar';
import { WindowControls } from '@/components/jarvis/WindowControls';
import { OnboardingWizard, useOnboarding } from '@/components/jarvis/OnboardingWizard';
import { MaintenanceScreen, useMaintenanceMode } from '@/components/jarvis/MaintenanceScreen';
import { ForceUpdateScreen, useForceUpdate } from '@/components/jarvis/ForceUpdateScreen';
import { VoiceAssistantManager } from '@/components/jarvis/VoiceAssistantManager';
import { DashboardView } from '@/components/jarvis/views/DashboardView';
import { ChatView } from '@/components/jarvis/views/ChatView';
import { AppsView } from '@/components/jarvis/views/AppsView';
import { ClipsView } from '@/components/jarvis/views/ClipsView';
import { RoutinesView } from '@/components/jarvis/views/RoutinesView';
import { SettingsView } from '@/components/jarvis/views/SettingsView';
import { SystemView } from '@/components/jarvis/views/SystemView';
import { ThemesView } from '@/components/jarvis/views/ThemesView';
import { useJarvisStore } from '@/store/jarvisStore';
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';
import { useIsMobile } from '@/hooks/use-mobile';
import { Menu, X } from 'lucide-react';

const views: Record<string, React.ComponentType> = {
  dashboard: DashboardView,
  chat: ChatView,
  apps: AppsView,
  clips: ClipsView,
  themes: ThemesView,
  routines: RoutinesView,
  system: SystemView,
  settings: SettingsView,
};

const Index = () => {
  const { activeView } = useJarvisStore();
  const { complete, finish } = useOnboarding();
  const { isMaintenance, loading } = useMaintenanceMode();
  const { needsUpdate, minVersion, loading: updateLoading } = useForceUpdate();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useGlobalShortcuts();
  const View = views[activeView] || DashboardView;

  if (loading || updateLoading) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary/60 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (needsUpdate) {
    return <ForceUpdateScreen minVersion={minVersion} />;
  }

  if (isMaintenance) {
    return <MaintenanceScreen />;
  }

  if (!complete) {
    return <OnboardingWizard onComplete={finish} />;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <VoiceAssistantManager />

      {/* Desktop sidebar */}
      {!isMobile && <Sidebar />}

      {/* Mobile sidebar overlay */}
      {isMobile && mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="relative z-10">
            <Sidebar onNavClick={() => setMobileMenuOpen(false)} />
          </div>
          <div className="flex-1 bg-black/60" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        {isMobile ? (
          <div className="flex items-center justify-between px-4 h-12 border-b border-border bg-card shrink-0">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-muted-foreground">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <span className="text-[11px] font-display tracking-[0.2em] text-muted-foreground/70">JARVIS</span>
            <div className="w-5" />
          </div>
        ) : (
          <WindowControls />
        )}
        <View />
      </div>
    </div>
  );
};

export default Index;
