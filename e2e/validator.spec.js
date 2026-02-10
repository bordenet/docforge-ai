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

test.describe('Validator', () => {

  test('loads without JavaScript errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));

    await page.goto('/validator/?type=one-pager');
    await page.waitForLoadState('networkidle');

    expect(errors).toHaveLength(0);
  });

  test('displays correct title for document type', async ({ page }) => {
    await page.goto('/validator/?type=prd');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveTitle(/Validator/);
    await expect(page.locator('#header-title')).toContainText('PRD Validator');
  });

  test('document type selector contains all 9 types', async ({ page }) => {
    await page.goto('/validator/?type=one-pager');
    await page.waitForLoadState('networkidle');

    const selector = page.locator('#doc-type-selector');
    await expect(selector).toBeVisible();

    const options = await selector.locator('option').allTextContents();
    expect(options.length).toBe(9);
  });

  test('editor textarea is visible', async ({ page }) => {
    await page.goto('/validator/?type=one-pager');
    await page.waitForLoadState('networkidle');

    const editor = page.locator('#editor');
    await expect(editor).toBeVisible();
  });

  test('scorecard shows initial state', async ({ page }) => {
    await page.goto('/validator/?type=one-pager');
    await page.waitForLoadState('networkidle');

    const scoreTotal = page.locator('#score-total');
    await expect(scoreTotal).toContainText('--');

    const badge = page.locator('#score-badge');
    await expect(badge).toContainText('Paste a document to score');
  });

  test('validate button triggers scoring', async ({ page }) => {
    await page.goto('/validator/?type=one-pager');
    await page.waitForLoadState('networkidle');

    // Enter some content
    const editor = page.locator('#editor');
    await editor.fill('# My One-Pager\\n\\n## Problem\\nThis is a test problem.\\n\\n## Solution\\nThis is a test solution.');

    // Click validate
    const validateBtn = page.locator('#btn-validate');
    await validateBtn.click();

    // Score should update
    const scoreTotal = page.locator('#score-total');
    await expect(scoreTotal).not.toContainText('--');
  });

  test('clear button resets editor', async ({ page }) => {
    await page.goto('/validator/?type=one-pager');
    await page.waitForLoadState('networkidle');

    const editor = page.locator('#editor');
    await editor.fill('Some test content');

    const clearBtn = page.locator('#btn-clear');
    await clearBtn.click();

    await expect(editor).toHaveValue('');
  });

  for (const docType of DOC_TYPES) {
    test(`loads ${docType.name} validator without errors`, async ({ page }) => {
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));

      await page.goto(`/validator/?type=${docType.id}`);
      await page.waitForLoadState('networkidle');

      expect(errors).toHaveLength(0);
    });
  }

});

