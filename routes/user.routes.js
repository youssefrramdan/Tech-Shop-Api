import express from 'express';
import {
  createUser,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  getMe,
  updateMe,
  uploadUserImage,
  changeMyPassword,
  changeUserPassword,
  updateUserRole,
} from '../controllers/user.controller.js';
import { protectedRoutes, allowTo } from '../controllers/auth.controller.js';
import createUploader from '../middlewares/cloudnairyMiddleware.js';

const upload = createUploader();
const userRouter = express.Router();

userRouter
  .route('/')
  .post(protectedRoutes, allowTo('admin'), createUser)
  .get(protectedRoutes, allowTo('admin'), getAllUsers);

userRouter
  .route('/me')
  .get(protectedRoutes, getMe)
  .patch(protectedRoutes, updateMe);

userRouter
  .route('/my-image')
  .patch(protectedRoutes, upload.single('profileImage'), uploadUserImage);

userRouter.route('/changePassword').patch(protectedRoutes, changeMyPassword);

userRouter
  .route('/changePassword/:id')
  .patch(protectedRoutes, changeUserPassword);

userRouter
  .route('/:id/role')
  .patch(protectedRoutes, allowTo('admin'), updateUserRole);

userRouter
  .route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(protectedRoutes, allowTo('admin'), deleteUser);

export default userRouter;
