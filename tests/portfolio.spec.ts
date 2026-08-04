import { test, expect } from '@playwright/test';

test.describe('3D Neural Network Portfolio — E2E Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/');
  });

  test('1. Initial Load & Responsive Header Verification', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await expect(page.locator('text=INSIDE MY NEURAL NETWORK')).toBeVisible();
    await expect(page.locator('text=DEEPAK R V')).toBeVisible();
    await expect(page.locator('text=AI & MACHINE LEARNING ENGINEER')).toBeVisible();

    expect(consoleErrors.length).toBe(0);
  });

  test('2. Sub-Network Traversal (Skills & Backpropagation)', async ({ page }) => {
    // Click Skills node chip inside 3D scene
    await page.click('text=Skills');
    
    // Backpropagation button should appear
    await expect(page.locator('text=Back (Backpropagation)')).toBeVisible();

    // Click Backpropagation to return to main graph
    await page.click('text=Back (Backpropagation)');

    // Should return to main graph
    await expect(page.locator('text=About Me')).toBeVisible();
  });

  test('3. Modal Open & Backdrop Layering Test', async ({ page }) => {
    // Click About Me chip
    await page.click('text=About Me');

    // Modal should be visible
    await expect(page.locator('text=About Deepak R V')).toBeVisible();

    // Close modal
    await page.click('text=Close Window');

    // Modal closed
    await expect(page.locator('text=About Deepak R V')).not.toBeVisible();
  });
});
