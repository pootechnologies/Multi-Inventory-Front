// import "./utils/fetcherunAuth"; // Import the fetch wrapper to override the global fetch
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import QueryProvider from "./utils/queryClient";
import { Toaster } from "react-hot-toast";
import i18n from "../src/i18n";

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

// Register Service Worker for PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").then(
      (registration) => {
        console.log("Service Worker registered: ", registration);
      },
      (err) => {
        console.log("Service Worker registration failed: ", err);
      }
    );
  });
}
