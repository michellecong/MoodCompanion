import React, { useState, useEffect } from "react";
import {
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudFog,
  Wind,
} from "lucide-react";
import "./Weather.css";

// Weather Component
const WeatherComponent = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationName, setLocationName] = useState("Your Location");

  // API key using Vite environment variables
  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

  // Get weather icon based on weather condition
  const getWeatherIcon = (weatherMain) => {
    if (!weatherMain) return <Wind size={48} className="text-gray-600" />;

    switch (weatherMain) {
      case "Clear":
        return <Sun size={48} style={{ color: "#f59e0b" }} />;
      case "Clouds":
        return <Cloud size={48} style={{ color: "#6b7280" }} />;
      case "Rain":
      case "Drizzle":
        return <CloudRain size={48} style={{ color: "#3b82f6" }} />;
      case "Snow":
        return <CloudSnow size={48} style={{ color: "#bfdbfe" }} />;
      case "Thunderstorm":
        return <CloudLightning size={48} style={{ color: "#8b5cf6" }} />;
      case "Fog":
      case "Mist":
      case "Haze":
        return <CloudFog size={48} style={{ color: "#9ca3af" }} />;
      default:
        return <Wind size={48} style={{ color: "#6b7280" }} />;
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
        main: { temp: 15, humidity: 70 },
        weather: [{ main: "Clear", description: "clear sky" }],
        wind: { speed: 3.5 },
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch default weather if geolocation fails (Toronto)
  const fetchDefaultWeather = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=Toronto&appid=${API_KEY}&units=metric`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch default weather data");
      }

      const data = await response.json();
      setWeather(data);
      setLocationName("Toronto");
      setError(null);
    } catch (err) {
      console.error("Error fetching default weather data:", err);
      setError("Unable to get weather data. Please refresh the page.");

      // Using mock data for display purposes
      setWeather({
        name: "Toronto",
        main: { temp: 15, humidity: 70 },
        weather: [{ main: "Clear", description: "clear sky" }],
        wind: { speed: 3.5 },
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

  // Get appropriate weather class based on weather condition
  const getWeatherClass = () => {
    if (
      !weather ||
      !weather.weather ||
      !weather.weather[0] ||
      !weather.weather[0].main
    ) {
      return "weather-container";
    }

    const weatherMain = weather.weather[0].main;

    switch (weatherMain) {
      case "Clear":
        return "weather-container weather-clear-sky";
      case "Clouds":
        return "weather-container weather-clouds";
      case "Rain":
      case "Drizzle":
        return "weather-container weather-rain";
      case "Snow":
        return "weather-container weather-snow";
      case "Thunderstorm":
        return "weather-container weather-thunderstorm";
      case "Fog":
      case "Mist":
      case "Haze":
        return "weather-container weather-fog";
      default:
        return "weather-container";
    }
  };

  // Create placeholder skeleton content
  const loadingPlaceholder = (
    <div className="content-container">
      <div className="weather-icon-container">
        <div className="skeleton skeleton-icon"></div>
      </div>

      <div className="skeleton skeleton-city"></div>
      <div className="skeleton skeleton-temp"></div>

      <div className="weather-details">
        <div className="detail-card">
          <p className="detail-label">Humidity</p>
          <div className="skeleton skeleton-detail"></div>
        </div>
        <div className="detail-card">
          <p className="detail-label">Wind Speed</p>
          <div className="skeleton skeleton-detail"></div>
        </div>
      </div>

      <div className="message-card">
        <div className="skeleton skeleton-message-line1"></div>
        <div className="skeleton skeleton-message-line2"></div>
        <div className="skeleton skeleton-message-line3"></div>
        <div className="skeleton skeleton-message-line4"></div>
      </div>
    </div>
  );

  return (
    <div className={getWeatherClass()}>
      <h1 className="weather-title">Weather Mood Assistant</h1>

      {loading ? (
        loadingPlaceholder
      ) : error ? (
        <div className="error-state">
          <p>{error}</p>
        </div>
      ) : weather ? (
        <div className="content-container">
          {/* Weather information */}
          <div className="weather-icon-container">
            {weather.weather && weather.weather[0]
              ? getWeatherIcon(weather.weather[0].main)
              : getWeatherIcon(null)}
          </div>

          <h2 className="city-name">{weather.name || locationName}</h2>
          <p className="temperature">
            {weather.main && typeof weather.main.temp !== "undefined"
              ? `${Math.round(weather.main.temp)}°C`
              : "--°C"}
          </p>
          <p className="weather-description">
            {weather.weather &&
            weather.weather[0] &&
            weather.weather[0].description
              ? weather.weather[0].description
              : ""}
          </p>

          <div className="weather-details">
            <div className="detail-card">
              <p className="detail-label">Humidity</p>
              <p className="detail-value">
                {weather.main && typeof weather.main.humidity !== "undefined"
                  ? `${weather.main.humidity}%`
                  : "--"}
              </p>
            </div>
            <div className="detail-card">
              <p className="detail-label">Wind Speed</p>
              <p className="detail-value">
                {weather.wind && typeof weather.wind.speed !== "undefined"
                  ? `${weather.wind.speed} m/s`
                  : "--"}
              </p>
            </div>
          </div>

          {/* Comforting message */}
          <div className="message-card">
            <p className="message-text">
              {weather.weather && weather.weather[0] && weather.main
                ? getComfortingWords(weather.weather[0].main, weather.main.temp)
                : "Weather information is loading. Stay patient and positive!"}
            </p>
          </div>
        </div>
      ) : (
        loadingPlaceholder
      )}
    </div>
  );
};

export default WeatherComponent;
