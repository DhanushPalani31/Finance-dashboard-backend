import express from "express";
import { register, login, getMe, updateMe } from "../controllers/authController.js";
import { protect } from "../middlewares/auth.js";
import { registerValidator, loginValidator } from "../validators/authValidator.js";
import validate from "../middlewares/validate.js";

const router = express.Router();

router.post("/register", registerValidator, validate, register);
router.post("/login", loginValidator, validate, login);
router.get("/me", protect, getMe);
router.patch("/me", protect, updateMe);

export default router;
