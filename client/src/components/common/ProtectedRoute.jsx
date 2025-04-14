import React, { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

// ProtectedRoute component to wrap around private routes
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        // Wait for Auth0 to finish loading
        if (isLoading) return;

        // Check for Auth0 authentication
        if (isAuthenticated) {
          console.log("Auth0 authentication detected");

          // Refresh token to ensure it's valid
          try {
            const token = await getAccessTokenSilently({
              authorizationParams: {
                audience: import.meta.env.VITE_AUTH0_AUDIENCE,
                scope: "openid profile email",
              },
            });
            localStorage.setItem("token", token);
            console.log("Auth0 token refreshed in protected route");
          } catch (tokenErr) {
            console.error("Failed to refresh Auth0 token:", tokenErr);
          }

          setIsAuthorized(true);
          setIsCheckingAuth(false);
          return;
        }

        // If not authenticated with Auth0, check for token in localStorage
        const token =
          localStorage.getItem("token") || localStorage.getItem("app_token");
        const user = localStorage.getItem("user");

        if (token && user) {
          // User has token and user data in localStorage
          console.log("Local token found, authorizing");
          setIsAuthorized(true);
        } else {
          console.log("No valid authentication found");
          setIsAuthorized(false);
        }

        setIsCheckingAuth(false);
      } catch (error) {
        console.error("Error checking authentication:", error);
        setIsAuthorized(false);
        setIsCheckingAuth(false);
      }
    };

    checkAuthentication();
  }, [isAuthenticated, isLoading, getAccessTokenSilently]);

  // Show loading state while checking authentication
  if (isLoading || isCheckingAuth) {
    return (
      <div className="auth-loading">
        <div className="loading-spinner"></div>
        <p>Checking authentication...</p>
      </div>
    );
  }

  // If not authorized, redirect to login page
  if (!isAuthorized) {
    console.log("Not authorized, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authorized, render the children
  return children;
};

export default ProtectedRoute;
