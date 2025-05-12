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
const router = express.Router();

// Protect all routes after this middleware
router.use(protectedRoutes);

// User routes for logged in user
router.get('/me', getMe);
router.put('/updateMe', upload.single('profileImage'), updateMe);
router.put('/updateMyPassword', updateMyPassword);

// Admin only routes
router.use(allowTo('admin'));

router.route('/').get(getUsers).post(upload.single('profileImage'), createUser);

router
  .route('/:id')
  .get(getUser)
  .put(upload.single('profileImage'), updateUser)
  .delete(deleteUser);

export default router;
