import { prisma } from '../lib/prisma';
import type { Point, Coupon } from '../types';

export class PointsService {
  static async getUserPoints(userId: string): Promise<Point[]> {
    return await prisma.point.findMany({
      where: {
        userId,
        expiresAt: {
          gte: new Date()
        }
      },
      orderBy: {
        expiresAt: 'asc'
      }
    });
  }

  static async addPoints(
    userId: string, 
    amount: number, 
    type: 'REFERRAL_BONUS' | 'EVENT_REWARD' | 'PURCHASE_CASHBACK',
    description?: string
  ): Promise<Point> {
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 3);

    return await prisma.$transaction(async (tx) => {
      const point = await tx.point.create({
        data: {
          userId,
          amount,
          type,
          description,
          expiresAt: expiryDate,
        }
      });

      await tx.user.update({
        where: { id: userId },
        data: {
          pointsBalance: {
            increment: amount
          }
        }
      });

      return point;
    });
  }

  static async usePoints(userId: string, amount: number): Promise<boolean> {
    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId }
      });

      if (!user || user.pointsBalance < amount) {
        return false;
      }

      // Deduct points using FIFO (oldest first)
      const availablePoints = await tx.point.findMany({
        where: {
          userId,
          expiresAt: {
            gte: new Date()
          }
        },
        orderBy: {
          expiresAt: 'asc'
        }
      });

      let remainingToDeduct = amount;
      
      for (const pointRecord of availablePoints) {
        if (remainingToDeduct <= 0) break;

        const deductAmount = Math.min(pointRecord.amount, remainingToDeduct);
        
        await tx.point.create({
          data: {
            userId,
            amount: -deductAmount,
            type: 'EXPIRY_DEDUCTION',
            description: 'Points used for purchase',
            expiresAt: new Date(), // Immediate expiry for deduction records
          }
        });

        remainingToDeduct -= deductAmount;
      }

      await tx.user.update({
        where: { id: userId },
        data: {
          pointsBalance: {
            decrement: amount
          }
        }
      });

      return true;
    });
  }

  static async expirePoints(): Promise<void> {
    const expiredPoints = await prisma.point.findMany({
      where: {
        expiresAt: {
          lt: new Date()
        },
        amount: {
          gt: 0
        }
      },
      include: {
        user: true
      }
    });

    for (const expiredPoint of expiredPoints) {
      await prisma.$transaction(async (tx) => {
        await tx.point.create({
          data: {
            userId: expiredPoint.userId,
            amount: -expiredPoint.amount,
            type: 'EXPIRY_DEDUCTION',
            description: 'Points expired',
            expiresAt: new Date(),
          }
        });

        await tx.user.update({
          where: { id: expiredPoint.userId },
          data: {
            pointsBalance: {
              decrement: expiredPoint.amount
            }
          }
        });
      });
    }
  }
}

export class CouponService {
  static async getUserCoupons(userId: string): Promise<Coupon[]> {
    return await prisma.coupon.findMany({
      where: {
        OR: [
          { userId },
          { type: 'SYSTEM_PROMOTION' }
        ],
        isActive: true,
        expiresAt: {
          gte: new Date()
        }
      },
      orderBy: {
        expiresAt: 'asc'
      }
    });
  }

  static async validateCoupon(code: string, eventId?: string, userId?: string): Promise<Coupon | null> {
    const coupon = await prisma.coupon.findUnique({
      where: { code },
      include: {
        event: true,
        user: true,
        organizer: true
      }
    });

    if (!coupon || !coupon.isActive || coupon.expiresAt < new Date()) {
      return null;
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return null;
    }

    // Check event-specific coupon restrictions
    if (coupon.eventId && coupon.eventId !== eventId) {
      return null;
    }

    // Check user-specific coupon restrictions
    if (coupon.userId && coupon.userId !== userId) {
      return null;
    }

    return coupon;
  }

  static async useCoupon(couponId: string): Promise<boolean> {
    try {
      await prisma.coupon.update({
        where: { id: couponId },
        data: {
          usedCount: {
            increment: 1
          }
        }
      });
      return true;
    } catch {
      return false;
    }
  }

  static async createOrganizerCoupon(data: {
    code: string;
    discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
    discountValue: number;
    organizerId: string;
    eventId?: string;
    minPurchase?: number;
    maxUses?: number;
    expiresAt: Date;
  }): Promise<Coupon> {
    return await prisma.coupon.create({
      data: {
        ...data,
        type: 'ORGANIZER_VOUCHER',
        isActive: true,
      }
    });
  }
}
