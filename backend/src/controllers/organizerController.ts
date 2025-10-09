import { Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

export const getOrganizerStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const organizerId = req.user!.id;

    // Check if user is organizer
    if (req.user!.role !== 'ORGANIZER') {
      res.status(403).json({
        status: 'fail',
        message: 'Access denied. Organizer role required.',
      });
      return;
    }

    // Get organizer events count
    const eventsCount = await prisma.event.count({
      where: { organizerId },
    });

    // Get total revenue from confirmed transactions
    const revenueResult = await prisma.transaction.aggregate({
      where: {
        event: {
          organizerId,
        },
        status: 'CONFIRMED',
      },
      _sum: {
        totalAmount: true,
      },
    });

    // Get tickets sold count
    const ticketsSold = await prisma.transaction.aggregate({
      where: {
        event: {
          organizerId,
        },
        status: 'CONFIRMED',
      },
      _count: {
        id: true,
      },
    });

    // Get pending transactions count
    const pendingTransactions = await prisma.transaction.count({
      where: {
        event: {
          organizerId,
        },
        status: 'PENDING',
      },
    });

    res.json({
      status: 'success',
      data: {
        stats: {
          eventsCount,
          totalRevenue: revenueResult._sum.totalAmount || 0,
          ticketsSold: ticketsSold._count.id,
          pendingTransactions,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getOrganizerEvents = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const organizerId = req.user!.id;

    // Check if user is organizer
    if (req.user!.role !== 'ORGANIZER') {
      res.status(403).json({
        status: 'fail',
        message: 'Access denied. Organizer role required.',
      });
      return;
    }

    const events = await prisma.event.findMany({
      where: { organizerId },
      include: {
        _count: {
          select: {
            transactions: {
              where: {
                status: 'CONFIRMED',
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      status: 'success',
      data: { events },
    });
  } catch (error) {
    next(error);
  }
};

export const getOrganizerTransactions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const organizerId = req.user!.id;

    // Check if user is organizer
    if (req.user!.role !== 'ORGANIZER') {
      res.status(403).json({
        status: 'fail',
        message: 'Access denied. Organizer role required.',
      });
      return;
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        event: {
          organizerId,
        },
      },
      include: {
        event: {
          select: {
            title: true,
            date: true,
            time: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
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
