# Fractal Assembly

A cross-platform habit tracking application focused on foundational daily habits that compound over time. The project consists of a React Native mobile app powered by Expo and a Node.js REST API backend.

## 🎯 Project Overview

Fractal Assembly is designed around the concept that small, consistent daily habits create powerful compound effects over time - like fractals where simple patterns create complex, beautiful structures. The app focuses on tracking "foundational habits" - essential daily activities that form the building blocks of a productive and healthy lifestyle.

### Core Philosophy
- **Foundational Focus**: Emphasis on 5 core daily habits rather than overwhelming users with endless tasks
- **Daily Reset**: Each day starts fresh with the ability to reset all habits
- **Simplicity**: Clean, intuitive interface that encourages consistent daily engagement
- **Compound Growth**: Track streaks and completion rates to visualize the power of consistency

## 🏗️ Architecture

This is a **monorepo** managed with **pnpm workspaces**, containing two main applications:

```
fractal-assembly/
├── apps/
│   ├── backend/     # Node.js REST API
│   └── mobile/      # React Native/Expo mobile app
├── package.json     # Root workspace configuration
└── pnpm-workspace.yaml
```

## 🛠️ Technologies & Tools

### Backend (`apps/backend`)
- **Runtime**: Node.js with ES Modules
- **Framework**: Express.js
- **Database**: SQLite with better-sqlite3
- **Security**: Helmet.js, CORS, Rate limiting
- **Logging**: Morgan
- **Development**: Nodemon for hot reloading

### Mobile App (`apps/mobile`)
- **Framework**: React Native (0.79.5) with Expo (SDK 53)
- **Navigation**: Expo Router with file-based routing
- **UI Components**: Custom themed components
- **Icons**: Expo Vector Icons
- **Development**: Expo CLI with hot reloading

### Development Tools
- **Package Manager**: pnpm with workspaces
- **Linting**: ESLint with TypeScript support
- **Git Hooks**: Husky for pre-commit validation
- **Language**: TypeScript/JavaScript ES Modules
- **Testing**: Jest (configured but no tests written yet)

### Code Quality & Standards
- **ESLint Configuration**: Shared across both apps with TypeScript rules
- **Pre-commit Hooks**: Runs tests and linting before commits
- **CORS**: Configured for development with multiple localhost origins
- **Rate Limiting**: 100 requests per 15 minutes per IP on API endpoints

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- pnpm (`npm install -g pnpm`)
- For mobile development: Expo CLI and either iOS Simulator or Android emulator

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd fractal-assembly

# Install dependencies for all workspaces
pnpm install

# Initialize the database with foundational habits
pnpm run init-db
```

### Development

**Start the backend API:**
```bash
pnpm run dev:backend
# Server runs on http://localhost:3001
```

**Start the mobile app:**
```bash
pnpm run start:mobile
# Follow Expo CLI instructions to open on device/simulator
```

**Alternative individual commands:**
```bash
# Backend commands
pnpm --filter backend dev
pnpm --filter backend start
pnpm --filter backend init-db

# Mobile commands
pnpm --filter mobile start
pnpm --filter mobile android
pnpm --filter mobile ios
```

## 📱 Current Features

### ✅ Implemented Features

#### Backend API
- **Foundational Habits Management**: CRUD operations for habit tracking
- **Daily Completion Tracking**: Mark habits complete/incomplete with timestamps
- **Statistics & Streaks**: Calculate completion rates and streak counts
- **Category Organization**: Habits organized by health, wellness, productivity, personal
- **Date Range Queries**: Query completions across specific date ranges
- **Daily Reset Functionality**: Reset all habits for a new day
- **Health Check Endpoint**: Monitor API status and uptime
- **Robust Error Handling**: Comprehensive error responses with proper HTTP status codes
- **Security Features**: Rate limiting, CORS protection, helmet security headers
- **Database Persistence**: SQLite with proper schema and relationships

#### Mobile App
- **Foundational Habits Display**: Clean list view of daily habits
- **Real-time Progress Tracking**: Visual progress indicator showing completion percentage
- **Daily Reset Functionality**: Button to reset all habits for a new day
- **Online/Offline Status**: Connection status indicator
- **Debug Tools**: Built-in debugging buttons for development
- **Cross-platform Support**: Runs on iOS, Android, and web
- **Auto-refresh**: Automatic data synchronization with backend
- **Date Display**: Current date and progress tracking

#### Default Foundational Habits
The system comes pre-configured with 5 essential daily habits:
1. **Make bed** (personal)
2. **Take meds** (health) 
3. **Meditate 5 minutes** (wellness)
4. **Go for a walk** (health)
5. **Daily check-in** (productivity)

### 🔄 API Endpoints

**Base URL**: `http://localhost:3001/api`

#### Core Endpoints
- `GET /health` - Health check
- `GET /api/habits` - Get all habits with today's completion status
- `GET /api/habits/:id` - Get specific habit details
- `POST /api/habits` - Create new habit
- `PUT /api/habits/:id` - Update habit
- `DELETE /api/habits/:id` - Delete habit (non-foundational only)
- `POST /api/habits/:id/complete` - Mark habit complete
- `DELETE /api/habits/:id/complete` - Mark habit incomplete
- `GET /api/habits/completions/today` - Get today's completions
- `GET /api/habits/completions/range` - Get completions for date range
- `GET /api/habits/:id/stats` - Get habit statistics
- `POST /api/habits/reset-day` - Reset all habits for a day

## 🗄️ Database Schema

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

#### `tasks` (for future features)
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

## 🧪 Development & Testing

### Available Scripts
```bash
# Root level
pnpm run start:backend      # Start backend in production mode
pnpm run dev:backend        # Start backend in development mode
pnpm run start:mobile       # Start mobile app
pnpm run init-db           # Initialize database
pnpm run lint              # Run ESLint on all code
pnpm run test              # Run Jest tests

# Backend specific
pnpm --filter backend start
pnpm --filter backend dev
pnpm --filter backend init-db

# Mobile specific  
pnpm --filter mobile start
pnpm --filter mobile android
pnpm --filter mobile ios
pnpm --filter mobile web
```

### Git Hooks
- **Pre-commit**: Runs tests and linting before allowing commits
- **Husky**: Manages git hooks consistently across development environments

### Environment Configuration
- **PORT**: Backend server port (default: 3001)
- **NODE_ENV**: Environment setting (development/production)

## 🚧 Known Limitations & Areas for Improvement

### Testing
- Jest is configured but no tests are currently implemented
- Need unit tests for API endpoints
- Need integration tests for mobile app components

### Security
- No authentication/authorization system
- All API endpoints are publicly accessible
- No user accounts or data isolation

### Features
- Limited to foundational habits (no custom habit creation in UI)
- No data export/import functionality
- No push notifications
- No social features or sharing
- No advanced analytics or insights

### Performance
- No caching layer
- No database optimization for larger datasets
- No offline data persistence in mobile app

## 🔮 Future Roadmap

### Short-term Improvements
- [ ] Implement comprehensive testing suite
- [ ] Add user authentication and authorization
- [ ] Implement custom habit creation in mobile UI
- [ ] Add push notifications for habit reminders
- [ ] Improve offline functionality with local storage

### Medium-term Features
- [ ] Advanced analytics and insights dashboard
- [ ] Habit templates and recommendations
- [ ] Data export/import functionality
- [ ] Social features (sharing progress, challenges)
- [ ] Customizable habit categories
- [ ] Multiple habit schedules (weekly, custom intervals)

### Long-term Vision
- [ ] Web dashboard application
- [ ] Machine learning for habit recommendations
- [ ] Integration with health apps and wearables
- [ ] Community features and challenges
- [ ] Subscription service with premium features

## 📄 License

MIT License - see individual package.json files for details.

## 🤝 Contributing

This appears to be a personal project in active development. The codebase follows modern JavaScript/TypeScript best practices with ESLint configuration and git hooks for code quality.

### Development Guidelines
- Use pnpm for package management
- Follow the established ESLint configuration
- Write meaningful commit messages
- Test changes across both backend and mobile apps
- Ensure proper error handling and user feedback

## 📞 Support

For questions or issues, refer to the detailed API documentation in `apps/backend/README.md` or examine the mobile app implementation in `apps/mobile/`.