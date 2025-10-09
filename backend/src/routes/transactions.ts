import express from 'express';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';
import {
  createTransaction,
  getTransactions,
  getTransaction,
  updateTransactionStatus,
  uploadPaymentProof,
} from '../controllers/transactionController';

const router = express.Router();

// All transaction routes require authentication
router.use(authenticate);

// Transaction routes
router.post('/', createTransaction);
router.get('/', getTransactions);
router.get('/:id', getTransaction);
router.patch('/:id', updateTransactionStatus);
router.post('/:id/payment-proof', upload.single('paymentProof'), uploadPaymentProof);

export default router;