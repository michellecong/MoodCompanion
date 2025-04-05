import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import "./ProfileDropdown.css";

function ProfileDropdown({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="profile-dropdown-container" ref={dropdownRef}>
      <button className="profile-dropdown-trigger" onClick={toggleDropdown}>
        Profile
        <span className={`dropdown-arrow ${isOpen ? "open" : ""}`}>▼</span>
      </button>

      {isOpen && (
        <div className="profile-dropdown-menu">
          <div className="dropdown-user-info">
            <div className="dropdown-avatar">
              {user.avatar ? (
                <img src={user.avatar} alt="User avatar" />
              ) : (
                <div className="avatar-placeholder">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="dropdown-user-details">
              <p className="dropdown-username">{user.username}</p>
              <p className="dropdown-email">{user.email}</p>
            </div>
          </div>

          <ul className="dropdown-links">
            <li>
              <Link to="/profile" onClick={() => setIsOpen(false)}>
                View Profile
              </Link>
            </li>
            <li>
              <Link to="/profile/edit" onClick={() => setIsOpen(false)}>
                Edit Profile
              </Link>
            </li>
            <li>
              <Link to="/profile/settings" onClick={() => setIsOpen(false)}>
                Settings
              </Link>
            </li>
            <li>
              <Link to="/profile/mood-history" onClick={() => setIsOpen(false)}>
                Mood History
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default ProfileDropdown;
