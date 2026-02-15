/**
 * Product Requirements Document (PRD) Plugin Configuration
 */

import { validateDocument as validatePRD } from './js/validator.js';

export const prdPlugin = {
  id: 'prd',
  name: 'Product Requirements Document',
  icon: '📋',
  description: 'Product Requirements Document for engineering teams',
  docsUrl: 'https://www.productplan.com/glossary/product-requirements-document/',
  dbName: 'prd-docforge-db',

  formFields: [
    {
      id: 'title',
      label: 'Document Title',
      type: 'text',
      required: true,
      placeholder: 'e.g., User Authentication System PRD',
    },
    {
      id: 'problem',
      label: 'Problem Statement',
      type: 'textarea',
      required: true,
      rows: 3,
      placeholder: 'What problem does this product/feature solve?',
    },
    {
      id: 'userPersona',
      label: 'Target User Persona',
      type: 'textarea',
      required: false,
      rows: 2,
      placeholder: 'Who is the primary user? What are their needs?',
    },
    {
      id: 'context',
      label: 'Background & Context',
      type: 'textarea',
      required: false,
      rows: 3,
      placeholder: 'Market context, strategic alignment, why now...',
    },
    {
      id: 'competitors',
      label: 'Competitors & Alternatives',
      type: 'textarea',
      required: false,
      rows: 2,
      placeholder: 'Who are the main competitors? What alternatives do users currently use?',
    },
    {
      id: 'customerEvidence',
      label: 'Customer Evidence & Research',
      type: 'textarea',
      required: false,
      rows: 3,
      placeholder:
        'Customer interviews, support ticket data, analytics, NPS feedback, competitive losses...',
    },
    {
      id: 'goals',
      label: 'Goals & Success Metrics',
      type: 'textarea',
      required: false,
      rows: 2,
      placeholder: 'What does success look like? Include current baselines if known.',
    },
    {
      id: 'requirements',
      label: 'High-Level Requirements',
      type: 'textarea',
      required: false,
      rows: 3,
      placeholder: 'Key functional and non-functional requirements...',
    },
    {
      id: 'constraints',
      label: 'Constraints & Dependencies',
      type: 'textarea',
      required: false,
      rows: 2,
      placeholder: 'Technical constraints, dependencies, timeline constraints...',
    },
    {
      id: 'documentScope',
      label: 'Document Scope & Length',
      type: 'select',
      required: false,
      options: [
        { value: 'feature', label: 'Feature (1-3 pages) - Single capability or enhancement' },
        { value: 'epic', label: 'Epic (4-8 pages) - Multi-feature initiative' },
        { value: 'product', label: 'Product (8-15 pages) - New product or major platform' },
      ],
      placeholder: 'How big is this initiative?',
    },
  ],

  scoringDimensions: [
    {
      name: 'Document Structure',
      maxPoints: 20,
      description: 'Section presence, organization, formatting',
    },
    {
      name: 'Requirements Clarity',
      maxPoints: 25,
      description: 'Precision, completeness, consistency',
    },
    { name: 'User Focus', maxPoints: 20, description: 'Personas, problem statement, alignment' },
    {
      name: 'Technical Quality',
      maxPoints: 15,
      description: 'Non-functional reqs, acceptance criteria, traceability',
    },
    {
      name: 'Strategic Viability',
      maxPoints: 20,
      description: 'Metric validity, scope realism, traceability',
    },
  ],

  validateDocument: validatePRD,

  workflowConfig: {
    phaseCount: 3,
    phases: [
      {
        number: 1,
        name: 'Initial PRD Draft',
        icon: '📝',
        aiModel: 'Claude',
        description: 'Generate the first PRD draft',
      },
      {
        number: 2,
        name: 'Alternative Perspective',
        icon: '🔍',
        aiModel: 'Gemini',
        description: 'Get technical review from Gemini',
      },
      {
        number: 3,
        name: 'Final Synthesis',
        icon: '✨',
        aiModel: 'Claude',
        description: 'Combine into polished PRD',
      },
    ],
  },
};
