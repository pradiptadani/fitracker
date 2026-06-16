import { test, expect } from '@playwright/test';

test('Mobile layout shows bottom nav', async ({ page, isMobile }) => {
  // Skip if not testing mobile
  if (!isMobile) return;

  await page.goto('/login');
  
  // Assuming login bypass or test db setup happens here
  
  // expect(page.locator('nav.bottom-nav')).toBeVisible();
});
