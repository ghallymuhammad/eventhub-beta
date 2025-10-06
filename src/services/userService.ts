import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';
import type { User, Point, Coupon } from '../types';

export class UserService {
  static async createUser(userData: {
    email: string;
    password: string;
    name: string;
    role?: 'USER' | 'ORGANIZER' | 'ADMIN';
    phoneNumber?: string;
    referralCode?: string;
  }): Promise<Omit<User, 'password'>> {
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    return await prisma.$transaction(async (tx) => {
      // Check if referral code exists
      let referrer = null;
      if (userData.referralCode) {
        referrer = await tx.user.findUnique({
          where: { referralCode: userData.referralCode }
        });
        
        if (!referrer) {
          throw new Error('Invalid referral code');
        }
      }

      // Create user
      const user = await tx.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          name: userData.name,
          role: userData.role || 'USER',
          phoneNumber: userData.phoneNumber,
          referredBy: referrer?.id,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          referralCode: true,
          pointsBalance: true,
          profilePicture: true,
          phoneNumber: true,
          referredBy: true,
          createdAt: true,
          updatedAt: true,
          emailVerified: true,
        }
      });

      // If registered with referral, create rewards
      if (referrer) {
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 3);

        // Give referrer 10,000 points
        await tx.point.create({
          data: {
            userId: referrer.id,
            amount: 10000,
            type: 'REFERRAL_BONUS',
            description: `Referral bonus for ${user.name}`,
            expiresAt: expiryDate,
          }
        });

        // Update referrer's points balance
        await tx.user.update({
          where: { id: referrer.id },
          data: {
            pointsBalance: {
              increment: 10000
            }
          }
        });

        // Create discount coupon for new user
        const couponCode = `REF${user.referralCode.slice(-6).toUpperCase()}`;
        await tx.coupon.create({
          data: {
            code: couponCode,
            discountType: 'PERCENTAGE',
            discountValue: 10, // 10% discount
            type: 'REFERRAL_REWARD',
            userId: user.id,
            expiresAt: expiryDate,
            maxUses: 1,
          }
        });
      }

      return user;
    });
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  static async getUserById(id: string): Promise<Omit<User, 'password'> | null> {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  static async updateUser(id: string, userData: Partial<User>): Promise<Omit<User, 'password'> | null> {
    return await prisma.user.update({
      where: { id },
      data: userData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async changePassword(userId: string, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });
  }

  static async deleteUser(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id }
    });
  }
}
