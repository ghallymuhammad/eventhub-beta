import { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
        name: string;
    };
}
export declare const authenticate: (req: Request, res: Response, next: NextFunction) => void;
export declare const restrictTo: (...roles: string[]) => (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const authorize: (...roles: string[]) => (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const optionalAuth: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map