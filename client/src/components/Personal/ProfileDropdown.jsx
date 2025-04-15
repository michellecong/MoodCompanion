import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import "./ProfileDropdown.css";
import { getAssetUrl } from "../../api/helpers";
import Avatar from "./Avatar";

function ProfileDropdown({ user: initialUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [user, setUser] = useState(initialUser);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

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
              <Avatar user={user} size="lg" />
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
              <Link to="/mood-tracking" onClick={() => setIsOpen(false)}>
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
