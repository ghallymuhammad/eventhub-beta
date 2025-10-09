import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

export const createTransaction = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { eventId, ticketTypes, totalAmount, couponId } = req.body;
    const userId = req.user!.id;

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        eventId,
        totalAmount,
        originalAmount: totalAmount,
        couponId,
        status: 'WAITING_PAYMENT',
      },
      include: {
        event: true,
        user: true,
        coupon: true,
      },
    });

    res.status(201).json({
      status: 'success',
      data: { transaction },
    });
  } catch (error) {
    next(error);
  }
};

export const getTransactions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;

    const transactions = await prisma.transaction.findMany({
      where: { userId },
      include: {
        event: true,
        coupon: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      status: 'success',
      data: { transactions },
    });
  } catch (error) {
    next(error);
  }
};

export const getTransaction = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    if (!id) {
      res.status(400).json({
        status: 'fail',
        message: 'Transaction ID is required',
      });
      return;
    }

    const transaction = await prisma.transaction.findFirst({
      where: { 
        id,
        userId,
      },
      include: {
        event: true,
        user: true,
        coupon: true,
      },
    });

    if (!transaction) {
      res.status(404).json({
        status: 'fail',
        message: 'Transaction not found',
      });
      return;
    }

    res.json({
      status: 'success',
      data: { transaction },
    });
  } catch (error) {
    next(error);
  }
};

export const updateTransactionStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user!.id;

    if (!id) {
      res.status(400).json({
        status: 'fail',
        message: 'Transaction ID is required',
      });
      return;
    }

    const transaction = await prisma.transaction.findFirst({
      where: { id, userId },
    });

    if (!transaction) {
      res.status(404).json({
        status: 'fail',
        message: 'Transaction not found',
      });
      return;
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data: { status },
      include: {
        event: true,
        user: true,
        coupon: true,
      },
    });

    res.json({
      status: 'success',
      data: { transaction: updatedTransaction },
    });
  } catch (error) {
    next(error);
  }
};

export const uploadPaymentProof = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    if (!id) {
      res.status(400).json({
        status: 'fail',
        message: 'Transaction ID is required',
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        status: 'fail',
        message: 'No file uploaded',
      });
      return;
    }

    const transaction = await prisma.transaction.findFirst({
      where: { 
        id: id,
        userId: userId,
      },
    });

    if (!transaction) {
      res.status(404).json({
        status: 'fail',
        message: 'Transaction not found',
      });
      return;
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data: { 
        paymentProof: req.file.filename,
        status: 'PENDING',
        paymentProofUploadedAt: new Date(),
      },
      include: {
        event: true,
        user: true,
        coupon: true,
      },
    });

    res.json({
      status: 'success',
      data: { transaction: updatedTransaction },
    });
  } catch (error) {
    next(error);
  }
};
