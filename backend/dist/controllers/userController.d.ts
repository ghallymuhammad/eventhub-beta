import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getUserProfile: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateUserProfile: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getUserPoints: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getUserCoupons: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=userController.d.ts.map