import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const createTransaction: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getTransactions: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getTransaction: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateTransactionStatus: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const uploadPaymentProof: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=transactionController.d.ts.map