import User from "../models/User.js";
import { generateToken } from "../utils/jwt.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";


export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 409, "Email is already registered.");
    }

    const user = await User.create({ name, email, password, role });
    const token = generateToken(user._id);

    return sendSuccess(res, 201, "Account created successfully.", { user, token });
  } catch (error) {
    next(error);
  }
};


export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return sendError(res, 401, "Invalid email or password.");
    }

    if (user.status === "inactive") {
      return sendError(res, 403, "Your account has been deactivated. Contact an admin.");
    }

    
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    return sendSuccess(res, 200, "Logged in successfully.", {
      user: { ...user.toJSON(), password: undefined },
      token,
    });
  } catch (error) {
    next(error);
  }
};


export const getMe = async (req, res) => {
  return sendSuccess(res, 200, "Profile fetched successfully.", req.user);
};


export const updateMe = async (req, res, next) => {
  try {
    const { name, password } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (password) {
      if (password.length < 6) {
        return sendError(res, 400, "Password must be at least 6 characters.");
      }
      user.password = password;
    }

    await user.save();
    return sendSuccess(res, 200, "Profile updated successfully.", user);
  } catch (error) {
    next(error);
  }
};
