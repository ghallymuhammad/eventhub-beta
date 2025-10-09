"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.getMe = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const zod_1 = require("zod");
const errorHandler_1 = require("../middleware/errorHandler");
const jwt_1 = require("../lib/jwt");
const prisma_1 = require("../lib/prisma");
const registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    email: zod_1.z.string().email('Please provide a valid email'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
    role: zod_1.z.enum(['USER', 'ORGANIZER']).optional().default('USER'),
    referralCode: zod_1.z.string().optional(),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Please provide a valid email'),
    password: zod_1.z.string().min(1, 'Please provide a password'),
});
exports.register = (0, errorHandler_1.catchAsync)(async (req, res, next) => {
    const validatedData = registerSchema.parse(req.body);
    const { name, email, password, role, referralCode } = validatedData;
    const existingUser = await prisma_1.prisma.user.findUnique({
        where: { email },
    });
    if (existingUser) {
        return next(new errorHandler_1.AppError('User with this email already exists', 409));
    }
    const hashedPassword = await bcryptjs_1.default.hash(password, 12);
    const result = await prisma_1.prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role,
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
    (0, jwt_1.createSendToken)(result, 201, res);
});
exports.login = (0, errorHandler_1.catchAsync)(async (req, res, next) => {
    const { email, password } = loginSchema.parse(req.body);
    const user = await prisma_1.prisma.user.findUnique({
        where: { email },
    });
    if (!user || !(await bcryptjs_1.default.compare(password, user.password))) {
        return next(new errorHandler_1.AppError('Incorrect email or password', 401));
    }
    const userResponse = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        referralCode: user.referralCode,
        createdAt: user.createdAt,
    };
    (0, jwt_1.createSendToken)(userResponse, 200, res);
});
exports.getMe = (0, errorHandler_1.catchAsync)(async (req, res, next) => {
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: req.user.id },
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
});
const logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });
    res.status(200).json({
        status: 'success',
        message: 'Logged out successfully',
    });
};
exports.logout = logout;
//# sourceMappingURL=authController.js.map