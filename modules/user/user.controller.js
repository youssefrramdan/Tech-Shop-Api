import { catchError } from "../../middlewares/catchError.js";
import { User } from "../../models/User.model.js";
import { AppError } from "../../utils/appError.js";
import jwt from "jsonwebtoken";
const addUser = catchError(async (req, res, next) => {
  console.log(req.body);
  let user = new User(req.body);
  const token = jwt.sign({ id: user._id, email: user.email }, "1234");
  await user.save();
  res.json({ message: "success", user, token });
});

const getAllUsers = catchError(async (req, res, next) => {
  let user = await User.find();
  res.json({ message: "success", user });
});

const getSpecificUser = catchError(async (req, res, next) => {
  let user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError("User not found", 404));
  }
  res.json({ message: "success", user });
});

const updateUser = catchError(async (req, res, next) => {
  let user = await User.findByIdAndUpdate(req.params.id);
  user || next(new AppError(`${user} not found`));
  !user || res.json({ message: "success", document });
});

const deleteUser = catchError(async (req, res, next) => {
  let user = await User.findByIdAndDelete(req.params.id);
  user || next(new AppError(`${user} not found`));
  !user || res.json({ message: "success" });
});
export { addUser, getAllUsers, getSpecificUser, deleteUser, updateUser };
