import express from "express";
import {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  restoreTransaction,
} from "../controllers/transactionController.js";
import { protect, authorize } from "../middlewares/auth.js";
import {
  createTransactionValidator,
  updateTransactionValidator,
  filterTransactionValidator,
} from "../validators/transactionValidator.js";
import validate from "../middlewares/validate.js";

const router = express.Router();

router.use(protect); 


router.get("/", filterTransactionValidator, validate, getAllTransactions);
router.get("/:id", getTransactionById);


router.post("/", authorize("analyst", "admin"), createTransactionValidator, validate, createTransaction);


router.patch("/:id", authorize("analyst", "admin"), updateTransactionValidator, validate, updateTransaction);

router.delete("/:id", authorize("admin"), deleteTransaction);
router.patch("/:id/restore", authorize("admin"), restoreTransaction);

export default router;
