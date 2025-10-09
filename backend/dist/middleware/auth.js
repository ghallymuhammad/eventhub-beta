"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authorize = exports.restrictTo = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorHandler_1 = require("./errorHandler");
const prisma_1 = require("../lib/prisma");
exports.authenticate = (0, errorHandler_1.catchAsync)(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return next(new errorHandler_1.AppError('You are not logged in! Please log in to get access.', 401));
    }
    const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    const currentUser = await prisma_1.prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
        },
    });
    if (!currentUser) {
        return next(new errorHandler_1.AppError('The user belonging to this token does no longer exist.', 401));
    }
    req.user = currentUser;
    next();
});
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new errorHandler_1.AppError('You do not have permission to perform this action', 403));
        }
        next();
    };
};
exports.restrictTo = restrictTo;
exports.authorize = exports.restrictTo;
exports.optionalAuth = (0, errorHandler_1.catchAsync)(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return next();
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const currentUser = await prisma_1.prisma.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
        });
        if (currentUser) {
            req.user = currentUser;
        }
    }
    catch (error) {
    }
    next();
});
//# sourceMappingURL=auth.js.map