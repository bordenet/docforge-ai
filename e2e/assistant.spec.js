import { test, expect } from '@playwright/test';

const DOC_TYPES = [
  { id: 'one-pager', name: 'One-Pager', icon: '📄' },
  { id: 'prd', name: 'PRD', icon: '📋' },
  { id: 'adr', name: 'ADR', icon: '🏗️' },
  { id: 'pr-faq', name: 'PR-FAQ', icon: '📰' },
  { id: 'power-statement', name: 'Power Statement', icon: '💪' },
  { id: 'acceptance-criteria', name: 'Acceptance Criteria', icon: '✅' },
  { id: 'jd', name: 'Job Description', icon: '💼' },
  { id: 'business-justification', name: 'Business Justification', icon: '📊' },
  { id: 'strategic-proposal', name: 'Strategic Proposal', icon: '🎯' },
];

test.describe('Assistant', () => {

  test('loads without JavaScript errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));

    await page.goto('/assistant/?type=one-pager');
    await page.waitForLoadState('networkidle');

    expect(errors).toHaveLength(0);
  });

  test('displays correct title for default document type', async ({ page }) => {
    await page.goto('/assistant/?type=one-pager');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveTitle(/One-Pager Assistant/);
    await expect(page.locator('#header-icon')).toContainText('📄');
  });

  test('document type selector contains all 9 types', async ({ page }) => {
    await page.goto('/assistant/?type=one-pager');
    await page.waitForLoadState('networkidle');

    const selector = page.locator('#doc-type-selector');
    await expect(selector).toBeVisible();

    const options = await selector.locator('option').allTextContents();
    expect(options.length).toBe(9);

    for (const docType of DOC_TYPES) {
      expect(options.some(opt => opt.includes(docType.name))).toBe(true);
    }
  });

  test('switching document type updates URL', async ({ page }) => {
    await page.goto('/assistant/?type=one-pager');
    await page.waitForLoadState('networkidle');

    const selector = page.locator('#doc-type-selector');
    await selector.selectOption('prd');

    await page.waitForURL(/type=prd/);
    expect(page.url()).toContain('type=prd');
  });

  test('new project button navigates to #new', async ({ page }) => {
    await page.goto('/assistant/?type=one-pager');
    await page.waitForLoadState('networkidle');

    const newBtn = page.locator('#btn-new-project');
    if (await newBtn.isVisible()) {
      await newBtn.click();
      await expect(page).toHaveURL(/#new/);
    }
  });

  for (const docType of DOC_TYPES) {
    test(`loads ${docType.name} without errors`, async ({ page }) => {
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));

      await page.goto(`/assistant/?type=${docType.id}`);
      await page.waitForLoadState('networkidle');

      expect(errors).toHaveLength(0);
      await expect(page.locator('#header-icon')).toContainText(docType.icon);
    });
  }

});

