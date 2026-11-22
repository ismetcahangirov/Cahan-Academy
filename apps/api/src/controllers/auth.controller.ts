import { CookieOptions, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '../config/db.js';
import { adminUsers, type AdminUser } from '../config/schema.js';
import { apiResponse } from '../utils/apiResponse.js';
import {
  generateAccessToken,
  generateRefreshToken,
  passwordVersion,
  verifyRefreshToken,
} from '../utils/jwt.js';
import { LoginSchema } from '../schemas/form.schema.js';

export const REFRESH_COOKIE = 'refreshToken';

// The web app and the API live on different vercel.app hosts, so the cookie must be SameSite=None.
// It is HttpOnly and is never returned in a JSON body, so page scripts cannot read it.
export const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'none',
  path: '/',
};

const REFRESH_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

// Constant-time-ish failure path: compare against a real bcrypt hash when the user does not exist,
// so response timing does not reveal which emails are registered.
// (bcrypt hash of a throwaway string, cost 12 — not a credential.)
const DUMMY_HASH = '$2a$12$Ja3RX06NHbR2VuoMUMqymu51fwQ6b75cPkTVrfWnA/vh5h9BFntf6';

const issueSession = async (res: Response, user: AdminUser, message: string) => {
  const accessToken = await generateAccessToken({
    sub: user.id,
    email: user.email,
    role: 'admin',
    isSuperAdmin: user.isSuperAdmin,
  });
  const refreshToken = await generateRefreshToken({
    sub: user.id,
    pwv: passwordVersion(user.passwordHash),
  });

  res.cookie(REFRESH_COOKIE, refreshToken, { ...refreshCookieOptions, maxAge: REFRESH_MAX_AGE });

  res.status(200).json(
    apiResponse(true, message, {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isSuperAdmin: user.isSuperAdmin,
      },
    })
  );
};

export const login = async (req: Request, res: Response) => {
  try {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json(apiResponse(false, 'Email və şifrə tələb olunur.'));
      return;
    }
    const { email, password } = parsed.data;

    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.email, email));
    const passwordOk = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);

    if (!user || !passwordOk) {
      res.status(401).json(apiResponse(false, 'Yanlış email və ya şifrə.'));
      return;
    }

    await issueSession(res, user, 'Giriş uğurludur.');
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json(apiResponse(false, 'Daxili server xətası.'));
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    // Only the HttpOnly cookie is accepted; refresh tokens are never handled by page scripts.
    const refreshToken = req.cookies?.[REFRESH_COOKIE];

    if (!refreshToken || typeof refreshToken !== 'string') {
      res.status(401).json(apiResponse(false, 'Yeniləmə tokeni tapılmadı.'));
      return;
    }

    const { payload } = await verifyRefreshToken(refreshToken);
    const userId = payload.sub as string;

    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.id, userId));

    // A password change rotates the fingerprint and therefore revokes older refresh tokens.
    if (!user || payload.pwv !== passwordVersion(user.passwordHash)) {
      res.clearCookie(REFRESH_COOKIE, refreshCookieOptions);
      res.status(401).json(apiResponse(false, 'Sessiya etibarsızdır. Yenidən daxil olun.'));
      return;
    }

    await issueSession(res, user, 'Token yeniləndi.');
  } catch (error) {
    console.error('Refresh error:', (error as Error)?.message);
    res.status(401).json(apiResponse(false, 'Yanlış və ya vaxtı keçmiş yeniləmə tokeni.'));
  }
};

export const logout = async (_req: Request, res: Response) => {
  res.clearCookie(REFRESH_COOKIE, refreshCookieOptions);
  res.status(200).json(apiResponse(true, 'Çıxış uğurludur.'));
};
