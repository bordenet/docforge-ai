/**
 * PR-FAQ (Amazon-style) Plugin Configuration
 */

export const prFaqPlugin = {
  id: 'pr-faq',
  name: 'PR-FAQ',
  icon: '📰',
  description: 'Amazon-style PR-FAQ document for product launches',
  dbName: 'pr-faq-fusion-db',

  formFields: [
    {
      id: 'title',
      label: 'Product/Feature Name',
      type: 'text',
      required: true,
      placeholder: 'e.g., Smart Home Energy Dashboard'
    },
    {
      id: 'problem',
      label: 'Customer Problem',
      type: 'textarea',
      required: true,
      rows: 3,
      placeholder: 'What customer problem are you solving? Start with the customer.'
    },
    {
      id: 'solution',
      label: 'Proposed Solution',
      type: 'textarea',
      required: true,
      rows: 3,
      placeholder: 'How does this product/feature solve the problem?'
    },
    {
      id: 'customerQuote',
      label: 'Customer Quote',
      type: 'textarea',
      required: false,
      rows: 2,
      placeholder: 'Hypothetical customer quote celebrating the solution...'
    },
    {
      id: 'internalFaq',
      label: 'Internal FAQ Topics',
      type: 'textarea',
      required: false,
      rows: 3,
      placeholder: 'Key questions stakeholders will ask (cost, timeline, risks)...',
      helpText: 'List the hard questions that need answers in the Internal FAQ'
    },
    {
      id: 'metrics',
      label: 'Success Metrics',
      type: 'textarea',
      required: false,
      rows: 2,
      placeholder: 'How will success be measured? Key metrics...'
    }
  ],

  scoringDimensions: [
    { name: 'Customer Focus', maxPoints: 25, description: 'Clear customer problem, working backwards mindset' },
    { name: 'Press Release Quality', maxPoints: 25, description: 'Compelling narrative, clear benefits, quotable' },
    { name: 'FAQ Completeness', maxPoints: 25, description: 'Addresses key stakeholder questions' },
    { name: 'Business Case', maxPoints: 25, description: 'Metrics, feasibility, risk acknowledgment' }
  ],

  validateDocument: null,

  workflowConfig: {
    phaseCount: 3,
    phases: [
      { number: 1, name: 'Initial PR-FAQ', icon: '📝', aiModel: 'Claude', description: 'Generate the first PR-FAQ draft' },
      { number: 2, name: 'Stakeholder Perspective', icon: '🔍', aiModel: 'Gemini', description: 'Challenge assumptions with Gemini' },
      { number: 3, name: 'Final PR-FAQ', icon: '✨', aiModel: 'Claude', description: 'Combine into polished PR-FAQ' }
    ]
  }
};

