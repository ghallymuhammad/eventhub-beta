"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrganizerTransactions = exports.getOrganizerEvents = exports.getOrganizerStats = void 0;
const prisma_1 = require("../lib/prisma");
const getOrganizerStats = async (req, res, next) => {
    try {
        const organizerId = req.user.id;
        if (req.user.role !== 'ORGANIZER') {
            res.status(403).json({
                status: 'fail',
                message: 'Access denied. Organizer role required.',
            });
            return;
        }
        const eventsCount = await prisma_1.prisma.event.count({
            where: { organizerId },
        });
        const revenueResult = await prisma_1.prisma.transaction.aggregate({
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
        const ticketsSold = await prisma_1.prisma.transaction.aggregate({
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
        const pendingTransactions = await prisma_1.prisma.transaction.count({
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
    }
    catch (error) {
        next(error);
    }
};
exports.getOrganizerStats = getOrganizerStats;
const getOrganizerEvents = async (req, res, next) => {
    try {
        const organizerId = req.user.id;
        if (req.user.role !== 'ORGANIZER') {
            res.status(403).json({
                status: 'fail',
                message: 'Access denied. Organizer role required.',
            });
            return;
        }
        const events = await prisma_1.prisma.event.findMany({
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
    }
    catch (error) {
        next(error);
    }
};
exports.getOrganizerEvents = getOrganizerEvents;
const getOrganizerTransactions = async (req, res, next) => {
    try {
        const organizerId = req.user.id;
        if (req.user.role !== 'ORGANIZER') {
            res.status(403).json({
                status: 'fail',
                message: 'Access denied. Organizer role required.',
            });
            return;
        }
        const transactions = await prisma_1.prisma.transaction.findMany({
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
    }
    catch (error) {
        next(error);
    }
};
exports.getOrganizerTransactions = getOrganizerTransactions;
//# sourceMappingURL=organizerController.js.map