import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Auth0ProviderWithHistory from "./components/Auth0Provider.jsx";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Auth0ProviderWithHistory>
      <App />
    </Auth0ProviderWithHistory>
  </StrictMode>
);
