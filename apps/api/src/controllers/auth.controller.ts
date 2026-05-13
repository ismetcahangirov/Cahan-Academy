import { Request, Response } from 'express';
import * as jose from 'jose';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '../config/db.js';
import { adminUsers } from '../config/schema.js';
import { env } from '../config/env.js';
import { apiResponse } from '../utils/apiResponse.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json(apiResponse(false, 'Email və şifrə tələb olunur.'));
      return;
    }

    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.email, email));

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      res.status(401).json(apiResponse(false, 'Yanlış email və ya şifrə.'));
      return;
    }

    const accessToken = await generateAccessToken({ 
      sub: user.id, 
      email: user.email, 
      role: 'admin' 
    });

    const refreshToken = await generateRefreshToken({ sub: user.id });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json(apiResponse(true, 'Giriş uğurludur.', {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    }));
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json(apiResponse(false, 'Daxili server xətası.'));
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      res.status(401).json(apiResponse(false, 'Yeniləmə tokeni tapılmadı.'));
      return;
    }

    const { payload } = await verifyRefreshToken(refreshToken);
    const userId = payload.sub as string;

    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.id, userId));

    if (!user) {
      res.status(401).json(apiResponse(false, 'İstifadəçi tapılmadı.'));
      return;
    }

    const accessToken = await generateAccessToken({ 
      sub: user.id, 
      email: user.email, 
      role: 'admin' 
    });

    res.status(200).json(apiResponse(true, 'Token yeniləndi.', { accessToken }));
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(401).json(apiResponse(false, 'Yanlış və ya vaxtı keçmiş yeniləmə tokeni.'));
  }
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie('refreshToken');
  res.status(200).json(apiResponse(true, 'Çıxış uğurludur.'));
};
