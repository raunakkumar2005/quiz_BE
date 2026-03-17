# Communities Module API Documentation

This document provides comprehensive documentation for the Reddit-like community feature implemented in the quiz platform backend.

## Overview

The Communities module allows users to create and participate in exam-specific communities (e.g., GATE2026, UPSC, JEE Advanced) with full Reddit-like functionality including posts, comments, voting, and moderation.

## Authentication

All endpoints (except `/api/trending`) require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Community Endpoints

### 1. Create Community
**POST** `/api/communities`

Create a new community for a specific exam.

**Request Body:**
```json
{
  "name": "GATE2026",
  "description": "Community for GATE 2026 aspirants",
  "exam": "GATE",
  "rules": ["Be respectful", "No spam", "Stay on topic"]
}
```

**Validation Rules:**
- `name`: 3-50 characters, alphanumeric and spaces only
- `description`: 10-500 characters
- `exam`: 2-100 characters, alphanumeric and spaces only
- `rules`: Optional array, max 10 items, 200 chars each

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "640123456789abcdef123456",
    "name": "GATE2026",
    "description": "Community for GATE 2026 aspirants",
    "exam": "GATE",
    "creator": {
      "_id": "640123456789abcdef123457",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "moderators": ["640123456789abcdef123457"],
    "members": ["640123456789abcdef123457"],
    "member_count": 1,
    "rules": ["Be respectful", "No spam", "Stay on topic"],
    "created_at": "2024-03-09T12:00:00.000Z"
  },
  "message": "Community created successfully"
}
```

### 2. Get All Communities
**GET** `/api/communities`

Get all communities with optional filtering.

**Query Parameters:**
- `exam` (optional): Filter by exam name
- `search` (optional): Search in name/description
- `limit` (optional): Number of results (1-100, default: 20)
- `skip` (optional): Number of results to skip (default: 0)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "communities": [...],
    "total": 150,
    "hasMore": true
  }
}
```

### 3. Get Community by Name
**GET** `/api/communities/:communityName`

Get a specific community by name.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "640123456789abcdef123456",
    "name": "GATE2026",
    "description": "Community for GATE 2026 aspirants",
    "exam": "GATE",
    "creator": {...},
    "moderators": [...],
    "members": [...],
    "member_count": 50,
    "rules": ["Be respectful", "No spam"],
    "created_at": "2024-03-09T12:00:00.000Z"
  }
}
```

### 4. Join Community
**POST** `/api/communities/:communityName/join`

Join a community.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {...},
  "message": "Successfully joined community"
}
```

### 5. Leave Community
**POST** `/api/communities/:communityName/leave`

Leave a community (creators cannot leave their own community).

**Response (200 OK):**
```json
{
  "success": true,
  "data": {...},
  "message": "Successfully left community"
}
```

### 6. Add Moderator
**POST** `/api/communities/:communityName/moderators/add`

Add a user as moderator (only existing moderators can do this).

**Request Body:**
```json
{
  "userId": "640123456789abcdef123458"
}
```

### 7. Remove Moderator
**POST** `/api/communities/:communityName/moderators/remove`

Remove moderator privileges (only community creator can do this).

**Request Body:**
```json
{
  "userId": "640123456789abcdef123458"
}
```

### 8. Ban User
**POST** `/api/communities/:communityName/ban`

Ban a user from community (only moderators can do this).

**Request Body:**
```json
{
  "userId": "640123456789abcdef123458"
}
```

### 9. Get Community Posts
**GET** `/api/communities/:communityName/posts`

Get posts from a community.

**Query Parameters:**
- `limit` (optional): Number of posts (1-100, default: 20)
- `skip` (optional): Number of posts to skip (default: 0)
- `sortBy` (optional): Sort order - "new", "top", "hot" (default: "new")

**Response:**
```json
{
  "success": true,
  "data": {
    "posts": [...],
    "total": 100,
    "hasMore": true
  }
}
```

### 10. Get Trending Posts
**GET** `/api/communities/:communityName/trending`

Get trending posts from a community (sorted by vote score).

## Post Endpoints

### 1. Create Post
**POST** `/api/posts`

Create a new post in a community.

**Request Body:**
```json
{
  "title": "Best preparation strategy for GATE 2026?",
  "content": "I'm starting my GATE 2026 preparation...",
  "communityName": "GATE2026",
  "post_type": "question",
  "tags": ["GATE", "preparation"],
  "is_anonymous": false
}
```

**Validation Rules:**
- `title`: 5-200 characters
- `content`: 10-5000 characters
- `communityName`: Must exist and user must be member
- `post_type`: "discussion", "question", "announcement", "resource"
- `tags`: Optional array, max 10 items, 50 chars each
- `is_anonymous`: Boolean (optional)

### 2. Get Post
**GET** `/api/posts/:postId`

Get a specific post by ID.

### 3. Update Post
**PUT** `/api/posts/:postId`

Update a post (only author or moderators can do this).

### 4. Delete Post
**DELETE** `/api/posts/:postId`

Delete a post (only author or moderators can do this).

### 5. Vote on Post
**POST** `/api/posts/:postId/vote`

Vote on a post.

**Request Body:**
```json
{
  "voteType": "upvote"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "post": {...},
    "vote": {
      "action": "added",
      "voteType": "upvote"
    }
  }
}
```

### 6. Pin/Unpin Post
**POST** `/api/posts/:postId/pin`

Pin or unpin a post (only moderators can do this).

### 7. Lock/Unlock Post
**POST** `/api/posts/:postId/lock`

Lock or unlock a post (only moderators can do this).

### 8. Search Posts
**GET** `/api/posts/search`

Search posts across communities.

**Query Parameters:**
- `q`: Search query (2-100 characters)
- `communityName` (optional): Limit search to specific community
- `limit` (optional): Number of results
- `skip` (optional): Number of results to skip

## Comment Endpoints

### 1. Create Comment
**POST** `/api/posts/:postId/comments`

Create a comment on a post.

**Request Body:**
```json
{
  "content": "Great question! Here's my advice...",
  "parentCommentId": "640123456789abcdef123459",
  "is_anonymous": false
}
```

### 2. Get Comments for Post
**GET** `/api/posts/:postId/comments`

Get all comments for a post (with nested replies).

### 3. Get Top-level Comments
**GET** `/api/posts/:postId/comments/top`

Get only top-level comments for a post.

### 4. Get Comment Replies
**GET** `/api/comments/:commentId/replies`

Get replies to a specific comment.

### 5. Update Comment
**PUT** `/api/comments/:commentId`

Update a comment (only author or moderators can do this).

### 6. Delete Comment
**DELETE** `/api/comments/:commentId`

Delete a comment (only author or moderators can do this).

### 7. Vote on Comment
**POST** `/api/comments/:commentId/vote`

Vote on a comment.

## Feed Endpoints

### 1. User Feed
**GET** `/api/feed`

Get posts from communities the user has joined.

**Query Parameters:**
- `limit` (optional): Number of posts
- `skip` (optional): Number of posts to skip

**Response:**
```json
{
  "success": true,
  "data": {
    "posts": [...],
    "total": 50,
    "hasMore": true
  }
}
```

### 2. Trending Posts
**GET** `/api/trending`

Get trending posts from all communities.

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": ["Field validation failed"]
  }
}
```

## Usage Examples

### Create a Community
```bash
curl -X POST http://localhost:3000/api/communities \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "UPSC2026",
    "description": "UPSC Civil Services Exam 2026",
    "exam": "UPSC",
    "rules": ["No political content", "Stay focused on preparation"]
  }'
```

### Create a Post
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Best books for UPSC preparation?",
    "content": "Looking for recommendations...",
    "communityName": "UPSC2026",
    "post_type": "question"
  }'
```

### Vote on a Post
```bash
curl -X POST http://localhost:3000/api/posts/640123456789abcdef123456/vote \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "voteType": "upvote"
  }'
```

### Get User Feed
```bash
curl -X GET http://localhost:3000/api/feed \
  -H "Authorization: Bearer your-jwt-token"
```

## Key Features

1. **Reddit-like Voting**: Users can upvote/downvote posts and comments
2. **Nested Comments**: Support for threaded comment replies
3. **Moderation**: Full moderation capabilities including banning users
4. **Feed System**: Personalized feed based on joined communities
5. **Trending Posts**: Algorithm-based trending posts across communities
6. **Anonymous Posts**: Option for anonymous posting (configurable per community)
7. **Search**: Full-text search across posts and comments
8. **Validation**: Comprehensive input validation and sanitization
9. **Authentication**: JWT-based authentication for all actions
10. **Rate Limiting**: Built-in protection against spam and abuse

## Database Schema

The implementation uses MongoDB with the following collections:
- `communities`: Community information and metadata
- `posts`: Posts within communities
- `comments`: Comments on posts (with nested support)
- `votes`: User votes on posts and comments
- `users`: Extended with community relationships

## Testing

Run the comprehensive test suite:
```bash
npm run test:communities
```

This will test all major functionality including community creation, post management, voting, and moderation features.