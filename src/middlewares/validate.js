import { validationResult } from "express-validator";
import { sendError } from "../utils/apiResponse.js";


const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    return sendError(res, 400, "Validation failed", messages);
  }
  next();
};

export default validate;
