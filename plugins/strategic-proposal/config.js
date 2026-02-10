/**
 * Strategic Proposal Plugin Configuration
 */

export const strategicProposalPlugin = {
  id: 'strategic-proposal',
  name: 'Strategic Proposal',
  icon: '🎯',
  description: 'Strategic proposals for business initiatives',
  dbName: 'strategic-proposal-docforge-db',

  formFields: [
    {
      id: 'title',
      label: 'Proposal Title',
      type: 'text',
      required: true,
      placeholder: 'e.g., Expand into European Market'
    },
    {
      id: 'problem',
      label: 'Problem / Opportunity',
      type: 'textarea',
      required: true,
      rows: 3,
      placeholder: 'What strategic problem or opportunity are you addressing?'
    },
    {
      id: 'context',
      label: 'Strategic Context',
      type: 'textarea',
      required: true,
      rows: 3,
      placeholder: 'Market dynamics, competitive landscape, internal factors...'
    },
    {
      id: 'proposedSolution',
      label: 'Proposed Solution',
      type: 'textarea',
      required: false,
      rows: 3,
      placeholder: 'What is your recommended approach?'
    },
    {
      id: 'businessImpact',
      label: 'Expected Business Impact',
      type: 'textarea',
      required: false,
      rows: 2,
      placeholder: 'Revenue, market share, strategic positioning...'
    },
    {
      id: 'timeline',
      label: 'Implementation Timeline',
      type: 'textarea',
      required: false,
      rows: 2,
      placeholder: 'Key milestones and phases...'
    },
    {
      id: 'resources',
      label: 'Required Resources',
      type: 'textarea',
      required: false,
      rows: 2,
      placeholder: 'Budget, headcount, partnerships...'
    },
    {
      id: 'risks',
      label: 'Risks & Mitigations',
      type: 'textarea',
      required: false,
      rows: 2,
      placeholder: 'Key risks and how they will be addressed...'
    }
  ],

  scoringDimensions: [
    { name: 'Problem Statement', maxPoints: 25, description: 'Clear problem definition' },
    { name: 'Proposed Solution', maxPoints: 25, description: 'Actionable solution' },
    { name: 'Business Impact', maxPoints: 25, description: 'Measurable outcomes' },
    { name: 'Implementation Plan', maxPoints: 25, description: 'Timeline and resources' }
  ],

  validateDocument: null,

  workflowConfig: {
    phaseCount: 3,
    phases: [
      { number: 1, name: 'Draft Proposal', icon: '📝', aiModel: 'Claude', description: 'Generate proposal draft' },
      { number: 2, name: 'Executive Review', icon: '🔍', aiModel: 'Gemini', description: 'Challenge with Gemini' },
      { number: 3, name: 'Final Proposal', icon: '✨', aiModel: 'Claude', description: 'Combine into polished proposal' }
    ]
  }
};

