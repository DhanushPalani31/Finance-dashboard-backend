import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { protect, authorize } from "../middlewares/auth.js";
import { body } from "express-validator";
import validate from "../middlewares/validate.js";

const router = express.Router();


router.use(protect, authorize("admin"));

const updateUserValidator = [
  body("role").optional().isIn(["viewer", "analyst", "admin"]).withMessage("Invalid role"),
  body("status").optional().isIn(["active", "inactive"]).withMessage("Invalid status"),
];

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.patch("/:id", updateUserValidator, validate, updateUser);
router.delete("/:id", deleteUser);

export default router;
