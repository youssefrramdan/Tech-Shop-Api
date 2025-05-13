import express from 'express';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getMe,
  updateMe,
  updateMyPassword,
} from '../controllers/user.controller.js';
import { protectedRoutes, allowTo } from '../controllers/auth.controller.js';
import createUploader from '../middlewares/cloudnairyMiddleware.js';

const upload = createUploader();
const userRouter = express.Router();

// Protect all routes after this middleware
userRouter.use(protectedRoutes);

// User routes for logged in user
userRouter.get('/me', getMe);
userRouter.put('/updateMe', upload.single('profileImage'), updateMe);
userRouter.put('/updateMyPassword', updateMyPassword);

// Admin only routes
userRouter.use(allowTo('admin'));

userRouter
  .route('/')
  .get(getUsers)
  .post(upload.single('profileImage'), createUser);

userRouter
  .route('/:id')
  .get(getUser)
  .put(upload.single('profileImage'), updateUser)
  .delete(deleteUser);

export default userRouter;
