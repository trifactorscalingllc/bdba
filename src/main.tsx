import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import { installGlobalHandlers } from "@/lib/error-logger";
import "./index.css";

// Capture non-React errors (raw window.onerror + unhandled promise rejections)
// to public.app_errors. React render errors are caught separately by
// <ErrorBoundary> around /dashboard and /login in App.tsx.
installGlobalHandlers();

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
