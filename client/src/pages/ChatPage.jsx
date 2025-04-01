import { useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Send } from "lucide-react";
import "./Chat.css";

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    // State updater
    if (!input.trim()) return;
    const newMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setLoading(true);
    
    try {
        // API call Placeholder
      const response = await axios.post("/api/chat", { messages: [...messages, newMessage] });
      setMessages((prev) => [...prev, { role: "ai", content: response.data.reply }]);
    } catch (error) {
      console.error("Error fetching AI response:", error);
    }
    
    setLoading(false);
  };

  return (
    <div className="chat-container">
      <Card className="chat-box">
        <CardContent className="chat-content">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.role === "user" ? "user-message" : "ai-message"}`}
            >
              {msg.content}
            </div>
          ))}
          {loading && <div className="loading-text">AI is typing...</div>}
        </CardContent>
      </Card>
      <div className="input-container">
        <Input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <Button onClick={sendMessage} disabled={loading}>
          <Send className="icon" />
        </Button>
      </div>
    </div>
  );
};

export default ChatPage;
