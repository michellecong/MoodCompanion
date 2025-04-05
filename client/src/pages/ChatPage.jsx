import { useState } from "react";
import ChatSidebar from "../components/chat/ChatSidebar";
import "./ChatPage.css";

function ChatPage() {
  const [chats, setChats] = useState([
    { id: Date.now(), title: "New Chat", messages: [] },
  ]);
  const [activeChatId, setActiveChatId] = useState(chats[0].id);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const getActiveChat = () => chats.find((chat) => chat.id === activeChatId);

  const createNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: `Chat ${chats.length + 1}`,
      messages: [],
    };
    setChats([newChat, ...chats]);
    setActiveChatId(newChat.id);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    const updatedMessages = [...getActiveChat().messages, userMessage];

    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === activeChatId
          ? { ...chat, messages: updatedMessages }
          : chat
      )
    );

    setInput("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      const aiMessage = { sender: "ai", text: data.reply };

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === activeChatId
            ? {
                ...chat,
                messages: [...updatedMessages, aiMessage],
              }
            : chat
        )
      );
    } catch (error) {
      console.error("Error:", error);
      const fallbackMessage = {
        sender: "ai",
        text: "Sorry, something went wrong.",
      };

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === activeChatId
            ? {
                ...chat,
                messages: [...updatedMessages, fallbackMessage],
              }
            : chat
        )
      );
    }

    setLoading(false);
  };

  return (
    <div className="chat-layout">
      <ChatSidebar
        chats={chats}
        activeChatId={activeChatId}
        onNewChat={createNewChat}
        onSelectChat={setActiveChatId}
      />

      <div className="chat-container">
        <div className="chat-messages">
          {getActiveChat().messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              {msg.sender === "ai" ? "🤖 " : "🧑 "} {msg.text}
            </div>
          ))}
          {loading && <div className="message ai">🤖 Typing...</div>}
        </div>

        <div className="chat-input">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            disabled={loading}
          />
          <button onClick={sendMessage} disabled={loading}>
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
