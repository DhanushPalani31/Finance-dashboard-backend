import { verifyToken } from "../utils/jwt.js";
import User from "../models/User.js";
import { sendError } from "../utils/apiResponse.js";


export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return sendError(res, 401, "Access denied. No token provided.");
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return sendError(res, 401, "User belonging to this token no longer exists.");
    }

    if (user.status === "inactive") {
      return sendError(res, 403, "Your account has been deactivated. Contact admin.");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return sendError(res, 401, "Invalid token.");
    }
    if (error.name === "TokenExpiredError") {
      return sendError(res, 401, "Token has expired. Please log in again.");
    }
    return sendError(res, 500, "Authentication failed.");
  }
};


export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        `Access denied. '${req.user.role}' role is not authorized for this action.`
      );
    }
    next();
  };
};
