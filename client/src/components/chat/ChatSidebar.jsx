import { Link } from "react-router-dom";

function ChatSidebar({ chats, onSelectChat }) {
    return (
      <div className="chat-sidebar">
        <h3>📚 Saved Chats</h3>
        {chats.length === 0 ? (
          <p style={{ fontStyle: "italic", padding: "8px" }}>No saved chats yet</p>
        ) : (
          chats.map((chat) => (
            <Link key={chat._id} to={`/chat/${chat._id}`} className="chat-link">
            <div className="chat-title">{chat.title}</div>
          </Link>
          ))
        )}
      </div>
    );
  }
  
  export default ChatSidebar;
  