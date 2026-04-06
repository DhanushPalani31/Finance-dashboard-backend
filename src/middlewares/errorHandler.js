import { sendError } from "../utils/apiResponse.js";

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

 
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ID format: ${err.value}`;
  }

 
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `'${err.keyValue[field]}' is already registered for field '${field}'.`;
  }

  
  if (err.name === "ValidationError") {
    statusCode = 400;
    const errors = Object.values(err.errors).map((e) => e.message);
    return sendError(res, statusCode, "Validation failed", errors);
  }

  
  if (err.name === "JsonWebTokenError") {
    return sendError(res, 401, "Invalid token.");
  }
  if (err.name === "TokenExpiredError") {
    return sendError(res, 401, "Token expired.");
  }

  if (process.env.NODE_ENV === "development") {
    console.error("🔥 Error:", err);
  }

  return sendError(res, statusCode, message);
};

export default errorHandler;
