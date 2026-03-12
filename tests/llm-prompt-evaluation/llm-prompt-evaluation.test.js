/**
 * LLM Prompt Evaluation Test Battery
 *
 * Validates that DocForge's LLM prompts work correctly across all document types
 * and workflows. Tests 9 document types × 2 workflows × 3 phases = 54 evaluations.
 *
 * See AGENT-INSTRUCTIONS.md for usage and troubleshooting.
 */

import * as fs from 'fs';
import * as path from 'path';
import { describe, it, expect, beforeAll, beforeEach } from '@jest/globals';
import { generatePrompt } from '../../shared/js/prompt-generator.js';
import { runAllChecks } from './evaluators/index.js';
import phaseOutputs from './fixtures/phase-outputs.js';

/**
 * Load a prompt template from disk (for mocking fetch)
 */
function loadPromptTemplate(pluginId, phase) {
  const templatePath = path.join(
    process.cwd(),
    'plugins',
    pluginId,
    'prompts',
    `phase${phase}.md`
  );
  try {
    return fs.readFileSync(templatePath, 'utf-8');
  } catch {
    return null;
  }
}

// All 9 document types in DocForge
const DOCUMENT_TYPES = [
  'acceptance-criteria',
  'adr',
  'business-justification',
  'jd',
  'one-pager',
  'power-statement',
  'pr-faq',
  'prd',
  'strategic-proposal',
];

const PHASES = [1, 2, 3];
const WORKFLOWS = ['create', 'import'];

// Cache for loaded fixtures
const fixtureCache = {
  formData: {},
  importDocuments: {},
};

/**
 * Load form data fixture for a document type
 */
async function loadFormDataFixture(docType) {
  if (fixtureCache.formData[docType]) {
    return fixtureCache.formData[docType];
  }

  const fixturePath = path.join(
    process.cwd(),
    'tests/llm-prompt-evaluation/fixtures/form-data',
    `${docType}.js`
  );

  if (!fs.existsSync(fixturePath)) {
    throw new Error(`Fixture not found: ${fixturePath}`);
  }

  const module = await import(fixturePath);
  fixtureCache.formData[docType] = module.default;
  return module.default;
}

/**
 * Load import document fixture for a document type
 */
function loadImportDocumentFixture(docType) {
  if (fixtureCache.importDocuments[docType]) {
    return fixtureCache.importDocuments[docType];
  }

  const fixturePath = path.join(
    process.cwd(),
    'tests/llm-prompt-evaluation/fixtures/import-documents',
    `${docType}-sample.md`
  );

  if (!fs.existsSync(fixturePath)) {
    throw new Error(`Fixture not found: ${fixturePath}`);
  }

  const content = fs.readFileSync(fixturePath, 'utf-8');
  fixtureCache.importDocuments[docType] = content;
  return content;
}

/**
 * Generate a prompt for testing
 */
async function generateTestPrompt(docType, workflow, phase) {
  const plugin = { id: docType };

  // Build formData based on workflow
  let formData;
  if (workflow === 'import') {
    const importedContent = loadImportDocumentFixture(docType);
    formData = { importedContent };
  } else {
    formData = await loadFormDataFixture(docType);
  }

  // Build previousResponses for phases 2 and 3
  const previousResponses = {};
  if (phase >= 2) {
    previousResponses[1] = phaseOutputs.phase1;
  }
  if (phase >= 3) {
    previousResponses[2] = phaseOutputs.phase2;
  }

  const options = { isImported: workflow === 'import' };

  return generatePrompt(plugin, phase, formData, previousResponses, options);
}

/**
 * Build fixtures object for evaluators
 */
async function buildFixtures(docType, workflow, phase) {
  const fixtures = {
    previousResponses: {},
  };

  if (workflow === 'import') {
    fixtures.importedContent = loadImportDocumentFixture(docType);
  } else {
    fixtures.formData = await loadFormDataFixture(docType);
  }

  if (phase >= 2) {
    fixtures.previousResponses[1] = phaseOutputs.phase1;
  }
  if (phase >= 3) {
    fixtures.previousResponses[2] = phaseOutputs.phase2;
  }

  return fixtures;
}

// Main test suite
describe('LLM Prompt Evaluation Battery', () => {
  // Set up global mocks before all tests
  beforeAll(() => {
    global.window = {
      location: {
        pathname: '/assistant/',
      },
    };
  });

  for (const docType of DOCUMENT_TYPES) {
    describe(`${docType}`, () => {
      for (const workflow of WORKFLOWS) {
        describe(`${workflow} workflow`, () => {
          for (const phase of PHASES) {
            it(`Phase ${phase} prompt is valid`, async () => {
              // Mock fetch to load templates from disk
              const template = loadPromptTemplate(docType, phase);
              if (!template) {
                throw new Error(`Template not found: plugins/${docType}/prompts/phase${phase}.md`);
              }
              global.fetch = async () => ({
                ok: true,
                text: async () => template,
              });

              // Generate the prompt
              const prompt = await generateTestPrompt(docType, workflow, phase);

              // Build fixtures for evaluators
              const fixtures = await buildFixtures(docType, workflow, phase);

              // Run all checks
              const results = runAllChecks(prompt, workflow, phase, fixtures);

              // Report warnings but don't fail
              if (results.warnings.length > 0) {
                console.warn(`Warnings for ${docType}/${workflow}/phase${phase}:`, results.warnings);
              }

              // Fail on any FAIL-severity issues
              expect(results.failures).toEqual([]);
            });
          }
        });
      }
    });
  }
});

