import React from "react";

const FriendRequests = ({ requests, onHandleRequest, isLoading }) => {
  if (isLoading) {
    return <div className="loading">Loading friend requests...</div>;
  }

  if (requests.length === 0) {
    return (
      <div className="no-requests">
        <p>You don't have any pending friend requests.</p>
      </div>
    );
  }

  return (
    <div className="friend-requests-container">
      <h2>Pending Friend Requests</h2>

      <div className="request-list">
        {requests.map((request) => (
          <div key={request._id} className="request-card">
            <div
              className="user-avatar"
              style={{ backgroundColor: request.from.avatarColor }}
            >
              {request.from.avatar ? (
                <img src={request.from.avatar} alt={request.from.username} />
              ) : (
                <span>{request.from.username.charAt(0).toUpperCase()}</span>
              )}
            </div>

            <div className="request-info">
              <h3>{request.from.username}</h3>
              <p className="request-email">{request.from.email}</p>
              {request.message && (
                <p className="request-message">"{request.message}"</p>
              )}
              <p className="request-date">
                Sent: {new Date(request.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="request-actions">
              <button
                className="accept-btn"
                onClick={() => onHandleRequest(request._id, "accept")}
              >
                Accept
              </button>
              <button
                className="reject-btn"
                onClick={() => onHandleRequest(request._id, "reject")}
              >
                Decline
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendRequests;
