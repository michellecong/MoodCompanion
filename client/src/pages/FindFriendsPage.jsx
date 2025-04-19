import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { toast } from "react-toastify";
import FriendRequests from "../components/Friends/FriendRequests";
import FriendsList from "../components/Friends/FriendsList";
import FriendRequestForm from "../components/Friends/FriendRequestForm";
import "./FindFriendsPage.css";

const FindFriendsPage = ({ isAuthenticated }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const tabFromUrl = queryParams.get("tab");

  // Debug React version
  useEffect(() => {
    console.log("FindFriendsPage mounted, React version:", React.version);

    // Check all input elements after render
    setTimeout(() => {
      const inputs = document.querySelectorAll("input");
      console.log("Found inputs:", inputs.length);

      // Add a global event listener to capture all input events
      const handleInputEvent = (e) => {
        if (e.target.tagName === "INPUT") {
          console.log("Input event detected:", e.type, e.target.value);
        }
      };

      document.addEventListener("input", handleInputEvent, true);
      return () =>
        document.removeEventListener("input", handleInputEvent, true);
    }, 500);
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (isAuthenticated === false) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Set default tab or use the one from URL
  const [activeTab, setActiveTab] = useState(
    ["search", "requests", "friends"].includes(tabFromUrl)
      ? tabFromUrl
      : "search"
  );
  const [searchResults, setSearchResults] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manages search term without React state
  const [searchInputValue, setSearchInputValue] = useState("");

  // Fetch friend requests and friends on component mount
  useEffect(() => {
    const fetchFriendData = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching friend data...");

        const requestOptions = {
          timeout: 8000,
          headers: {
            "Cache-Control": "no-cache",
          },
        };

        const [requestsResponse, friendsResponse] = await Promise.allSettled([
          api.get("/users/friend-requests", requestOptions),
          api.get("/users/friends", requestOptions),
        ]);

        if (
          requestsResponse.status === "fulfilled" &&
          requestsResponse.value?.data?.data
        ) {
          console.log(
            "Successfully fetched friend requests:",
            requestsResponse.value.data.data.length
          );
          setFriendRequests(requestsResponse.value.data.data || []);
        } else {
          console.warn(
            "Could not fetch friend requests:",
            requestsResponse.reason || "Unknown error"
          );
          setFriendRequests([]);
        }

        if (
          friendsResponse.status === "fulfilled" &&
          friendsResponse.value?.data?.data
        ) {
          console.log(
            "Successfully fetched friends:",
            friendsResponse.value.data.data.length
          );
          setFriends(friendsResponse.value.data.data || []);
        } else {
          console.warn(
            "Could not fetch friends:",
            friendsResponse.reason || "Unknown error"
          );
          setFriends([]);
        }
      } catch (err) {
        console.error("Error fetching friend data:", err);
        setError(
          "There was a problem loading your friends data. Please try again later."
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchFriendData();
    }
  }, [isAuthenticated]);

  // Handle user search
  const handleSearch = async (searchTerm) => {
    console.log("Search initiated with term:", searchTerm);

    if (!searchTerm || !searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await api
        .get(`/users/search?query=${encodeURIComponent(searchTerm)}`)
        .catch((err) => {
          console.error("Search API error:", err);
          toast.error("Failed to search users");
          return { data: { data: [] } };
        });

      console.log("Search results:", response.data.data);
      setSearchResults(response.data.data || []);
    } catch (err) {
      console.error("Search error:", err);
      toast.error("Failed to search users");
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Show friend request form
  const showSendRequestForm = (user) => {
    setSelectedUser(user);
    setShowRequestForm(true);
  };

  // Hide friend request form
  const hideSendRequestForm = () => {
    setSelectedUser(null);
    setShowRequestForm(false);
  };

  const [notification, setNotification] = useState({ message: "", type: "" });

  const displayNotification = (message, type) => {
    setNotification({ message, type });

    alert(`${type}: ${message}`);
  };

  const sendFriendRequest = async (userId, message) => {
    setIsSubmitting(true);

    try {
      const userWithRequest = searchResults.find(
        (user) => user._id === userId && user.requestSent
      );

      if (userWithRequest) {
        displayNotification(
          "You have already sent a friend request to this user",
          "warning"
        );
        setShowRequestForm(false);
        return true;
      }

      try {
        await api.post("/users/friend-request", {
          toUserId: userId,
          message: message,
        });

        setSearchResults(
          searchResults.map((user) =>
            user._id === userId ? { ...user, requestSent: true } : user
          )
        );

        setShowRequestForm(false);
        displayNotification("Friend request sent successfully!", "success");
        return true;
      } catch (apiError) {
        const errorMessage = apiError.response?.data?.message;

        if (errorMessage === "Friend request already sent") {
          setSearchResults(
            searchResults.map((user) =>
              user._id === userId ? { ...user, requestSent: true } : user
            )
          );
          setShowRequestForm(false);
          displayNotification(
            "You have already sent a friend request to this user",
            "warning"
          );
          return true;
        } else if (errorMessage === "Already friends with this user") {
          setSearchResults(
            searchResults.map((user) =>
              user._id === userId ? { ...user, isFriend: true } : user
            )
          );
          setShowRequestForm(false);
          displayNotification("You are already friends with this user", "info");
          return true;
        } else {
          throw apiError;
        }
      }
    } catch (error) {
      console.error(
        "Unexpected error occurred while sending friend request:",
        error
      );
      displayNotification(
        "Error: " +
          (error.response?.data?.message || "Failed to send friend request"),
        "error"
      );
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };
  // Handle friend request response (accept/reject)
  const handleFriendRequest = async (requestId, action) => {
    try {
      await api.put("/users/friend-request", {
        requestId,
        action,
      });

      // Update UI based on action
      if (action === "accept") {
        toast.success("Friend request accepted");
        // Find the accepted request to add to friends list
        const acceptedRequest = friendRequests.find(
          (req) => req._id === requestId
        );
        if (acceptedRequest) {
          setFriends((prev) => [...prev, acceptedRequest.from]);
        }
      } else {
        toast.info("Friend request rejected");
      }

      // Remove the request from the list
      setFriendRequests((prev) =>
        prev.filter((request) => request._id !== requestId)
      );
    } catch (err) {
      console.error("Error handling friend request:", err);
      toast.error("Failed to process friend request");
    }
  };

  // Remove friend
  const removeFriend = async (friendId) => {
    try {
      await api.delete(`/users/friends/${friendId}`);
      toast.success("Friend removed successfully");
      // Update friends list
      setFriends((prev) => prev.filter((friend) => friend._id !== friendId));
    } catch (err) {
      console.error("Error removing friend:", err);
      toast.error("Failed to remove friend");
    }
  };

  return (
    <div className="find-friends-container">
      <h1>Friends</h1>

      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === "search" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("search");
            navigate("/friends?tab=search");
          }}
        >
          Find Friends
        </button>
        <button
          className={`tab-btn ${activeTab === "requests" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("requests");
            navigate("/friends?tab=requests");
          }}
        >
          Friend Requests
          {friendRequests.length > 0 && (
            <span className="badge">{friendRequests.length}</span>
          )}
        </button>
        <button
          className={`tab-btn ${activeTab === "friends" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("friends");
            navigate("/friends?tab=friends");
          }}
        >
          My Friends
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="tab-content">
        {activeTab === "search" && (
          <div className="search-tab">
            {/* Non-React Controlled Search Form */}
            <div className="search-bar-container">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const input = document.getElementById("search-input");
                  if (input) {
                    console.log("Form submitted with value:", input.value);
                    handleSearch(input.value);
                  }
                }}
              >
                <div className="search-input-group">
                  <input
                    id="search-input"
                    type="text"
                    placeholder="Search by username or email..."
                    defaultValue={searchInputValue}
                    onChange={(e) => {
                      console.log("Native input change:", e.target.value);
                      setSearchInputValue(e.target.value);
                    }}
                    className="friend-search-input"
                  />
                  <button type="submit" className="friend-search-button">
                    Search
                  </button>
                </div>
                <p className="search-helper-text">
                  Find friends by entering their username or email address
                </p>

                {/* Debug section */}
                <div className="friend-debug-info">
                  Current input value: {searchInputValue}
                </div>
              </form>
            </div>

            {showRequestForm && selectedUser ? (
              <div className="request-form-container">
                <FriendRequestForm
                  username={selectedUser.username}
                  onSend={(message) =>
                    sendFriendRequest(selectedUser._id, message)
                  }
                  onCancel={hideSendRequestForm}
                />
              </div>
            ) : isLoading ? (
              <div className="loading">Searching...</div>
            ) : (
              <div className="search-results">
                {searchResults.length > 0 ? (
                  searchResults.map((user) => (
                    <div key={user._id} className="user-card">
                      <div
                        className="user-avatar"
                        style={{ backgroundColor: user.avatarColor }}
                      >
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.username} />
                        ) : (
                          <span>{user.username.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="user-info">
                        <h3>{user.username}</h3>
                        <p>{user.email}</p>
                      </div>
                      {user.requestSent ? (
                        <button className="request-sent-btn" disabled>
                          Request Sent
                        </button>
                      ) : (
                        <button
                          className="send-request-btn"
                          onClick={() => showSendRequestForm(user)}
                        >
                          Add Friend
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="no-results">
                    No users found. Try a different search term.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "requests" && (
          <FriendRequests
            requests={friendRequests}
            onHandleRequest={handleFriendRequest}
            isLoading={isLoading}
          />
        )}

        {activeTab === "friends" && (
          <FriendsList
            friends={friends}
            onRemoveFriend={removeFriend}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
};

export default FindFriendsPage;
