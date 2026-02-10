/**
 * Power Statement Plugin Configuration
 */

export const powerStatementPlugin = {
  id: 'power-statement',
  name: 'Power Statement',
  icon: '💪',
  description: 'Compelling power statements for sales and marketing',
  dbName: 'power-statement-docforge-db',

  formFields: [
    {
      id: 'customerType',
      label: 'Customer Type',
      type: 'select',
      required: true,
      options: [
        { value: 'enterprise', label: 'Enterprise' },
        { value: 'smb', label: 'SMB' },
        { value: 'consumer', label: 'Consumer' },
        { value: 'developer', label: 'Developer' },
        { value: 'other', label: 'Other' }
      ]
    },
    {
      id: 'problem',
      label: 'Customer Problem',
      type: 'textarea',
      required: true,
      rows: 3,
      placeholder: 'What specific problem does your customer face?'
    },
    {
      id: 'solution',
      label: 'Your Solution',
      type: 'textarea',
      required: true,
      rows: 3,
      placeholder: 'How does your product/service solve this problem?'
    },
    {
      id: 'differentiation',
      label: 'Differentiation',
      type: 'textarea',
      required: false,
      rows: 2,
      placeholder: 'What makes your solution unique vs. alternatives?'
    },
    {
      id: 'proofPoints',
      label: 'Proof Points',
      type: 'textarea',
      required: false,
      rows: 2,
      placeholder: 'Metrics, case studies, testimonials that prove value...'
    },
    {
      id: 'objections',
      label: 'Common Objections',
      type: 'textarea',
      required: false,
      rows: 2,
      placeholder: 'What objections do you typically hear? How do you address them?'
    }
  ],

  scoringDimensions: [
    { name: 'Clarity', maxPoints: 25, description: 'Plain language, conversational tone, no jargon' },
    { name: 'Impact', maxPoints: 25, description: 'Customer outcomes, quantified results, credible proof' },
    { name: 'Action', maxPoints: 25, description: 'Problem clarity, solution specificity, differentiation' },
    { name: 'Specificity', maxPoints: 25, description: 'Metrics, customer type clarity, objection handling' }
  ],

  validateDocument: null,

  workflowConfig: {
    phaseCount: 3,
    phases: [
      { number: 1, name: 'Initial Draft', icon: '📝', aiModel: 'Claude', description: 'Generate power statement draft' },
      { number: 2, name: 'Sales Perspective', icon: '🔍', aiModel: 'Gemini', description: 'Sharpen with Gemini' },
      { number: 3, name: 'Final Statement', icon: '✨', aiModel: 'Claude', description: 'Combine into polished statement' }
    ]
  }
};

