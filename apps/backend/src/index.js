import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import database from "./models/database.js";
import tasksRouter from "./routes/tasks.js";
import goalsRouter from "./routes/goals.js";
import projectsRouter from "./routes/projects.js";
import adminRouter from "./routes/admin.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for OPTIONS requests (CORS preflight)
  skip: (req) => req.method === "OPTIONS",
});
app.use("/api/", limiter);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // More permissive for development - allow localhost on any port
    if (origin && origin.includes("localhost")) {
      console.log(`CORS allowed for localhost origin: ${origin}`);
      return callback(null, true);
    }

    const allowedOrigins = [
      "http://localhost:3000", // React dev server
      "http://localhost:8081", // Expo dev server
      "http://localhost:19000", // Expo web
      "http://localhost:19006", // Expo web alternative
      "exp://localhost:19000", // Expo mobile
      "exp://192.168.1.100:19000", // Expo mobile (replace with your IP)
      "https://localhost:3000", // HTTPS variants
      "https://localhost:8081",
    ];

    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log(`CORS allowed for whitelisted origin: ${origin}`);
      callback(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Accept",
    "X-Requested-With",
  ],
  preflightContinue: false,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options("*", cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging middleware
app.use(morgan("combined"));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Fractal Assembly Backend is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use("/api/tasks", tasksRouter);
app.use("/api/goals", goalsRouter);
app.use("/api/projects", projectsRouter);
app.use("/admin", adminRouter);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to Fractal Assembly API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      tasks: "/api/tasks",
      goals: "/api/goals",
      projects: "/api/projects",
      documentation: "See README.md for API documentation",
    },
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    message: `The endpoint ${req.method} ${req.originalUrl} does not exist`,
  });
});

// Global error handler
app.use((error, req, res, _next) => {
  console.error("Global error handler:", error);
  console.error("Request URL:", req.originalUrl);
  console.error("Request method:", req.method);
  console.error("Request headers:", req.headers);

  // CORS error
  if (error.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      error: "CORS error",
      message: "Origin not allowed by CORS policy",
    });
  }

  // JSON parsing error
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({
      success: false,
      error: "Invalid JSON",
      message: "Request body contains invalid JSON",
    });
  }

  // Default error response
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development"
        ? error.message
        : "Something went wrong",
  });
});

// Graceful shutdown handler
async function gracefulShutdown(signal) {
  console.log(`\nReceived ${signal}. Starting graceful shutdown...`);

  // Close database connection
  try {
    await database.close();
    console.log("Database connection closed.");
  } catch (error) {
    console.error("Error closing database:", error);
  }

  // Close server
  server.close(() => {
    console.log("HTTP server closed.");
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error(
      "Could not close connections in time, forcefully shutting down",
    );
    process.exit(1);
  }, 10000);
}

// Initialize database and start server
async function startServer() {
  try {
    // Connect to database
    await database.connect();
    console.log("Database connected successfully");

    // Start HTTP server
    const server = app.listen(PORT, () => {
      console.log(`
🚀 Fractal Assembly Backend Server Started!
📍 Server running on port ${PORT}
🌐 Health check: http://localhost:${PORT}/health
📚 API endpoints: http://localhost:${PORT}/api/tasks
🕐 Started at: ${new Date().toISOString()}
      `);
    });

    // Export server for graceful shutdown
    global.server = server;

    // Handle shutdown signals
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

    return server;
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Start the server
startServer();

export default app;
