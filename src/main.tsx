import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { loadThemePreference, applyTheme } from './lib/themes';

// Catch unhandled network errors on startup so VPN/offline doesn't cause a white screen
window.addEventListener('unhandledrejection', (event) => {
  if (
    event.reason instanceof TypeError &&
    /fetch|network|failed to fetch|ERR_NAME|ERR_CONNECTION/i.test(event.reason.message)
  ) {
    console.warn('[Jarvis] Suppressed network error on startup:', event.reason.message);
    event.preventDefault();
  }
});

// Apply saved theme before first render
const { presetId, accentId } = loadThemePreference();
applyTheme(presetId, accentId);

createRoot(document.getElementById("root")!).render(<App />);
