/**
 * One-Pager Plugin Configuration
 */

export const onePagerPlugin = {
  id: 'one-pager',
  name: 'One-Pager',
  icon: '📄',
  description: 'Concise one-page decision document',
  dbName: 'one-pager-docforge-db',

  formFields: [
    {
      id: 'title',
      label: 'Project Title',
      type: 'text',
      required: true,
      placeholder: 'e.g., Mobile App Performance Optimization'
    },
    {
      id: 'problemStatement',
      label: 'Problem Statement',
      type: 'textarea',
      required: true,
      rows: 3,
      placeholder: 'What problem are you solving? Be specific...'
    },
    {
      id: 'costOfDoingNothing',
      label: 'Cost of Doing Nothing',
      type: 'textarea',
      required: false,
      rows: 2,
      placeholder: 'e.g., $50K/month lost revenue, 10% customer churn...',
      helpText: 'What happens if this isn\'t solved? Include business impact, revenue loss, etc.'
    },
    {
      id: 'context',
      label: 'Additional Context',
      type: 'textarea',
      required: false,
      rows: 2,
      placeholder: 'Any background, constraints, or considerations...'
    },
    {
      id: 'proposedSolution',
      label: 'Proposed Solution',
      type: 'textarea',
      required: false,
      rows: 3,
      placeholder: 'High-level description of the proposed solution...'
    },
    {
      id: 'keyGoals',
      label: 'Key Goals/Benefits',
      type: 'textarea',
      required: false,
      rows: 2,
      placeholder: 'List the main goals and expected benefits...'
    },
    {
      id: 'scopeInScope',
      label: 'In Scope',
      type: 'textarea',
      required: false,
      rows: 2,
      placeholder: 'What\'s included...'
    },
    {
      id: 'scopeOutOfScope',
      label: 'Out of Scope',
      type: 'textarea',
      required: false,
      rows: 2,
      placeholder: 'What\'s explicitly excluded...'
    },
    {
      id: 'successMetrics',
      label: 'Success Metrics',
      type: 'textarea',
      required: false,
      rows: 2,
      placeholder: 'How will you measure success?'
    },
    {
      id: 'keyStakeholders',
      label: 'Key Stakeholders',
      type: 'textarea',
      required: false,
      rows: 2,
      placeholder: 'Who needs to be involved or informed?'
    },
    {
      id: 'timelineEstimate',
      label: 'Timeline Estimate',
      type: 'textarea',
      required: false,
      rows: 2,
      placeholder: 'Rough timeline or milestones...'
    }
  ],

  scoringDimensions: [
    { name: 'Problem Clarity', maxPoints: 30, description: 'Problem statement, cost of inaction, customer focus' },
    { name: 'Solution Quality', maxPoints: 25, description: 'Solution addresses problem, measurable goals, high-level' },
    { name: 'Scope Discipline', maxPoints: 25, description: 'In/out scope, success metrics, SMART criteria' },
    { name: 'Completeness', maxPoints: 20, description: 'Required sections, stakeholders, timeline' }
  ],

  // Validation will be imported from validator.js
  validateDocument: null, // Set by plugin loader

  workflowConfig: {
    phaseCount: 3,
    phases: [
      { number: 1, name: 'Initial Draft', icon: '📝', aiModel: 'Claude', description: 'Generate the first draft using Claude' },
      { number: 2, name: 'Alternative Perspective', icon: '🔍', aiModel: 'Gemini', description: 'Get improvements from Gemini' },
      { number: 3, name: 'Final Synthesis', icon: '✨', aiModel: 'Claude', description: 'Combine into polished final version' }
    ]
  }
};

