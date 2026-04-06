import User from "../models/User.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";

export const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.status) filter.status = req.query.status;

    const [users, total] = await Promise.all([
      User.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      User.countDocuments(filter),
    ]);

    return sendSuccess(res, 200, "Users fetched successfully.", users, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};


export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 404, "User not found.");
    return sendSuccess(res, 200, "User fetched successfully.", user);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { role, status } = req.body;

    if (req.params.id === req.user._id.toString()) {
      return sendError(res, 400, "Admins cannot modify their own role or status via this endpoint.");
    }

    const allowedUpdates = {};
    if (role) allowedUpdates.role = role;
    if (status) allowedUpdates.status = status;

    if (Object.keys(allowedUpdates).length === 0) {
      return sendError(res, 400, "Provide at least one field to update: role or status.");
    }

    const user = await User.findByIdAndUpdate(req.params.id, allowedUpdates, {
      new: true,
      runValidators: true,
    });

    if (!user) return sendError(res, 404, "User not found.");

    return sendSuccess(res, 200, "User updated successfully.", user);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return sendError(res, 400, "You cannot delete your own account.");
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return sendError(res, 404, "User not found.");

    return sendSuccess(res, 200, "User deleted successfully.");
  } catch (error) {
    next(error);
  }
};
