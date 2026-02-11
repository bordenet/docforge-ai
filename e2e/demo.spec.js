import { test, expect } from '@playwright/test';

test.describe('Demo Mode', () => {
  test('demo data module is importable', async ({ page }) => {
    await page.goto('/assistant/?type=one-pager');
    await page.waitForLoadState('networkidle');

    // Verify the demo-data module can be loaded
    const hasDemoModule = await page.evaluate(async () => {
      try {
        const module = await import('/shared/js/demo-data.js');
        return typeof module.getDemoData === 'function';
      } catch {
        return false;
      }
    });

    expect(hasDemoModule).toBe(true);
  });

  test('demo data has valid one-pager content', async ({ page }) => {
    await page.goto('/assistant/?type=one-pager');
    await page.waitForLoadState('networkidle');

    const demoData = await page.evaluate(async () => {
      const module = await import('/shared/js/demo-data.js');
      return module.getDemoData('one-pager');
    });

    expect(demoData).not.toBeNull();
    expect(demoData.formData).toBeDefined();
    expect(demoData.formData.projectName).toBe('Smart Home Energy Monitor');
    expect(demoData.phases[1]).toContain('Executive Summary');
    expect(demoData.phases[2]).toContain('Adversarial Review');
    expect(demoData.phases[3]).toContain('Final');
  });

  test('demo data phases have markdown structure', async ({ page }) => {
    await page.goto('/assistant/?type=one-pager');
    await page.waitForLoadState('networkidle');

    const phases = await page.evaluate(async () => {
      const module = await import('/shared/js/demo-data.js');
      const data = module.getDemoData('one-pager');
      return data.phases;
    });

    // Phase 1 should have headers
    expect(phases[1]).toContain('# ');
    expect(phases[1]).toContain('## ');

    // Phase 2 should have review structure
    expect(phases[2]).toContain('Strengths');
    expect(phases[2]).toContain('Gaps');

    // Phase 3 should be the final synthesis with substantial content
    expect(phases[3].length).toBeGreaterThan(1000);
  });

  test('hasDemoData returns correct values', async ({ page }) => {
    await page.goto('/assistant/?type=one-pager');
    await page.waitForLoadState('networkidle');

    const results = await page.evaluate(async () => {
      const module = await import('/shared/js/demo-data.js');
      return {
        onePager: module.hasDemoData('one-pager'),
        prd: module.hasDemoData('prd'),
        adr: module.hasDemoData('adr'),
      };
    });

    expect(results.onePager).toBe(true);
    expect(results.prd).toBe(false);
    expect(results.adr).toBe(false);
  });
});
