/**
 * Templates for PRD (Product Requirements Document)
 * Pre-filled content mapped to docforge-ai form field IDs
 */

export const TEMPLATES = [
  {
    id: 'blank',
    name: 'Blank PRD',
    icon: '📄',
    description: 'Start from scratch',
    fields: {}
  },
  {
    id: 'newFeature',
    name: 'New Feature',
    icon: '✨',
    description: 'Define a new product feature',
    fields: {
      title: 'New Feature PRD',
      problem: 'Users currently face [pain point] when trying to [task].\n\nEvidence:\n- [User research finding 1]\n- [Support ticket trend]\n- [Competitor analysis]',
      userPersona: 'Primary: [Persona name] - [Role/demographic]\nSecondary: [Persona name] - [Role/demographic]\n\nJobs to be done:\n- [JTBD 1]\n- [JTBD 2]',
      context: 'Strategic alignment: [Company initiative]\nMarket timing: [Why now]\nDependencies: [Related projects/systems]',
      goals: '1. [Goal 1] - Measured by [metric]\n2. [Goal 2] - Measured by [metric]\n3. [Goal 3] - Measured by [metric]',
      requirements: 'Must Have:\n- [Requirement 1]\n- [Requirement 2]\n\nShould Have:\n- [Requirement 3]\n\nNice to Have:\n- [Requirement 4]',
      constraints: 'Technical: [constraint]\nTimeline: [constraint]\nBudget: [constraint]'
    }
  },
  {
    id: 'platformMigration',
    name: 'Platform Migration',
    icon: '🔄',
    description: 'Migrate to new platform/system',
    fields: {
      title: 'Platform Migration PRD',
      problem: 'Current platform [name] has the following limitations:\n- [Limitation 1]\n- [Limitation 2]\n\nImpact: [Business impact of staying on current platform]',
      userPersona: 'Internal users: [Team/role]\nExternal users: [Customer segment if applicable]\n\nMigration stakeholders:\n- [Stakeholder 1]: [Role in migration]\n- [Stakeholder 2]: [Role in migration]',
      context: 'Current state: [Describe current platform]\nTarget state: [Describe target platform]\nMigration strategy: [Big bang / Phased / Parallel run]',
      goals: '1. Zero customer-facing downtime\n2. Data integrity maintained at 100%\n3. Feature parity by [date]\n4. [Additional goal]',
      requirements: 'Data Migration:\n- [Requirement]\n\nFeature Parity:\n- [Requirement]\n\nRollback Plan:\n- [Requirement]',
      constraints: 'Downtime window: [constraint]\nData retention: [constraint]\nCompliance: [constraint]'
    }
  },
  {
    id: 'internalTool',
    name: 'Internal Tool',
    icon: '🔧',
    description: 'Build internal productivity tool',
    fields: {
      title: 'Internal Tool PRD',
      problem: 'Team currently spends [X hours/week] on [manual process].\n\nPain points:\n- [Pain point 1]\n- [Pain point 2]\n\nCost of status quo: [Quantified impact]',
      userPersona: 'Primary users: [Team name] ([X] people)\nSecondary users: [Other teams]\n\nTechnical proficiency: [Low/Medium/High]',
      context: 'Current workflow:\n1. [Step 1]\n2. [Step 2]\n3. [Step 3]\n\nDesired workflow:\n1. [Improved step 1]\n2. [Improved step 2]',
      goals: '1. Reduce time spent on [task] by [X]%\n2. Eliminate manual errors in [process]\n3. Enable self-service for [capability]',
      requirements: 'Core Features:\n- [Feature 1]\n- [Feature 2]\n\nIntegrations:\n- [System 1]\n- [System 2]\n\nReporting:\n- [Report type]',
      constraints: 'Build vs buy: [Decision]\nMaintenance burden: [Consideration]\nSecurity: [Requirements]'
    }
  },
  {
    id: 'apiPlatform',
    name: 'API Platform',
    icon: '🔌',
    description: 'Design API or developer platform',
    fields: {
      title: 'API Platform PRD',
      problem: 'Partners/developers need programmatic access to [capability].\n\nCurrent state:\n- [Manual process or no access]\n- [Integration friction]\n\nOpportunity: [Market size or partner requests]',
      userPersona: 'Primary: External developers at [partner type]\nSecondary: Internal teams building on platform\n\nDeveloper experience level: [Junior/Senior/Mixed]',
      context: 'API strategy: [REST/GraphQL/gRPC]\nAuthentication: [OAuth/API Key/JWT]\nRate limiting: [Tiers and limits]',
      goals: '1. [X] partner integrations in [timeframe]\n2. API uptime of [X]%\n3. Developer satisfaction score of [X]',
      requirements: 'Endpoints:\n- [Endpoint 1]: [Purpose]\n- [Endpoint 2]: [Purpose]\n\nSDKs:\n- [Language 1]\n- [Language 2]\n\nDocumentation:\n- [Type]',
      constraints: 'Backward compatibility: [Policy]\nBreaking changes: [Process]\nSLA: [Requirements]'
    }
  }
];

export function getTemplate(templateId) {
  return TEMPLATES.find(t => t.id === templateId) || null;
}

export function getAllTemplates() {
  return TEMPLATES;
}

