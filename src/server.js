import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;


connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  });

 
  process.on("unhandledRejection", (err) => {
    console.error(" Unhandled Rejection:", err.name, err.message);
    server.close(() => process.exit(1));
  });

  
  process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err.name, err.message);
    process.exit(1);
  });

  
  process.on("SIGTERM", () => {
    console.log(" SIGTERM received. Shutting down gracefully...");
    server.close(() => {
      console.log(" Process terminated.");
      process.exit(0);
    });
  });
});
