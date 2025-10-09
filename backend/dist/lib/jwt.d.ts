export interface JwtPayload {
    id: string;
    email: string;
    role: string;
}
export declare const signToken: (payload: JwtPayload) => string;
export declare const verifyToken: (token: string) => JwtPayload;
export declare const createSendToken: (user: any, statusCode: number, res: any) => void;
//# sourceMappingURL=jwt.d.ts.map