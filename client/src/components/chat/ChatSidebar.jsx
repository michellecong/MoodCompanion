import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "./ChatSidebar.css";

function ChatSidebar({ chats, onDeleteChat }) {
  const navigate = useNavigate();
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
      <button
      className="new-chat-btn"
      onClick={() => navigate("/chat")}
      title="Start a new chat"
    >
      ➕ New Chat
    </button>
    </div>
  );
}

export default ChatSidebar;
