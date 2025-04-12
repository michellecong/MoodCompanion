import { Link } from "react-router-dom";
import "./Navbar.css";
import Avatar from "../Personal/Avatar";
import ProfileDropdown from "../Personal/ProfileDropdown";
import { useAuth0 } from "@auth0/auth0-react";
import { getAssetUrl } from "../../api/helpers";

function Navbar() {
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo">
          AI Mood Companion
        </Link>

        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-link">
              Home
            </Link>
          </li>

          {isAuthenticated ? (
            <>
              <li className="nav-item">
                <Link to="/journals" className="nav-link">
                  Journal
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/posts" className="nav-link">
                  Wishing Well
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/chat" className="nav-link">
                  Chatbot
                </Link>
              </li>
              <li className="nav-item">
                <ProfileDropdown user={user} />
              </li>
              <li className="nav-item">
                <button
                  className="logout-btn"
                  onClick={() =>
                    logout({
                      returnTo: window.location.origin,
                    })
                  }
                >
                  Logout
                </button>
              </li>
              {user && (
                <li className="nav-item user-welcome">
                  <span>Hi, {user.name || user.nickname || "Friend"}</span>
                </li>
              )}
              <Avatar user={user} size="md" />
            </>
          ) : (
            <>
              <li className="nav-item">
                <button className="nav-link" onClick={() => loginWithRedirect()}>
                  Login
                </button>
              </li>
              <li className="nav-item">
                <button
                  className="nav-link register-btn"
                  onClick={() => loginWithRedirect({ screen_hint: "signup" })}
                >
                  Register
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
