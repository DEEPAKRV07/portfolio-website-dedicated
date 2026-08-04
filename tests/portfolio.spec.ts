import { test, expect } from '@playwright/test';

test.describe('3D Neural Network Portfolio — E2E Suite', () => {
  test('Application loads without errors and renders 3D viewport', async ({ page }) => {
    // Listen for uncaught WebGL / console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('http://localhost:3000/');
    
    // Header title verification
    await expect(page.locator('text=INSIDE MY NEURAL NETWORK')).toBeVisible();
    await expect(page.locator('text=DEEPAK R V')).toBeVisible();
    await expect(page.locator('text=AI & MACHINE LEARNING ENGINEER')).toBeVisible();

    // Verify 60 FPS / GPU badge
    await expect(page.locator('text=60 FPS')).toBeVisible();

    // Verify no breaking console errors occurred
    expect(consoleErrors.length).toBe(0);
  });
});
