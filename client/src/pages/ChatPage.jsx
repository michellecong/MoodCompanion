import { useEffect, useState } from "react";
import ChatSidebar from "../components/chat/ChatSidebar";
import { useNavigate, useParams } from "react-router-dom";
import "./ChatPage.css";
import api from "../api/axios";

function ChatPage() {
  const [savedChats, setSavedChats] = useState([]); // Only saved chats go here
  const [unsavedMessages, setUnsavedMessages] = useState([]); // Current chat
  const [savedMessages, setSavedMessages] = useState([]); // Saved messages for existing chat
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { chatId } = useParams();

  useEffect(() => {
    if (!localStorage.getItem("token")) return;
  
    if (chatId) {
      loadChat(chatId);
    } else {
      fetchSavedChats();
      // Clear out the old chat state
      setSavedMessages([]);
      setUnsavedMessages([]);
    }
  }, [chatId]);
  
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    const newMessages = [...unsavedMessages, userMessage];
    setUnsavedMessages(newMessages);
    console.log("unsavedMessages", unsavedMessages);
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

  const handleProtectedAction = () => {
    const isLoggedIn = !!localStorage.getItem("token");
  
    if (!isLoggedIn) {
      alert("⚠️ Please log in to perform this action.");
      // Redirection
      navigate("/login"); 
      return;
    }
    console.log("User is logged in. Proceeding...");
  };

  // For new chats.
  const createChat = async () => {
    if (unsavedMessages.length === 0) return;

    try {
      const response = await api.post("/chat/save", {
        messages: unsavedMessages,
      });
  
      if (response.data.success) {
        console.log("✅ Chat saved to DB:", response.data.data);
        setUnsavedMessages([]); // clear messages after successful save
      } else {
        console.error("❌ Failed to save chat:", response.data.message);
      }
    } catch (error) {
      console.error("🔥 Error saving chat:", error);
    }
  };

  // Update existing chat: adding new messages to the existing chat
  const updateChat = async (chatId) => {
    if (unsavedMessages.length === 0) return;
  
    handleProtectedAction(); // Check if user is logged in before saving
    try {
      const response = await api.put("/chat/update/" + chatId, {
        messages: unsavedMessages,
      });
  
      if (response.data.success) {
        console.log("✅ Chat updated in DB:", response.data.data);
        setUnsavedMessages([]); // clear messages after successful save
      } else {
        console.error("❌ Failed to update chat:", response.data.message);
      }
    } catch (error) {
      console.error("🔥 Error updating chat:", error);
    }
    // refresh the list of messages after saving
  }

  // Save chat: either create a new chat or update an existing one
  // If chatId is present, update the existing chat; otherwise, create a new one.
  const saveChat = async () => {
    if (chatId) {
      await updateChat(chatId); // Update existing chat
    } else {
      await createChat(); // Create new chat
    }
    // reload the chat list after saving
    fetchSavedChats(); // Refresh the list of saved chats after saving
    // update saved messages to include the new chat
    setSavedMessages((prevMessages) => [...prevMessages, ...unsavedMessages]);
  }

  // Find chat by ID and load it into the chat window
  const loadChat = async (chatId) => {
    try {
      const response = await api.get("/chat/" + chatId); // returns chat by ID
      const messagesData = response.data?.data;
  
      if (!messagesData || !Array.isArray(messagesData.messages)) {
        console.error("Invalid chat data.");
        return;
      }
  
      setSavedMessages(messagesData.messages); 
    } catch (err) {
      console.error("🔥 Failed to load chat:", err);
    }
  };
  
  const deleteChat = async (chatId) => {
    handleProtectedAction(); // Check if user is logged in before deleting
    try {
      const response = await api.delete("/chat/" + chatId); // returns chat by ID
      console.log("Deleted chat:", response.data);
      fetchSavedChats(); // Refresh the list of saved chats after deletion
    } catch (err) {
      console.error("🔥 Failed to delete chat:", err);
    }
  }

  // Fetch all saved chats from the server
  const fetchSavedChats = async () => {
    try {
      const response = await api.get("/chat"); // returns list of chats
      const chatData = response.data?.data;
      console.log("Fetched saved chats:", chatData);
  
      if (!chatData || !Array.isArray(chatData)) {
        console.error("Invalid chat data.");
        return;
      }
  
      setSavedChats(chatData); // ✅ set the full list of saved chats
    } catch (err) {
      console.error("🔥 Failed to load chat:", err);
    }
  };

  // Make a journal entry from the chat
  const makeJournal = async (chatId) => {
    handleProtectedAction(); // Check if user is logged in before making a journal entry
    try {
      const response = await api.post("/journals/from-chat/" + chatId); // returns chat by ID
      console.log("Created journal entry:", response.data);
      alert("✅ Journal entry created successfully!");
    }
    catch (err) {
      console.error("🔥 Failed to create journal entry:", err);
      alert("❌ Failed to create journal entry.");
    }
  };

  return (
    <div className="chat-layout">

      <div className="chat-container">
        <div className="chat-messages">
        {[...savedMessages, ...unsavedMessages].map((msg, index) => (
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
          <button onClick={saveChat} disabled={loading}>
            Save Chat
          </button>
        </div>
      </div>
    <div className="chat-sidebar-container">
      <ChatSidebar chats={savedChats} onSelectChat={loadChat} onDeleteChat={deleteChat} onMakeJournal={makeJournal}/>
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
