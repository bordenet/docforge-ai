/**
 * Templates for ADR (Architecture Decision Record)
 * Pre-filled content mapped to docforge-ai form field IDs
 */

export const TEMPLATES = [
  {
    id: 'blank',
    name: 'Blank',
    icon: '📄',
    description: 'Start from scratch',
    fields: {}
  },
  {
    id: 'techStackChoice',
    name: 'Tech Stack Choice',
    icon: '🛠️',
    description: 'Technology selection decision',
    fields: {
      title: 'ADR: Technology Stack Selection',
      status: 'proposed',
      context: 'We need to select [technology type] for [project/system].\n\nRequirements:\n- [Requirement 1]\n- [Requirement 2]\n\nConstraints:\n- Team expertise in [languages/frameworks]\n- Integration with [existing systems]',
      decision: 'We will use [Technology] because:\n1. [Reason 1]\n2. [Reason 2]\n3. [Reason 3]',
      consequences: 'Positive:\n- [Benefit 1]\n- [Benefit 2]\n\nNegative:\n- [Tradeoff 1]\n- [Tradeoff 2]\n\nNeutral:\n- [Observation]',
      alternatives: 'Option A: [Technology]\n- Pros: [list]\n- Cons: [list]\n\nOption B: [Technology]\n- Pros: [list]\n- Cons: [list]\n\nOption C: Do nothing\n- Not viable because: [reason]'
    }
  },
  {
    id: 'deploymentStrategy',
    name: 'Deployment Strategy',
    icon: '🚀',
    description: 'CI/CD or deployment decision',
    fields: {
      title: 'ADR: Deployment Strategy',
      status: 'proposed',
      context: 'Current deployment process has the following issues:\n- [Issue 1]\n- [Issue 2]\n\nGoals:\n- Reduce deployment time from [X] to [Y]\n- Enable [capability]',
      decision: 'We will implement [strategy] using [tools].\n\nKey components:\n- [Component 1]\n- [Component 2]',
      consequences: 'Positive:\n- Faster deployments\n- Reduced manual errors\n- [Other benefit]\n\nNegative:\n- Learning curve for team\n- [Other tradeoff]\n\nNeutral:\n- Requires [infrastructure change]',
      alternatives: 'Option A: [Strategy]\n- Rejected because: [reason]\n\nOption B: [Strategy]\n- Rejected because: [reason]'
    }
  },
  {
    id: 'apiDesign',
    name: 'API Design',
    icon: '🔗',
    description: 'API architecture decision',
    fields: {
      title: 'ADR: API Design Approach',
      status: 'proposed',
      context: 'We need to design APIs for [system/service].\n\nConsumers:\n- [Consumer 1]\n- [Consumer 2]\n\nRequirements:\n- [Performance requirement]\n- [Compatibility requirement]',
      decision: 'We will use [REST/GraphQL/gRPC] with the following patterns:\n- [Pattern 1]\n- [Pattern 2]\n- [Pattern 3]',
      consequences: 'Positive:\n- [Benefit 1]\n- [Benefit 2]\n\nNegative:\n- [Tradeoff 1]\n\nNeutral:\n- Requires documentation effort',
      alternatives: 'REST:\n- Pros: Simple, well-understood\n- Cons: Over/under-fetching\n\nGraphQL:\n- Pros: Flexible queries\n- Cons: Complexity\n\ngRPC:\n- Pros: Performance\n- Cons: Browser support'
    }
  },
  {
    id: 'dataMigration',
    name: 'Data Migration',
    icon: '💾',
    description: 'Database or data migration decision',
    fields: {
      title: 'ADR: Data Migration Strategy',
      status: 'proposed',
      context: 'We need to migrate data from [source] to [target].\n\nData volume: [size]\nDowntime tolerance: [requirement]\nData integrity requirements: [requirements]',
      decision: 'We will use [migration strategy] with the following approach:\n1. [Step 1]\n2. [Step 2]\n3. [Step 3]\n\nRollback plan: [description]',
      consequences: 'Positive:\n- [Benefit 1]\n- [Benefit 2]\n\nNegative:\n- [Risk 1]\n- [Complexity]\n\nNeutral:\n- Requires [X] hours of planned downtime',
      alternatives: 'Big Bang:\n- Rejected because: [reason]\n\nDual-Write:\n- Rejected because: [reason]\n\nStrangler Fig:\n- Rejected because: [reason]'
    }
  }
];

export function getTemplate(templateId) {
  return TEMPLATES.find(t => t.id === templateId) || null;
}

export function getAllTemplates() {
  return TEMPLATES;
}

