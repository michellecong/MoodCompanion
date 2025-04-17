import { useState } from "react";
import ChatSidebar from "../components/chat/ChatSidebar";
import "./ChatPage.css";
import api from "../api/axios";

function ChatPage() {
  const [savedChats, setSavedChats] = useState([]); // Only saved chats go here
  const [unsavedMessages, setUnsavedMessages] = useState([]); // Current chat
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    const newMessages = [...unsavedMessages, userMessage];
    setUnsavedMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await api.post("/chat", { message: input });
      const aiMessage = { sender: "ai", text: response.data.reply };
      setUnsavedMessages((prevMessages) => [...prevMessages, aiMessage]);
    } catch (error) {
      console.error("Error:", error);
      const fallback = { sender: "ai", text: "Sorry, something went wrong." };
      setUnsavedMessages((prev) => [...prev, fallback]);
    }

    setLoading(false);
  };

  const saveChat = () => {
    if (unsavedMessages.length === 0) return;

    const now = new Date();
    const title = now.toLocaleString(); // e.g., "4/5/2025, 11:30:12 AM"
    const newChat = {
      id: Date.now(),
      title,
      messages: unsavedMessages,
    };

    setSavedChats([newChat, ...savedChats]);
    setUnsavedMessages([]); // clear after save
  };

  const loadChat = (chatId) => {
    const chat = savedChats.find((c) => c.id === chatId);
    if (chat) {
      setUnsavedMessages(chat.messages);
    }
  };

  return (
    <div className="chat-layout">
      <ChatSidebar chats={savedChats} onSelectChat={loadChat} />

      <div className="chat-container">
        <div className="chat-messages">
          {unsavedMessages.map((msg, index) => (
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
          <button
            onClick={saveChat}
            disabled={loading || unsavedMessages.length === 0}
          >
            Save Chat
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;

/* Future functionalities:
Pattern recognization - recognise their cognitive distortions
Educational tips to challenge distortions
insight into patterns over time
guided reflection */
