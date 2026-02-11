import { test, expect } from '@playwright/test';

/**
 * Complete Workflow E2E Tests
 * 
 * Tests the full user journey:
 * 1. Navigate to assistant with document type
 * 2. Create new project with template
 * 3. Complete all 3 phases
 * 4. Verify data persistence
 * 5. Export final document
 */

test.describe('Complete Workflow', () => {
  
  // Clear IndexedDB before each test to start fresh
  test.beforeEach(async ({ page }) => {
    await page.goto('/assistant/?type=one-pager');
    await page.waitForLoadState('networkidle');
    
    // Clear IndexedDB for clean state
    await page.evaluate(async () => {
      const dbs = await indexedDB.databases();
      for (const db of dbs) {
        if (db.name && db.name.startsWith('docforge-')) {
          indexedDB.deleteDatabase(db.name);
        }
      }
    });
    
    // Reload to ensure clean state
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('creates project with template and pre-fills form', async ({ page }) => {
    // Click New One-Pager link (it's an <a> tag, not a button)
    const newBtn = page.locator('a[href="#new"]').first();
    await expect(newBtn).toBeVisible();
    await newBtn.click();

    // Wait for new project form
    await page.waitForURL(/#new/);

    // Select a template (Feature Pitch - an actual template name)
    const templateBtn = page.locator('.template-btn').filter({ hasText: 'Feature Pitch' });
    await expect(templateBtn).toBeVisible();
    await templateBtn.click();

    // Verify form fields are pre-filled (problemStatement should have template content)
    const problemField = page.locator('#problemStatement');
    await expect(problemField).not.toHaveValue('');
  });

  test('submits form and navigates to phase 1', async ({ page }) => {
    // Navigate to new project form
    await page.goto('/assistant/?type=one-pager#new');
    await page.waitForLoadState('networkidle');

    // Fill form manually (use actual field IDs from config)
    await page.fill('#title', 'E2E Test Project');
    await page.fill('#problemStatement', 'Testing the workflow');
    await page.fill('#proposedSolution', 'Automated E2E tests');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for project view with phase
    await page.waitForURL(/#project\//);

    // Verify Copy Prompt button exists (proves we're on phase 1)
    const copyPromptBtn = page.locator('#copy-prompt-btn');
    await expect(copyPromptBtn).toBeVisible();

    // Verify phase tabs are present
    const phaseTabs = page.locator('.phase-tab');
    await expect(phaseTabs).toHaveCount(3);
  });

  test('copies prompt and enables response textarea', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    // Create a project first
    await page.goto('/assistant/?type=one-pager#new');
    await page.waitForLoadState('networkidle');
    await page.fill('#title', 'Clipboard Test Project');
    await page.fill('#problemStatement', 'Testing clipboard');
    await page.fill('#proposedSolution', 'Copy prompt functionality');
    await page.click('button[type="submit"]');
    await page.waitForURL(/#project\//);

    // Response textarea should be disabled before copying prompt
    const responseTextarea = page.locator('#response-textarea');
    await expect(responseTextarea).toBeDisabled();

    // Click Copy Prompt button
    const copyPromptBtn = page.locator('#copy-prompt-btn');
    await expect(copyPromptBtn).toBeVisible();
    await copyPromptBtn.click();

    // Verify response textarea is now enabled after copying prompt
    await expect(responseTextarea).toBeEnabled();
  });

  test('saves response and advances to next phase', async ({ page }) => {
    // Create a project
    await page.goto('/assistant/?type=one-pager#new');
    await page.waitForLoadState('networkidle');
    await page.fill('#title', 'Phase Advance Test');
    await page.fill('#problemStatement', 'Testing phase advancement');
    await page.fill('#proposedSolution', 'Save response and advance');
    await page.click('button[type="submit"]');
    await page.waitForURL(/#project\//);

    // First need to generate prompt before we can save response
    const copyPromptBtn = page.locator('#copy-prompt-btn');
    await expect(copyPromptBtn).toBeVisible();
    await copyPromptBtn.click();
    await page.waitForTimeout(300);

    // Fill in response textarea
    const responseTextarea = page.locator('#response-textarea');
    await expect(responseTextarea).toBeVisible();
    await responseTextarea.fill('# Phase 1 Response\n\nThis is a test response for Phase 1.');

    // Save response
    const saveBtn = page.locator('#save-response-btn');
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();

    // Wait for auto-advance to Phase 2
    await page.waitForTimeout(500);

    // Verify we're on Phase 2 (check that Phase 2 tab has the active styling - border-blue-600)
    const phase2Tab = page.locator('.phase-tab').filter({ hasText: '2' });
    await expect(phase2Tab).toHaveClass(/border-blue-600/);
  });

  test('completes all 3 phases and shows completion banner', async ({ page }) => {
    // Create project
    await page.goto('/assistant/?type=one-pager#new');
    await page.waitForLoadState('networkidle');
    await page.fill('#title', 'Full Workflow Test');
    await page.fill('#problemStatement', 'Test complete workflow');
    await page.fill('#proposedSolution', 'Complete all 3 phases');
    await page.click('button[type="submit"]');
    await page.waitForURL(/#project\//);

    // Phase 1: Generate prompt first, then save response
    await page.locator('#copy-prompt-btn').click();
    await page.waitForTimeout(300);
    await page.locator('#response-textarea').fill('# Phase 1 Draft\n\nInitial draft content.');
    await page.locator('#save-response-btn').click();
    await page.waitForTimeout(500);

    // Phase 2: Generate prompt first, then save response
    await page.locator('#copy-prompt-btn').click();
    await page.waitForTimeout(300);
    await page.locator('#response-textarea').fill('# Phase 2 Review\n\nGemini review feedback.');
    await page.locator('#save-response-btn').click();
    await page.waitForTimeout(500);

    // Phase 3: Generate prompt first, then save response
    await page.locator('#copy-prompt-btn').click();
    await page.waitForTimeout(300);
    await page.locator('#response-textarea').fill('# Final Document\n\nSynthesized final version.');
    await page.locator('#save-response-btn').click();
    await page.waitForTimeout(500);

    // Verify completion banner appears (look for the export-final-btn which only shows when complete)
    const exportBtn = page.locator('#export-final-btn');
    await expect(exportBtn).toBeVisible({ timeout: 5000 });
  });
});

