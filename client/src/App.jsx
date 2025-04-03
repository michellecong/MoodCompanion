import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import JournalsPage from "./pages/JournalsPage";
import SingleJournalPage from "./pages/SingleJournalPage";
import PostDetailPage from "./pages/PostDetailPage";
import PostsListPage from "./pages/PostsListPage";
import ChatPage from "./pages/ChatPage";
import CreatePostPage from "./pages/CreatePostPage";
import MoodTrackingPage from "./pages/MoodTrackingPage";

import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <Router>
      <div className="app-container">
        <Navbar
          isAuthenticated={isAuthenticated}
          onLogout={handleLogout}
          user={user}
        />
        <main className="main-content">
          <Routes>
            <Route
              path="/"
              element={
                <HomePage isAuthenticated={isAuthenticated} user={user} />
              }
            />
            <Route
              path="/login"
              element={
                <LoginPage onLogin={setIsAuthenticated} onUser={setUser} />
              }
            />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/journals" element={<JournalsPage />} />
            <Route path="/journal/:id" element={<SingleJournalPage />} />
            <Route path="/mood-tracking" element={<MoodTrackingPage />} />
            <Route
              path="/post/:id"
              element={
                <PostDetailPage isAuthenticated={isAuthenticated} user={user} />
              }
            />
            <Route path="/posts" element={<PostsListPage />} />
            <Route path="/create-post" element={<CreatePostPage />} />
            <Route path="/chat" element={<ChatPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
