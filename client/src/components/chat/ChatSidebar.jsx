function ChatSidebar({ chats, activeChatId, onNewChat, onSelectChat }) {
    return (
      <div className="chat-sidebar">
        <button onClick={onNewChat}>+ New Chat</button>
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`chat-title ${chat.id === activeChatId ? "active" : ""}`}
            onClick={() => onSelectChat(chat.id)}
          >
            {chat.title}
          </div>
        ))}
      </div>
    );
  }
  
export default ChatSidebar;
  