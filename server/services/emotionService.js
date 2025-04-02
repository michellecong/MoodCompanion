// require('dotenv').config();
// const axios = require('axios');

// const mapSentimentToEmotions = (sentiment, mood) => {
//   let emotionsDetected = [];

//   // based on sentiment score and magnitude, map to emotions
//   // for example:
//   // - positive score with high magnitude -> joy
//   // - negative score with high magnitude -> sadness
//   if (sentiment.score >= 0.3) {
//     emotionsDetected.push({ name: 'joy', score: sentiment.score });
//   } else if (sentiment.score <= -0.3) {
//     emotionsDetected.push({ name: 'sadness', score: Math.abs(sentiment.score) });
//   } else {
//     emotionsDetected.push({ name: 'neutral', score: 0.5 });
//   }

//   // if the sentiment magnitude is high, add more emotions
//   if (sentiment.magnitude > 0.5) {
//     if (sentiment.score < 0) {
//       emotionsDetected.push({ name: 'anger', score: sentiment.magnitude * 0.5 });
//       emotionsDetected.push({ name: 'anxiety', score: sentiment.magnitude * 0.3 });
//     }
//   }

//   // if the sentiment score is close to zero, add complexity
//   if (mood && mood !== 'complexity') {
//     const moodWeight = 0.4; // mood weight
//     const existingEmotion = emotionsDetected.find(e => e.name === mood);
//     if (existingEmotion) {
//       existingEmotion.score = Math.min(1.0, existingEmotion.score + moodWeight);
//     } else {
//       emotionsDetected.push({ name: mood, score: moodWeight });
//     }
//   }

//   // normalize scores to sum to 1
//   const totalScore = emotionsDetected.reduce((sum, e) => sum + e.score, 0);
//   if (totalScore > 0) {
//     emotionsDetected = emotionsDetected.map(e => ({
//       name: e.name,
//       score: e.score / totalScore,
//     }));
//   }

//   return emotionsDetected;
// };

// const detectEmotions = async (content, mood) => {
//     try {
//         console.log('Calling Google Cloud Natural Language API with content:', content);
  
//         const API_KEY = process.env.GOOGLE_API_KEY;
//         if (!API_KEY) {
//           throw new Error("GOOGLE_API_KEY is missing in environment variables.");
//         }
  
//         const response = await axios.post(
//           `https://language.googleapis.com/v1/documents:analyzeSentiment?key=${API_KEY}`, // ✅ 修正认证方式
//           {
//             document: {
//               type: 'PLAIN_TEXT',
//               content: content,
//             },
//             encodingType: 'UTF8',
//           }
//         );
  
//       console.log('API response:', response.data); // 添加日志
//       const sentiment = response.data.documentSentiment;
//       const emotionsDetected = mapSentimentToEmotions(sentiment, mood);
//       console.log('Emotions detected:', emotionsDetected); // 添加日志
  
//       return emotionsDetected;
//     } catch (error) {
//       console.error('Error detecting emotions:', error.response ? error.response.data : error.message);
//       // 错误时返回默认值，基于 mood
//       if (mood && mood !== 'complexity') {
//         return [{ name: mood, score: 1.0 }];
//       }
//       return [{ name: 'neutral', score: 0.5 }];
//     }
//   };

// const generateFeedback = (emotionsDetected) => {
//   const topEmotion = emotionsDetected.reduce((prev, current) =>
//     prev.score > current.score ? prev : current
//   );
//   switch (topEmotion.name) {
//     case 'happy':
//     case 'joy':
//       return 'You seem to be feeling great! Keep spreading positivity!';
//     case 'calm':
//     case 'satisfaction':
//       return 'You’re feeling calm and content—nice to see!';
//     case 'sad':
//     case 'sadness':
//       return 'It looks like you might be feeling down. Would you like to try some relaxation techniques?';
//     case 'angry':
//     case 'anger':
//       return 'You seem to be feeling frustrated. Maybe take a break and breathe deeply.';
//     case 'anxious':
//     case 'anxiety':
//       return 'You might be feeling anxious. How about some deep breathing exercises?';
//     case 'neutral':
//       return 'Your emotions seem balanced. How can I assist you today?';
//     default:
//       return 'Thanks for sharing your thoughts! How can I assist you today?';
//   }
// };

// module.exports = { detectEmotions, generateFeedback };

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
//   } else {
//     // 备用逻辑：基于关键字
//     const lowerContent = content.toLowerCase();
//     if (lowerContent.includes('sad') || lowerContent.includes('unhappy')) {
//       emotionsDetected.push({ name: 'sadness', score: 0.7 });
//     } else if (lowerContent.includes('happy') || lowerContent.includes('great')) {
//       emotionsDetected.push({ name: 'joy', score: 0.7 });
//     } else if (lowerContent.includes('angry') || lowerContent.includes('frustrated')) {
//       emotionsDetected.push({ name: 'anger', score: 0.7 });
//     } else if (lowerContent.includes('anxious') || lowerContent.includes('worried')) {
//       emotionsDetected.push({ name: 'anxiety', score: 0.7 });
//     } else {
//       emotionsDetected.push({ name: 'neutral', score: 0.5 });
//     }
//   }

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
            `https://language.googleapis.com/v1/documents:analyzeSentiment?key=${API_KEY}`, // ✅ 修正认证方式
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