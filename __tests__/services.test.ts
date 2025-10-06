import { PointsService } from '../src/services/pointsService';
import { CouponService } from '../src/services/couponService';
import { prisma } from '../src/lib/prisma';

// Mock Prisma
jest.mock('../src/lib/prisma', () => ({
  prisma: {
    $transaction: jest.fn(),
    points: {
      create: jest.fn(),
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
    coupon: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as any;

describe('PointsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addPoints', () => {
    it('should add points for a user', async () => {
      const mockTransaction = jest.fn();
      mockTransaction.points = { create: jest.fn() };
      
      await PointsService.addPoints(
        mockTransaction,
        'user123',
        100,
        'Test reward',
        'event123'
      );

      expect(mockTransaction.points.create).toHaveBeenCalledWith({
        data: {
          userId: 'user123',
          amount: 100,
          description: 'Test reward',
          eventId: 'event123',
          expiresAt: expect.any(Date),
        },
      });
    });

    it('should set correct expiration date (1 year from now)', async () => {
      const mockTransaction = jest.fn();
      mockTransaction.points = { create: jest.fn() };
      
      const beforeCall = new Date();
      await PointsService.addPoints(
        mockTransaction,
        'user123',
        100,
        'Test reward'
      );
      const afterCall = new Date();

      const createCall = mockTransaction.points.create.mock.calls[0][0];
      const expiresAt = createCall.data.expiresAt;
      
      // Should be approximately 1 year from now
      const expectedExpiry = new Date();
      expectedExpiry.setFullYear(expectedExpiry.getFullYear() + 1);
      
      expect(expiresAt.getTime()).toBeGreaterThanOrEqual(
        new Date(beforeCall.getTime() + 365 * 24 * 60 * 60 * 1000).getTime() - 1000
      );
      expect(expiresAt.getTime()).toBeLessThanOrEqual(
        new Date(afterCall.getTime() + 365 * 24 * 60 * 60 * 1000).getTime() + 1000
      );
    });
  });

  describe('getUserPoints', () => {
    it('should return user points with correct total', async () => {
      const mockPoints = [
        { id: '1', amount: 100, isUsed: false, expiresAt: new Date('2025-12-31') },
        { id: '2', amount: 50, isUsed: false, expiresAt: new Date('2025-12-31') },
        { id: '3', amount: 25, isUsed: true, expiresAt: new Date('2025-12-31') }, // Used, shouldn't count
        { id: '4', amount: 30, isUsed: false, expiresAt: new Date('2024-01-01') }, // Expired, shouldn't count
      ];

      mockPrisma.points.findMany.mockResolvedValue(mockPoints);

      const result = await PointsService.getUserPoints('user123');

      expect(result).toEqual({
        points: mockPoints,
        totalAvailable: 150, // Only unused and non-expired points
      });

      expect(mockPrisma.points.findMany).toHaveBeenCalledWith({
        where: { userId: 'user123' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('expireOldPoints', () => {
    it('should mark expired points as used', async () => {
      await PointsService.expireOldPoints();

      expect(mockPrisma.points.updateMany).toHaveBeenCalledWith({
        where: {
          expiresAt: { lt: expect.any(Date) },
          isUsed: false,
        },
        data: { isUsed: true },
      });
    });
  });
});

describe('CouponService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createSystemCoupon', () => {
    it('should create a system coupon with correct properties', async () => {
      const couponData = {
        code: 'WELCOME10',
        discountType: 'PERCENTAGE' as const,
        discountValue: 10,
        description: 'Welcome discount',
        maxUses: 100,
        expiresAt: new Date('2025-12-31'),
      };

      mockPrisma.coupon.create.mockResolvedValue({ id: 'coupon123', ...couponData });

      const result = await CouponService.createSystemCoupon(couponData);

      expect(mockPrisma.coupon.create).toHaveBeenCalledWith({
        data: {
          ...couponData,
          type: 'SYSTEM',
          organizerId: null,
          currentUses: 0,
        },
      });

      expect(result).toEqual({ id: 'coupon123', ...couponData });
    });
  });

  describe('validateCoupon', () => {
    it('should return valid coupon when all conditions are met', async () => {
      const validCoupon = {
        id: 'coupon123',
        code: 'VALID10',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        isActive: true,
        expiresAt: new Date('2025-12-31'),
        maxUses: 100,
        currentUses: 50,
        eventId: null, // System coupon
      };

      mockPrisma.coupon.findFirst.mockResolvedValue(validCoupon);

      const result = await CouponService.validateCoupon('VALID10', 'user123');

      expect(result).toEqual({
        isValid: true,
        coupon: validCoupon,
        error: null,
      });
    });

    it('should return invalid when coupon not found', async () => {
      mockPrisma.coupon.findFirst.mockResolvedValue(null);

      const result = await CouponService.validateCoupon('INVALID', 'user123');

      expect(result).toEqual({
        isValid: false,
        coupon: null,
        error: 'Coupon not found',
      });
    });

    it('should return invalid when coupon is expired', async () => {
      const expiredCoupon = {
        id: 'coupon123',
        code: 'EXPIRED10',
        isActive: true,
        expiresAt: new Date('2024-01-01'), // Expired
        maxUses: 100,
        currentUses: 50,
      };

      mockPrisma.coupon.findFirst.mockResolvedValue(expiredCoupon);

      const result = await CouponService.validateCoupon('EXPIRED10', 'user123');

      expect(result).toEqual({
        isValid: false,
        coupon: expiredCoupon,
        error: 'Coupon has expired',
      });
    });

    it('should return invalid when max uses exceeded', async () => {
      const maxUsedCoupon = {
        id: 'coupon123',
        code: 'MAXED10',
        isActive: true,
        expiresAt: new Date('2025-12-31'),
        maxUses: 100,
        currentUses: 100, // At max uses
      };

      mockPrisma.coupon.findFirst.mockResolvedValue(maxUsedCoupon);

      const result = await CouponService.validateCoupon('MAXED10', 'user123');

      expect(result).toEqual({
        isValid: false,
        coupon: maxUsedCoupon,
        error: 'Coupon usage limit reached',
      });
    });
  });

  describe('calculateDiscount', () => {
    it('should calculate percentage discount correctly', () => {
      const result = CouponService.calculateDiscount(1000, 'PERCENTAGE', 10);
      expect(result).toBe(100); // 10% of 1000
    });

    it('should calculate fixed amount discount correctly', () => {
      const result = CouponService.calculateDiscount(1000, 'FIXED', 150);
      expect(result).toBe(150);
    });

    it('should cap fixed discount at total amount', () => {
      const result = CouponService.calculateDiscount(100, 'FIXED', 150);
      expect(result).toBe(100); // Can't discount more than the total
    });

    it('should return 0 for invalid discount type', () => {
      const result = CouponService.calculateDiscount(1000, 'INVALID' as any, 10);
      expect(result).toBe(0);
    });
  });
});
