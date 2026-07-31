// import "./utils/fetcherunAuth"; // Import the fetch wrapper to override the global fetch
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import QueryProvider from "./utils/queryClient";
import { Toaster } from "react-hot-toast";
import i18n from "../src/i18n";
import { registerSW } from "virtual:pwa-register";

// Register service worker for PWA
registerSW({
  onNeedRefresh() {
    if (confirm("New content available. Reload?")) {
      window.location.reload();
    }
  },
  onOfflineReady() {
    console.log("App is ready for offline use");
  },
});

const Main = () => {
  return (
    <QueryProvider>
      <App />
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
