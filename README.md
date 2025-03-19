# MoodCompanion

# Mind Companion API Documentation

This document explains how to test the Mind Companion API using Postman, focusing on user authentication and journal creation.

## Prerequisites

- [Postman](https://www.postman.com/downloads/) installed on your machine
- The Mind Companion API server running locally or deployed

## Server Environment Variables (.env)

The server requires the following environment variables in a .env file:

```
PORT=3000
MONGODB_URI=your-mongoDB-uri
JWT_SECRET=your_jwt_secret_key_here
```

## Authentication Flow

The API uses JWT (JSON Web Token) for authentication. You must first register or login to receive a token, then use this token in subsequent requests.

### 1. User Registration

1. Open Postman and create a new request
2. Set the request method to `POST`
3. Set the URL to `http://localhost:3000/api/users/register` (adjust the URL if your server is running on a different host/port)
4. Go to the `Body` tab, select `raw` and set the format to `JSON`
5. Enter the registration details:

```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "yourpassword123"
}
```

6. Click `Send`
7. The server will respond with a token and user details if registration is successful:

```json
{
  "success": true,
  "token": "your-jwt-token-here",
  "user": {
    "id": "user-id",
    "username": "testuser",
    "email": "test@example.com",
    "role": ["user"],
    "profilePicture": "default-avatar.png",
    "createdAt": "2025-03-19T00:00:00.000Z"
  }
}
```

### 2. User Login

1. Create a new request in Postman
2. Set the request method to `POST`
3. Set the URL to `http://localhost:3000/api/users/login`
4. Go to the `Body` tab, select `raw` and set the format to `JSON`
5. Enter the login credentials:

```json
{
  "email": "test@example.com",
  "password": "yourpassword123"
}
```

6. Click `Send`
7. The server will respond with a token and user details if login is successful

### 3. Copy the Authentication Token

From either the registration or login response:

1. Find the `token` field in the JSON response
2. Copy the token value (without the quotes)

## Creating a Journal Entry

Once you have obtained your authentication token, you can use it to create journal entries:

### 1. Set Up the Journal Request

1. Create a new request in Postman
2. Set the request method to `POST`
3. Set the URL to `http://localhost:3000/api/journals`

### 2. Add Authentication Header

1. Go to the `Headers` tab
2. Add a new header with:
   - Key: `x-auth-token`
   - Value: [paste your copied token here]

### 3. Add Journal Content

1. Go to the `Body` tab, select `raw` and set the format to `JSON`
2. Enter the journal details:

```json
{
  "title": "My Journal Entry",
  "content": "Today was a great day. I accomplished many things and feel positive about my progress."
}
```

3. Click `Send`
4. If successful, the server will respond with the created journal entry, including emotion analysis:

```json
{
  "success": true,
  "data": {
    "userId": "user-id",
    "title": "My Journal Entry",
    "content": "Today was a great day...",
    "emotionsDetected": [
      {
        "name": "joy",
        "score": 0.8
      },
      {
        "name": "satisfaction",
        "score": 0.6
      }
    ],
    "feedback": "You seem to be in a positive mood today!",
    "_id": "journal-id",
    "createdAt": "2025-03-19T02:30:00.000Z",
    "updatedAt": "2025-03-19T02:30:00.000Z"
  }
}
```

## Troubleshooting

- **401 Unauthorized**: Make sure you're including the correct token in the `x-auth-token` header
- **400 Bad Request**: Check your request body format and ensure all required fields are included
- **500 Server Error**: Check the server logs for more detailed information

## Creating Postman Collection (Optional)

For easier testing, you can create a Postman collection:

1. Click the "New" button and select "Collection"
2. Name your collection (e.g., "Mind Companion API")
3. Add your requests to this collection
4. Use environment variables to store and automatically update your token

```
// In the Tests tab of your login request:
pm.environment.set("token", pm.response.json().token);

// Then use {{token}} as the value for your x-auth-token header
```

This makes testing the API more efficient, especially when tokens expire.
