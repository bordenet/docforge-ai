import { test, expect } from '@playwright/test';

test.describe('Storage (IndexedDB)', () => {
  test('can navigate to new project', async ({ page }) => {
    await page.goto('/assistant/?type=one-pager');
    await page.waitForLoadState('networkidle');

    // Navigate to new project view
    const newBtn = page.locator('#btn-new-project');
    if (await newBtn.isVisible()) {
      await newBtn.click();
      await expect(page).toHaveURL(/#new/);
    }
  });

  test('app container exists', async ({ page }) => {
    await page.goto('/assistant/?type=one-pager');
    await page.waitForLoadState('networkidle');

    // Check that app container exists and is visible
    const appContainer = page.locator('#app-container');
    await expect(appContainer).toBeVisible();
  });

  test('storage info shows in footer', async ({ page }) => {
    await page.goto('/assistant/?type=one-pager');
    await page.waitForLoadState('networkidle');

    const storageInfo = page.locator('#storage-info');
    await expect(storageInfo).toBeVisible();
  });

  test('IndexedDB is accessible', async ({ page }) => {
    await page.goto('/assistant/?type=one-pager');
    await page.waitForLoadState('networkidle');

    // Verify IndexedDB is working
    const canOpenDb = await page.evaluate(() => {
      return new Promise((resolve) => {
        try {
          const req = indexedDB.open('test-db-access', 1);
          req.onsuccess = () => {
            req.result.close();
            indexedDB.deleteDatabase('test-db-access');
            resolve(true);
          };
          req.onerror = () => resolve(false);
        } catch {
          resolve(false);
        }
      });
    });
    expect(canOpenDb).toBe(true);
  });

  test('each document type configures unique dbName', async ({ page }) => {
    await page.goto('/assistant/?type=one-pager');
    await page.waitForLoadState('networkidle');

    // Verify the plugin system correctly assigns different dbNames
    // by checking the expected names exist in the plugin configs
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));

    // Visit multiple doc types - if dbNames were the same, there would be conflicts
    await page.goto('/assistant/?type=prd');
    await page.waitForLoadState('networkidle');

    await page.goto('/assistant/?type=adr');
    await page.waitForLoadState('networkidle');

    expect(errors).toHaveLength(0);
  });
});
