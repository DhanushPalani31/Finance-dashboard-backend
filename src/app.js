import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import errorHandler from "./middlewares/errorHandler.js";
import { sendError } from "./utils/apiResponse.js";

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "*",
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));


const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please try again later." },
});
app.use("/api", limiter);


const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: "Too many login attempts. Please try again after 15 minutes." },
});
app.use("/api/v1/auth", authLimiter);


if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false }));


app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Finance Dashboard API is running",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});


app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/transactions", transactionRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);


app.all("*", (req, res) => {
  sendError(res, 404, `Route '${req.originalUrl}' not found on this server.`);
});


app.use(errorHandler);

export default app;
