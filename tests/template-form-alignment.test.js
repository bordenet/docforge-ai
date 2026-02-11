/**
 * Template/Form Field Alignment Tests
 * 
 * These tests verify that ALL template variables in prompt templates
 * have corresponding form field IDs in plugin configs.
 * 
 * This prevents the critical bug where prompts are generated with
 * unsubstituted {{VARIABLE}} placeholders.
 */

import { describe, test, expect } from '@jest/globals';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Plugin IDs to test
const PLUGIN_IDS = [
  'one-pager',
  'prd',
  'adr',
  'pr-faq',
  'power-statement',
  'acceptance-criteria',
  'jd',
  'business-justification',
  'strategic-proposal'
];

// Reserved template variables that don't come from form fields
const RESERVED_VARIABLES = [
  'PHASE1_OUTPUT',
  'PHASE2_OUTPUT',
  'PHASE1_RESPONSE',
  'PHASE2_RESPONSE'
];

/**
 * Convert UPPER_SNAKE_CASE to camelCase
 * This matches the conversion in fillPromptTemplate()
 */
function toCamelCase(str) {
  return str.toLowerCase().replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Extract all {{VARIABLE}} patterns from a template
 */
function extractTemplateVariables(template) {
  const matches = template.match(/\{\{(\w+)\}\}/g) || [];
  return [...new Set(matches.map(m => m.replace(/[{}]/g, '')))];
}

/**
 * Load plugin config and extract form field IDs
 */
async function getFormFieldIds(pluginId) {
  const configPath = join(process.cwd(), 'plugins', pluginId, 'config.js');
  if (!existsSync(configPath)) {
    throw new Error(`Config not found: ${configPath}`);
  }
  
  const configContent = readFileSync(configPath, 'utf-8');
  const idMatches = configContent.match(/id:\s*['"]([^'"]+)['"]/g) || [];
  return idMatches
    .map(m => m.match(/id:\s*['"]([^'"]+)['"]/)[1])
    .filter(id => id !== pluginId); // Exclude the plugin ID itself
}

/**
 * Load prompt template for a phase
 */
function loadPromptTemplate(pluginId, phase) {
  const templatePath = join(process.cwd(), 'plugins', pluginId, 'prompts', `phase${phase}.md`);
  if (!existsSync(templatePath)) {
    return null;
  }
  return readFileSync(templatePath, 'utf-8');
}

describe('Template/Form Field Alignment', () => {
  
  describe('Phase 1 templates must have matching form fields', () => {
    PLUGIN_IDS.forEach(pluginId => {
      test(`${pluginId}: all Phase 1 template variables have matching form fields`, async () => {
        const template = loadPromptTemplate(pluginId, 1);
        if (!template) {
          console.warn(`No phase1.md found for ${pluginId}`);
          return;
        }
        
        const templateVars = extractTemplateVariables(template);
        const formFieldIds = await getFormFieldIds(pluginId);
        
        // Convert form field IDs to both formats for matching
        const validIds = new Set([
          ...formFieldIds,
          ...formFieldIds.map(id => id.toUpperCase()),
          ...formFieldIds.map(id => id.replace(/([A-Z])/g, '_$1').toUpperCase()),
          ...RESERVED_VARIABLES
        ]);
        
        const missingVars = [];
        
        for (const varName of templateVars) {
          if (RESERVED_VARIABLES.includes(varName)) continue;
          
          const camelCase = toCamelCase(varName);
          const hasMatch = formFieldIds.includes(camelCase) || 
                          formFieldIds.includes(varName) ||
                          formFieldIds.includes(varName.toLowerCase());
          
          if (!hasMatch) {
            missingVars.push({
              templateVar: varName,
              expectedFormField: camelCase,
              availableFields: formFieldIds
            });
          }
        }
        
        expect(missingVars).toEqual([]);
      });
    });
  });

  describe('Phase 2 templates must have matching form fields or phase outputs', () => {
    PLUGIN_IDS.forEach(pluginId => {
      test(`${pluginId}: all Phase 2 template variables are valid`, async () => {
        const template = loadPromptTemplate(pluginId, 2);
        if (!template) {
          console.warn(`No phase2.md found for ${pluginId}`);
          return;
        }
        
        const templateVars = extractTemplateVariables(template);
        const formFieldIds = await getFormFieldIds(pluginId);
        
        const missingVars = [];
        
        for (const varName of templateVars) {
          if (RESERVED_VARIABLES.includes(varName)) continue;
          
          const camelCase = toCamelCase(varName);
          const hasMatch = formFieldIds.includes(camelCase) || 
                          formFieldIds.includes(varName) ||
                          formFieldIds.includes(varName.toLowerCase());
          
          if (!hasMatch) {
            missingVars.push({
              templateVar: varName,
              expectedFormField: camelCase
            });
          }
        }
        
        expect(missingVars).toEqual([]);
      });
    });
  });

  describe('Phase 3 templates must have matching form fields or phase outputs', () => {
    PLUGIN_IDS.forEach(pluginId => {
      test(`${pluginId}: all Phase 3 template variables are valid`, async () => {
        const template = loadPromptTemplate(pluginId, 3);
        if (!template) {
          console.warn(`No phase3.md found for ${pluginId}`);
          return;
        }
        
        const templateVars = extractTemplateVariables(template);
        const formFieldIds = await getFormFieldIds(pluginId);
        
        const missingVars = [];
        
        for (const varName of templateVars) {
          if (RESERVED_VARIABLES.includes(varName)) continue;
          
          const camelCase = toCamelCase(varName);
          const hasMatch = formFieldIds.includes(camelCase) || 
                          formFieldIds.includes(varName) ||
                          formFieldIds.includes(varName.toLowerCase());
          
          if (!hasMatch) {
            missingVars.push({
              templateVar: varName,
              expectedFormField: camelCase
            });
          }
        }
        
        expect(missingVars).toEqual([]);
      });
    });
  });
});

