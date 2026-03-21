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

  test('persists draft edits to project-scoped validator state (survives reload)', async ({ page }) => {
    await page.goto('/assistant/?type=one-pager');
    await page.waitForLoadState('networkidle');

    const projectId = 'e2e-attached-project-2';
    const seed = '# Seed v1\n\nHello';

    await page.evaluate(
      async ({ projectId: pid, seed: md }) => {
        const { saveProject } = await import('/shared/js/storage.js');
        await saveProject('one-pager-docforge-db', {
          id: pid,
          title: 'Attached Mode Draft Persistence',
          currentPhase: 3,
          phase3_output: md,
        });
      },
      { projectId, seed }
    );

    await page.goto(`/validator/?type=one-pager&project=${projectId}&phase=3`);
    await expect(page.locator('#attached-badge')).toBeVisible();

    const edited = `${seed}\n\n## Extra\nDraft edit that should persist.`;
    await page.fill('#editor', edited);
    await page.waitForTimeout(700); // debounce window

    await page.reload();
    await expect(page.locator('#attached-badge')).toBeVisible();
    await expect(page.locator('#editor')).toHaveValue(edited);
  });

  test('can apply validator edits back to the Assistant project phase output', async ({ page }) => {
    await page.goto('/assistant/?type=one-pager');
    await page.waitForLoadState('networkidle');

    const projectId = 'e2e-attached-project-3';
    const seed = '# Seed\n\nHello';

    await page.evaluate(
      async ({ projectId: pid, seed: md }) => {
        const { saveProject } = await import('/shared/js/storage.js');
        await saveProject('one-pager-docforge-db', {
          id: pid,
          title: 'Attached Mode Apply',
          currentPhase: 3,
          phases: {
            3: { response: md, completed: true },
          },
          phase3_output: md,
        });
      },
      { projectId, seed }
    );

    await page.goto(`/validator/?type=one-pager&project=${projectId}&phase=3`);
    await expect(page.locator('#attached-badge')).toBeVisible();
	    await expect(page.locator('#attached-status')).toContainText('Editing project output');

    const edited = `${seed}\n\n## Applied\nThis should save back to the project.`;
    await page.fill('#editor', edited);
	    await expect(page.locator('#attached-status')).toContainText('not applied to project');

    const applyBtn = page.locator('#btn-apply');
    await expect(applyBtn).toBeEnabled();
    await page.click('#btn-apply');
    await expect(applyBtn).toBeDisabled();

    // Wait for apply to complete (toast is emitted after IndexedDB write)
    await expect(page.locator('#toast-container')).toContainText('Applied to project!');

	    await expect(page.locator('#attached-status')).toContainText('Applied');
    await expect(applyBtn).toBeEnabled();

    await page.goto(`/assistant/?type=one-pager#project/${projectId}`);
    await expect(page.locator('#response-textarea')).toHaveValue(edited);
  });

  test('locks document type switching controls in attached mode', async ({ page }) => {
    await page.goto('/assistant/?type=one-pager');
    await page.waitForLoadState('networkidle');

    const projectId = 'e2e-attached-project-4';
    const seed = '# Seed\n\nHello';

    await page.evaluate(
      async ({ projectId: pid, seed: md }) => {
        const { saveProject } = await import('/shared/js/storage.js');
        await saveProject('one-pager-docforge-db', {
          id: pid,
          title: 'Attached Mode Lock',
          currentPhase: 3,
          phases: { 3: { response: md, completed: true } },
          phase3_output: md,
        });
      },
      { projectId, seed }
    );

    await page.goto(`/validator/?type=one-pager&project=${projectId}&phase=3`);
    await expect(page.locator('#attached-badge')).toBeVisible();

    // In attached mode, switching document types must be disabled/hidden.
    await expect(page.locator('#doc-type-btn')).toBeHidden();
    await expect(page.locator('#doc-type-selector')).toBeDisabled();
  });

  test('shows an attached-mode error state when project is missing', async ({ page }) => {
    await page.goto('/validator/?type=one-pager&project=does-not-exist&phase=3');

    await expect(page.locator('#attached-badge')).toBeVisible();
    await expect(page.locator('#attached-error')).toBeVisible();
    await expect(page.locator('#attached-error')).toContainText('Project not found');

    // Blocked-state UI should be visible and no scoring should run.
    await expect(page.locator('#attached-blocked')).toBeVisible();
    await expect(page.locator('#score-total')).toContainText('--');

    // Should not allow editing/saving when the project doesn't exist.
    await expect(page.locator('#editor')).toBeDisabled();
	    await expect(page.locator('#btn-load-canonical')).toBeHidden();

    // Must not create validator state for non-existent projects.
    const validatorState = await page.evaluate(async () => {
      const { getValidatorState } = await import('/shared/js/storage.js');
      return getValidatorState('one-pager-docforge-db', 'does-not-exist');
    });
    expect(validatorState).toBeNull();
  });

	  test('can revert a diverged draft back to the canonical project output', async ({ page }) => {
	    await page.goto('/assistant/?type=one-pager');
	    await page.waitForLoadState('networkidle');

	    const projectId = 'e2e-attached-project-7';
	    const canonical = '# Canonical\n\nHello';
	    const draft = '# Draft\n\nThis diverged.';

	    await page.evaluate(
	      async ({ projectId: pid, canonical: can, draft: dr }) => {
	        const { saveProject, saveValidatorState } = await import('/shared/js/storage.js');
	        await saveProject('one-pager-docforge-db', {
	          id: pid,
	          title: 'Attached Mode Revert Draft',
	          currentPhase: 3,
	          phases: { 3: { response: can, completed: true } },
	          phase3_output: can,
	        });

	        const now = new Date().toISOString();
	        await saveValidatorState('one-pager-docforge-db', {
	          projectId: pid,
	          schemaVersion: 1,
	          phases: {
	            '3': {
	              draftMarkdown: dr,
	              draftUpdatedAt: now,
	              history: {
	                versions: [{ markdown: dr, savedAt: now }],
	                currentIndex: 0,
	              },
	            },
	          },
	        });
	      },
	      { projectId, canonical, draft }
	    );

	    await page.goto(`/validator/?type=one-pager&project=${projectId}&phase=3`);
	    await expect(page.locator('#attached-badge')).toBeVisible();
	    await expect(page.locator('#editor')).toHaveValue(draft);
	    await expect(page.locator('#attached-status')).toContainText('not applied to project');
	    await expect(page.locator('#btn-load-canonical')).toBeVisible();

	    // Cancel keeps draft intact (and should not rewrite validator state).
	    await page.click('#btn-load-canonical');
	    await expect(page.locator('#confirm-modal')).toBeVisible();
	    await page.click('#confirm-cancel');
	    await expect(page.locator('#editor')).toHaveValue(draft);

	    await page.reload();
	    await expect(page.locator('#editor')).toHaveValue(draft);

	    // Confirm loads canonical and aligns draft for reloads.
	    await page.click('#btn-load-canonical');
	    await expect(page.locator('#confirm-modal')).toBeVisible();
	    await page.click('#confirm-ok');
	    await expect(page.locator('#editor')).toHaveValue(canonical);
	    await expect(page.locator('#attached-status')).toContainText('Editing project output');
	    await expect(page.locator('#btn-load-canonical')).toBeHidden();

	    await page.reload();
	    await expect(page.locator('#editor')).toHaveValue(canonical);
	  });

	  test('Validator Save persists to project so Assistant Phase 3 reflects latest saved content', async ({ page }) => {
	    await page.goto('/assistant/?type=one-pager');
	    await page.waitForLoadState('networkidle');

	    const projectId = 'e2e-attached-project-6';
	    const seed = '# Seed\n\nHello';

	    await page.evaluate(
	      async ({ projectId: pid, seed: md }) => {
	        const { saveProject } = await import('/shared/js/storage.js');
	        await saveProject('one-pager-docforge-db', {
	          id: pid,
	          title: 'Attached Mode Save Applies',
	          currentPhase: 3,
	          phases: { 3: { response: md, completed: true } },
	          phase3_output: md,
	        });
	      },
	      { projectId, seed }
	    );

	    await page.goto(`/validator/?type=one-pager&project=${projectId}&phase=3`);
	    await expect(page.locator('#attached-badge')).toBeVisible();

	    const edited = `${seed}\n\n## Saved\nThis should save back to the project when clicking Save.`;
	    await page.fill('#editor', edited);
	    await page.click('#btn-save');
	    await expect(page.locator('#toast-container')).toContainText('Saved & applied');

	    await page.goto(`/assistant/?type=one-pager#project/${projectId}`);
	    await expect(page.locator('#response-textarea')).toHaveValue(edited);
	  });

	  const DOC_TYPES = [
	    { type: 'one-pager', dbName: 'one-pager-docforge-db' },
	    { type: 'prd', dbName: 'prd-docforge-db' },
	  ];

	  for (const doc of DOC_TYPES) {
	    test(`Assistant Save Response then Tune & Refine opens Validator with latest Phase 3 content (${doc.type}, legacy flat field)`, async ({ page }) => {
	      await page.goto(`/assistant/?type=${doc.type}`);
	      await page.waitForLoadState('networkidle');

	      const projectId = `e2e-attached-tune-refine-${doc.type}-legacy-1`;
	      const seed = `# Seed (${doc.type})\n\nHello`;
	      const updated = `#abc 123\n\n${seed}`;

	      // Seed a project that includes the legacy flat field. Historically the Assistant only updated
	      // nested phases[3].response, causing Validator (which preferred phase3_output) to open stale content.
	      await page.evaluate(
	        async ({ dbName, projectId: pid, seed: md }) => {
	          const { saveProject } = await import('/shared/js/storage.js');
	          await saveProject(dbName, {
	            id: pid,
	            title: 'Tune & Refine Seed',
	            currentPhase: 3,
	            phases: { 3: { prompt: 'seed prompt', response: md, completed: true } },
	            phase3_output: md,
	          });
	        },
	        { dbName: doc.dbName, projectId, seed }
	      );

	      await page.goto(`/assistant/?type=${doc.type}#project/${projectId}`);
	      await expect(page.locator('#response-textarea')).toHaveValue(seed);

	      await page.fill('#response-textarea', updated);
	      await page.click('#save-response-btn');
	      await expect(page.locator('#toast-container')).toContainText('Your document is complete!');

	      // Assert canonical + legacy are kept in sync.
	      const saved = await page.evaluate(
	        async ({ dbName, projectId: pid }) => {
	          const { getProject } = await import('/shared/js/storage.js');
	          return getProject(dbName, pid);
	        },
	        { dbName: doc.dbName, projectId }
	      );
	      expect(saved.phases['3'].response).toBe(updated);
	      expect(saved.phase3_output).toBe(updated);

	      const [popup] = await Promise.all([
	        page.waitForEvent('popup'),
	        page.click('#validate-btn'),
	      ]);
	      await popup.waitForLoadState('networkidle');
	      await expect(popup.locator('#attached-badge')).toBeVisible();
	      await expect(popup.locator('#editor')).toHaveValue(updated);
	    });

	    test(`Assistant Save Response then Tune & Refine opens Validator with latest Phase 3 content (${doc.type}, nested-only project)`, async ({ page }) => {
	      await page.goto(`/assistant/?type=${doc.type}`);
	      await page.waitForLoadState('networkidle');

	      const projectId = `e2e-attached-tune-refine-${doc.type}-nested-1`;
	      const seed = `# Seed (${doc.type})\n\nHello`;
	      const updated = `#abc 123\n\n${seed}`;

	      await page.evaluate(
	        async ({ dbName, projectId: pid, seed: md }) => {
	          const { saveProject } = await import('/shared/js/storage.js');
	          await saveProject(dbName, {
	            id: pid,
	            title: 'Tune & Refine Seed (Nested Only)',
	            currentPhase: 3,
	            phases: { 3: { prompt: 'seed prompt', response: md, completed: true } },
	          });
	        },
	        { dbName: doc.dbName, projectId, seed }
	      );

	      await page.goto(`/assistant/?type=${doc.type}#project/${projectId}`);
	      await expect(page.locator('#response-textarea')).toHaveValue(seed);

	      await page.fill('#response-textarea', updated);
	      await page.click('#save-response-btn');
	      await expect(page.locator('#toast-container')).toContainText('Your document is complete!');

	      const [popup] = await Promise.all([
	        page.waitForEvent('popup'),
	        page.click('#validate-btn'),
	      ]);
	      await popup.waitForLoadState('networkidle');
	      await expect(popup.locator('#attached-badge')).toBeVisible();
	      await expect(popup.locator('#editor')).toHaveValue(updated);
	    });

		    test(`Assistant Save Response then Copy Final + Tune & Refine always use latest Phase 3 content even with existing validator draft (${doc.type})`, async ({ page }) => {
		      // Clipboard APIs require explicit permissions in Playwright.
		      await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

		      await page.goto(`/assistant/?type=${doc.type}`);
		      await page.waitForLoadState('networkidle');

		      const projectId = `e2e-attached-copy-final-${doc.type}-1`;
		      const seed = `# Seed (${doc.type})\n\nHello`;
		      const updated = `# TESTING 1-2-3\n\n${seed}`;

		      // Seed a completed Phase 3 project.
		      await page.evaluate(
		        async ({ dbName, projectId: pid, seed: md }) => {
		          const { saveProject } = await import('/shared/js/storage.js');
		          await saveProject(dbName, {
		            id: pid,
		            title: 'Copy Final Regression Seed',
		            currentPhase: 3,
		            phases: { 3: { prompt: 'seed prompt', response: md, completed: true } },
		            phase3_output: md,
		          });
		        },
		        { dbName: doc.dbName, projectId, seed }
		      );

		      // Create existing validatorState by visiting attached-mode once (this is what makes the bug non-deterministic).
		      await page.goto(`/validator/?type=${doc.type}&project=${projectId}&phase=3`);
		      await expect(page.locator('#attached-badge')).toBeVisible();
		      await expect(page.locator('#editor')).toHaveValue(seed);

		      // Back to Assistant, edit Phase 3 and save.
		      await page.goto(`/assistant/?type=${doc.type}#project/${projectId}`);
		      await expect(page.locator('#response-textarea')).toHaveValue(seed);
		      await page.fill('#response-textarea', updated);

		      // Important: click Copy Final immediately after Save (no explicit wait), to match the user repro.
		      await page.click('#save-response-btn');
		      await page.click('#export-final-btn');
		      await expect(page.locator('#toast-container')).toContainText('Final document copied', { timeout: 10000 });

		      const clipboard = await page.evaluate(() => navigator.clipboard.readText());
		      expect(clipboard).toBe(updated);

		      const [popup] = await Promise.all([
		        page.waitForEvent('popup'),
		        page.click('#validate-btn'),
		      ]);
		      await popup.waitForLoadState('networkidle');
		      await expect(popup.locator('#attached-badge')).toBeVisible();
		      await expect(popup.locator('#editor')).toHaveValue(updated);
		    });
	  }

  test('shows an attached-mode error state when phase output is empty', async ({ page }) => {
    await page.goto('/assistant/?type=one-pager');
    await page.waitForLoadState('networkidle');

    const projectId = 'e2e-attached-project-5';

    await page.evaluate(
      async ({ projectId: pid }) => {
        const { saveProject } = await import('/shared/js/storage.js');
        await saveProject('one-pager-docforge-db', {
          id: pid,
          title: 'Attached Mode Empty',
          currentPhase: 3,
          phases: { 3: { response: '', completed: true } },
          phase3_output: '',
        });
      },
      { projectId }
    );

    await page.goto(`/validator/?type=one-pager&project=${projectId}&phase=3`);
    await expect(page.locator('#attached-badge')).toBeVisible();
	    await expect(page.locator('#attached-error')).toBeHidden();
	    await expect(page.locator('#attached-empty')).toBeVisible();
	    await expect(page.locator('#attached-empty')).toContainText('Phase 3 output is empty');
	    await expect(page.locator('#attached-open-assistant')).toHaveAttribute('href', `/assistant/?type=one-pager#project/${projectId}`);
  });

	  test('can draft from an empty phase output and apply back to the Assistant project', async ({ page }) => {
	    await page.goto('/assistant/?type=one-pager');
	    await page.waitForLoadState('networkidle');

	    const projectId = 'e2e-attached-project-6';
	    await page.evaluate(
	      async ({ projectId: pid }) => {
	        const { saveProject } = await import('/shared/js/storage.js');
	        await saveProject('one-pager-docforge-db', {
	          id: pid,
	          title: 'Attached Mode Empty Apply',
	          currentPhase: 3,
	          phases: { 3: { response: '', completed: true } },
	          phase3_output: '',
	        });
	      },
	      { projectId }
	    );

	    await page.goto(`/validator/?type=one-pager&project=${projectId}&phase=3`);
	    await expect(page.locator('#attached-empty')).toBeVisible();

	    const drafted = '# Drafted\n\nThis was created in Validator.';
	    await page.fill('#editor', drafted);
	    await expect(page.locator('#attached-empty')).toBeHidden();
	    await expect(page.locator('#attached-status')).toContainText('not applied to project');

	    await page.click('#btn-apply');
	    await expect(page.locator('#toast-container')).toContainText('Applied to project!');
	    await expect(page.locator('#attached-status')).toContainText('Applied');

	    await page.goto(`/assistant/?type=one-pager#project/${projectId}`);
	    await expect(page.locator('#response-textarea')).toHaveValue(drafted);
	  });
});

