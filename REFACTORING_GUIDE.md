# Refactoring Guide: Habits to Tasks

This document outlines the comprehensive refactoring performed to replace the concept of "habits" with "tasks" throughout the Fractal Assembly project.

## Overview

The refactoring involved updating terminology from "habits" to "tasks" across the entire codebase, including:
- Backend models and API endpoints
- Database schema and migration
- Mobile app interfaces and components
- TypeScript type definitions

## Changes Made

### Backend Changes

#### 1. Model Refactoring
- **Removed**: `apps/backend/src/models/Habit.js`
- **Added**: `apps/backend/src/models/Task.js`
- Updated all database queries to use `tasks` and `task_completions` tables
- Replaced method names: `getHabitsWithTodayStatus` → `getTasksWithTodayStatus`
- Updated parameter names: `habitId` → `taskId`

#### 2. API Routes
- **Removed**: `apps/backend/src/routes/habits.js`
- **Added**: `apps/backend/src/routes/tasks.js`
- Updated all endpoints from `/api/habits/*` to `/api/tasks/*`
- Updated error messages and response text to use "task" terminology

#### 3. Database Schema
- **Old Tables**: `habits`, `habit_completions`
- **New Tables**: `tasks`, `task_completions`
- Updated foreign key references: `habit_id` → `task_id`
- Updated indexes to match new table names

#### 4. Server Configuration
- Updated `apps/backend/src/index.js` to import `tasksRouter` instead of `habitsRouter`
- Changed API route mounting from `/api/habits` to `/api/tasks`
- Updated startup messages and endpoint documentation

### Mobile App Changes

#### 1. API Client (`apps/mobile/services/api.ts`)
- **Interface**: `Habit` → `Task`
- **Interface**: `HabitCompletion` → `TaskCompletion`
- **Methods**: 
  - `getHabits()` → `getTasks()`
  - `getHabit()` → `getTask()`
  - `createHabit()` → `createTask()`
  - `updateHabit()` → `updateTask()`
  - `deleteHabit()` → `deleteTask()`
  - `markHabitComplete()` → `markTaskComplete()`
  - `markHabitIncomplete()` → `markTaskIncomplete()`
  - `getHabitStats()` → `getTaskStats()`

#### 2. Context Updates (`apps/mobile/contexts/TaskContext.tsx`)
- **Methods**: 
  - `initFoundationalHabits()` → `initFoundationalTasks()`
  - `resetDailyHabits()` → `resetDailyTasks()`
- **Action Types**: `RESET_DAILY_HABITS_LOCAL` → `RESET_DAILY_TASKS_LOCAL`
- Updated function `convertApiHabitToTask()` → `convertApiTaskToTask()`

#### 3. UI Components
- Updated loading messages from "Loading habits..." to "Loading tasks..."
- Updated button labels and user-facing text
- Fixed TypeScript linting issues with unused variables and `any` types

### Database Migration

#### Migration Script
- **Added**: `apps/backend/src/scripts/migrate-habits-to-tasks.js`
- Safely backs up original `habits.db` to `habits.db.backup`
- Creates new `tasks.db` with updated schema
- Migrates all data from old tables to new tables
- Preserves all completion records and metadata
- Creates proper indexes for performance

#### Database Files
- **Old**: `apps/backend/data/habits.db`
- **New**: `apps/backend/data/tasks.db`
- **Backup**: `apps/backend/data/habits.db.backup`

## Migration Steps

If you need to run the migration manually:

1. **Backup Current Database**:
   ```bash
   cd apps/backend
   cp data/habits.db data/habits.db.manual-backup
   ```

2. **Run Migration Script**:
   ```bash
   cd apps/backend
   node src/scripts/migrate-habits-to-tasks.js
   ```

3. **Verify Migration**:
   ```bash
   # Check that new database exists
   ls -la data/tasks.db
   
   # Start the server to test
   npm start
   ```

## API Endpoint Changes

### Old Endpoints
```
GET    /api/habits
GET    /api/habits/:id
POST   /api/habits
PUT    /api/habits/:id
DELETE /api/habits/:id
POST   /api/habits/:id/complete
DELETE /api/habits/:id/complete
GET    /api/habits/:id/stats
GET    /api/habits/completions/today
GET    /api/habits/completions/range
POST   /api/habits/reset-day
```

### New Endpoints
```
GET    /api/tasks
GET    /api/tasks/:id
POST   /api/tasks
PUT    /api/tasks/:id
DELETE /api/tasks/:id
POST   /api/tasks/:id/complete
DELETE /api/tasks/:id/complete
GET    /api/tasks/:id/stats
GET    /api/tasks/completions/today
GET    /api/tasks/completions/range
POST   /api/tasks/reset-day
```

## TypeScript Type Changes

### Old Types
```typescript
interface Habit {
  id: string;
  text: string;
  completedToday: boolean;
  // ...
}

interface HabitCompletion {
  id: string;
  habitId: string;
  completedAt: string;
  completionDate: string;
}
```

### New Types
```typescript
interface Task {
  id: string;
  text: string;
  completedToday: boolean;
  // ...
}

interface TaskCompletion {
  id: string;
  taskId: string;
  completedAt: string;
  completionDate: string;
}
```

## Testing

After the refactoring:

1. **Backend Testing**:
   ```bash
   cd apps/backend
   npm start
   # Test endpoints with curl or Postman
   curl http://localhost:3001/api/tasks
   ```

2. **Mobile App Testing**:
   ```bash
   cd apps/mobile
   npm start
   # Test in simulator/device
   ```

3. **Database Verification**:
   - Verify all tasks are present in new database
   - Check that completion history is preserved
   - Ensure new tasks can be created and completed

## Rollback Plan

If needed, you can rollback by:

1. Stop the server
2. Restore the backup: `cp data/habits.db.backup data/habits.db`
3. Revert the code changes using git
4. Restart with the old codebase

## Files Modified

### Backend
- `src/models/Task.js` (new)
- `src/models/database.js`
- `src/routes/tasks.js` (new)
- `src/index.js`
- `src/scripts/init-db.js`
- `src/scripts/migrate-habits-to-tasks.js` (new)

### Mobile
- `services/api.ts`
- `contexts/TaskContext.tsx`
- `app/(tabs)/index.tsx`
- Various component files for linting fixes

### Database
- `data/tasks.db` (new)
- `data/habits.db.backup` (backup of original)

## Summary

This refactoring successfully transforms the entire application from using "habit" terminology to "task" terminology while:
- Preserving all existing functionality
- Maintaining data integrity through safe migration
- Updating all user-facing text consistently
- Following TypeScript best practices
- Ensuring backward compatibility through database backups

The refactoring is comprehensive and maintains the same feature set while providing clearer, more general terminology that better reflects the application's purpose.