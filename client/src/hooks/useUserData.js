import { useState, useEffect } from "react";
import api from "../api/axios";

export function useUserData(isAuthenticated) {
  const [recentJournals, setRecentJournals] = useState([]);
  const [currentMood, setCurrentMood] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Only fetch if authenticated AND token exists
    if (isAuthenticated && token) {
      fetchUserData(token);
    } else if (!isAuthenticated) {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const fetchUserData = async (token) => {
    try {
      setIsLoading(true);

      const response = await api.get("/journals?limit=2", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setRecentJournals(response.data.data);
      } else {
        console.warn("Failed to fetch recent journals");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
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
