// import "./utils/fetcherunAuth"; // Import the fetch wrapper to override the global fetch
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
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
import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onNeedRefresh() {
    // Show a prompt to the user to refresh
    if (confirm('New content available, reload to update?')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('App is ready to work offline')
  },
})

console.log('Service Worker registered for PWA')
