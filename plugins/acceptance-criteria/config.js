/**
 * Acceptance Criteria Plugin Configuration
 */

export const acceptanceCriteriaPlugin = {
  id: 'acceptance-criteria',
  name: 'Acceptance Criteria',
  icon: '✅',
  description: 'Generate testable acceptance criteria for user stories',
  dbName: 'acceptance-criteria-docforge-db',

  formFields: [
    {
      id: 'issueTitle',
      label: 'Issue Title',
      type: 'text',
      required: true,
      placeholder: 'e.g., As a user, I want to reset my password',
    },
    {
      id: 'whatNeedsToBeDone',
      label: 'What Needs to Be Done',
      type: 'textarea',
      required: true,
      rows: 3,
      placeholder: 'Describe what needs to be accomplished...',
    },
    {
      id: 'relatedContext',
      label: 'Related Context',
      type: 'textarea',
      required: false,
      rows: 3,
      placeholder: 'What context is needed to understand this story?',
    },
    {
      id: 'edgeCases',
      label: 'Edge Cases & Error States',
      type: 'textarea',
      required: false,
      rows: 2,
      placeholder: 'What edge cases or error states need to be handled?',
    },
    {
      id: 'outOfScope',
      label: 'Out of Scope',
      type: 'textarea',
      required: false,
      rows: 2,
      placeholder: 'What is explicitly NOT included in this story?',
    },
  ],

  scoringDimensions: [
    {
      name: 'Structure',
      maxPoints: 25,
      description: 'Summary, AC checklist, Out of Scope sections',
    },
    {
      name: 'Clarity',
      maxPoints: 30,
      description: 'Testable criteria, action verbs, measurable metrics',
    },
    {
      name: 'Testability',
      maxPoints: 25,
      description: 'Binary verifiable, no vague terms, specific thresholds',
    },
    {
      name: 'Completeness',
      maxPoints: 20,
      description: 'Criterion count, edge cases, error states',
    },
  ],

  validateDocument: null,

  workflowConfig: {
    phaseCount: 3,
    phases: [
      {
        number: 1,
        name: 'Draft AC',
        icon: '📝',
        aiModel: 'Claude',
        description: 'Generate acceptance criteria draft',
      },
      {
        number: 2,
        name: 'QA Perspective',
        icon: '🔍',
        aiModel: 'Gemini',
        description: 'Add edge cases with Gemini',
      },
      {
        number: 3,
        name: 'Final AC',
        icon: '✨',
        aiModel: 'Claude',
        description: 'Combine into testable AC',
      },
    ],
  },
};
