import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar({ isAuthenticated, onLogout, user }) {
  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo">
          AI Mood Companion
        </Link>

        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-link">Home</Link>
          </li>
          
          {isAuthenticated ? (
            <>
              <li className="nav-item">
                <Link to="/journal" className="nav-link">Journal</Link>
              </li>
              <li className="nav-item">
                <Link to="/wishing-well" className="nav-link">Wishing Well</Link>
              </li>
              <li className="nav-item">
                <Link to="/profile" className="nav-link">Profile</Link>
              </li>
              <li className="nav-item">
                <button className="logout-btn" onClick={onLogout}>
                  Logout
                </button>
              </li>
              {user && (
                <li className="nav-item user-welcome">
                  <span>Hi, {user.username}</span>
                </li>
              )}
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link to="/login" className="nav-link">Login</Link>
              </li>
              <li className="nav-item">
                <Link to="/register" className="nav-link register-btn">Register</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;