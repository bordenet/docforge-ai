/**
 * Product Requirements Document (PRD) Plugin Configuration
 */

export const prdPlugin = {
  id: 'prd',
  name: 'PRD',
  icon: '📋',
  description: 'Product Requirements Document for engineering teams',
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
      placeholder: 'Market context, competitive landscape, strategic alignment...',
    },
    {
      id: 'goals',
      label: 'Goals & Success Metrics',
      type: 'textarea',
      required: false,
      rows: 2,
      placeholder: 'What does success look like? How will it be measured?',
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

  validateDocument: null,

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
