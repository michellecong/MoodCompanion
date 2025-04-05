function ChatSidebar({ chats, onSelectChat }) {
    return (
      <div className="chat-sidebar">
        <h3>📚 Saved Chats</h3>
        {chats.length === 0 ? (
          <p style={{ fontStyle: "italic", padding: "8px" }}>No saved chats yet</p>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              className="chat-title"
              onClick={() => onSelectChat(chat.id)}
            >
              {chat.title}
            </div>
          ))
        )}
      </div>
    );
  }
  
  export default ChatSidebar;
  