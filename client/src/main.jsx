import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Auth0Provider } from "@auth0/auth0-react";
import App from "./App.jsx";

// ✅ Use import.meta.env for Vite
const domain = import.meta.env.VITE_AUTH0_DOMAIN;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

if (!domain || !clientId) {
  console.error("❌ Missing Auth0 environment variables. Check your .env file.");
  throw new Error("Auth0 configuration is incomplete.");
}

const onRedirectCallback = (appState) => {
  const targetUrl = appState?.returnTo || window.location.pathname;
  window.history.replaceState({}, document.title, targetUrl);
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Auth0Provider
        domain={domain}
        clientId={clientId}
        authorizationParams={{
          redirect_uri: window.location.origin,
          audience,
          scope: "openid profile email",
        }}
        onRedirectCallback={onRedirectCallback}
        cacheLocation="localstorage"
        useRefreshTokens={true}
      >
        <App />
      </Auth0Provider>
    </BrowserRouter>
  </React.StrictMode>
);
