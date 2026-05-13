import { test, expect } from '@playwright/test';

test.describe('Cahan Academy E2E', () => {
  test('Ana səhifə uğurla yüklənməlidir', async ({ page }) => {
    await page.goto('/');
    // 'as-needed' prefix olduğu üçün ana səhifədə /az olmaya bilər
    await expect(page.locator('h1')).toBeVisible();
  });

  test('Dil dəyişdirmə (AZ -> EN) işləməlidir', async ({ page }) => {
    test.slow();
    await page.goto('/');
    
    // Dil menyusunu açaq
    const switcher = page.getByRole('button', { name: 'Dil seçimi' });
    await expect(switcher).toBeVisible();
    await switcher.click();
    
    // EN seçimini edək - exact: true istifadə edirik ki, 'EN' tam uyğun gəlsin
    const enOption = page.getByRole('button', { name: 'EN', exact: true });
    await expect(enOption).toBeVisible({ timeout: 10000 });
    await enOption.click();
    
    // URL-də /en olmalıdır
    await page.waitForURL(/\/en/);
    expect(page.url()).toContain('/en');
  });

  test('Kurslar səhifəsinə naviqasiya', async ({ page }) => {
    await page.goto('/');
    
    // Desktop naviqasiyasında 'Kurslar' linkini tapaq
    const coursesLink = page.getByRole('link', { name: 'Kurslar' }).first();
    await expect(coursesLink).toBeVisible();
    await coursesLink.click();
    
    // default locale üçün /courses kifayətdir
    await page.waitForURL(/\/courses/);
    expect(page.url()).toContain('/courses');
  });
});
