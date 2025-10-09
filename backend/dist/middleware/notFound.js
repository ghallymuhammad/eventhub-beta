"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = void 0;
const errorHandler_1 = require("./errorHandler");
const notFound = (req, res, next) => {
    const err = new errorHandler_1.AppError(`Route ${req.originalUrl} not found`, 404);
    next(err);
};
exports.notFound = notFound;
//# sourceMappingURL=notFound.js.map