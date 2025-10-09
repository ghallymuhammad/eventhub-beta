import express from 'express';
import { authenticate, restrictTo } from '../middleware/auth';
import {
  getOrganizerStats,
  getOrganizerEvents,
  getOrganizerTransactions,
} from '../controllers/organizerController';

const router = express.Router();

// All organizer routes require authentication and organizer role
router.use(authenticate);
router.use(restrictTo('ORGANIZER'));

// Organizer routes
router.get('/stats', getOrganizerStats);
router.get('/events', getOrganizerEvents);
router.get('/transactions', getOrganizerTransactions);

export default router;
