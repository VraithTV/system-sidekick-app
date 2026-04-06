import { useEffect, useState } from 'react';

const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI;

/**
 * Listens for the Electron close event and shows a confirmation dialog.
 * Returns state to render the dialog in React.
 */
export function useCloseConfirmation() {
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    if (!isElectron) return;
    const api = (window as any).electronAPI;
    api.onConfirmClose(() => setShowDialog(true));
  }, []);

  const minimizeToTray = () => {
    setShowDialog(false);
    (window as any).electronAPI.closeAction('tray');
  };

  const quitApp = () => {
    setShowDialog(false);
    (window as any).electronAPI.closeAction('quit');
  };

  const cancel = () => setShowDialog(false);

  return { showDialog, minimizeToTray, quitApp, cancel };
}
