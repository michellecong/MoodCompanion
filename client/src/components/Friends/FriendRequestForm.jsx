import React, { useState } from "react";

const FriendRequestForm = ({ onSend, onCancel, username }) => {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const success = await onSend(message);

      if (!success) {
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("error sending friends request message:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="friend-request-form">
      <h3>Send a friend request to {username}</h3>
      <p className="form-helper-text">Add a personal message (optional)</p>

      <form onSubmit={handleSubmit}>
        <textarea
          className="message-textarea"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Hey, I'd like to connect with you..."
          maxLength={200}
          rows={4}
        />

        <div className="character-count">{message.length}/200 characters</div>

        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send Request"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FriendRequestForm;
