/**
 * Strategic Proposal Plugin Configuration
 */

export const strategicProposalPlugin = {
  id: 'strategic-proposal',
  name: 'Strategic Proposal',
  icon: '🎯',
  description: 'Sales-focused proposals for strategic initiatives',
  docsUrl: 'https://hinzconsulting.com/strategic-proposal-planning/',
  dbName: 'strategic-proposal-docforge-db',

  formFields: [
    {
      id: 'title',
      label: 'Proposal Title',
      type: 'text',
      required: true,
      placeholder: 'e.g., CallBox Partnership Proposal for Smith Auto Group',
    },
    {
      id: 'organizationName',
      label: 'Organization Name',
      type: 'text',
      required: true,
      placeholder: 'e.g., Acme Corporation',
    },
    {
      id: 'organizationLocation',
      label: 'Organization Location',
      type: 'text',
      required: true,
      placeholder: 'e.g., Dallas, TX',
    },
    {
      id: 'siteCount',
      label: 'Number of Sites/Locations',
      type: 'text',
      required: false,
      placeholder: 'e.g., 5 offices across the metro area',
    },
    {
      id: 'currentVendor',
      label: 'Current Vendor (if any)',
      type: 'text',
      required: false,
      placeholder: 'e.g., CDK Global',
    },
    {
      id: 'decisionMakerName',
      label: 'Decision Maker Name',
      type: 'text',
      required: true,
      placeholder: 'e.g., John Smith',
    },
    {
      id: 'decisionMakerRole',
      label: 'Decision Maker Role',
      type: 'text',
      required: true,
      placeholder: 'e.g., VP of Operations',
    },
    {
      id: 'conversationTranscripts',
      label: 'Conversation Transcripts / Call Logs',
      type: 'textarea',
      required: false,
      rows: 4,
      placeholder: 'Paste relevant call transcripts or conversation notes...',
    },
    {
      id: 'meetingNotes',
      label: 'Meeting Notes',
      type: 'textarea',
      required: false,
      rows: 3,
      placeholder: 'Notes from discovery meetings...',
    },
    {
      id: 'painPoints',
      label: 'Known Pain Points',
      type: 'textarea',
      required: true,
      rows: 3,
      placeholder: 'What problems are they trying to solve?',
    },
    {
      id: 'attachmentText',
      label: 'Additional Context from Attachments',
      type: 'textarea',
      required: false,
      rows: 3,
      placeholder: 'Paste any relevant content from documents or emails...',
    },
    {
      id: 'workingDraft',
      label: 'Existing Working Draft (if any)',
      type: 'textarea',
      required: false,
      rows: 3,
      placeholder: 'If you have a draft started, paste it here...',
    },
    {
      id: 'additionalContext',
      label: 'Additional Context',
      type: 'textarea',
      required: false,
      rows: 2,
      placeholder: 'Any other relevant information...',
    },
  ],

  scoringDimensions: [
    { name: 'Problem Statement', maxPoints: 25, description: 'Clear problem definition' },
    { name: 'Proposed Solution', maxPoints: 25, description: 'Actionable solution' },
    { name: 'Business Impact', maxPoints: 25, description: 'Measurable outcomes' },
    { name: 'Implementation Plan', maxPoints: 25, description: 'Timeline and resources' },
  ],

  validateDocument: null,

  workflowConfig: {
    phaseCount: 3,
    phases: [
      {
        number: 1,
        name: 'Draft Proposal',
        icon: '📝',
        aiModel: 'Claude',
        description: 'Generate proposal draft',
      },
      {
        number: 2,
        name: 'Executive Review',
        icon: '🔍',
        aiModel: 'Gemini',
        description: 'Challenge with Gemini',
      },
      {
        number: 3,
        name: 'Final Proposal',
        icon: '✨',
        aiModel: 'Claude',
        description: 'Combine into polished proposal',
      },
    ],
  },
};
