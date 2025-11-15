import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { LanguageProvider } from "./contexts/LanguageContext";

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <LanguageProvider>
      <App />
    </LanguageProvider>
  );
  
  // Dispatch event for prerendering
  if (typeof window !== "undefined") {
    setTimeout(() => {
      document.dispatchEvent(new Event("render-ready"));
    }, 1000);
  }
}
