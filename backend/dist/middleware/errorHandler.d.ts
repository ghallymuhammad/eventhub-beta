import { Request, Response, NextFunction } from 'express';
export interface CustomError extends Error {
    statusCode?: number;
    status?: string;
    isOperational?: boolean;
}
export declare class AppError extends Error implements CustomError {
    readonly statusCode: number;
    readonly status: string;
    readonly isOperational: boolean;
    constructor(message: string, statusCode: number);
}
export declare const errorHandler: (err: CustomError, req: Request, res: Response, next: NextFunction) => void;
export declare const notFound: (req: Request, res: Response, next: NextFunction) => void;
export declare const catchAsync: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=errorHandler.d.ts.map