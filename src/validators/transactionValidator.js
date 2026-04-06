import { body, query } from "express-validator";

const VALID_CATEGORIES = [
  "salary", "freelance", "investment", "business",
  "food", "transport", "utilities", "rent",
  "healthcare", "education", "entertainment", "shopping", "travel", "other",
];

export const createTransactionValidator = [
  body("title")
    .trim()
    .notEmpty().withMessage("Title is required")
    .isLength({ max: 100 }).withMessage("Title cannot exceed 100 characters"),

  body("amount")
    .notEmpty().withMessage("Amount is required")
    .isFloat({ min: 0.01 }).withMessage("Amount must be a positive number greater than 0"),

  body("type")
    .notEmpty().withMessage("Type is required")
    .isIn(["income", "expense"]).withMessage("Type must be 'income' or 'expense'"),

  body("category")
    .notEmpty().withMessage("Category is required")
    .isIn(VALID_CATEGORIES).withMessage(`Category must be one of: ${VALID_CATEGORIES.join(", ")}`),

  body("date")
    .optional()
    .isISO8601().withMessage("Date must be a valid ISO 8601 date"),

  body("notes")
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage("Notes cannot exceed 500 characters"),
];

export const updateTransactionValidator = [
  body("title")
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage("Title cannot exceed 100 characters"),

  body("amount")
    .optional()
    .isFloat({ min: 0.01 }).withMessage("Amount must be a positive number greater than 0"),

  body("type")
    .optional()
    .isIn(["income", "expense"]).withMessage("Type must be 'income' or 'expense'"),

  body("category")
    .optional()
    .isIn(VALID_CATEGORIES).withMessage(`Category must be one of: ${VALID_CATEGORIES.join(", ")}`),

  body("date")
    .optional()
    .isISO8601().withMessage("Date must be a valid ISO 8601 date"),

  body("notes")
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage("Notes cannot exceed 500 characters"),
];

export const filterTransactionValidator = [
  query("type")
    .optional()
    .isIn(["income", "expense"]).withMessage("Type must be 'income' or 'expense'"),

  query("category")
    .optional()
    .isIn(VALID_CATEGORIES).withMessage("Invalid category"),

  query("startDate")
    .optional()
    .isISO8601().withMessage("startDate must be a valid date"),

  query("endDate")
    .optional()
    .isISO8601().withMessage("endDate must be a valid date"),

  query("page")
    .optional()
    .isInt({ min: 1 }).withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
];
