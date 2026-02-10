/**
 * Job Description (JD) Plugin Configuration
 */

export const jdPlugin = {
  id: 'jd',
  name: 'Job Description',
  icon: '💼',
  description: 'Create inclusive, compelling job descriptions',
  dbName: 'jd-docforge-db',

  formFields: [
    {
      id: 'jobTitle',
      label: 'Job Title',
      type: 'text',
      required: true,
      placeholder: 'e.g., Senior Software Engineer'
    },
    {
      id: 'postingType',
      label: 'Posting Type',
      type: 'select',
      required: true,
      options: [
        { value: 'external', label: 'External Posting' },
        { value: 'internal', label: 'Internal Posting' },
        { value: 'both', label: 'Both Internal & External' }
      ]
    },
    {
      id: 'department',
      label: 'Department/Team',
      type: 'text',
      required: false,
      placeholder: 'e.g., Platform Engineering'
    },
    {
      id: 'level',
      label: 'Level',
      type: 'select',
      required: false,
      options: [
        { value: 'entry', label: 'Entry Level' },
        { value: 'mid', label: 'Mid Level' },
        { value: 'senior', label: 'Senior' },
        { value: 'staff', label: 'Staff' },
        { value: 'principal', label: 'Principal' },
        { value: 'manager', label: 'Manager' },
        { value: 'director', label: 'Director' }
      ]
    },
    {
      id: 'teamContext',
      label: 'Team Context',
      type: 'textarea',
      required: false,
      rows: 3,
      placeholder: 'What does the team do? What will this person work on?'
    },
    {
      id: 'requirements',
      label: 'Key Requirements',
      type: 'textarea',
      required: false,
      rows: 3,
      placeholder: 'Must-have skills, experience, qualifications...'
    },
    {
      id: 'niceToHave',
      label: 'Nice to Have',
      type: 'textarea',
      required: false,
      rows: 2,
      placeholder: 'Preferred but not required skills...'
    },
    {
      id: 'compensation',
      label: 'Compensation Range',
      type: 'text',
      required: false,
      placeholder: 'e.g., $150K-$200K + equity'
    }
  ],

  scoringDimensions: [
    { name: 'Clarity', maxPoints: 25, description: 'Clear role, responsibilities, requirements' },
    { name: 'Inclusivity', maxPoints: 25, description: 'Gender-neutral language, reasonable requirements' },
    { name: 'Completeness', maxPoints: 25, description: 'All sections present, team context, growth opportunity' },
    { name: 'Appeal', maxPoints: 25, description: 'Compelling, authentic, differentiating' }
  ],

  validateDocument: null,

  workflowConfig: {
    phaseCount: 3,
    phases: [
      { number: 1, name: 'Draft JD', icon: '📝', aiModel: 'Claude', description: 'Generate job description draft' },
      { number: 2, name: 'Inclusivity Review', icon: '🔍', aiModel: 'Gemini', description: 'Check inclusivity with Gemini' },
      { number: 3, name: 'Final JD', icon: '✨', aiModel: 'Claude', description: 'Combine into polished JD' }
    ]
  }
};

