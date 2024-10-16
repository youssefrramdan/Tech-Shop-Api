import { User } from "../models/User.model.js";

export const checkEmail = async (req, res, next) => {
  let isFound = await User.findOne({ email: req.body.email });
  if (isFound) {
    return res.status(409).json({ message: "email already exists" });
  }
  next();
};
