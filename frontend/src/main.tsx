import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "./providers/theme-provider";
import { initSentry } from "./config/sentry";
import { initWebVitals } from "./utils/webVitals";
import { registerServiceWorker } from "./utils/service-worker";
import { reportPerformanceMetrics } from "./utils/performance";
import App from "./App.tsx";
import "./index.css";

// Initialize Sentry before rendering the app
initSentry();

// Initialize Web Vitals tracking
initWebVitals();

// Register Service Worker for caching
registerServiceWorker();

// Report performance metrics in development
if (process.env.NODE_ENV === 'development') {
  window.addEventListener('load', () => {
    setTimeout(reportPerformanceMetrics, 0);
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <App />
    </ThemeProvider>
  </StrictMode>,
);

