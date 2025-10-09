import { Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

export const getUserProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        profilePicture: true,
        phoneNumber: true,
        referralCode: true,
        pointsBalance: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
      return;
    }

    res.json({
      status: 'success',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { name, phoneNumber, profilePicture } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(phoneNumber && { phoneNumber }),
        ...(profilePicture && { profilePicture }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        profilePicture: true,
        phoneNumber: true,
        referralCode: true,
        pointsBalance: true,
        createdAt: true,
      },
    });

    res.json({
      status: 'success',
      data: { user: updatedUser },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserPoints = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const points = await prisma.point.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const totalPoints = await prisma.user.findUnique({
      where: { id: userId },
      select: { pointsBalance: true },
    });

    res.json({
      status: 'success',
      data: { 
        points,
        totalPoints: totalPoints?.pointsBalance || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserCoupons = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const coupons = await prisma.coupon.findMany({
      where: { 
        userId,
        isActive: true,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      status: 'success',
      data: { coupons },
    });
  } catch (error) {
    next(error);
  }
};
