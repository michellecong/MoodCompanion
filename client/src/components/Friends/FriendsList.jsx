import React from "react";

const FriendsList = ({ friends, onRemoveFriend, isLoading }) => {
  if (isLoading) {
    return <div className="loading">Loading friends...</div>;
  }

  if (friends.length === 0) {
    return (
      <div className="no-friends">
        <p>You haven't added any friends yet.</p>
        <p>Switch to the Find Friends tab to start connecting with others!</p>
      </div>
    );
  }

  return (
    <div className="friends-list-container">
      <h2>My Friends ({friends.length})</h2>

      <div className="friends-grid">
        {friends.map((friend) => (
          <div key={friend._id} className="friend-card">
            <div
              className="friend-avatar"
              style={{ backgroundColor: friend.avatarColor }}
            >
              {friend.avatar ? (
                <img src={friend.avatar} alt={friend.username} />
              ) : (
                <span>{friend.username.charAt(0).toUpperCase()}</span>
              )}
            </div>

            <div className="friend-info">
              <h3>{friend.username}</h3>
              <p>{friend.email}</p>
            </div>

            <div className="friend-actions">
              <button
                className="remove-friend-btn"
                onClick={() => onRemoveFriend(friend._id)}
              >
                Remove Friend
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendsList;
