import { prisma } from '@/src/lib/prisma';
import { User, Role } from '@prisma/client';

export class UserService {
  // Get user by email
  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { email },
        include: {
          organizedEvents: true,
          transactions: true,
          points: true,
          coupons: true,
        },
      });
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  // Create new user
  static async createUser(userData: {
    email: string;
    password: string;
    name: string;
    role: Role;
    phoneNumber?: string;
    referredBy?: string;
  }): Promise<User | null> {
    try {
      return await prisma.user.create({
        data: userData,
      });
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  // Update user profile
  static async updateUser(
    userId: string,
    updateData: Partial<User>
  ): Promise<User | null> {
    try {
      return await prisma.user.update({
        where: { id: userId },
        data: updateData,
      });
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  }

  // Get user's points balance
  static async getUserPointsBalance(userId: string): Promise<number> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { pointsBalance: true },
      });
      return user?.pointsBalance || 0;
    } catch (error) {
      console.error('Error getting user points balance:', error);
      return 0;
    }
  }

  // Add points to user
  static async addPointsToUser(
    userId: string,
    amount: number,
    description?: string
  ): Promise<boolean> {
    try {
      await prisma.$transaction(async (tx) => {
        // Update user's balance
        await tx.user.update({
          where: { id: userId },
          data: {
            pointsBalance: {
              increment: amount,
            },
          },
        });

        // Create points record
        await tx.point.create({
          data: {
            userId,
            amount,
            type: 'EARNED',
            description,
            expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
          },
        });
      });
      return true;
    } catch (error) {
      console.error('Error adding points to user:', error);
      return false;
    }
  }
}

export default UserService;
