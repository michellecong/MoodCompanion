const axios = require('axios');

const mapSentimentToEmotions = (sentiment, content) => {
  let emotionsDetected = [];

  if (sentiment) {
    if (sentiment.score >= 0.3) {
      emotionsDetected.push({ name: 'joy', score: sentiment.score });
    } else if (sentiment.score <= -0.3) {
      emotionsDetected.push({ name: 'sadness', score: Math.abs(sentiment.score) });
    } else {
      emotionsDetected.push({ name: 'neutral', score: 0.5 });
    }

    if (sentiment.magnitude > 0.5) {
      if (sentiment.score < 0) {
        emotionsDetected.push({ name: 'anger', score: sentiment.magnitude * 0.5 });
        emotionsDetected.push({ name: 'anxiety', score: sentiment.magnitude * 0.3 });
      }
    }
}

  const totalScore = emotionsDetected.reduce((sum, e) => sum + e.score, 0);
  if (totalScore > 0) {
    emotionsDetected = emotionsDetected.map(e => ({
      name: e.name,
      score: e.score / totalScore,
    }));
  }

  return emotionsDetected;
};

const detectEmotions = async (content) => {
    try {
        console.log('Calling Google Cloud Natural Language API with content:', content);
    
        const API_KEY = process.env.GOOGLE_API_KEY;
        if (!API_KEY) {
            throw new Error("GOOGLE_API_KEY is missing in environment variables.");
        }
    
        const response = await axios.post(
            `https://language.googleapis.com/v1/documents:analyzeSentiment?key=${API_KEY}`,
            {
            document: {
                type: 'PLAIN_TEXT',
                content: content,
            },
            encodingType: 'UTF8',
            }
        );

    console.log('API response:', response.data);
    const sentiment = response.data.documentSentiment;
    const emotionsDetected = mapSentimentToEmotions(sentiment, content);
    console.log('Emotions detected:', emotionsDetected);

    return emotionsDetected;
  } catch (error) {
    console.error('Error detecting emotions:', error.response ? error.response.data : error.message);
    return mapSentimentToEmotions(null, content);
  }
};

const generateFeedback = (emotionsDetected) => {
  const topEmotion = emotionsDetected.reduce((prev, current) =>
    prev.score > current.score ? prev : current
  );
  switch (topEmotion.name) {
    case 'happy':
    case 'joy':
      return 'You seem to be feeling great! Keep spreading positivity!';
    case 'calm':
    case 'satisfaction':
      return 'You’re feeling calm and content—nice to see!';
    case 'sad':
    case 'sadness':
      return 'It looks like you might be feeling down. Would you like to try some relaxation techniques?';
    case 'angry':
    case 'anger':
      return 'You seem to be feeling frustrated. Maybe take a break and breathe deeply.';
    case 'anxious':
    case 'anxiety':
      return 'You might be feeling anxious. How about some deep breathing exercises?';
    case 'neutral':
      return 'Your emotions seem balanced. How can I assist you today?';
    default:
      return 'Thanks for sharing your thoughts! How can I assist you today?';
  }
};

module.exports = { detectEmotions, generateFeedback };