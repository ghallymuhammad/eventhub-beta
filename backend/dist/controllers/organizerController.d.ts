import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getOrganizerStats: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getOrganizerEvents: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getOrganizerTransactions: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=organizerController.d.ts.map