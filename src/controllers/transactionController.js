import Transaction from "../models/Transaction.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";


export const getAllTransactions = async (req, res, next) => {
  try {
    const { type, category, startDate, endDate, search, page = 1, limit = 10, sortBy = "date", order = "desc" } = req.query;

    const filter = {};

    if (type) filter.type = type;
    if (category) filter.category = category;

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { notes: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === "asc" ? 1 : -1;

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate("createdBy", "name email role")
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(parseInt(limit)),
      Transaction.countDocuments(filter),
    ]);

    return sendSuccess(res, 200, "Transactions fetched successfully.", transactions, {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    next(error);
  }
};


export const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate("createdBy", "name email");
    if (!transaction) return sendError(res, 404, "Transaction not found.");
    return sendSuccess(res, 200, "Transaction fetched successfully.", transaction);
  } catch (error) {
    next(error);
  }
};


export const createTransaction = async (req, res, next) => {
  try {
    const { title, amount, type, category, date, notes } = req.body;

    const transaction = await Transaction.create({
      title,
      amount,
      type,
      category,
      date: date || new Date(),
      notes,
      createdBy: req.user._id,
    });

    await transaction.populate("createdBy", "name email");

    return sendSuccess(res, 201, "Transaction created successfully.", transaction);
  } catch (error) {
    next(error);
  }
};

export const updateTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return sendError(res, 404, "Transaction not found.");

    // Analysts can only edit their own transactions
    if (req.user.role === "analyst" && transaction.createdBy.toString() !== req.user._id.toString()) {
      return sendError(res, 403, "Analysts can only update their own transactions.");
    }

    const allowedFields = ["title", "amount", "type", "category", "date", "notes"];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) transaction[field] = req.body[field];
    });

    await transaction.save();
    await transaction.populate("createdBy", "name email");

    return sendSuccess(res, 200, "Transaction updated successfully.", transaction);
  } catch (error) {
    next(error);
  }
};


export const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return sendError(res, 404, "Transaction not found.");

    
    transaction.isDeleted = true;
    transaction.deletedAt = new Date();
    await transaction.save();

    return sendSuccess(res, 200, "Transaction deleted successfully.");
  } catch (error) {
    next(error);
  }
};


export const restoreTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne(
      { _id: req.params.id, isDeleted: true },
      null,
      { includeDeleted: true }
    );

    if (!transaction) return sendError(res, 404, "Deleted transaction not found.");

    transaction.isDeleted = false;
    transaction.deletedAt = null;
    await transaction.save();

    return sendSuccess(res, 200, "Transaction restored successfully.", transaction);
  } catch (error) {
    next(error);
  }
};
