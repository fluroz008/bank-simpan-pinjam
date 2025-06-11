import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";

export const authentication = ( req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.header('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
        res.status(401).json({ message: 'Access token required.' });
        return;
    }

    try{
        const payload = verifyAccessToken(token);
        (req as any).user = payload;
        next();
    }
    catch (err) {
        res.status(403).json({ message: 'Invalid or expired access token.' });
        return;
    }

};