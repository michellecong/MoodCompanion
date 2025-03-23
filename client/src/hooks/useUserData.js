// src/hooks/useUserData.js
import { useState, useEffect } from "react";

export function useUserData(isAuthenticated) {
  const [recentJournals, setRecentJournals] = useState([]);
  const [currentMood, setCurrentMood] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only fetch data when the user is authenticated
    if (isAuthenticated) {
      fetchUserData();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const fetchUserData = async () => {
    try {
      // In a real application, this would be an API call
      // Using mock data for development purposes

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Set mock data
      setRecentJournals([
        {
          _id: "1",
          title: "A good day",
          content: "Today was productive and I felt energized throughout.",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          emotionsDetected: [
            { name: "joy", score: 0.8 },
            { name: "satisfaction", score: 0.7 },
          ],
        },
        {
          _id: "2",
          title: "Feeling anxious about presentation",
          content:
            "I have a big presentation tomorrow and I'm feeling nervous.",
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          emotionsDetected: [
            { name: "anxiety", score: 0.6 },
            { name: "fear", score: 0.4 },
          ],
        },
      ]);

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setIsLoading(false);
    }
  };

  return {
    recentJournals,
    currentMood,
    setCurrentMood,
    isLoading,
  };
}
