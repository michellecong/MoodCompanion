import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "./MoodTrackingPage.css";
import api from "../api/axios";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function MoodTrackingPage() {
  const { isAuthenticated, isLoading: authLoading, getAccessTokenSilently } = useAuth0();

  const [journals, setJournals] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJournals = async () => {
      try {
        setLoading(true);
        const token = await getAccessTokenSilently();
        console.log("✅ Fetched token:", token);
        localStorage.setItem("token", token); 

        const response = await api.get("/journals"); // Axios interceptor will attach the token
        if (response.data.success) {
          setJournals(response.data.data);
        } else {
          setError("Failed to fetch journals");
        }
      } catch (err) {
        console.error("Error fetching journals:", err);
        setError("Error fetching journals");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && isAuthenticated) {
      fetchJournals();
    }
  }, [authLoading, isAuthenticated, getAccessTokenSilently]);

  useEffect(() => {
    if (journals.length === 0) return;

    try {
      const emotionTrends = processEmotionTrends(journals);
      setChartData(emotionTrends);
    } catch (err) {
      console.error("Error processing emotion data:", err);
      setError("Error processing emotion data");
    }
  }, [journals]);

  const processEmotionTrends = (journals) => {
    const today = new Date();
    const past30Days = new Date(today);
    past30Days.setDate(today.getDate() - 30);

    const dates = [];
    for (let d = new Date(past30Days); d <= today; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d).toISOString().split("T")[0]);
    }

    const emotions = [
      "excited", "content", "depressed", "lonely", "frustrated",
      "irritated", "nervous", "worried", "calm", "indifferent"
    ];

    const emotionData = emotions.reduce((acc, emotion) => {
      acc[emotion] = new Array(dates.length).fill(0);
      return acc;
    }, {});

    journals.forEach((journal) => {
      if (!journal?.createdAt) return;
      const journalDate = new Date(journal.createdAt).toISOString().split("T")[0];
      const index = dates.indexOf(journalDate);
      if (index === -1) return;

      const topEmotion = journal.emotionsDetected?.reduce((prev, current) =>
        prev.score > current.score ? prev : current, {});

      if (topEmotion?.name && emotionData[topEmotion.name]) {
        emotionData[topEmotion.name][index] += 1;
      } else if (topEmotion?.name) {
        console.warn(`Unknown emotion "${topEmotion.name}" detected`);
      }
    });

    return {
      labels: dates,
      datasets: emotions.map((emotion) => ({
        label: emotion.charAt(0).toUpperCase() + emotion.slice(1),
        data: emotionData[emotion],
        borderColor: getEmotionColor(emotion),
        backgroundColor: getEmotionColor(emotion, 0.2),
        fill: false,
        tension: 0.1,
      })),
    };
  };

  const getEmotionColor = (emotion, opacity = 1) => {
    const colors = {
      excited: `rgba(255, 99, 132, ${opacity})`,
      content: `rgba(75, 192, 192, ${opacity})`,
      depressed: `rgba(54, 162, 235, ${opacity})`,
      lonely: `rgba(153, 102, 255, ${opacity})`,
      frustrated: `rgba(255, 159, 64, ${opacity})`,
      irritated: `rgba(255, 99, 71, ${opacity})`,
      nervous: `rgba(255, 206, 86, ${opacity})`,
      worried: `rgba(255, 182, 193, ${opacity})`,
      calm: `rgba(144, 238, 144, ${opacity})`,
      indifferent: `rgba(169, 169, 169, ${opacity})`,
    };
    return colors[emotion] || `rgba(128, 128, 128, ${opacity})`;
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: "Emotion Trends - Past 30 Days",
      },
    },
    scales: {
      x: { title: { display: true, text: "Date" } },
      y: {
        title: { display: true, text: "Number of Journals" },
        beginAtZero: true,
        ticks: { stepSize: 1 },
      },
    },
    onClick: (event, elements) => {
      if (elements?.length > 0) {
        const dateIndex = elements[0].index;
        const selectedDate = chartData?.labels[dateIndex];
        if (selectedDate) {
          window.location.href = `/journals?date=${selectedDate}`;
        }
      }
    },
  };

  return (
    <div className="mood-tracking-page">
      <h1>Mood Tracking</h1>
      <p>Visualize your emotional patterns over the past 30 days.</p>

      {loading && <p className="loading">Loading data...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && journals.length === 0 && (
        <div className="no-data">
          <p>You haven't written any journals yet. Start journaling to track your mood!</p>
          <Link to="/journals/new" className="button primary">Write New Journal</Link>
        </div>
      )}

      {chartData ? (
        <div className="chart-container">
          <Line data={chartData} options={chartOptions} />
          <div className="chart-helper">
            <p>Click on data points to view journals from that day</p>
          </div>
        </div>
      ) : (
        !loading && journals.length > 0 && (
          <p>Unable to generate chart data. Please try again later.</p>
        )
      )}

      <div className="action-buttons">
        <Link to="/journals" className="button">Back to Journals</Link>
        <Link to="/" className="button secondary">Back to Dashboard</Link>
      </div>
    </div>
  );
}

export default MoodTrackingPage;
