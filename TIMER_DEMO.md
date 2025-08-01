# Timer Functionality Demo

This document demonstrates the complete timer functionality that has been implemented in the Fractal Assembly app.

## 🎯 Overview

Users can now:
1. Set durations for tasks (e.g., "5 minutes", "25 min", "1h 30m")
2. Start timers for tasks with durations
3. Have tasks automatically marked complete when timers finish
4. Control timers with start/pause/stop functionality

## 🗄️ Database Schema

### Tasks Table
```sql
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  frequency_type TEXT DEFAULT 'daily',
  frequency_data TEXT DEFAULT '{}',
  frequency_time TEXT,
  completed BOOLEAN NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  duration_seconds INTEGER NULL,
  timer_started_at DATETIME NULL,
  timer_status TEXT DEFAULT 'not_started' CHECK (timer_status IN ('not_started', 'running', 'paused', 'completed'))
);
```

## 🔌 API Endpoints

### Timer Control
- `POST /api/tasks/:id/timer/start` - Start timer
- `POST /api/tasks/:id/timer/pause` - Pause timer
- `POST /api/tasks/:id/timer/stop` - Stop timer
- `GET /api/tasks/:id/timer/status` - Get timer status

### Task Management
- `POST /api/tasks` - Create task with optional `durationSeconds`
- `PUT /api/tasks/:id` - Update task including duration

## 📱 Mobile Components

### 1. DurationInput Component
**Location**: `components/DurationInput.tsx`

Allows users to input duration in various formats:
- Natural language: "5 minutes", "1 hour 30 minutes"
- Abbreviated: "5m", "1h 30m", "90s"
- Time format: "1:30" (1 min 30 sec), "0:05:30" (5 min 30 sec)
- Numbers: "5" (assumes minutes)

**Features**:
- Real-time validation and parsing
- Quick preset buttons (5min, 10min, 15min, 25min, 30min, 1hr)
- Visual feedback for valid/invalid input

### 2. Timer Component
**Location**: `components/Timer.tsx`

**Features**:
- Visual progress bar
- Countdown display
- Start/Pause/Stop controls
- Auto-completion when timer expires
- Persistent state across app sessions

### 3. Updated TaskItem
**Location**: `components/tasks/TaskItem.tsx`

**New Features**:
- Shows timer for tasks with duration
- Displays duration information
- Auto-completes task when timer finishes
- Integrates seamlessly with existing task actions

### 4. Updated AddTaskForm
**Location**: `components/tasks/AddTaskForm.tsx`

**New Features**:
- Duration input section
- Preview shows duration in task preview
- Validates and formats duration input

## 🔧 Services

### TimerService
**Location**: `services/timerService.ts`

**Key Methods**:
- `startTimer(taskId)` - Start timer for task
- `pauseTimer(taskId)` - Pause running timer
- `stopTimer(taskId)` - Stop and reset timer
- `getTimerStatus(taskId)` - Get current timer state
- `formatTime(seconds)` - Format seconds to HH:MM:SS or MM:SS
- `parseDurationInput(input)` - Parse various duration formats

## 🎮 Usage Examples

### Creating a Task with Duration

1. **Tap the + button** to open Add Task form
2. **Enter task text**: "Meditate"
3. **Set duration**: Type "5 minutes" or select "5 min" preset
4. **Tap Create Task**

### Starting a Timer

1. **Find task** with duration in task list
2. **Tap Start** in the timer section
3. **Timer begins countdown** with visual progress
4. **Task auto-completes** when timer reaches zero

### Timer Controls

- **Start**: Begin countdown
- **Pause**: Temporarily stop countdown (can resume)
- **Stop**: Reset timer completely
- **Progress Bar**: Shows visual progress
- **Time Display**: Shows remaining time

### Duration Input Formats

| Input | Parsed As | Display |
|-------|-----------|---------|
| `5` | 5 minutes | 5:00 |
| `5 minutes` | 5 minutes | 5:00 |
| `5m` | 5 minutes | 5:00 |
| `1h 30m` | 90 minutes | 1:30:00 |
| `1:30` | 1 min 30 sec | 1:30 |
| `90 seconds` | 1 min 30 sec | 1:30 |
| `25 min` | 25 minutes | 25:00 |

## 🔄 Auto-Completion Flow

1. **User starts timer** for a task
2. **Timer counts down** in real-time
3. **When timer reaches zero**:
   - Timer status changes to "completed"
   - Task is automatically marked as complete
   - UI updates to show completion
   - User can see completion in task list

## 🎨 UI/UX Features

### Visual Feedback
- **Progress Bar**: Shows completion percentage
- **Time Display**: Large, easy-to-read countdown
- **Status Indicators**: Clear timer state (Running, Paused, etc.)
- **Smooth Animations**: For timer state changes

### User Experience
- **Preset Buttons**: Quick access to common durations
- **Smart Parsing**: Flexible input formats
- **Auto-Completion**: No manual task completion needed
- **Persistent State**: Timers survive app restarts

### Accessibility
- **Clear Labels**: All controls properly labeled
- **Touch Targets**: Appropriately sized for mobile
- **Visual Hierarchy**: Clear information structure

## 🧪 Testing Scenarios

### Basic Timer Flow
1. Create task: "Read for 15 minutes" with 15 minute duration
2. Start timer
3. Verify countdown shows 15:00 and decreases
4. Wait for completion (or skip to end)
5. Verify task is marked complete

### Timer Controls
1. Start timer
2. Pause timer - verify countdown stops
3. Resume timer - verify countdown continues
4. Stop timer - verify timer resets

### Duration Input Validation
1. Try various input formats
2. Verify real-time parsing feedback
3. Test preset buttons
4. Verify invalid inputs show error

### Edge Cases
1. Create task without duration - verify no timer shows
2. Complete task manually - verify timer disappears
3. Edit task to add/remove duration
4. Multiple timers running simultaneously

## 📊 Data Flow

```
User Input (Duration) 
    ↓
DurationInput Component (Parse & Validate)
    ↓
AddTaskForm (Include in task data)
    ↓
TaskContext (API call with durationSeconds)
    ↓
Backend API (Save to database)
    ↓
TaskItem (Display timer if duration exists)
    ↓
Timer Component (Control timer state)
    ↓
TimerService (API calls for timer operations)
    ↓
Auto-completion (Toggle task when timer expires)
```

## 🚀 Future Enhancements

### Potential Features
- **Timer Notifications**: Push notifications when timer completes
- **Sound Alerts**: Audio feedback for timer completion
- **Timer Presets**: User-defined common durations
- **Timer History**: Track time spent on different tasks
- **Break Timers**: Pomodoro-style work/break cycles
- **Multiple Timers**: Run multiple task timers simultaneously
- **Timer Analytics**: Reports on time spent per task type

### Technical Improvements
- **Offline Support**: Timer functionality without internet
- **Background Timers**: Continue timers when app is closed
- **Timer Sync**: Sync timer state across devices
- **Performance**: Optimize timer updates for battery life

## 🎯 Success Metrics

### User Engagement
- Number of tasks created with durations
- Timer completion rates
- Time spent in timer mode
- Task completion correlation with timer usage

### Technical Performance
- Timer accuracy (±1 second)
- App performance during timer operations
- Battery usage impact
- API response times for timer operations

---

## 🎉 Summary

The timer functionality provides a complete solution for time-based task management:

1. **Flexible Duration Input** - Multiple formats supported
2. **Visual Timer Interface** - Progress bars and countdown displays  
3. **Automatic Completion** - Tasks complete when timers finish
4. **Seamless Integration** - Works with existing task management
5. **Robust API** - Full backend support for timer operations

This creates a powerful tool for users who want to time their activities and have tasks automatically marked complete when finished.