import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './MoodTrackingPage.css';
import api from "../api/axios";

// register the components
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
  const [journals, setJournals] = useState([]);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchJournals = async () => {
      try {
        const response = await api.get("/journals");
        if (response.data.success) {
          setJournals(response.data.data);
        //   setFilteredJournals(response.data.data);
        } else {
          setError("Failed to fetch journals");
        }
      } catch (err) {
        setError("Error fetching journals");
        console.error("Error fetching journals:", err);
      }
    };
  
    fetchJournals();
  }, []);  

  useEffect(() => {
    if (journals.length === 0) return;

    const emotionTrends = processEmotionTrends(journals);
    setChartData(emotionTrends);
  }, [journals]);

  const processEmotionTrends = (journals) => {
    const today = new Date();
    const past30Days = new Date(today);
    past30Days.setDate(today.getDate() - 30);

    const dates = [];
    for (let d = new Date(past30Days); d <= today; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d).toISOString().split('T')[0]);
    }

    const emotions = [
      'excited', 'content', 'depressed', 'lonely', 'frustrated', 'irritated',
      'nervous', 'worried', 'calm', 'indifferent'
    ];
    const emotionData = emotions.reduce((acc, emotion) => {
      acc[emotion] = new Array(dates.length).fill(0);
      return acc;
    }, {});

    journals.forEach(journal => {
      const journalDate = new Date(journal.createdAt).toISOString().split('T')[0];
      const dateIndex = dates.indexOf(journalDate);
      if (dateIndex === -1) return;

      if (journal.emotionsDetected && journal.emotionsDetected.length > 0) {
        const topEmotion = journal.emotionsDetected.reduce((prev, current) =>
          prev.score > current.score ? prev : current
        );
        emotionData[topEmotion.name][dateIndex] += 1;
      }
    });

    return {
      labels: dates,
      datasets: emotions.map(emotion => ({
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
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Emotion Trends Over the Past 30 Days',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Number of Journals',
        },
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const dateIndex = elements[0].index;
        const selectedDate = chartData.labels[dateIndex];
        const journalsOnDate = journals.filter(journal =>
          new Date(journal.createdAt).toISOString().split('T')[0] === selectedDate
        );
        if (journalsOnDate.length > 0) {
          window.location.href = `/journals?date=${selectedDate}`;
        }
      }
    },
  };

  return (
    <div className="mood-tracking-page">
      <h1>Mood Tracking</h1>
      <p>Visualize your emotional patterns over the past 30 days.</p>
      {error && <p className="error">{error}</p>}
      {chartData ? (
        <div className="chart-container">
          <Line data={chartData} options={chartOptions} />
        </div>
      ) : (
        <p>No data available. Start writing journals to track your mood!</p>
      )}
      <Link to="/journals" className="back-link">Back to Journals</Link>
    </div>
  );
}

export default MoodTrackingPage;