# AI Mood Companion: A Web-Based Emotional Support Platform

MoodCompanion is a personal AI-powered application that helps users track their emotions, journal their thoughts, and find support. The app features mood tracking, digital journaling with emotion detection, and a community support system.

## Table of Contents

- [Features](#features)
- [Client](#Client)
- [Project Structure](#project-structure)

## Features

- **Mood Tracker**: Record and visualize your daily emotional states
- **Digital Journal**: AI-powered journaling with emotion analysis
- **AI Companion**: Get emotional support and personalized advice
- **Community Support**: Share thoughts anonymously with others

## Tech Stack
Frontend: React
Backend: Node.js, Express.js
Database: MongoDB
APIs: OpenAI, Google Cloud Natural Language API
Deployment: Render

## Environment Configuration
If you are running the web app locally, add the following configuration in a .env file:
```sh
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key
OPENAI_API_KEY=your_openai_api_key
```

## Server
Start server:
```bash
nodemon server.js
```

## Client

1. Install dependencies:

```bash
npm install
```

2. Start client:

```bash
npm run dev
```

3. Open your browser and navigate to http://localhost:5173 (or some other port if port 5173 is already occupied, it will notify you).

4. Running Tests:
```bash
npx vitest
```

## Time Line
- Iteration 1 - Mar 25
- Iteration 2 - Apr 5
- Iteration 3 - Apr 16
- Final Project submission - Apr 17 (10:45 am)

## License

This project is licensed under the MIT License - see the LICENSE file for details.



