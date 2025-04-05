// src/hooks/useUserData.js
import { useState, useEffect } from "react";
import api from "../api/axios";

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
      setIsLoading(true);

      // Fetch the current mood
      const response = await api.get("/journals?limit=2"); // limit to 2 for recent journals

      if (response.data.success) {
        setRecentJournals(response.data.data);
      } else {
        console.error("Failed to fetch recent journals");
      }

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
