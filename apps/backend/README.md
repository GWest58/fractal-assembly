# Fractal Assembly Backend API

A REST API for tracking foundational habits and daily completions.

## Overview

This backend provides a robust API for managing daily habits with completion tracking, statistics, and persistence. It's designed to work with the Fractal Assembly mobile app but can be used by any client application.

## Features

- ✅ **Foundational Habits Management** - Pre-configured essential daily habits
- ✅ **Daily Completion Tracking** - Track habit completions with timestamps
- ✅ **Statistics & Streaks** - Get completion rates and streak information
- ✅ **Category Organization** - Habits organized by health, wellness, productivity, personal
- ✅ **Date Range Queries** - Query completions across date ranges
- ✅ **Daily Reset Functionality** - Reset all habits for a new day
- ✅ **SQLite Database** - Lightweight, serverless database with full ACID compliance
- ✅ **CORS Support** - Ready for web and mobile app integration
- ✅ **Rate Limiting** - Protection against abuse
- ✅ **Error Handling** - Comprehensive error responses

## Quick Start

### 1. Install Dependencies

```bash
cd apps/backend
npm install
```

### 2. Initialize Database

```bash
npm run init-db
```

### 3. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3001`

### 4. Health Check

```bash
curl http://localhost:3001/health
```

## API Endpoints

### Base URL
```
http://localhost:3001/api
```

### Authentication
Currently no authentication is required. All endpoints are publicly accessible.

---

## Habits API

### Get All Habits
Get all foundational habits with today's completion status.

```http
GET /api/habits
```

**Query Parameters:**
- `date` (optional) - ISO date string (YYYY-MM-DD). Defaults to today.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "foundational-0",
      "text": "Make bed",
      "category": "personal",
      "isFoundational": true,
      "completedToday": true,
      "lastCompletedAt": "2024-01-15T08:30:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "date": "2024-01-15"
}
```

### Get Specific Habit
Get details for a specific habit.

```http
GET /api/habits/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "foundational-0",
    "text": "Make bed",
    "category": "personal",
    "isFoundational": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Create New Habit
Create a new foundational habit.

```http
POST /api/habits
```

**Body:**
```json
{
  "text": "Drink 8 glasses of water",
  "category": "health",
  "isFoundational": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-generated-id",
    "text": "Drink 8 glasses of water",
    "category": "health",
    "isFoundational": true,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  },
  "message": "Habit created successfully"
}
```

**Validation:**
- `text` is required and cannot be empty
- `category` must be one of: `health`, `wellness`, `productivity`, `personal`
- `isFoundational` defaults to `true`

### Update Habit
Update an existing habit's text or category.

```http
PUT /api/habits/:id
```

**Body:**
```json
{
  "text": "Make bed and organize room",
  "category": "personal"
}
```

### Delete Habit
Delete a habit (only non-foundational habits can be deleted).

```http
DELETE /api/habits/:id
```

**Note:** Foundational habits cannot be deleted and will return a 403 error.

---

## Completion Tracking

### Mark Habit Complete
Mark a habit as completed for today (or specified date).

```http
POST /api/habits/:id/complete
```

**Body (optional):**
```json
{
  "completedAt": "2024-01-15T08:30:00.000Z"
}
```

If `completedAt` is not provided, the current timestamp is used.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "completion-id",
    "habitId": "foundational-0",
    "completedAt": "2024-01-15T08:30:00.000Z",
    "completionDate": "2024-01-15"
  },
  "message": "Habit marked as completed"
}
```

### Mark Habit Incomplete
Remove completion for a habit on a specific date.

```http
DELETE /api/habits/:id/complete?date=2024-01-15
```

**Query Parameters:**
- `date` (optional) - ISO date string. Defaults to today.

### Get Today's Completions
Get all habit completions for today.

```http
GET /api/habits/completions/today
```

**Query Parameters:**
- `date` (optional) - ISO date string. Defaults to today.

### Get Completions Range
Get habit completions for a date range.

```http
GET /api/habits/completions/range?startDate=2024-01-01&endDate=2024-01-15
```

**Query Parameters:**
- `startDate` (required) - ISO date string (YYYY-MM-DD)
- `endDate` (required) - ISO date string (YYYY-MM-DD)

---

## Statistics

### Get Habit Statistics
Get completion statistics for a specific habit.

```http
GET /api/habits/:id/stats?days=30
```

**Query Parameters:**
- `days` (optional) - Number of days to analyze. Defaults to 30.

**Response:**
```json
{
  "success": true,
  "data": {
    "habit": {
      "id": "foundational-0",
      "text": "Make bed",
      "category": "personal",
      "isFoundational": true
    },
    "stats": {
      "totalDays": 30,
      "completedDays": 25,
      "completionRate": 83,
      "streak": 7
    }
  }
}
```

---

## Utility Endpoints

### Reset Day
Reset all foundational habits for a specific day (mark all as incomplete).

```http
POST /api/habits/reset-day
```

**Body (optional):**
```json
{
  "date": "2024-01-15"
}
```

If `date` is not provided, today is used.

**Response:**
```json
{
  "success": true,
  "message": "All foundational habits reset for 2024-01-15",
  "date": "2024-01-15",
  "resetCount": 5
}
```

### Health Check

```http
GET /health
```

**Response:**
```json
{
  "success": true,
  "message": "Fractal Assembly Backend is running",
  "timestamp": "2024-01-15T10:00:00.000Z",
  "uptime": 3600
}
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created successfully
- `400` - Bad request (validation error)
- `403` - Forbidden (e.g., trying to delete foundational habit)
- `404` - Resource not found
- `429` - Too many requests (rate limited)
- `500` - Internal server error

---

## Database Schema

### Tables

#### `habits`
```sql
CREATE TABLE habits (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('health', 'wellness', 'productivity', 'personal')),
  is_foundational BOOLEAN NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### `habit_completions`
```sql
CREATE TABLE habit_completions (
  id TEXT PRIMARY KEY,
  habit_id TEXT NOT NULL,
  completed_at DATETIME NOT NULL,
  completion_date DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (habit_id) REFERENCES habits (id) ON DELETE CASCADE,
  UNIQUE(habit_id, completion_date)
);
```

#### `tasks` (for future regular tasks)
```sql
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT 0,
  category TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## Development

### Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-restart
- `npm run init-db` - Initialize database with foundational habits
- `npm test` - Run tests (currently no tests configured)

### Environment Variables

- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)

### Default Foundational Habits

The system initializes with these 5 foundational habits:

1. **Make bed** (personal)
2. **Take meds** (health)
3. **Meditate 5 minutes** (wellness)
4. **Go for a walk** (health)
5. **Daily check-in** (productivity)

---

## CORS Configuration

The server accepts requests from:
- `http://localhost:3000` (React dev)
- `http://localhost:8081` (Expo dev)
- `http://localhost:19000` (Expo web)
- `http://localhost:19006` (Expo web alt)
- `exp://localhost:19000` (Expo mobile)

---

## Rate Limiting

- **Limit:** 100 requests per 15 minutes per IP
- **Scope:** All `/api/*` endpoints
- **Headers:** Standard rate limit headers included

---

## Security Features

- **Helmet.js** - Security headers
- **CORS** - Cross-origin protection
- **Rate limiting** - Abuse prevention
- **Input validation** - SQL injection prevention
- **Error handling** - Information disclosure prevention

---

## Future Enhancements

- [ ] User authentication and authorization
- [ ] Habit templates and recommendations
- [ ] Social features and sharing
- [ ] Advanced analytics and insights
- [ ] Notification system
- [ ] Data export functionality
- [ ] Mobile push notifications
- [ ] Habit categories customization

---

## Support

For issues or questions, please check the project repository or contact the development team.