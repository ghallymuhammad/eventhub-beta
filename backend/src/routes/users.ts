import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  getUserProfile,
  updateUserProfile,
  getUserPoints,
  getUserCoupons,
} from '../controllers/userController';

const router = express.Router();

// All user routes require authentication
router.use(authenticate);

// User routes
router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);
router.get('/points', getUserPoints);
router.get('/coupons', getUserCoupons);

export default router;