import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import api from "./api/axios"; // 添加这行导入
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
  const { logout, isAuthenticated, user, getAccessTokenSilently } = useAuth0();
  const [localAuth, setLocalAuth] = useState(false);
  const [localUser, setLocalUser] = useState(null);

  // 同步Auth0状态到本地状态
  useEffect(() => {
    console.log("App: Auth0 state changed", isAuthenticated);
    const syncAuth0State = async () => {
      if (isAuthenticated && user) {
        try {
          console.log(
            "App: User authenticated with Auth0, syncing with backend"
          );
          const accessToken = await getAccessTokenSilently();
          const response = await api.post("/users/auth0-callback", {
            user,
            token: accessToken,
          });

          if (response.data.token) {
            console.log("App: Backend auth successful, updating local state");
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.user));
            setLocalAuth(true);
            setLocalUser(response.data.user);
          }
        } catch (error) {
          console.error("Error syncing Auth0 state:", error);
        }
      }
    };

    syncAuth0State();
  }, [isAuthenticated, user, getAccessTokenSilently]);

  // 检查本地存储的身份验证信息
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      console.log("App: Found local auth data, setting local state");
      setLocalAuth(true);
      setLocalUser(JSON.parse(userData));
    }
  }, [isAuthenticated, user, getAccessTokenSilently, isLoading]);

  const handleLogout = () => {
    console.log("App: Handling logout");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setLocalAuth(false);
    setLocalUser(null);

    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  };

  return (
    <Router>
      <div className="app-container">
        <Navbar
          isAuthenticated={localAuth}
          onLogout={handleLogout}
          user={localUser}
        />
        <main className="main-content">
          <ErrorBoundary>
            <Routes>
              <Route
                path="/"
                element={
                  <HomePage isAuthenticated={localAuth} user={localUser} />
                }
              />
              <Route
                path="/login"
                element={
                  <LoginPage onLogin={setLocalAuth} onUser={setLocalUser} />
                }
              />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/journals" element={<JournalsPage />} />
              <Route path="/journal/:id" element={<SingleJournalPage />} />
              <Route path="/mood-tracking" element={<MoodTrackingPage />} />
              <Route
                path="/post/:id"
                element={
                  <PostDetailPage
                    isAuthenticated={localAuth}
                    user={localUser}
                  />
                }
              />
              <Route path="/posts" element={<PostsListPage />} />
              <Route path="/create-post" element={<CreatePostPage />} />
              <Route
                path="/followed-posts"
                element={<FollowedPostsPage isAuthenticated={localAuth} />}
              />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="*" element={<NotFoundPage />} />
              <Route
                path="/profile"
                element={
                  <Profile user={localUser} isAuthenticated={localAuth} />
                }
              />
            </Routes>
          </ErrorBoundary>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
