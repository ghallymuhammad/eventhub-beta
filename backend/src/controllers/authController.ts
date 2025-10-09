import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { AppError, catchAsync } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { createSendToken } from '../lib/jwt';
import { prisma } from '../lib/prisma';

// Validation schemas
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please provide a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['USER', 'ORGANIZER']).optional().default('USER'),
  referralCode: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Please provide a valid email'),
  password: z.string().min(1, 'Please provide a password'),
});

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the user
 *         name:
 *           type: string
 *           description: User's full name
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         role:
 *           type: string
 *           enum: [USER, ORGANIZER, ADMIN]
 *           description: User's role in the system
 *         referralCode:
 *           type: string
 *           description: User's unique referral code
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Account creation timestamp
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 minimum: 2
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minimum: 8
 *               role:
 *                 type: string
 *                 enum: [USER, ORGANIZER]
 *                 default: USER
 *               referralCode:
 *                 type: string
 *     responses:
 *       201:
 *         description: User successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 token:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input data
 *       409:
 *         description: Email already exists
 */
export const register = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Validate input
    const validatedData = registerSchema.parse(req.body);
    const { name, email, password, role, referralCode } = validatedData;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return next(new AppError('User with this email already exists', 409));
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user in transaction with referral logic
    const result = await prisma.$transaction(async (tx) => {
      // Create the new user
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: role as any,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          referralCode: true,
          createdAt: true,
        },
      });

      // TODO: Implement referral and points system later
      // For now, just set the referrer if provided
      if (referralCode) {
        const referrer = await tx.user.findUnique({
          where: { referralCode },
          select: { id: true }
        });
        
        if (referrer) {
          await tx.user.update({
            where: { id: newUser.id },
            data: { referredBy: referrer.id }
          });
        }
      }

      return newUser;
    });

    // Create and send token
    createSendToken(result, 201, res);
  }
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User successfully logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 token:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid credentials
 */
export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Validate input
    const { email, password } = loginSchema.parse(req.body);

    // Check if user exists and password is correct
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    // Remove password from response
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      referralCode: user.referralCode,
      createdAt: user.createdAt,
    };

    // Create and send token
    createSendToken(userResponse, 200, res);
  }
);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authenticated
 */
export const getMe = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        referralCode: true,
        createdAt: true,
        _count: {
          select: {
            organizedEvents: true,
            transactions: true,
            referrals: true,
          },
        },
      },
    });

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  }
);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: User successfully logged out
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Logged out successfully
 */
export const logout = (req: Request, res: Response) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
};
