/**
 * Architecture Decision Record (ADR) Plugin Configuration
 */

export const adrPlugin = {
  id: 'adr',
  name: 'Architecture Decision Record',
  icon: '🏗️',
  description: 'Architecture Decision Record for technical decisions',
  docsUrl: 'https://adr.github.io/',
  dbName: 'adr-docforge-db',

  formFields: [
    {
      id: 'title',
      label: 'Decision Title',
      type: 'text',
      required: true,
      placeholder: 'e.g., Use PostgreSQL as primary database',
    },
    {
      id: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: [
        { value: 'proposed', label: 'Proposed' },
        { value: 'accepted', label: 'Accepted' },
        { value: 'deprecated', label: 'Deprecated' },
        { value: 'superseded', label: 'Superseded' },
      ],
    },
    {
      id: 'context',
      label: 'Context',
      type: 'textarea',
      required: true,
      rows: 4,
      placeholder: "What is the issue that we're seeing that is motivating this decision?",
    },
    {
      id: 'decision',
      label: 'Decision',
      type: 'textarea',
      required: true,
      rows: 3,
      placeholder: "What is the change that we're proposing?",
    },
    {
      id: 'consequences',
      label: 'Consequences',
      type: 'textarea',
      required: false,
      rows: 3,
      placeholder: 'What becomes easier or harder because of this decision?',
    },
    {
      id: 'alternatives',
      label: 'Alternatives Considered',
      type: 'textarea',
      required: false,
      rows: 3,
      placeholder: 'What other options were considered and why were they rejected?',
    },
  ],

  scoringDimensions: [
    { name: 'Context', maxPoints: 25, description: 'Clear problem context and constraints' },
    { name: 'Decision', maxPoints: 25, description: 'Clear statement of the decision' },
    { name: 'Consequences', maxPoints: 25, description: 'Positive and negative consequences' },
    {
      name: 'Status',
      maxPoints: 25,
      description: 'Clear status (proposed/accepted/deprecated/superseded)',
    },
  ],

  validateDocument: null,

  workflowConfig: {
    phaseCount: 3,
    phases: [
      {
        number: 1,
        name: 'Initial Draft',
        icon: '📝',
        aiModel: 'Claude',
        description: 'Generate the first ADR draft',
      },
      {
        number: 2,
        name: 'Technical Review',
        icon: '🔍',
        aiModel: 'Gemini',
        description: 'Get technical perspective from Gemini',
      },
      {
        number: 3,
        name: 'Final ADR',
        icon: '✨',
        aiModel: 'Claude',
        description: 'Combine into polished ADR',
      },
    ],
  },
};
