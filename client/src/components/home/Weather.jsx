import React, { useState, useEffect } from "react";
import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudFog,
  Wind,
} from "lucide-react";
import "./Weather.css";

const CompactWeather = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationName, setLocationName] = useState("Your Location");

  // API key - in a real app, use environment variables
  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY; // Replace with your OpenWeatherMap API key

  // Get weather icon based on weather condition
  const getWeatherIcon = (weatherMain) => {
    if (!weatherMain) return <Wind size={32} color="#6b7280" />;

    switch (weatherMain) {
      case "Clear":
        return <Sun size={32} color="#f59e0b" />;
      case "Clouds":
        return <Cloud size={32} color="#6b7280" />;
      case "Rain":
      case "Drizzle":
        return <CloudRain size={32} color="#3b82f6" />;
      case "Snow":
        return <CloudSnow size={32} color="#bfdbfe" />;
      case "Thunderstorm":
        return <CloudLightning size={32} color="#8b5cf6" />;
      case "Fog":
      case "Mist":
      case "Haze":
        return <CloudFog size={32} color="#9ca3af" />;
      default:
        return <Wind size={32} color="#6b7280" />;
    }
  };

  // Get comforting message based on weather condition
  const getComfortingWords = (weatherMain, temp) => {
    if (!weatherMain || temp === undefined) {
      return "Weather information is loading. Stay patient and positive!";
    }

    switch (weatherMain) {
      case "Clear":
        return "A sunny day like your smile, warming hearts. Enjoy this beautiful moment!";
      case "Clouds":
        return "Clouds protect us from intense sunlight, offering gentle care. A good time for reflection and relaxation.";
      case "Rain":
      case "Drizzle":
        return "Raindrops are nature's music, cleansing our souls. Remember to carry an umbrella and stay warm.";
      case "Snow":
        return "Snowflakes fall gently, making the world pure and peaceful. A moment to appreciate life's beauty.";
      case "Thunderstorm":
        return "After the storm comes the rainbow. Temporary difficulties will pass. Stay strong and hopeful.";
      case "Fog":
      case "Mist":
      case "Haze":
        return "There's a mysterious beauty in fog, like life's unknowns full of possibilities. Move forward slowly and enjoy the journey.";
      default:
        return temp > 20
          ? "Warm weather is perfect for a walk outside. Let your body and mind bathe in nature's embrace."
          : temp < 5
          ? "It's quite chilly today. Remember to dress warmly, and a cup of hot tea can warm your heart."
          : "Today's weather is quite pleasant. Hope your mood is as lovely as the weather!";
    }
  };

  // Get container class based on weather condition
  const getContainerClass = () => {
    if (!weather || !weather.weather || !weather.weather[0]) {
      return "weather-container";
    }

    const weatherMain = weather.weather[0].main;

    switch (weatherMain) {
      case "Clear":
        return "weather-container clear-sky";
      case "Clouds":
        return "weather-container clouds";
      case "Rain":
      case "Drizzle":
        return "weather-container rain";
      case "Snow":
        return "weather-container snow";
      case "Thunderstorm":
        return "weather-container thunderstorm";
      case "Fog":
      case "Mist":
      case "Haze":
        return "weather-container fog";
      default:
        return "weather-container";
    }
  };

  // Fetch weather by coordinates
  const fetchWeatherByCoords = async (lat, lon) => {
    if (lat === undefined || lon === undefined) return;

    setLoading(true);
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch weather data");
      }

      const data = await response.json();
      setWeather(data);
      if (data && data.name) {
        setLocationName(data.name);
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching weather data by coordinates:", err);
      setError("Unable to get weather data for your location.");

      // Using mock data for display purposes
      setWeather({
        name: "Your Location",
        main: { temp: 18 },
        weather: [{ main: "Clear", description: "clear sky" }],
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch default weather if geolocation fails (using a default city)
  const fetchDefaultWeather = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=Beijing&appid=${API_KEY}&units=metric`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch default weather data");
      }

      const data = await response.json();
      setWeather(data);
      setLocationName("Beijing");
      setError(null);
    } catch (err) {
      console.error("Error fetching default weather data:", err);
      setError("Unable to get weather data. Please refresh the page.");

      // Using mock data for display purposes
      setWeather({
        name: "Beijing",
        main: { temp: 18 },
        weather: [{ main: "Clear", description: "clear sky" }],
      });
    } finally {
      setLoading(false);
    }
  };

  // Get geolocation on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherByCoords(
            position.coords.latitude,
            position.coords.longitude
          );
        },
        (error) => {
          console.error("Error getting location:", error);
          setError("Unable to access your location. Showing default weather.");
          fetchDefaultWeather();
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      setError(
        "Geolocation is not supported by your browser. Showing default weather."
      );
      fetchDefaultWeather();
    }
  }, []);

  if (loading) {
    return (
      <div className="weather-container">
        <div className="loading-state">
          <p>Loading weather information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-state">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={getContainerClass()}>
      {/* Location and basic weather info */}
      <div className="weather-header">
        <p className="location-name">{weather.name || locationName}</p>
        <span className="weather-icon-temp">
          {weather.weather && weather.weather[0]
            ? getWeatherIcon(weather.weather[0].main)
            : getWeatherIcon(null)}
          <span className="temperature">
            {weather.main && typeof weather.main.temp !== "undefined"
              ? `${Math.round(weather.main.temp)}°C`
              : "--°C"}
          </span>
        </span>
      </div>

      {/* Highlighted comfort message */}
      <div className="message-container">
        <div className="message-card">
          <p className="message-text">
            {weather.weather && weather.weather[0] && weather.main
              ? getComfortingWords(weather.weather[0].main, weather.main.temp)
              : "Weather information is loading. Stay patient and positive!"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompactWeather;
