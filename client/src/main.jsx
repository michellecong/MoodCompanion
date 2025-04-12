// main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";
import App from "./App.jsx";
import "./index.css";

const domain = "dev-mbnzpg6jdhzwez57.us.auth0.com";
const clientId = "aUFLFb8hIWukzOXGOy6kbKWO8JAP9Pxz";
const audience = "https://example_end_point/"; // from Auth0 API settings

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: audience,
        scope: "openid profile email",
      }}
    >
      <App />
    </Auth0Provider>
  </StrictMode>
);
