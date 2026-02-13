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
    page.on('pageerror', (error) => errors.push(error.message));

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

    // Click button to open dropdown menu
    const menuBtn = page.locator('#doc-type-btn');
    await expect(menuBtn).toBeVisible();
    await menuBtn.click();

    // Check menu is visible and contains 9 document type links
    const menu = page.locator('#doc-type-menu');
    await expect(menu).toBeVisible();

    const links = await menu.locator('a[data-type]').all();
    expect(links.length).toBe(9);

    // Verify all doc types are present
    for (const docType of DOC_TYPES) {
      const link = menu.locator(`a[data-type="${docType.id}"]`);
      await expect(link).toBeVisible();
    }
  });

  test('switching document type updates URL', async ({ page }) => {
    await page.goto('/assistant/?type=one-pager');
    await page.waitForLoadState('networkidle');

    // Click button to open dropdown menu
    const menuBtn = page.locator('#doc-type-btn');
    await menuBtn.click();

    // Click on PRD link
    const menu = page.locator('#doc-type-menu');
    await menu.locator('a[data-type="prd"]').click();

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
      page.on('pageerror', (error) => errors.push(error.message));

      await page.goto(`/assistant/?type=${docType.id}`);
      await page.waitForLoadState('networkidle');

      expect(errors).toHaveLength(0);
      await expect(page.locator('#header-icon')).toContainText(docType.icon);
    });
  }

  test('export all button is visible in header', async ({ page }) => {
    await page.goto('/assistant/?type=one-pager');
    await page.waitForLoadState('networkidle');

    // Button is in the static header, not the dynamic content
    const exportAllBtn = page.locator('header #export-all-btn');
    await expect(exportAllBtn).toBeVisible();
    await expect(exportAllBtn).toContainText('Export All');
  });

  test('import button is visible in header', async ({ page }) => {
    await page.goto('/assistant/?type=one-pager');
    await page.waitForLoadState('networkidle');

    // Button is in the static header, not the dynamic content
    const importBtn = page.locator('header #import-btn');
    await expect(importBtn).toBeVisible();
    await expect(importBtn).toContainText('Import');
  });

  test('export all button triggers download', async ({ page }) => {
    // Create a project first
    await page.goto('/assistant/?type=one-pager#new');
    await page.waitForLoadState('networkidle');
    await page.fill('#title', 'Export Test Project');
    await page.fill('#problemStatement', 'Test export functionality');
    await page.fill('#proposedSolution', 'Click export button');
    await page.click('button[type="submit"]');
    await page.waitForURL(/#project\//);

    // Go back to home page
    await page.goto('/assistant/?type=one-pager');
    await page.waitForLoadState('networkidle');

    // Set up download listener
    const downloadPromise = page.waitForEvent('download', { timeout: 5000 });

    // Click export button
    await page.locator('header #export-all-btn').click();

    // Wait for download to start
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/one-pager-backup-.*\.json/);
  });

  test('about link opens about modal', async ({ page }) => {
    await page.goto('/assistant/?type=one-pager');
    await page.waitForLoadState('networkidle');

    // Click about link
    await page.click('#about-link');

    // Modal should appear with About content (use specific ID)
    const modal = page.locator('#about-modal');
    await expect(modal).toBeVisible({ timeout: 2000 });
    await expect(modal).toContainText(/About.*Assistant/i);
    await expect(modal).toContainText('Features');
  });

  test('about modal can be closed', async ({ page }) => {
    await page.goto('/assistant/?type=one-pager');
    await page.waitForLoadState('networkidle');

    // Open modal
    await page.click('#about-link');
    const modal = page.locator('#about-modal');
    await expect(modal).toBeVisible({ timeout: 2000 });

    // Close modal by clicking close button
    await page.click('.close-about-btn');
    await expect(modal).not.toBeVisible({ timeout: 2000 });
  });
});

// Phase output substitution tests
// These tests verify that prior phase outputs are correctly included in prompts
test.describe('Phase Output Substitution', () => {
  // Use clipboard permissions for reading copied prompts
  test.use({
    permissions: ['clipboard-read', 'clipboard-write'],
  });

  test('phase 2 prompt includes phase 1 response', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    // Create a project and complete phase 1
    await page.goto('/assistant/?type=one-pager#new');
    await page.waitForLoadState('networkidle');
    await page.fill('#title', 'Phase Output Test');
    await page.fill('#problemStatement', 'Test problem');
    await page.fill('#proposedSolution', 'Test solution');
    await page.click('button[type="submit"]');
    await page.waitForURL(/#project\//);

    // Complete phase 1 - copy prompt first
    await page.click('#copy-prompt-btn');
    await page.waitForTimeout(500);

    // Save a phase 1 response
    const phase1Response = 'This is the Phase 1 draft output from Claude.';
    await page.fill('#response-textarea', phase1Response);
    await page.click('#save-response-btn');
    await page.waitForTimeout(500);

    // Now on phase 2 - copy the prompt
    await page.click('#copy-prompt-btn');
    await page.waitForTimeout(500);

    // Read the clipboard content
    const clipboardContent = await page.evaluate(async () => {
      return await navigator.clipboard.readText();
    });

    // Verify phase 1 output is included in phase 2 prompt
    expect(clipboardContent).toContain(phase1Response);
  });

  test('phase 3 prompt includes both phase 1 and phase 2 responses', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    // Create a project and complete phases 1 and 2
    await page.goto('/assistant/?type=one-pager#new');
    await page.waitForLoadState('networkidle');
    await page.fill('#title', 'Phase 3 Output Test');
    await page.fill('#problemStatement', 'Test problem for phase 3');
    await page.fill('#proposedSolution', 'Test solution for phase 3');
    await page.click('button[type="submit"]');
    await page.waitForURL(/#project\//);

    // Complete phase 1
    await page.click('#copy-prompt-btn');
    await page.waitForTimeout(500);
    const phase1Response = 'UNIQUE_PHASE1_CONTENT_12345';
    await page.fill('#response-textarea', phase1Response);
    await page.click('#save-response-btn');
    await page.waitForTimeout(500);

    // Complete phase 2
    await page.click('#copy-prompt-btn');
    await page.waitForTimeout(500);
    const phase2Response = 'UNIQUE_PHASE2_CONTENT_67890';
    await page.fill('#response-textarea', phase2Response);
    await page.click('#save-response-btn');
    await page.waitForTimeout(500);

    // Now on phase 3 - copy the prompt
    await page.click('#copy-prompt-btn');
    await page.waitForTimeout(500);

    // Read the clipboard content
    const clipboardContent = await page.evaluate(async () => {
      return await navigator.clipboard.readText();
    });

    // Verify BOTH phase 1 and phase 2 outputs are included
    expect(clipboardContent).toContain(phase1Response);
    expect(clipboardContent).toContain(phase2Response);
  });
});
