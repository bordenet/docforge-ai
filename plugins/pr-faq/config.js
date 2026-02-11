/**
 * PR-FAQ (Amazon-style) Plugin Configuration
 */

export const prFaqPlugin = {
  id: 'pr-faq',
  name: 'Press Release FAQ (PR-FAQ)',
  icon: '📰',
  description: 'Amazon-style PR-FAQ document for product launches',
  dbName: 'pr-faq-docforge-db',

  formFields: [
    {
      id: 'productName',
      label: 'Product/Feature Name',
      type: 'text',
      required: true,
      placeholder: 'e.g., Smart Home Energy Dashboard',
    },
    {
      id: 'companyName',
      label: 'Company Name',
      type: 'text',
      required: true,
      placeholder: 'e.g., Acme Corp',
    },
    {
      id: 'targetCustomer',
      label: 'Target Customer',
      type: 'textarea',
      required: true,
      rows: 2,
      placeholder: 'Who is the target customer? Be specific about their role and context.',
    },
    {
      id: 'problem',
      label: 'Customer Problem',
      type: 'textarea',
      required: true,
      rows: 3,
      placeholder: 'What customer problem are you solving? Start with the customer.',
    },
    {
      id: 'theAlternative',
      label: 'The Alternative',
      type: 'textarea',
      required: false,
      rows: 2,
      placeholder: 'What do customers do today? Manual process? Competitor product?',
    },
    {
      id: 'solution',
      label: 'Proposed Solution',
      type: 'textarea',
      required: true,
      rows: 3,
      placeholder: 'How does this product/feature solve the problem?',
    },
    {
      id: 'benefits',
      label: 'Key Benefits',
      type: 'textarea',
      required: false,
      rows: 2,
      placeholder: 'Top 3-5 benefits for the customer...',
    },
    {
      id: 'metrics',
      label: 'Success Metrics',
      type: 'textarea',
      required: false,
      rows: 2,
      placeholder: 'How will success be measured? Key metrics...',
    },
    {
      id: 'priceAndAvailability',
      label: 'Price and Availability',
      type: 'textarea',
      required: false,
      rows: 2,
      placeholder: 'Launch date, pricing, regional availability...',
    },
    {
      id: 'releaseDate',
      label: 'Release Date',
      type: 'text',
      required: false,
      placeholder: 'e.g., Q2 2026',
    },
    {
      id: 'executiveVision',
      label: 'Executive Vision',
      type: 'textarea',
      required: false,
      rows: 2,
      placeholder: 'High-level "Why" from company perspective...',
    },
    {
      id: 'internalRisks',
      label: 'Internal Risks',
      type: 'textarea',
      required: false,
      rows: 2,
      placeholder: 'Biggest reason this might fail...',
    },
    {
      id: 'location',
      label: 'Location',
      type: 'text',
      required: false,
      placeholder: 'e.g., Seattle, WA',
    },
  ],

  scoringDimensions: [
    {
      name: 'Customer Focus',
      maxPoints: 25,
      description: 'Clear customer problem, working backwards mindset',
    },
    {
      name: 'Press Release Quality',
      maxPoints: 25,
      description: 'Compelling narrative, clear benefits, quotable',
    },
    { name: 'FAQ Completeness', maxPoints: 25, description: 'Addresses key stakeholder questions' },
    {
      name: 'Business Case',
      maxPoints: 25,
      description: 'Metrics, feasibility, risk acknowledgment',
    },
  ],

  validateDocument: null,

  workflowConfig: {
    phaseCount: 3,
    phases: [
      {
        number: 1,
        name: 'Initial PR-FAQ',
        icon: '📝',
        aiModel: 'Claude',
        description: 'Generate the first PR-FAQ draft',
      },
      {
        number: 2,
        name: 'Stakeholder Perspective',
        icon: '🔍',
        aiModel: 'Gemini',
        description: 'Challenge assumptions with Gemini',
      },
      {
        number: 3,
        name: 'Final PR-FAQ',
        icon: '✨',
        aiModel: 'Claude',
        description: 'Combine into polished PR-FAQ',
      },
    ],
  },
};
