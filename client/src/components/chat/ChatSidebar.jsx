import { Link } from "react-router-dom";
import "./ChatSidebar.css";

function ChatSidebar({ chats, onDeleteChat }) {
  return (
    <div className="chat-sidebar">
      <h3>📚 Saved Chats</h3>
      {chats.length === 0 ? (
        <p className="no-chats">No saved chats yet</p>
      ) : (
        chats.map((chat) => (
          <div key={chat._id} className="chat-item">
            <Link to={`/chat/${chat._id}`} className="chat-title">
              {chat.title}
            </Link>
            <button
              className="delete-btn"
              onClick={() => onDeleteChat(chat._id)}
              title="Delete chat"
            >
              ❌
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default ChatSidebar;
