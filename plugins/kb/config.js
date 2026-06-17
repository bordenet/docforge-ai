/**
 * Knowledge Base Article Plugin Configuration
 * @see https://support.zendesk.com/hc/en-us/articles/4408831743258-Best-practices-Developing-content-for-your-knowledge-base
 */

import { validateDocument } from './js/validator.js';

export const kbPlugin = {
  id: 'kb',
  name: 'Knowledge Base Article',
  icon: '📖',
  description: 'Troubleshooting and how-to articles for product support',
  docsUrl: 'https://support.zendesk.com/hc/en-us/articles/4408831743258-Best-practices-Developing-content-for-your-knowledge-base',
  dbName: 'kb-docforge-db',

  formFields: [
    {
      id: 'title',
      label: 'Article Title',
      type: 'text',
      required: true,
      placeholder: 'e.g., SSO login fails with "invalid_audience" error',
    },
    {
      id: 'articleType',
      label: 'Article Type',
      type: 'select',
      required: true,
      options: [
        { value: 'troubleshooting', label: 'Troubleshooting — diagnose and resolve a problem' },
        { value: 'how-to', label: 'How-To — step-by-step guide to accomplish a task' },
      ],
    },
    {
      id: 'audience',
      label: 'Audience',
      type: 'select',
      required: true,
      options: [
        { value: 'end-user', label: 'End User — non-technical customer' },
        { value: 'customer-admin', label: 'Customer Admin — technical admin of the product' },
        { value: 'developer', label: 'Developer — API/integration consumer' },
        { value: 'sre', label: 'SRE / Ops — internal ops or customer ops' },
      ],
    },
    {
      id: 'severity',
      label: 'Impact Severity',
      type: 'select',
      required: false,
      options: [
        { value: 'low', label: 'Low — minor inconvenience, workaround exists' },
        { value: 'medium', label: 'Medium — significant friction, partial workaround' },
        { value: 'high', label: 'High — feature blocked, no workaround' },
        { value: 'critical', label: 'Critical — service unavailable or data at risk' },
      ],
    },
    {
      id: 'symptoms',
      label: 'Symptoms / Observable Behavior',
      type: 'textarea',
      required: true,
      rows: 4,
      placeholder: 'Exact error messages, UI behavior, log entries. Quote error text exactly.',
    },
    {
      id: 'environment',
      label: 'Environment / Applies To',
      type: 'textarea',
      required: false,
      rows: 2,
      placeholder: 'Product version, browser, OS, integrations, deployment model...',
    },
    {
      id: 'rootCause',
      label: 'Root Cause (if known)',
      type: 'textarea',
      required: false,
      rows: 2,
      placeholder: 'Brief technical cause. "Unknown" is OK — describe the trigger instead.',
    },
    {
      id: 'resolution',
      label: 'Resolution Steps (seed)',
      type: 'textarea',
      required: true,
      rows: 4,
      placeholder: 'Key steps you know. Be specific — UI paths, commands, exact values. LLM fills gaps and formalizes.',
    },
  ],

  scoringDimensions: [
    { name: 'Findability & Framing', maxPoints: 20, description: 'Actionable title; exact error text; audience; articleType consistency' },
    { name: 'Resolution Quality', maxPoints: 25, description: 'Numbered steps with UI paths/commands/exact values; no abstract verbs' },
    { name: 'Completeness & Safety Net', maxPoints: 25, description: 'Verification with expected output; 3-component escalation; type-required sections' },
    { name: 'Precision & Technical Accuracy', maxPoints: 15, description: 'Environment specificity; cause quality; no slop/vague qualifiers' },
    { name: 'Self-Service Architecture', maxPoints: 15, description: 'Prevention; related; summary/goal; self-contained; time estimate' },
  ],

  validateDocument,

  workflowConfig: {
    phaseCount: 3,
    phases: [
      {
        number: 1,
        name: 'Initial Draft',
        icon: '📝',
        aiModel: 'Claude',
        description: 'Generate the first draft',
      },
      {
        number: 2,
        name: 'Critical Review',
        icon: '🔍',
        aiModel: 'Gemini',
        description: 'Get critique from Gemini',
      },
      {
        number: 3,
        name: 'Final Synthesis',
        icon: '✨',
        aiModel: 'Claude',
        description: 'Combine into polished version',
      },
    ],
  },
};

// Invariant: scoringDimensions must total exactly 100
const KB_DIMENSION_TOTAL = kbPlugin.scoringDimensions.reduce((sum, d) => sum + d.maxPoints, 0);
if (KB_DIMENSION_TOTAL !== 100) {
  throw new Error(`Config invariant: kb scoringDimensions total ${KB_DIMENSION_TOTAL}, expected 100`);
}
