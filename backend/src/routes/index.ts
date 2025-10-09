import express from 'express';
import authRoutes from './auth';
import eventRoutes from './events';
import transactionRoutes from './transactions';
import userRoutes from './users';
import organizerRoutes from './organizer';

const router = express.Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/events', eventRoutes);
router.use('/transactions', transactionRoutes);
router.use('/users', userRoutes);
router.use('/organizer', organizerRoutes);

// Health check for API
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'EventHub API is running!',
    timestamp: new Date().toISOString(),
  });
});

export default router;
