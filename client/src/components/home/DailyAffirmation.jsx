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
    "You are stronger than you realize, even on tough days.",
    "Every challenge you face is a chance to grow and shine.",
    "You deserve kindness—from others and from yourself.",
    "Your journey is unique, and that’s what makes it beautiful.",
    "You have the power to create change, one choice at a time.",
    "It’s okay to rest. You don’t have to do it all today.",
    "You are enough, just as you are, right now.",
    "Your efforts are seen, even when they feel small.",
    "Let go of what you can’t control and embrace what you can.",
    "You bring light to others in ways you may not even see.",
    "Today, you are allowed to simply be—no pressure, just peace.",
    "Your resilience is inspiring. You’ve made it this far.",
    "You are worthy of love, joy, and all good things.",
    "Mistakes don’t define you; they help you grow.",
    "You have a voice, and it deserves to be heard.",
    "Every day is a fresh start. You’ve got this.",
    "You are not alone—your struggles connect you to others.",
    "Your heart is big, and that’s a strength, not a weakness.",
    "You can handle whatever comes your way, one step at a time.",
    "You are a work in progress, and that’s perfectly okay.",
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
