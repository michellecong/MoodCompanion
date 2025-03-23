import { useState, useEffect } from "react";
import affirmationBg from "../../assets/images/affirmationBg.jpg"; // 假设有这个图片，如果没有请替换为实际图片路径

function DailyAffirmation() {
  const [dailyAffirmation, setDailyAffirmation] = useState("");

  // Predefined list of affirmations
  const affirmations = [
    "You are capable of amazing things. Today is full of possibilities.",
    "Your emotions are valid. It's okay to feel what you're feeling.",
    "Take a moment to breathe deeply and appreciate yourself today.",
    "Small steps forward are still progress. You're doing great.",
    "Your presence in this world matters. You make a difference.",
  ];

  // Select a random affirmation when the component loads
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * affirmations.length);
    setDailyAffirmation(affirmations[randomIndex]);
  }, []);

  return (
    <div className="daily-affirmation">
      <div className="affirmation-image">
        <img src={affirmationBg} alt="Inspirational background" />
      </div>
      <div className="affirmation-content">
        <h3>Today's Affirmation</h3>
        <p>{dailyAffirmation}</p>
      </div>
    </div>
  );
}

export default DailyAffirmation;
