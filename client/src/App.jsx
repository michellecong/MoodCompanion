import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import ErrorBoundary from "./components/common/ErrorBoundary";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import JournalsPage from "./pages/JournalsPage";
import SingleJournalPage from "./pages/SingleJournalPage";
import MoodTrackingPage from "./pages/MoodTrackingPage";
import PostDetailPage from "./pages/PostDetailPage";
import PostsListPage from "./pages/PostsListPage";
import CreatePostPage from "./pages/CreatePostPage";
import FollowedPostsPage from "./pages/FollowedPostsPage";
import ChatPage from "./pages/ChatPage";
import NotFoundPage from "./pages/NotFoundPage";
import Profile from "./components/Personal/Profile";
import ProtectedRoute from "./components/common/ProtectedRoute";
import api from "./api/axios";
import "./App.css";

function App() {
  const {
    isAuthenticated,
    user,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
    isLoading,
  } = useAuth0();

  const [appLoading, setAppLoading] = useState(true);
  const [syncError, setSyncError] = useState(null);

  useEffect(() => {
    const syncUserWithDatabase = async () => {
      if (isAuthenticated && user) {
        try {
          console.log("Auth0 authentication detected, syncing user");

          // Get the Auth0 token
          const token = await getAccessTokenSilently({
            authorizationParams: {
              // Ensure we're requesting the right audience and scope
              audience: import.meta.env.VITE_AUTH0_AUDIENCE,
              scope: "openid profile email",
            },
          });

          console.log("Auth0 token obtained, length:", token.length);

          // Store the Auth0 token in localStorage
          localStorage.setItem("token", token);

          // Log the first part of the token for debugging (don't log full tokens in production)
          console.log(
            "Auth0 token first 20 chars:",
            token.substring(0, 20) + "..."
          );

          // Extract useful fields from Auth0 user object
          const syncResponse = await api.post("/users/auth0-sync", {
            auth0Id: user.sub,
            email: user.email,
            username: user.nickname || user.name || user.email.split("@")[0],
            name: user.name,
            avatar: user.picture || null,
          });

          // Store the user information from our database
          if (syncResponse.data.success) {
            console.log(
              "User sync successful:",
              syncResponse.data.user.username
            );
            localStorage.setItem(
              "user",
              JSON.stringify(syncResponse.data.user)
            );

            // Store our application JWT token as backup
            if (syncResponse.data.token) {
              localStorage.setItem("app_token", syncResponse.data.token);
              console.log("App token stored as backup");
            }

            // Update last login time
            if (syncResponse.data.user.isNewUser) {
              console.log("Welcome new user! First time login detected.");
              // You could redirect to an onboarding page here
            }
          } else {
            console.error(
              "User sync response indicates failure:",
              syncResponse.data
            );
            setSyncError("Failed to sync user data");
          }
        } catch (error) {
          console.error("Error syncing user with database:", error);
          // More detailed error logging
          if (error.response) {
            console.error("Response error data:", error.response.data);
            console.error("Response status:", error.response.status);
          }
          setSyncError(error.message || "Failed to sync user with database");
        } finally {
          setAppLoading(false);
        }
      } else if (!isLoading) {
        // Not authenticated and not loading, clear stored data
        console.log("User not authenticated, clearing stored auth data");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("app_token");
        setAppLoading(false);
      }
    };

    if (!isLoading) {
      syncUserWithDatabase();
    }
  }, [isAuthenticated, user, getAccessTokenSilently, isLoading]);

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("app_token");

    // Use Auth0 logout
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  // Show loading indicator while Auth0 is loading or while we're syncing
  if (isLoading || appLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading application...</p>
      </div>
    );
  }

  // Show error if user sync failed
  if (syncError && isAuthenticated) {
    return (
      <div className="error-container">
        <h2>Authentication Error</h2>
        <p>{syncError}</p>
        <button onClick={handleLogout} className="btn btn-primary">
          Logout and Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        user={user}
        onLogin={loginWithRedirect}
      />
      <main className="main-content">
        <ErrorBoundary>
          <Routes>
            <Route
              path="/"
              element={
                <HomePage isAuthenticated={isAuthenticated} user={user} />
              }
            />
            <Route
              path="/login"
              element={<LoginPage onLogin={() => loginWithRedirect()} />}
            />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/journals"
              element={
                <ProtectedRoute>
                  <JournalsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/journal/:id"
              element={
                <ProtectedRoute>
                  <SingleJournalPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mood-tracking"
              element={
                <ProtectedRoute>
                  <MoodTrackingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/post/:id"
              element={
                <PostDetailPage isAuthenticated={isAuthenticated} user={user} />
              }
            />
            <Route path="/posts" element={<PostsListPage />} />
            <Route
              path="/create-post"
              element={
                <ProtectedRoute>
                  <CreatePostPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/followed-posts"
              element={
                <ProtectedRoute>
                  <FollowedPostsPage isAuthenticated={isAuthenticated} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile user={user} isAuthenticated={isAuthenticated} />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}

export default App;
