# Quiz Backend - Project Specification

## Folder Structure

```
Quiz-BE/
├── src/
│   ├── config/
│   │   └── database.js         # MongoDB connection
│   ├── controllers/           # Thin controllers (request/response only)
│   │   └── quizController.js
│   ├── services/              # Business logic (thick)
│   │   ├── quizService.js
│   │   ├── aiService.js
│   │   └── questionService.js
│   ├── models/                # Mongoose schemas
│   │   ├── Question.js
│   │   ├── Quiz.js
│   │   ├── QuizQuestion.js
│   │   └── QuizAttempt.js
│   ├── routes/                # API route definitions
│   │   └── quizRoutes.js
│   ├── middleware/           # Express middleware
│   │   ├── errorHandler.js
│   │   └── validator.js
│   ├── utils/                 # Utility functions
│   │   ├── constants.js
│   │   └── helpers.js
│   └── app.js                 # Express app setup
├── .env                       # Environment variables
├── package.json               # Dependencies
├── server.js                  # Entry point
└── SPEC.md                    # This file
```

## Architecture Principles
- **Thin Controllers**: Only handle request/response, delegate to services
- **Thick Services**: All business logic resides here
- **Clean Separation**: Each layer has single responsibility
- **Centralized Error Handling**: Express error middleware
- **Environment Variables**: Configuration via .env

---

## REST API Contracts

### 1. Create Quiz
**POST** `/api/quizzes`

**Request Body:**
```json
{
  "exam": "JEE",
  "subject": "Physics",
  "topic": "Mechanics",
  "difficulty": "EASY",
  "num_questions": 10
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Quiz created successfully",
  "data": {
    "quiz_id": "507f1f77bcf86cd799439011",
    "exam": "JEE",
    "subject": "Physics",
    "topic": "Mechanics",
    "difficulty": "EASY",
    "total_questions": 10,
    "ai_generated": true,
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### 2. Get Quiz Questions
**GET** `/api/quizzes/:quiz_id/questions`

**Response (200):**
```json
{
  "success": true,
  "message": "Quiz questions fetched successfully",
  "data": {
    "quiz": {
      "_id": "507f1f77bcf86cd799439011",
      "exam": "JEE",
      "subject": "Physics",
      "topic": "Mechanics",
      "difficulty": "EASY",
      "total_questions": 10,
      "created_at": "2024-01-15T10:30:00.000Z"
    },
    "questions": [
      {
        "_id": "...",
        "question_text": "What is the SI unit of force?",
        "options": [
          { "key": "A", "value": "Newton" },
          { "key": "B", "value": "Joule" },
          { "key": "C", "value": "Watt" },
          { "key": "D", "value": "Pascal" }
        ]
      }
    ]
  }
}
```

---

### 3. Submit Quiz
**POST** `/api/quizzes/:quiz_id/submit`

**Request Body:**
```json
{
  "quiz_id": "507f1f77bcf86cd799439011",
  "answers": [
    { "question_id": "abc123", "selected_option": "A" },
    { "question_id": "def456", "selected_option": "B" }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Quiz submitted successfully",
  "data": {
    "quiz_id": "507f1f77bcf86cd799439011",
    "total_questions": 10,
    "correct_answers": 7,
    "incorrect_answers": 3,
    "unanswered": 0,
    "score_percentage": 70,
    "results": [
      {
        "question_id": "abc123",
        "selected_option": "A",
        "correct_option": "A",
        "is_correct": true,
        "explanation": "Newton is the SI unit of force..."
      }
    ]
  }
}
```

---

### 4. Get Quiz Result
**GET** `/api/quizzes/:quiz_id/result`

**Response (200):**
```json
{
  "success": true,
  "message": "Quiz result fetched successfully",
  "data": {
    "quiz_id": "507f1f77bcf86cd799439011",
    "total_questions": 10,
    "correct_answers": 7,
    "incorrect_answers": 3,
    "unanswered": 0,
    "score_percentage": 70,
    "results": [...]
  }
}
```

---

### 5. Health Check
**GET** `/health`

**Response (200):**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Error Responses

**400 - Validation Error:**
```json
{
  "success": false,
  "status": "fail",
  "message": "Missing required fields: exam, subject, topic"
}
```

**404 - Not Found:**
```json
{
  "success": false,
  "status": "fail",
  "message": "Quiz not found"
}
```

**500 - Server Error:**
```json
{
  "success": false,
  "status": "error",
  "message": "Internal server error"
}
```
