"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserCoupons = exports.getUserPoints = exports.updateUserProfile = exports.getUserProfile = void 0;
const prisma_1 = require("../lib/prisma");
const getUserProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await prisma_1.prisma.user.findUnique({
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
    }
    catch (error) {
        next(error);
    }
};
exports.getUserProfile = getUserProfile;
const updateUserProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { name, phoneNumber, profilePicture } = req.body;
        const updatedUser = await prisma_1.prisma.user.update({
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
    }
    catch (error) {
        next(error);
    }
};
exports.updateUserProfile = updateUserProfile;
const getUserPoints = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const points = await prisma_1.prisma.point.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        const totalPoints = await prisma_1.prisma.user.findUnique({
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
    }
    catch (error) {
        next(error);
    }
};
exports.getUserPoints = getUserPoints;
const getUserCoupons = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const coupons = await prisma_1.prisma.coupon.findMany({
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
    }
    catch (error) {
        next(error);
    }
};
exports.getUserCoupons = getUserCoupons;
//# sourceMappingURL=userController.js.map