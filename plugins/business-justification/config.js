/**
 * Business Justification Plugin Configuration
 */

import { validateDocument } from './js/validator.js';

export const businessJustificationPlugin = {
  id: 'business-justification',
  name: 'Business Justification',
  icon: '📊',
  description: 'Justify headcount, promotions, budget, or investments',
  docsUrl: 'https://www.projectmanagementdocs.com/template/project-initiation/business-case/',
  dbName: 'business-justification-docforge-db',

  formFields: [
    {
      id: 'title',
      label: 'Document Title',
      type: 'text',
      required: true,
      placeholder: 'e.g., FY26 Engineering Headcount Request',
    },
    {
      id: 'documentType',
      label: 'Justification Type',
      type: 'select',
      required: true,
      options: [
        { value: 'headcount', label: 'Headcount Request' },
        { value: 'promotion', label: 'Promotion Justification' },
        { value: 'budget', label: 'Budget Request' },
        { value: 'investment', label: 'Investment Case' },
        { value: 'other', label: 'Other' },
      ],
    },
    {
      id: 'context',
      label: 'Business Context',
      type: 'textarea',
      required: true,
      rows: 3,
      placeholder: 'What business need or opportunity drives this request?',
    },
    {
      id: 'currentState',
      label: 'Current State',
      type: 'textarea',
      required: false,
      rows: 2,
      placeholder: 'Describe the current situation and its limitations...',
    },
    {
      id: 'proposedChange',
      label: 'Proposed Change',
      type: 'textarea',
      required: true,
      rows: 3,
      placeholder: 'What are you requesting? Be specific about scope and cost.',
    },
    {
      id: 'alternatives',
      label: 'Alternatives Considered',
      type: 'textarea',
      required: false,
      rows: 2,
      placeholder: 'What other options were considered? Include do-nothing...',
    },
    {
      id: 'roi',
      label: 'ROI / Business Impact',
      type: 'textarea',
      required: false,
      rows: 2,
      placeholder: 'Expected return, payback period, strategic value...',
    },
    {
      id: 'risks',
      label: 'Risks & Mitigations',
      type: 'textarea',
      required: false,
      rows: 2,
      placeholder: 'Key risks and how they will be mitigated...',
    },
  ],

  scoringDimensions: [
    {
      name: 'Strategic Evidence',
      maxPoints: 30,
      description: 'Quantitative data, credible sources, before/after comparisons',
    },
    {
      name: 'Financial Justification',
      maxPoints: 25,
      description: 'Clear ROI, payback period, TCO analysis',
    },
    {
      name: 'Options & Alternatives',
      maxPoints: 25,
      description: '3+ options, do-nothing scenario, clear recommendation',
    },
    {
      name: 'Execution Completeness',
      maxPoints: 20,
      description: 'Executive summary, risks, stakeholder concerns addressed',
    },
  ],

  validateDocument,

  workflowConfig: {
    phaseCount: 3,
    phases: [
      {
        number: 1,
        name: 'Draft Justification',
        icon: '📝',
        aiModel: 'Claude',
        description: 'Generate justification draft',
      },
      {
        number: 2,
        name: 'Finance Perspective',
        icon: '🔍',
        aiModel: 'Gemini',
        description: 'Challenge assumptions with Gemini',
      },
      {
        number: 3,
        name: 'Final Document',
        icon: '✨',
        aiModel: 'Claude',
        description: 'Combine into polished justification',
      },
    ],
  },
};
