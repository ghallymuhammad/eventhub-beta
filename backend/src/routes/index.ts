import express from 'express';
import authRoutes from './auth';

const router = express.Router();

// Mount routes
router.use('/auth', authRoutes);

// Health check for API
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'EventHub API is running!',
    timestamp: new Date().toISOString(),
  });
});

export default router;
