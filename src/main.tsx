import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { LanguageProvider } from "./contexts/LanguageContext";

const rootElement = document.getElementById("root");

if (rootElement && rootElement.hasChildNodes()) {
  // react-snap already rendered content
  import('react-dom/client').then(({ hydrateRoot }) => {
    hydrateRoot(
      rootElement,
      <LanguageProvider>
        <App />
      </LanguageProvider>
    );
  });
} else if (rootElement) {
  // Normal client-side render
  createRoot(rootElement).render(
    <LanguageProvider>
      <App />
    </LanguageProvider>
  );
}
