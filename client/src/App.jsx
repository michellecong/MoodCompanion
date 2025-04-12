import React, { useEffect } from "react";
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

  console.log("Auth0", {
    isLoading,
    isAuthenticated,
    user,
    pathname: window.location.pathname,
    search: window.location.search,
  });
  
  useEffect(() => {
    const storeToken = async () => {
      if (isAuthenticated) {
        try {
          const token = await getAccessTokenSilently();
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));
          console.log("Token stored in localStorage:", token);
        } catch (error) {
          console.error("Error fetching token:", error);
        }
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    };
    storeToken();
  }, [isAuthenticated, user, getAccessTokenSilently]);

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  if (isLoading) return <div>Loading...</div>;

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
              element={<HomePage isAuthenticated={isAuthenticated} user={user} />}
            />
            <Route
              path="/login"
              element={<LoginPage onLogin={() => loginWithRedirect()} />}
            />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/journals" element={<JournalsPage />} />
            <Route path="/journal/:id" element={<SingleJournalPage />} />
            <Route path="/mood-tracking" element={<MoodTrackingPage />} />
            <Route
              path="/post/:id"
              element={<PostDetailPage isAuthenticated={isAuthenticated} user={user} />}
            />
            <Route path="/posts" element={<PostsListPage />} />
            <Route path="/create-post" element={<CreatePostPage />} />
            <Route
              path="/followed-posts"
              element={<FollowedPostsPage isAuthenticated={isAuthenticated} />}
            />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="*" element={<NotFoundPage />} />
            <Route
              path="/profile"
              element={<Profile user={user} isAuthenticated={isAuthenticated} />}
            />
          </Routes>
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}

export default App;
