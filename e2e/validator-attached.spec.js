import { test, expect } from '@playwright/test';

test.describe('Validator (project-attached mode)', () => {
  test('loads project Phase 3 markdown from IndexedDB via query string (no paste)', async ({ page }) => {
    // Seed a project via the shared storage module (IndexedDB)
    await page.goto('/assistant/?type=one-pager');
    await page.waitForLoadState('networkidle');

    const projectId = 'e2e-attached-project-1';
    const markdown = '# Attached Mode One-Pager\n\n## Problem\nWe have a paste-first validator today.\n\n## Solution\nAttach validator to the project.';

    await page.evaluate(
      async ({ projectId: pid, markdown: md }) => {
        const { saveProject } = await import('/shared/js/storage.js');
        await saveProject('one-pager-docforge-db', {
          id: pid,
          title: 'Attached Mode One-Pager',
          currentPhase: 3,
          phases: {
            3: { response: md, completed: true },
          },
          phase3_output: md,
        });
      },
      { projectId, markdown }
    );

    // Open validator in attached mode
    await page.goto(`/validator/?type=one-pager&project=${projectId}&phase=3`);

    // Attached indicator is our deterministic signal that loading completed
    await expect(page.locator('#attached-badge')).toBeVisible();

    // Editor is pre-filled and score is computed without paste
    await expect(page.locator('#editor')).toHaveValue(markdown);
    await expect(page.locator('#score-total')).not.toContainText('--');
  });
});

