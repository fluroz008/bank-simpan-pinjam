import bcrypt from 'bcryptjs';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt'
import { PrismaClient } from '../generated/prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

//Login
export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user || !(await bcrypt.compare(password, user.password))){
        res.status(401).json({message: 'Invalid credentials'});
        return;
    }
    
    const accessToken = generateAccessToken(user.id , user.name);
    const refreshToken = generateRefreshToken(user.id);

    await prisma.user.update({
        where: { id: user.id },
        data: { rememberToken: refreshToken  },
    });

    res.json({ accessToken, refreshToken});
    return;
};

//Refresh token
export const refresh = async (req: Request, res:Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        res.status(400).json({ message: "Refresh Token Required"});
        return;
    }

    try{
        const payload = verifyRefreshToken(refreshToken) as { userId: number };
        const user = await prisma.user.findUnique({ where: { id:payload.userId } });

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        if (user.rememberToken != refreshToken){
            res.status(403).json({ message: "Invalid refresh token" })
            return;
        }

        const newAccessToken = generateAccessToken(user.id, user.name);
        res.json({ accessToken: newAccessToken});
        return;
    }
    catch (err){
        res.status(403).json({ message: 'Invalid or expired refresh token' });
        return;
    }
};

//Logout
export const logout = async (req: Request, res:Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        res.sendStatus(204);
        return;
    }

    try {
        const payload = verifyRefreshToken(refreshToken) as { userId: number }

        await prisma.user.update({
            where: { id: payload.userId },
            data: {rememberToken: null}
        });

        res.sendStatus(204);
        return;
    }
    catch (err) {
        res.status(403).json({ message: 'Invalid or expired refresh token' });
        return;
    }
};