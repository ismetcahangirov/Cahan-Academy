# TESTING.md — Test Sənədləşməsi

> **Layihə:** Academy Landing Page
> **E2E:** Playwright
> **Unit/Integration:** Vitest
> **Son yenilənmə:** 2026

---

## 1. Test Strategiyası

```
┌─────────────────────────────────────────────────────────────┐
│                    TEST PİRAMİDASI                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│              ▲  E2E Testlər (Playwright)                    │
│             ▲▲▲   → Kritik istifadəçi axınları             │
│            ▲▲▲▲▲    → Contact form, Admin login             │
│           ▲▲▲▲▲▲▲    → SEO meta, Sitemap                   │
│                                                             │
│         ▲▲▲▲▲▲▲▲▲▲▲  Integration Testlər (Vitest)         │
│        ▲▲▲▲▲▲▲▲▲▲▲▲▲   → API endpoint testlər             │
│       ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲   → Service funksiyaları            │
│                                                             │
│  ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲  Unit Testlər (Vitest)            │
│ ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲  → Utility funksiyalar           │
│▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲  → Zod validasiya               │
│                            → JWT utils                      │
└─────────────────────────────────────────────────────────────┘

Test miqdarı hədəfi:
  Unit:        ~60%  → Sürətli, çox
  Integration: ~30%  → Orta sürət
  E2E:         ~10%  → Yavaş, az amma kritik
```

---

## 2. Qurulum

### 2.1 Paketlər

```bash
# Root səviyyə (monorepo)
npm install --save-dev \
  playwright \
  @playwright/test \
  vitest \
  @vitest/coverage-v8 \
  supertest \
  @types/supertest

# Playwright brauzerləri yüklə
npx playwright install chromium firefox webkit

# package.json skriptləri (root)
{
  "scripts": {
    "test":           "turbo run test",
    "test:e2e":       "playwright test",
    "test:e2e:ui":    "playwright test --ui",
    "test:unit":      "vitest run",
    "test:watch":     "vitest watch",
    "test:coverage":  "vitest run --coverage",
    "test:ci":        "vitest run --coverage && playwright test"
  }
}
```

### 2.2 Playwright Konfiqurasiyası

```typescript
// playwright.config.ts (root)

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir:  './e2e',
  timeout:  30_000,
  retries:  process.env.CI ? 2 : 0,
  workers:  process.env.CI ? 1 : '50%',

  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],

  use: {
    baseURL:     process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace:       'on-first-retry',
    screenshot:  'only-on-failure',
    video:       'retain-on-failure',
    locale:      'az-AZ',
  },

  projects: [
    // Desktop
    {
      name:   'chromium',
      use:    { ...devices['Desktop Chrome'] },
    },
    {
      name:   'firefox',
      use:    { ...devices['Desktop Firefox'] },
    },
    // Mobil
    {
      name:   'mobile-chrome',
      use:    { ...devices['Pixel 7'] },
    },
    {
      name:   'mobile-safari',
      use:    { ...devices['iPhone 14'] },
    },
  ],

  // Test başlanmadan əvvəl serveri başlat
  webServer: [
    {
      command:            'npm run dev --workspace=apps/web',
      port:               3000,
      reuseExistingServer: !process.env.CI,
      timeout:            120_000,
    },
    {
      command:            'npm run dev --workspace=apps/api',
      port:               5000,
      reuseExistingServer: !process.env.CI,
      timeout:            60_000,
    },
  ],
});
```

### 2.3 Vitest Konfiqurasiyası

```typescript
// apps/api/vitest.config.ts

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals:     true,
    environment: 'node',
    coverage: {
      provider:   'v8',
      reporter:   ['text', 'html', 'lcov'],
      exclude:    ['dist/**', 'drizzle/**', 'src/scripts/**'],
      thresholds: {
        lines:      70,
        functions:  70,
        branches:   60,
        statements: 70,
      },
    },
    setupFiles: ['./src/test/setup.ts'],
  },
});
```

---

## 3. E2E Testlər — Playwright

### 3.1 Test Yardımçıları

```typescript
// e2e/helpers/pages.ts

import type { Page } from '@playwright/test';

export class AcademyPage {
  constructor(readonly page: Page) {}

  // Naviqasiya
  async goToHome()     { await this.page.goto('/');         }
  async goToCourses()  { await this.page.goto('/kurslar');  }
  async goToContact()  { await this.page.goto('/elaqe');    }
  async goToAdmin()    { await this.page.goto('/admin/login'); }

  // Contact form doldurmaq
  async fillContactForm(data: {
    name:    string;
    email:   string;
    phone?:  string;
    message: string;
  }) {
    await this.page.getByLabel('Adınız').fill(data.name);
    await this.page.getByLabel('Email').fill(data.email);
    if (data.phone) {
      await this.page.getByLabel('Telefon').fill(data.phone);
    }
    await this.page.getByLabel('Mesaj').fill(data.message);
  }

  // Admin login
  async loginAsAdmin(email: string, password: string) {
    await this.goToAdmin();
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByLabel('Şifrə').fill(password);
    await this.page.getByRole('button', { name: 'Daxil ol' }).click();
    await this.page.waitForURL('**/admin/dashboard');
  }

  // SEO meta yoxlama
  async getMetaContent(name: string): Promise<string | null> {
    return this.page.getAttribute(`meta[name="${name}"]`, 'content')
      || this.page.getAttribute(`meta[property="${name}"]`, 'content');
  }
}
```

---

### 3.2 Ana Səhifə Testləri

```typescript
// e2e/home.spec.ts

import { test, expect }   from '@playwright/test';
import { AcademyPage }    from './helpers/pages';

test.describe('Ana Səhifə', () => {
  let academy: AcademyPage;

  test.beforeEach(async ({ page }) => {
    academy = new AcademyPage(page);
    await academy.goToHome();
  });

  test('Başlıq düzgün render olunur', async ({ page }) => {
    await expect(page).toHaveTitle(/Cahan Academy/);
  });

  test('H1 başlıq mövcuddur', async ({ page }) => {
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toBeVisible();
    await expect(h1).not.toBeEmpty();
  });

  test('Hero bölməsi görünür', async ({ page }) => {
    await expect(page.getByRole('region', { name: 'Əsas bölmə' })).toBeVisible();
  });

  test('CTA düyməsi kurslara aparır', async ({ page }) => {
    await page.getByRole('link', { name: 'Kurslara bax' }).first().click();
    await expect(page).toHaveURL(/kurslar/);
  });

  test('SEO — meta description mövcuddur', async ({ page }) => {
    const desc = await academy.getMetaContent('description');
    expect(desc).toBeTruthy();
    expect(desc!.length).toBeGreaterThan(50);
    expect(desc!.length).toBeLessThan(160);
  });

  test('SEO — og:image mövcuddur', async ({ page }) => {
    const ogImage = await academy.getMetaContent('og:image');
    expect(ogImage).toBeTruthy();
    expect(ogImage).toContain('cahanacademy.az');
  });

  test('SEO — canonical URL düzgündür', async ({ page }) => {
    const canonical = await page.getAttribute('link[rel="canonical"]', 'href');
    expect(canonical).toBe('https://cahanacademy.az');
  });

  test('Header naviqasiyası görünür', async ({ page }) => {
    await expect(page.getByRole('navigation', { name: 'Əsas naviqasiya' })).toBeVisible();
  });

  test('Footer mövcuddur', async ({ page }) => {
    await expect(page.getByRole('contentinfo')).toBeVisible();
  });

  test('Şəkillər yüklənir (LCP)', async ({ page }) => {
    // Hero şəklinin yükləndiyini yoxla
    const heroImg = page.locator('section[aria-label="Əsas bölmə"] img').first();
    await expect(heroImg).toBeVisible();

    // naturalWidth > 0 — şəkil həqiqətən yüklənib
    const loaded = await heroImg.evaluate((img: HTMLImageElement) => img.naturalWidth > 0);
    expect(loaded).toBe(true);
  });

  test('Statistika bölməsi rəqəmləri göstərir', async ({ page }) => {
    const stats = page.getByRole('region', { name: 'Statistikalar' });
    await expect(stats).toBeVisible();
    await expect(stats.getByText(/\d+\+/)).toHaveCount({ min: 2 });
  });
});
```

---

### 3.3 Kurslar Səhifəsi Testləri

```typescript
// e2e/courses.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Kurslar Səhifəsi', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/kurslar');
  });

  test('Kurslar siyahısı yüklənir', async ({ page }) => {
    // Ən azı 1 kurs kartı olmalıdır
    const cards = page.getByRole('article');
    await expect(cards.first()).toBeVisible({ timeout: 10_000 });
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Kurs kartında başlıq mövcuddur', async ({ page }) => {
    const firstCard = page.getByRole('article').first();
    const heading   = firstCard.getByRole('heading', { level: 3 });
    await expect(heading).toBeVisible();
    await expect(heading).not.toBeEmpty();
  });

  test('Kurs kartında qiymət göstərilir', async ({ page }) => {
    const firstCard = page.getByRole('article').first();
    // AZN və ya "Pulsuz" yazısı olmalıdır
    const priceText = firstCard.getByText(/AZN|Pulsuz/i);
    await expect(priceText).toBeVisible();
  });

  test('Kurs kartına klik — detallar səhifəsi', async ({ page }) => {
    const firstCard = page.getByRole('article').first();
    const link      = firstCard.getByRole('link').first();
    const href      = await link.getAttribute('href');
    expect(href).toContain('/kurslar/');

    await link.click();
    await expect(page).toHaveURL(/\/kurslar\/.+/);
  });

  test('SEO — title kurs adını ehtiva edir', async ({ page }) => {
    // Tək kurs səhifəsi
    const cards  = page.getByRole('article');
    await cards.first().getByRole('link').first().click();
    await page.waitForLoadState('networkidle');

    const title = await page.title();
    expect(title).toContain('Cahan Academy');
    expect(title.length).toBeGreaterThan(10);
  });

  test('Breadcrumb mövcuddur', async ({ page }) => {
    await page.getByRole('article').first().getByRole('link').first().click();
    await page.waitForLoadState('networkidle');

    const breadcrumb = page.getByRole('navigation', { name: /breadcrumb/i });
    await expect(breadcrumb).toBeVisible();
  });
});
```

---

### 3.4 Əlaqə Forması Testləri

```typescript
// e2e/contact-form.spec.ts

import { test, expect } from '@playwright/test';
import { AcademyPage }  from './helpers/pages';

test.describe('Əlaqə Forması', () => {
  let academy: AcademyPage;

  test.beforeEach(async ({ page }) => {
    academy = new AcademyPage(page);
    await page.goto('/elaqe');
  });

  test('Form elementləri görünür', async ({ page }) => {
    await expect(page.getByLabel('Adınız')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Mesaj')).toBeVisible();
    await expect(page.getByRole('button', { name: /göndər/i })).toBeVisible();
  });

  test('Boş form göndərilmir — validasiya xətaları', async ({ page }) => {
    await page.getByRole('button', { name: /göndər/i }).click();
    // Ən azı bir xəta mesajı olmalıdır
    const errors = page.getByRole('alert');
    await expect(errors.first()).toBeVisible();
  });

  test('Yanlış email — validasiya xətası', async ({ page }) => {
    await page.getByLabel('Adınız').fill('Test User');
    await page.getByLabel('Email').fill('not-an-email');
    await page.getByLabel('Mesaj').fill('Test mesaj mətni uzundur');
    await page.getByRole('button', { name: /göndər/i }).click();

    const emailError = page.getByText(/email/i).filter({ hasText: /düzgün|valid/i });
    await expect(emailError).toBeVisible();
  });

  test('Uğurlu form göndərmə', async ({ page }) => {
    await academy.fillContactForm({
      name:    'Test İstifadəçi',
      email:   'test@example.com',
      phone:   '+994501234567',
      message: 'Bu bir test mesajıdır. Ən az on simvol olmalıdır.',
    });

    await page.getByRole('button', { name: /göndər/i }).click();

    // Uğur mesajı görünür
    const success = page.getByText(/qəbul edildi|uğurlu|thank/i);
    await expect(success).toBeVisible({ timeout: 10_000 });
  });

  test('Rate limit — çox müraciət xətası', async ({ page }) => {
    // 3 dəfə göndər
    for (let i = 0; i < 3; i++) {
      await academy.fillContactForm({
        name:    `Test ${i}`,
        email:   `test${i}@example.com`,
        message: 'Test mesaj mətni uzundur ki keçsin.',
      });
      await page.getByRole('button', { name: /göndər/i }).click();
      await page.waitForTimeout(500);
      // Hər göndərmədən sonra formu yenilə
      if (i < 2) await page.reload();
    }

    // 4-cü cəhddə rate limit xətası
    await academy.fillContactForm({
      name:    'Test 4',
      email:   'test4@example.com',
      message: 'Test mesaj mətni uzundur ki keçsin.',
    });
    await page.getByRole('button', { name: /göndər/i }).click();

    const rateError = page.getByText(/çox sayda|rate limit|limit/i);
    await expect(rateError).toBeVisible({ timeout: 5_000 });
  });
});
```

---

### 3.5 Admin Panel Testləri

```typescript
// e2e/admin.spec.ts

import { test, expect } from '@playwright/test';
import { AcademyPage }  from './helpers/pages';

// Admin kredensialları test env-dən
const ADMIN_EMAIL    = process.env.TEST_ADMIN_EMAIL    || 'admin@cahanacademy.az';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'TestPass123!';

test.describe('Admin Panel', () => {
  let academy: AcademyPage;

  test.beforeEach(async ({ page }) => {
    academy = new AcademyPage(page);
  });

  test('Login səhifəsi açılır', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page.getByRole('heading', { name: /daxil ol/i })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Şifrə')).toBeVisible();
  });

  test('Admin panelə birbaşa giriş → redirect login', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/admin\/login/);
  });

  test('Yanlış şifrə ilə giriş uğursuz olur', async ({ page }) => {
    await page.goto('/admin/login');
    await page.getByLabel('Email').fill(ADMIN_EMAIL);
    await page.getByLabel('Şifrə').fill('WrongPassword123!');
    await page.getByRole('button', { name: 'Daxil ol' }).click();

    const error = page.getByText(/yanlış|incorrect|invalid/i);
    await expect(error).toBeVisible({ timeout: 5_000 });
    await expect(page).toHaveURL(/admin\/login/);
  });

  test('Düzgün kredensiallarla giriş', async ({ page }) => {
    await academy.loginAsAdmin(ADMIN_EMAIL, ADMIN_PASSWORD);
    await expect(page).toHaveURL(/admin\/dashboard/);
    await expect(page.getByText(/dashboard|panel/i)).toBeVisible();
  });

  test('Dashboard — leads statistikası görünür', async ({ page }) => {
    await academy.loginAsAdmin(ADMIN_EMAIL, ADMIN_PASSWORD);
    // Statistika kartları
    const statsSection = page.getByTestId('stats-section');
    await expect(statsSection).toBeVisible();
  });

  test('Leads siyahısı yüklənir', async ({ page }) => {
    await academy.loginAsAdmin(ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto('/admin/leads');
    // Table və ya "müraciət yoxdur" mesajı
    const content = page.getByRole('table').or(page.getByText(/müraciət|lead/i));
    await expect(content).toBeVisible({ timeout: 10_000 });
  });

  test('Çıxış — login-ə redirect', async ({ page }) => {
    await academy.loginAsAdmin(ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.getByRole('button', { name: /çıxış|logout/i }).click();
    await expect(page).toHaveURL(/admin\/login/);
  });
});
```

---

### 3.6 SEO & Texniki Testlər

```typescript
// e2e/seo.spec.ts

import { test, expect } from '@playwright/test';

const PAGES = [
  { path: '/',          name: 'Ana Səhifə'  },
  { path: '/kurslar',   name: 'Kurslar'     },
  { path: '/muellimler',name: 'Müəllimlər'  },
  { path: '/haqqimizda',name: 'Haqqımızda'  },
  { path: '/elaqe',     name: 'Əlaqə'       },
  { path: '/faq',       name: 'FAQ'         },
];

test.describe('SEO Yoxlamaları', () => {

  for (const { path, name } of PAGES) {
    test(`${name} — title 50-60 simvol`, async ({ page }) => {
      await page.goto(path);
      const title = await page.title();
      expect(title.length).toBeGreaterThan(10);
      expect(title.length).toBeLessThan(70);
      expect(title).toContain('Cahan Academy');
    });

    test(`${name} — meta description`, async ({ page }) => {
      await page.goto(path);
      const desc = await page.getAttribute('meta[name="description"]', 'content');
      expect(desc).toBeTruthy();
      expect(desc!.length).toBeGreaterThan(50);
      expect(desc!.length).toBeLessThan(165);
    });

    test(`${name} — yalnız bir h1`, async ({ page }) => {
      await page.goto(path);
      const h1s = page.getByRole('heading', { level: 1 });
      await expect(h1s).toHaveCount(1);
    });

    test(`${name} — canonical URL`, async ({ page }) => {
      await page.goto(path);
      const canonical = await page.getAttribute('link[rel="canonical"]', 'href');
      expect(canonical).toBeTruthy();
      expect(canonical).toContain('cahanacademy.az');
    });

    test(`${name} — OG teqləri`, async ({ page }) => {
      await page.goto(path);
      const ogTitle = await page.getAttribute('meta[property="og:title"]', 'content');
      const ogDesc  = await page.getAttribute('meta[property="og:description"]', 'content');
      const ogImg   = await page.getAttribute('meta[property="og:image"]', 'content');
      expect(ogTitle).toBeTruthy();
      expect(ogDesc).toBeTruthy();
      expect(ogImg).toBeTruthy();
    });
  }

  test('Sitemap mövcuddur və düzgün formatdadır', async ({ page }) => {
    const res = await page.request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain('<?xml');
    expect(body).toContain('<urlset');
    expect(body).toContain('cahanacademy.az');
    expect(body).toContain('<loc>');
  });

  test('Robots.txt mövcuddur', async ({ page }) => {
    const res = await page.request.get('/robots.txt');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain('User-agent');
    expect(body).toContain('Sitemap');
    expect(body).toContain('/admin');
  });

  test('404 səhifəsi düzgün status qaytarır', async ({ page }) => {
    const res = await page.request.get('/yoxdur-bele-bir-sehife-123');
    expect(res.status()).toBe(404);
  });

  test('JSON-LD schema mövcuddur (ana səhifə)', async ({ page }) => {
    await page.goto('/');
    const jsonLd = page.locator('script[type="application/ld+json"]');
    await expect(jsonLd).toHaveCount({ min: 1 });

    const content = await jsonLd.first().textContent();
    expect(content).toBeTruthy();
    const parsed = JSON.parse(content!);
    expect(parsed['@context']).toBe('https://schema.org');
  });

  test('Şəkillərin alt atributları mövcuddur', async ({ page }) => {
    await page.goto('/');
    const images = page.locator('img:not([aria-hidden="true"])');
    const count  = await images.count();

    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      expect(alt).not.toBeNull(); // alt atributu mövcuddur
    }
  });
});

test.describe('Performans Yoxlamaları', () => {
  test('Ana səhifə 3 saniyədən gec yüklənmir', async ({ page }) => {
    const start = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(3000);
  });

  test('Kurslar səhifəsi yüklənir', async ({ page }) => {
    await page.goto('/kurslar');
    await page.waitForLoadState('domcontentloaded');
    // Ən azı bir kurs kartı render olunub
    await expect(page.getByRole('article').first()).toBeVisible({ timeout: 8_000 });
  });
});
```

---

## 4. Unit Testlər — Vitest

### 4.1 Utility Funksiyaları

```typescript
// apps/api/src/utils/__tests__/slugify.test.ts

import { describe, it, expect } from 'vitest';
import { slugify }              from '@academy/shared-utils';

describe('slugify()', () => {
  it('Azərbaycan hərflərini çevirir', () => {
    expect(slugify('Python Başlanğıc')).toBe('python-baslangic');
  });

  it('Xüsusi hərfləri çevirir', () => {
    expect(slugify('Leyla Məmmədova')).toBe('leyla-memmedova');
    expect(slugify('Ş, Ç, Ğ, Ü, Ö')).toBe('s-c-g-u-o');
  });

  it('Böyük hərfləri kiçik edir', () => {
    expect(slugify('WEB DEVELOPMENT')).toBe('web-development');
  });

  it('Çox boşluqları tək tire edir', () => {
    expect(slugify('Python   Kursu')).toBe('python-kursu');
  });

  it('Başlanğıc və son tirəni silir', () => {
    expect(slugify(' Kurs ')).toBe('kurs');
  });

  it('Rəqəmləri saxlayır', () => {
    expect(slugify('Python 3.12')).toBe('python-3-12');
  });

  it('Boş string qaytarır', () => {
    expect(slugify('')).toBe('');
  });
});
```

```typescript
// apps/api/src/utils/__tests__/jwt.test.ts

import { describe, it, expect } from 'vitest';
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from '../jwt';

const payload = { adminId: 'test-id', email: 'admin@test.az' };

describe('JWT Utilities', () => {
  describe('signAccessToken()', () => {
    it('Token yaradır', async () => {
      const token = await signAccessToken(payload);
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT formatı
    });
  });

  describe('verifyAccessToken()', () => {
    it('Düzgün token-i doğrulayır', async () => {
      const token   = await signAccessToken(payload);
      const decoded = await verifyAccessToken(token);
      expect(decoded.adminId).toBe(payload.adminId);
      expect(decoded.email).toBe(payload.email);
    });

    it('Yanlış token — xəta atır', async () => {
      await expect(verifyAccessToken('invalid.token.here')).rejects.toThrow();
    });

    it('Refresh token access kimi qəbul edilmir', async () => {
      const refresh = await signRefreshToken(payload);
      await expect(verifyAccessToken(refresh)).rejects.toThrow();
    });
  });
});
```

---

### 4.2 Zod Validasiya Testləri

```typescript
// apps/api/src/schemas/__tests__/contact.schema.test.ts

import { describe, it, expect } from 'vitest';
import { contactSchema }        from '../contact.schema';

describe('contactSchema', () => {
  const validData = {
    name:    'Anar Hüseynov',
    email:   'anar@example.com',
    phone:   '+994501234567',
    message: 'Bu test mesajıdır, on simvoldan uzundur.',
    locale:  'az' as const,
  };

  describe('name', () => {
    it('Düzgün ad keçir', () => {
      const result = contactSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('Çox qısa ad — xəta', () => {
      const result = contactSchema.safeParse({ ...validData, name: 'A' });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].path).toContain('name');
    });

    it('Rəqəm daxil olan ad — xəta', () => {
      const result = contactSchema.safeParse({ ...validData, name: 'Anar123' });
      expect(result.success).toBe(false);
    });
  });

  describe('email', () => {
    it('Düzgün email keçir', () => {
      const result = contactSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('Yanlış email formatı — xəta', () => {
      const result = contactSchema.safeParse({ ...validData, email: 'not-email' });
      expect(result.success).toBe(false);
    });
  });

  describe('phone', () => {
    it('Düzgün Azərbaycan nömrəsi keçir', () => {
      const phones = ['+994501234567', '+994551234567', '+994771234567', '0501234567'];
      phones.forEach((phone) => {
        const result = contactSchema.safeParse({ ...validData, phone });
        expect(result.success).toBe(true);
      });
    });

    it('Yanlış nömrə formatı — xəta', () => {
      const result = contactSchema.safeParse({ ...validData, phone: '123456' });
      expect(result.success).toBe(false);
    });

    it('Boş nömrə — keçir (opsional)', () => {
      const result = contactSchema.safeParse({ ...validData, phone: '' });
      expect(result.success).toBe(true);
    });
  });

  describe('message', () => {
    it('Çox qısa mesaj — xəta', () => {
      const result = contactSchema.safeParse({ ...validData, message: 'Qısa' });
      expect(result.success).toBe(false);
    });

    it('Çox uzun mesaj — xəta', () => {
      const result = contactSchema.safeParse({
        ...validData,
        message: 'A'.repeat(1001),
      });
      expect(result.success).toBe(false);
    });
  });
});
```

---

### 4.3 Repository Testləri

```typescript
// apps/api/src/repositories/__tests__/lead.repository.test.ts

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { leadRepository } from '../lead.repository';
import { db }            from '../../config/db';
import { leads }         from '../../models/schema';

describe('leadRepository', () => {
  let createdLeadId: string;

  afterAll(async () => {
    // Test məlumatlarını sil
    if (createdLeadId) {
      await db.delete(leads).where(/* eq(leads.id, createdLeadId) */);
    }
  });

  describe('create()', () => {
    it('Yeni lead yaradır', async () => {
      const lead = await leadRepository.create({
        name:    'Test İstifadəçi',
        email:   `test-${Date.now()}@test.az`,
        message: 'Test mesajı',
        source:  'contact_form',
      });

      createdLeadId = lead.id;
      expect(lead.id).toBeTruthy();
      expect(lead.status).toBe('new');
      expect(lead.name).toBe('Test İstifadəçi');
    });
  });

  describe('findById()', () => {
    it('Mövcud lead tapır', async () => {
      const lead = await leadRepository.findById(createdLeadId);
      expect(lead).toBeDefined();
      expect(lead!.id).toBe(createdLeadId);
    });

    it('Mövcud olmayan ID — undefined qaytarır', async () => {
      const lead = await leadRepository.findById('00000000-0000-0000-0000-000000000000');
      expect(lead).toBeUndefined();
    });
  });

  describe('updateStatus()', () => {
    it('Status yenilənir', async () => {
      const updated = await leadRepository.updateStatus(
        createdLeadId,
        'contacted',
        'Telefon ilə əlaqə saxlanıldı'
      );
      expect(updated.status).toBe('contacted');
      expect(updated.notes).toBe('Telefon ilə əlaqə saxlanıldı');
    });
  });

  describe('getStats()', () => {
    it('Statistika qaytarır', async () => {
      const stats = await leadRepository.getStats();
      expect(stats.total).toBeGreaterThan(0);
      expect(typeof stats.newCount).toBe('number');
      expect(typeof stats.enrolled).toBe('number');
    });
  });
});
```

---

### 4.4 API Integration Testləri

```typescript
// apps/api/src/__tests__/contact.api.test.ts

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import { app }   from '../app';

const request = supertest(app);

describe('POST /api/contact', () => {
  const validBody = {
    name:    'Test İstifadəçi',
    email:   'test@example.az',
    phone:   '+994501234567',
    message: 'Bu test mesajıdır, kifayət qədər uzundur.',
    locale:  'az',
  };

  it('Düzgün məlumat — 201 qaytarır', async () => {
    const res = await request
      .post('/api/contact')
      .send(validBody);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeTruthy();
  });

  it('Email olmadan — 422 qaytarır', async () => {
    const res = await request
      .post('/api/contact')
      .send({ ...validBody, email: undefined });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('VALIDATION_ERROR');
  });

  it('Yanlış email formatı — 422 qaytarır', async () => {
    const res = await request
      .post('/api/contact')
      .send({ ...validBody, email: 'not-an-email' });

    expect(res.status).toBe(422);
    expect(res.body.details.email).toBeTruthy();
  });

  it('Çox qısa mesaj — 422 qaytarır', async () => {
    const res = await request
      .post('/api/contact')
      .send({ ...validBody, message: 'Qısa' });

    expect(res.status).toBe(422);
  });

  it('JSON Content-Type olmadan — 400 qaytarır', async () => {
    const res = await request
      .post('/api/contact')
      .send('plain text');

    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});

describe('GET /api/courses', () => {
  it('200 qaytarır', async () => {
    const res = await request.get('/api/courses');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('locale parametri işləyir', async () => {
    const res = await request.get('/api/courses?locale=en');
    expect(res.status).toBe(200);
  });
});

describe('GET /api/health', () => {
  it('200 qaytarır', async () => {
    const res = await request.get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('Admin endpoint qorunması', () => {
  it('Token olmadan — 401', async () => {
    const res = await request.get('/api/admin/leads');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('NO_TOKEN');
  });

  it('Yanlış token — 401', async () => {
    const res = await request
      .get('/api/admin/leads')
      .set('Authorization', 'Bearer invalid.token.here');
    expect(res.status).toBe(401);
  });
});
```

---

## 5. GitHub Actions — Test Pipeline

```yaml
# .github/workflows/test.yml

name: Test Suite

on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    name: Unit & Integration Testlər
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER:     testuser
          POSTGRES_PASSWORD: testpass
          POSTGRES_DB:       academy_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    env:
      DATABASE_URL:        postgresql://testuser:testpass@localhost:5432/academy_test
      JWT_ACCESS_SECRET:   test_access_secret_64_chars_minimum_length_required
      JWT_REFRESH_SECRET:  test_refresh_secret_64_chars_minimum_length_required
      NODE_ENV:            test
      SMTP_HOST:           localhost
      SMTP_PORT:           1025
      SMTP_USER:           test@test.az
      SMTP_PASS:           testpass
      CLIENT_URL:          http://localhost:3000
      ADMIN_EMAIL:         admin@test.az
      NOTIFICATION_EMAIL:  notify@test.az
      REVALIDATE_SECRET:   test_revalidate_secret_32

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - name: Migration icra et
        run: cd apps/api && npm run db:migrate

      - name: Vitest — Unit testlər
        run: cd apps/api && npm run test:coverage

      - name: Coverage hesabatı
        uses: codecov/codecov-action@v4
        with:
          file: apps/api/coverage/lcov.info

  e2e-tests:
    name: E2E Testlər
    runs-on: ubuntu-latest
    needs: unit-tests

    env:
      PLAYWRIGHT_BASE_URL:    http://localhost:3000
      NEXT_PUBLIC_API_URL:    http://localhost:5000/api
      NEXT_PUBLIC_SITE_URL:   http://localhost:3000
      DATABASE_URL:           ${{ secrets.DATABASE_URL_TEST }}
      JWT_ACCESS_SECRET:      ${{ secrets.JWT_ACCESS_SECRET_TEST }}
      JWT_REFRESH_SECRET:     ${{ secrets.JWT_REFRESH_SECRET_TEST }}
      TEST_ADMIN_EMAIL:       admin@test.az
      TEST_ADMIN_PASSWORD:    TestPass123!
      REVALIDATE_SECRET:      test_secret

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - name: Playwright brauzerləri yüklə
        run: npx playwright install --with-deps chromium

      - name: E2E testlər icra et
        run: npm run test:e2e -- --project=chromium

      - name: Test hesabatını yüklə
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name:           playwright-report
          path:           playwright-report/
          retention-days: 7
```

---

## 6. Test Yoxlama Siyahısı

```
QURULUM
  [ ]  Playwright quraşdırılıb
  [ ]  Vitest quraşdırılıb
  [ ]  Test DB konfiqurasiyası
  [ ]  GitHub Actions secrets əlavə edilib

UNIT TESTLƏR
  [ ]  slugify() — bütün Azərbaycan hərfləri
  [ ]  signAccessToken() / verifyAccessToken()
  [ ]  contactSchema — bütün validasiya qaydaları
  [ ]  leadRepository — CRUD əməliyyatları
  [ ]  Coverage > 70%

E2E TESTLƏR
  [ ]  Ana səhifə — başlıq, h1, CTA
  [ ]  Kurslar — siyahı, klik, detallar
  [ ]  Contact form — validasiya, uğurlu göndərmə
  [ ]  Admin login — düzgün/yanlış
  [ ]  Admin — qorunan route-lar
  [ ]  SEO — hər səhifə üçün title, description, h1, canonical
  [ ]  Sitemap + Robots.txt
  [ ]  JSON-LD schema

BROWSER KOMPATİBİLLİK
  [ ]  Chrome — keçir
  [ ]  Firefox — keçir
  [ ]  Mobile Chrome (Pixel 7) — keçir
  [ ]  Mobile Safari (iPhone 14) — keçir

CI/CD
  [ ]  PR-ə push — testlər işə düşür
  [ ]  Unit test uğursuzluğu — deploy bloklanır
  [ ]  E2E test uğursuzluğu — deploy bloklanır
  [ ]  Test hesabatı artifact olaraq saxlanılır
```
