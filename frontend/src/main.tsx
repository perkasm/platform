import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "./providers/theme-provider";
import { initSentry } from "./config/sentry";
import { initWebVitals } from "./utils/webVitals";
import App from "./App.tsx";
import "./index.css";

// Initialize Sentry before rendering the app
initSentry();

// Initialize Web Vitals tracking
initWebVitals();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <App />
    </ThemeProvider>
  </StrictMode>,
);

