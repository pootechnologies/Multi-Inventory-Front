// import "./utils/fetcherunAuth"; // Import the fetch wrapper to override the global fetch

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import { registerSW } from "virtual:pwa-register";

import "./index.css";
import App from "./App.jsx";
import QueryProvider from "./utils/queryClient";
import { PlanProvider } from "./contexts/PlanProvider";
import { Toaster } from "react-hot-toast";
import i18n from "../src/i18n";

const Main = () => {
  return (
    <QueryProvider>
      <PlanProvider>
        <App />
      </PlanProvider>
    </QueryProvider>
  );
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router>
      <Main />
      <Toaster />
    </Router>
  </StrictMode>
);

// Register Service Worker for PWA
registerSW({
  immediate: true,

  onOfflineReady() {
    // App is ready to work offline
  },

  onRegisteredSW(_swUrl, registration) {
    if (registration) {
      // Check for a new service worker every hour
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000);
    }
  },

  onRegisterError(_error) {
    // Service worker registration failed
  },
});