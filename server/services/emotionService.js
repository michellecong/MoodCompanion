const axios = require("axios");

const mapSentimentToEmotions = (sentiment, content) => {
  let emotionsDetected = [];

  // Handle case when sentiment is null (API failure)
  if (!sentiment) {
    return [{ name: "indifferent", score: 1.0 }];
  }

  if (sentiment) {
    // positive mood (score > 0)
    if (sentiment.score >= 0.5) {
      emotionsDetected.push({ name: "excited", score: sentiment.score });
    } else if (sentiment.score >= 0.3) {
      emotionsDetected.push({ name: "content", score: sentiment.score });
    }
    // negative mood (score < 0)
    else if (sentiment.score <= -0.5) {
      emotionsDetected.push({ name: "depressed", score: Math.abs(sentiment.score) });
    } else if (sentiment.score <= -0.3) {
      emotionsDetected.push({ name: "lonely", score: Math.abs(sentiment.score) });
    }
    // neutral mood (score between -0.3 and 0.3)
    else {
      if (sentiment.magnitude < 0.3) {
        emotionsDetected.push({ name: "calm", score: 0.5 });
      } else {
        emotionsDetected.push({ name: "indifferent", score: 0.5 });
      }
    }

    // additional emotions based on magnitude
    if (sentiment.magnitude > 0.5) {
      if (sentiment.score < 0) {
        if (sentiment.magnitude > 1.0) {
          emotionsDetected.push({ name: "frustrated", score: sentiment.magnitude * 0.5 });
        } else {
          emotionsDetected.push({ name: "irritated", score: sentiment.magnitude * 0.5 });
        }
        if (sentiment.magnitude > 0.8) {
          emotionsDetected.push({ name: "nervous", score: sentiment.magnitude * 0.3 });
        } else {
          emotionsDetected.push({ name: "worried", score: sentiment.magnitude * 0.3 });
        }
      }
    }
  }

  // Normalize scores to sum to 1
  const totalScore = emotionsDetected.reduce((sum, e) => sum + e.score, 0);
  if (totalScore > 0) {
    emotionsDetected = emotionsDetected.map((e) => ({
      name: e.name,
      score: e.score / totalScore,
    }));
  }

  return emotionsDetected;
};

const detectEmotions = async (content) => {
  try {
    console.log("Calling Google Cloud Natural Language API with content:", content);

    const API_KEY = process.env.GOOGLE_API_KEY;
    if (!API_KEY) {
      throw new Error("GOOGLE_API_KEY is missing in environment variables.");
    }

    const response = await axios.post(
      `https://language.googleapis.com/v1/documents:analyzeSentiment?key=${API_KEY}`,
      {
        document: {
          type: "PLAIN_TEXT",
          content: content,
        },
        encodingType: "UTF8",
      }
    );

    console.log("API response:", response.data);
    const sentiment = response.data.documentSentiment;
    const emotionsDetected = mapSentimentToEmotions(sentiment, content);
    console.log("Emotions detected:", emotionsDetected);

    return emotionsDetected;
  } catch (error) {
    console.error(
      "Error detecting emotions:",
      error.response ? error.response.data : error.message
    );
    return mapSentimentToEmotions(null, content);
  }
};

const generateFeedback = (emotionsDetected) => {
  if (!emotionsDetected || emotionsDetected.length === 0) {
    return "Thanks for sharing your thoughts! How can I assist you today?";
  }
  try {
    const topEmotion = emotionsDetected.reduce((prev, current) =>
      prev.score > current.score ? prev : current
    );
    switch (topEmotion.name) {
      case "excited":
        return "You're feeling excited! Keep that energy going!";
      case "content":
        return "You seem content and at peace—wonderful!";
      case "depressed":
        return "It looks like you might be feeling depressed. Would you like to try some uplifting activities?";
      case "lonely":
        return "You might be feeling lonely. How about connecting with a friend?";
      case "frustrated":
        return "You seem frustrated. Maybe take a break and relax.";
      case "irritated":
        return "You seem a bit irritated. Let’s take a deep breath.";
      case "nervous":
        return "You might be feeling nervous. How about some calming exercises?";
      case "worried":
        return "You seem worried. Let’s try to focus on the present.";
      case "calm":
        return "You’re feeling calm—nice to see!";
      case "indifferent":
        return "You seem neutral. How can I assist you today?";
      default:
        return "Thanks for sharing your thoughts! How can I assist you today?";
    }
  } catch (error) {
    console.error("Error generating feedback:", error);
    return "Thanks for sharing your thoughts! How can I assist you today?";
  }
};

module.exports = { detectEmotions, generateFeedback };