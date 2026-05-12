# AUTH.md — Autentifikasiya Sistemi

> **Layihə:** Academy Landing Page
> **Strategiya:** JWT (Jose) + HttpOnly Cookie
> **Scope:** Yalnız Admin Panel
> **Son yenilənmə:** 2026

---

## 1. Autentifikasiya Arxitekturası

```
┌─────────────────────────────────────────────────────────────┐
│                    ADMIN İSTİFADƏÇİSİ                       │
│              /admin/login səhifəsi                          │
└─────────────────────┬───────────────────────────────────────┘
                      │  POST /api/auth/login
                      │  { email, password }
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                 EXPRESS BACKEND                              │
│  1. Email/şifrə yoxla (bcrypt)                              │
│  2. Access Token yarat  (JWT, 15 dəq)                       │
│  3. Refresh Token yarat (JWT, 7 gün)                        │
│  4. Refresh Token → HttpOnly Cookie                         │
│  5. Access Token → JSON cavab                               │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                 NEXT.JS FRONTEND                             │
│  1. Access Token → memory (useState/Zustand)                │
│  2. Hər sorğuya:  Authorization: Bearer <access_token>      │
│  3. Token bitəndə: POST /api/auth/refresh (cookie ilə)      │
│  4. Yeni access token al                                     │
└─────────────────────────────────────────────────────────────┘

TOKEN STRATEGİYASI:
  Access Token:  15 dəqiqə  → memory-də saxla (XSS-ə qarşı)
  Refresh Token: 7 gün      → HttpOnly Cookie (JS oxuya bilməz)
```

---

## 2. Backend — Auth İmplementasiyası

### 2.1 Paketlər

```bash
cd apps/api
npm install jose bcryptjs
npm install --save-dev @types/bcryptjs
```

### 2.2 JWT Yardımçı Funksiyaları

```typescript
// src/utils/jwt.ts

import { SignJWT, jwtVerify } from 'jose';
import { env } from '../config/env';

const ACCESS_SECRET  = new TextEncoder().encode(env.JWT_ACCESS_SECRET);
const REFRESH_SECRET = new TextEncoder().encode(env.JWT_REFRESH_SECRET);

export interface JWTPayload {
  adminId: string;
  email:   string;
}

// Access Token yarat (15 dəqiqə)
export async function signAccessToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .setIssuer('cahanacademy.az')
    .setAudience('admin')
    .sign(ACCESS_SECRET);
}

// Refresh Token yarat (7 gün)
export async function signRefreshToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .setIssuer('cahanacademy.az')
    .setAudience('admin-refresh')
    .sign(REFRESH_SECRET);
}

// Access Token yoxla
export async function verifyAccessToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, ACCESS_SECRET, {
    issuer:   'cahanacademy.az',
    audience: 'admin',
  });
  return payload as unknown as JWTPayload;
}

// Refresh Token yoxla
export async function verifyRefreshToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, REFRESH_SECRET, {
    issuer:   'cahanacademy.az',
    audience: 'admin-refresh',
  });
  return payload as unknown as JWTPayload;
}
```

---

### 2.3 Auth Controller

```typescript
// src/controllers/auth.controller.ts

import type { Request, Response } from 'express';
import bcrypt                     from 'bcryptjs';
import { db }                     from '../config/db';
import { admins }                 from '../models/schema';
import { eq }                     from 'drizzle-orm';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt';
import { asyncHandler } from '../utils/asyncHandler';
import { apiResponse }  from '../utils/apiResponse';
import { AppError }     from '../utils/AppError';
import { env }          from '../config/env';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure:   env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge:   7 * 24 * 60 * 60 * 1000, // 7 gün (ms)
  path:     '/api/auth',              // Yalnız auth endpointlərə gedər
};

// POST /auth/login
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // 1. Admini tap
  const admin = await db.query.admins.findFirst({
    where: eq(admins.email, email.toLowerCase()),
  });

  if (!admin || !admin.isActive) {
    throw new AppError('Email və ya şifrə yanlışdır', 401, 'INVALID_CREDENTIALS');
  }

  // 2. Şifrəni yoxla
  const isValid = await bcrypt.compare(password, admin.passwordHash);
  if (!isValid) {
    throw new AppError('Email və ya şifrə yanlışdır', 401, 'INVALID_CREDENTIALS');
  }

  // 3. Tokenlar yarat
  const payload       = { adminId: admin.id, email: admin.email };
  const accessToken   = await signAccessToken(payload);
  const refreshToken  = await signRefreshToken(payload);

  // 4. Son giriş vaxtını yenilə
  await db
    .update(admins)
    .set({ lastLoginAt: new Date() })
    .where(eq(admins.id, admin.id));

  // 5. Refresh token → HttpOnly Cookie
  res.cookie('refresh_token', refreshToken, COOKIE_OPTIONS);

  // 6. Access token → JSON
  return apiResponse.success(res, {
    message: 'Giriş uğurlu oldu',
    data: {
      accessToken,
      admin: {
        id:    admin.id,
        email: admin.email,
        name:  admin.name,
      },
      expiresIn: 15 * 60, // saniyə
    },
  });
});

// POST /auth/refresh
export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refresh_token;

  if (!token) {
    throw new AppError('Refresh token tapılmadı', 401, 'NO_REFRESH_TOKEN');
  }

  // 1. Refresh token-i yoxla
  let payload: { adminId: string; email: string };
  try {
    payload = await verifyRefreshToken(token);
  } catch {
    res.clearCookie('refresh_token', { path: '/api/auth' });
    throw new AppError('Refresh token keçərsizdir', 401, 'INVALID_REFRESH_TOKEN');
  }

  // 2. Admin hələ də aktivdir?
  const admin = await db.query.admins.findFirst({
    where: eq(admins.id, payload.adminId),
  });

  if (!admin || !admin.isActive) {
    res.clearCookie('refresh_token', { path: '/api/auth' });
    throw new AppError('Hesab deaktiv edilib', 401, 'ACCOUNT_INACTIVE');
  }

  // 3. Yeni access token yarat
  const accessToken = await signAccessToken({
    adminId: admin.id,
    email:   admin.email,
  });

  return apiResponse.success(res, {
    data: {
      accessToken,
      expiresIn: 15 * 60,
    },
  });
});

// POST /auth/logout
export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie('refresh_token', { path: '/api/auth' });
  return apiResponse.success(res, { message: 'Çıxış uğurlu oldu' });
});

// GET /auth/me
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  // req.admin — auth middleware tərəfindən əlavə olunur
  const admin = (req as any).admin;
  return apiResponse.success(res, {
    data: {
      id:          admin.id,
      email:       admin.email,
      name:        admin.name,
      lastLoginAt: admin.lastLoginAt,
    },
  });
});
```

---

### 2.4 Auth Middleware

```typescript
// src/middleware/auth.middleware.ts

import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { db }               from '../config/db';
import { admins }           from '../models/schema';
import { eq }               from 'drizzle-orm';
import { AppError }         from '../utils/AppError';

export async function authMiddleware(
  req:  Request,
  res:  Response,
  next: NextFunction
): Promise<void> {
  try {
    // 1. Bearer token al
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError(
        'Autentifikasiya tələb olunur',
        401,
        'NO_TOKEN'
      );
    }

    const token = authHeader.slice(7);

    // 2. Token-i yoxla
    let payload: { adminId: string; email: string };
    try {
      payload = await verifyAccessToken(token);
    } catch (err: any) {
      if (err.code === 'ERR_JWT_EXPIRED') {
        throw new AppError('Token müddəti bitib', 401, 'TOKEN_EXPIRED');
      }
      throw new AppError('Keçərsiz token', 401, 'INVALID_TOKEN');
    }

    // 3. Admin mövcuddur?
    const admin = await db.query.admins.findFirst({
      where: eq(admins.id, payload.adminId),
    });

    if (!admin || !admin.isActive) {
      throw new AppError('Hesab tapılmadı və ya deaktiv', 401, 'ACCOUNT_INACTIVE');
    }

    // 4. admin-i request-ə əlavə et
    (req as any).admin = admin;
    next();

  } catch (err) {
    next(err);
  }
}
```

---

### 2.5 Auth Routes

```typescript
// src/routes/auth.routes.ts

import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validate }        from '../middleware/validate.middleware';
import { loginRateLimit }  from '../middleware/rateLimit.middleware';
import { authMiddleware }  from '../middleware/auth.middleware';
import { loginSchema }     from '../schemas/auth.schema';

const router = Router();

router.post('/login',   loginRateLimit, validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout',  authController.logout);
router.get('/me',       authMiddleware,  authController.getMe);

export default router;
```

### 2.6 Auth Zod Schema

```typescript
// src/schemas/auth.schema.ts

import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .email('Düzgün email daxil edin')
    .toLowerCase(),

  password: z
    .string()
    .min(8, 'Şifrə ən az 8 simvol olmalıdır')
    .max(100),
});

export type LoginData = z.infer<typeof loginSchema>;
```

---

### 2.7 Admin Şifrə Yaratma Skripti

```typescript
// src/scripts/create-admin.ts

import bcrypt  from 'bcryptjs';
import { db }  from '../config/db';
import { admins } from '../models/schema';

async function createAdmin() {
  const email    = process.env.ADMIN_EMAIL    || 'admin@cahanacademy.az';
  const password = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
  const name     = process.env.ADMIN_NAME     || 'Super Admin';

  const passwordHash = await bcrypt.hash(password, 12);

  const [admin] = await db
    .insert(admins)
    .values({ email, passwordHash, name })
    .onConflictDoUpdate({
      target:  admins.email,
      set:     { passwordHash, name },
    })
    .returning({ id: admins.id, email: admins.email });

  console.log('✅ Admin yaradıldı:', admin);
  process.exit(0);
}

createAdmin().catch((err) => {
  console.error('❌ Xəta:', err);
  process.exit(1);
});

// İstifadə:
// ADMIN_EMAIL=admin@cahanacademy.az \
// ADMIN_PASSWORD=SuperSecret123! \
// npx tsx src/scripts/create-admin.ts
```

---

## 3. Frontend — Next.js Auth

### 3.1 Auth Store (Zustand)

```typescript
// apps/web/stores/auth.store.ts
'use client';

import { create } from 'zustand';

interface Admin {
  id:    string;
  email: string;
  name:  string;
}

interface AuthState {
  admin:       Admin | null;
  accessToken: string | null;
  isLoading:   boolean;

  login:       (email: string, password: string) => Promise<void>;
  logout:      () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  setAdmin:    (admin: Admin, token: string) => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const useAuthStore = create<AuthState>((set, get) => ({
  admin:       null,
  accessToken: null,
  isLoading:   false,

  setAdmin: (admin, accessToken) => set({ admin, accessToken }),

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method:      'POST',
        credentials: 'include',      // Cookie üçün vacib
        headers:     { 'Content-Type': 'application/json' },
        body:        JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Giriş uğursuz oldu');
      }

      set({
        admin:       data.data.admin,
        accessToken: data.data.accessToken,
        isLoading:   false,
      });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method:      'POST',
        credentials: 'include',
      });
    } finally {
      set({ admin: null, accessToken: null });
    }
  },

  refreshToken: async () => {
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method:      'POST',
        credentials: 'include',
      });

      if (!res.ok) return false;

      const data = await res.json();
      set({ accessToken: data.data.accessToken });
      return true;
    } catch {
      return false;
    }
  },
}));
```

---

### 3.2 API Client — Token Auto-Refresh

```typescript
// apps/web/lib/admin-api.ts

import { useAuthStore } from '@/stores/auth.store';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function adminFetch<T>(
  endpoint:  string,
  options:   RequestInit = {}
): Promise<T> {
  const { accessToken, refreshToken, logout } = useAuthStore.getState();

  // İlk cəhd — mövcud token ilə
  let res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${accessToken}`,
      ...options.headers,
    },
  });

  // Token bitibsə — yenilə
  if (res.status === 401) {
    const errorData = await res.json();

    if (errorData.error === 'TOKEN_EXPIRED') {
      const refreshed = await refreshToken();

      if (!refreshed) {
        // Refresh token da keçərsizdir — çıxış
        await logout();
        window.location.href = '/admin/login';
        throw new Error('Sessiya başa çatdı');
      }

      // Yeni token ilə yenidən cəhd et
      const { accessToken: newToken } = useAuthStore.getState();
      res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        credentials: 'include',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${newToken}`,
          ...options.headers,
        },
      });
    }
  }

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'API xətası');
  }

  return res.json();
}
```

---

### 3.3 Admin Layout — Route Qoruma

```typescript
// app/[locale]/(admin)/layout.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router      = useRouter();
  const { admin, refreshToken } = useAuthStore();

  useEffect(() => {
    async function checkAuth() {
      if (!admin) {
        // Refresh token ilə yenidən giriş cəhdi
        const refreshed = await refreshToken();
        if (!refreshed) {
          router.replace('/admin/login');
        }
      }
    }

    checkAuth();
  }, [admin, refreshToken, router]);

  if (!admin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="ml-64 p-8">{children}</main>
    </div>
  );
}
```

---

### 3.4 Login Forması

```typescript
// app/[locale]/(admin)/login/page.tsx
'use client';

import { useState }     from 'react';
import { useRouter }    from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';

export default function AdminLoginPage() {
  const router      = useRouter();
  const { login }   = useAuthStore();
  const [error, setError]       = useState('');
  const [isLoading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const form     = new FormData(e.currentTarget);
    const email    = form.get('email') as string;
    const password = form.get('password') as string;

    try {
      await login(email, password);
      router.replace('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Giriş uğursuz oldu');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8]">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="font-heading text-3xl text-primary tracking-widest uppercase">
            Cahan Academy
          </h1>
          <p className="text-text-secondary mt-2">Admin Panel</p>
        </div>

        {/* Kart */}
        <div className="bg-white border border-border rounded-lg p-8 shadow-sm">
          <h2 className="font-heading text-xl mb-6 text-center">Daxil ol</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-text-secondary mb-1.5">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                className="w-full px-4 py-3 border border-border rounded-md
                           focus:outline-none focus:border-secondary
                           bg-white text-primary"
                placeholder="admin@cahanacademy.az"
              />
            </div>

            <div>
              <label className="block text-sm text-text-secondary mb-1.5">
                Şifrə
              </label>
              <input
                type="password"
                name="password"
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 border border-border rounded-md
                           focus:outline-none focus:border-secondary
                           bg-white text-primary"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-md">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary text-white rounded-md
                         hover:bg-primary/90 transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed
                         font-medium tracking-wide"
            >
              {isLoading ? 'Yüklənir...' : 'Daxil ol'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-text-muted mt-6">
          © 2026 Cahan Academy. Yalnız səlahiyyətli istifadəçilər.
        </p>
      </div>
    </div>
  );
}
```

---

## 4. Mühit Dəyişənləri — Auth üçün

```bash
# apps/api/.env

# JWT — iki ayrı secret (vacibdir!)
JWT_ACCESS_SECRET=min_32_char_random_string_for_access_tokens_here
JWT_REFRESH_SECRET=another_different_32_char_random_string_for_refresh

# Generasiya etmək üçün:
# node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 5. Təhlükəsizlik Tədbirləri

```
TOKEN TƏHLÜKƏSİZLİYİ
  ✅ Access Token:  15 dəq (qısa ömür — oğurlananda az zərər)
  ✅ Refresh Token: HttpOnly Cookie (JS oxuya bilməz — XSS qorunması)
  ✅ İki fərqli JWT secret (access + refresh)
  ✅ Token audience yoxlaması (admin / admin-refresh)
  ✅ Token issuer yoxlaması (cahanacademy.az)

HTTP TƏHLÜKƏSİZLİYİ
  ✅ Helmet.js — HTTP security headers
  ✅ CORS — yalnız icazəli domenlər
  ✅ Rate limiting — brute-force qorunması
  ✅ Cookie: Secure + SameSite=Strict (CSRF qorunması)
  ✅ Cookie path: /api/auth (minimal scope)

ŞİFRƏ
  ✅ bcrypt (salt rounds: 12) — GPU hücumlarına davamlı
  ✅ Şifrə heç vaxt log-a yazılmır
  ✅ Xəta mesajı: "Email və ya şifrə yanlışdır" (hansının yanlış olduğu bilinmir)

MƏLUMAT
  ✅ Admin şifrəsi heç vaxt response-da qaytarılmır
  ✅ passwordHash SELECT sorğularından çıxarılır
  ✅ SQL injection: Drizzle ORM parametrli sorğular istifadə edir
```

---

## 6. Helmet.js Konfiqurasiyası

```typescript
// apps/api/src/app.ts

import helmet  from 'helmet';
import cors    from 'cors';
import express from 'express';
import { env } from './config/env';

const app = express();

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'"],
      imgSrc:     ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc:    ["'self'"],
      objectSrc:  ["'none'"],
      frameSrc:   ["'none'"],
    },
  },
  hsts: {
    maxAge:            31536000,   // 1 il
    includeSubDomains: true,
    preload:           true,
  },
}));

// CORS
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://cahanacademy.az',
    'https://www.cahanacademy.az',
    'https://preview.cahanacademy.az',
  ],
  credentials:      true,           // Cookie üçün vacib
  methods:          ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders:   ['Content-Type', 'Authorization'],
  exposedHeaders:   ['X-RateLimit-Limit', 'X-RateLimit-Remaining'],
}));

app.use(express.json({ limit: '10kb' }));   // Böyük payload-ları rədd et
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
```

---

## 7. Auth API Endpointləri

| Method | Endpoint | Auth | Açıqlama |
|---|---|---|---|
| POST | `/api/auth/login` | ❌ | Giriş — token qaytar |
| POST | `/api/auth/refresh` | Cookie | Access token yenilə |
| POST | `/api/auth/logout` | Cookie | Çıxış — cookie sil |
| GET | `/api/auth/me` | ✅ Bearer | Cari admin məlumatı |

---

## 8. Auth Axın Diaqramı

```
İstifadəçi              Frontend              Backend               DB
    │                      │                     │                   │
    │── email+password ──►  │                     │                   │
    │                      │── POST /auth/login ─►│                   │
    │                      │                     │── SELECT admin ──►│
    │                      │                     │◄─ admin row ───── │
    │                      │                     │                   │
    │                      │                     │── bcrypt.compare() │
    │                      │                     │── sign tokens      │
    │                      │◄─ {accessToken}  ── │                   │
    │                      │◄─ Set-Cookie: refresh_token ── │        │
    │                      │                     │                   │
    │◄─ giriş uğurlu ───── │                     │                   │
    │                      │                     │                   │
    │   (15 dəq sonra)      │                     │                   │
    │                      │── POST /admin/leads─►│                   │
    │                      │   Authorization: Bearer <expired>        │
    │                      │◄─ 401 TOKEN_EXPIRED ─│                   │
    │                      │                     │                   │
    │                      │── POST /auth/refresh─►│                  │
    │                      │   Cookie: refresh_token                  │
    │                      │◄─ {newAccessToken} ──│                  │
    │                      │                     │                   │
    │                      │── POST /admin/leads─►│                   │
    │                      │   Authorization: Bearer <newAccessToken> │
    │                      │◄─ 200 OK ────────── │                   │
```

---

## 9. Auth Yoxlama Siyahısı

```
BACKEND
  [ ]  JWT_ACCESS_SECRET  — ən az 32 simvol, unikal
  [ ]  JWT_REFRESH_SECRET — ən az 32 simvol, fərqli
  [ ]  bcrypt salt rounds: 12
  [ ]  Refresh token HttpOnly + Secure Cookie
  [ ]  Token expired xətası düzgün qaytarılır (TOKEN_EXPIRED)
  [ ]  Rate limit: 5 cəhd / 15 dəq login üçün
  [ ]  Helmet.js aktiv
  [ ]  CORS yalnız icazəli domenlər
  [ ]  passwordHash SELECT-dən çıxarılır

FRONTEND
  [ ]  Access token yalnız memory-də (localStorage istifadə edilmir)
  [ ]  credentials: 'include' bütün admin fetch-lərdə
  [ ]  TOKEN_EXPIRED → auto-refresh → retry məntiqi işləyir
  [ ]  Refresh uğursuz → /admin/login redirect
  [ ]  Admin route-ları auth yoxlaması olmadan açılmır

TEST
  [ ]  Düzgün email+şifrə → giriş işləyir
  [ ]  Yanlış şifrə → 401 + "Email və ya şifrə yanlışdır"
  [ ]  Token bitdikdən sonra → auto-refresh işləyir
  [ ]  Refresh token silinəndə → login-ə redirect
  [ ]  5+ giriş cəhdi → rate limit işləyir
  [ ]  Admin deaktiv ediləndə → token qəbul edilmir
```
