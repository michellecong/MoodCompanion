import { Link } from "react-router-dom";
import "./Navbar.css";
import Avatar from "../Personal/Avatar";
import ProfileDropdown from "../Personal/ProfileDropdown";
// import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";
import { useEffect } from "react";

function Navbar({ isAuthenticated, onLogout, user: initialUser }) {
  // const { loginWithRedirect } = useAuth0();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(initialUser);

  useEffect(() => {
    const handleUserUpdate = () => {
      const updatedUser = JSON.parse(localStorage.getItem("user"));
      if (updatedUser) {
        setUser(updatedUser);
      }
    };

    window.addEventListener('user-updated', handleUserUpdate);
    return () => {
      window.removeEventListener('user-updated', handleUserUpdate);
    };
  }, []);
  
  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo">
          AI Mood Companion
        </Link>

        {/* Hamburger menu button */}
        <div className="hamburger" onClick={toggleMenu}>
          {menuOpen ? (
            <div className="close-icon">×</div>
          ) : (
            <div className="menu-icon">
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
            </div>
          )}
        </div>

        <ul className={`nav-menu ${menuOpen ? "active" : ""}`}>
          <li className="nav-item">
            <Link
              to="/"
              className="nav-link"
              onClick={() => setMenuOpen(false)}
            >
              Home
            </Link>
          </li>

          {isAuthenticated ? (
            <>
              <li className="nav-item">
                <Link
                  to="/journals"
                  className="nav-link"
                  onClick={() => setMenuOpen(false)}
                >
                  Journal
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/posts"
                  className="nav-link"
                  onClick={() => setMenuOpen(false)}
                >
                  Wishing Well
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/chat"
                  className="nav-link"
                  onClick={() => setMenuOpen(false)}
                >
                  Chatbot
                </Link>
              </li>
              <li className="nav-item dropdown-container">
                <ProfileDropdown user={user} />
              </li>
              <li className="nav-item">
                <button className="logout-btn" onClick={onLogout}>
                  Logout
                </button>
              </li>
              {user && (
                <li className="nav-item user-welcome">
                  <span>Hi, {user.username}</span>
                  <Avatar user={user} size="md" />
                </li>
              )}
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link
                  to="/login"
                  className="nav-link"
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
