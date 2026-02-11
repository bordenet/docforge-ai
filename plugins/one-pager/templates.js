/**
 * One-Pager Templates - Pre-filled content for common use cases
 * @module one-pager/templates
 */

/** @type {Object[]} */
export const TEMPLATES = [
  {
    id: 'blank',
    name: 'Blank',
    icon: '📄',
    description: 'Start from scratch',
    fields: {},
  },
  {
    id: 'featurePitch',
    name: 'Feature Pitch',
    icon: '🚀',
    description: 'Propose a new feature',
    fields: {
      problemStatement:
        'Customers are experiencing [pain point] when trying to [action], resulting in [negative outcome]',
      costOfDoingNothing:
        '$[X] lost revenue per [period]\n[Y]% customer churn attributed to this gap\n[Z] support tickets per month',
      context:
        'Market gap: [Competitor analysis]\nCustomer feedback: [Data source]\nStrategic alignment: [Initiative]',
      proposedSolution: 'Build [feature] that enables [capability] by [approach]',
      keyGoals:
        '- Reduce [pain metric] by [X]%\n- Increase [positive metric] by [Y]%\n- Enable [new capability]',
      scopeInScope: '- Core functionality\n- Integration with [system]\n- [Platform] support',
      scopeOutOfScope:
        '- Advanced analytics (Phase 2)\n- [Other platform] support\n- Legacy migration',
      successMetrics:
        '- [Metric 1]: Target [value]\n- [Metric 2]: Target [value]\n- Customer satisfaction: [NPS target]',
      keyStakeholders: 'Sponsor: [Exec]\nProduct: [PM]\nEngineering: [Lead]\nDesign: [Designer]',
      timelineEstimate: 'Discovery: [X] weeks\nBuild: [Y] weeks\nLaunch: [Target quarter]',
    },
  },
  {
    id: 'budgetAsk',
    name: 'Budget Ask',
    icon: '💰',
    description: 'Request resources/budget',
    fields: {
      problemStatement:
        'Current capacity constraint: [describe bottleneck]\nImpact: Unable to deliver [X] due to [limitation]',
      costOfDoingNothing:
        'Delayed roadmap by [X] months\n$[Y] opportunity cost\n[Z] team burnout risk',
      context:
        'Current state: [Team size, tools, infrastructure]\nDemand: [Growth projections, commitments]',
      proposedSolution:
        'Request: $[amount] for [headcount/tools/infrastructure]\nBreakdown:\n- [Item 1]: $[cost]\n- [Item 2]: $[cost]',
      keyGoals:
        '- Unlock [capability]\n- Reduce [bottleneck] by [X]%\n- Enable [strategic initiative]',
      scopeInScope: 'FY[Year] investment\n[Specific roles/tools/resources]',
      scopeOutOfScope: 'Future fiscal years\nContingent requests',
      successMetrics: 'ROI: [X]% in [timeframe]\nPayback period: [months]\nCapacity increase: [Y]%',
      keyStakeholders: 'Requestor: [Name]\nApprover: [Finance/Exec]\nBeneficiary: [Team]',
      timelineEstimate:
        'Decision needed: [Date]\nOnboarding/setup: [Duration]\nFull productivity: [Date]',
    },
  },
  {
    id: 'techDebtPitch',
    name: 'Tech Debt Pitch',
    icon: '🔧',
    description: 'Target specific technical debt',
    fields: {
      problemStatement:
        'SPECIFIC SYSTEM/COMPONENT: [Exact file/module/service name]\nSPECIFIC PROBLEM: [Concrete technical issue]',
      costOfDoingNothing:
        'Quantified impact:\n- [X]ms added latency per request\n- $[Y]/month in infrastructure costs\n- [Z] hours/week developer productivity loss',
      context:
        'Root cause: [When/why this was introduced]\nCurrent workarounds: [Band-aids in place]\nEvidence: [Links to metrics, incidents]',
      proposedSolution:
        'SPECIFIC CHANGE: [Exact refactoring]\nApproach: [Technical strategy]\nRisks mitigated: [How we avoid breaking things]',
      keyGoals:
        '- Reduce [specific metric] from [current] to [target]\n- Eliminate [specific failure mode]\n- Enable [blocked capability]',
      scopeInScope:
        '- [Specific file/module/service]\n- [Exact boundaries of refactoring]\n- Backward compatibility maintained',
      scopeOutOfScope:
        '- Related but separate issues\n- "While we\'re here" improvements\n- Broader architectural changes',
      successMetrics:
        'Before/After comparison:\n- [Metric 1]: [current] → [target]\n- [Metric 2]: [current] → [target]',
      keyStakeholders: 'Engineer: [Name]\nTech Lead: [Name]\nProduct: [PM]',
      timelineEstimate: 'Investigation: [X] days\nImplementation: [Y] days\nValidation: [Z] days',
    },
  },
  {
    id: 'experimentPlan',
    name: 'Experiment Plan',
    icon: '🧪',
    description: 'A/B test hypothesis',
    fields: {
      problemStatement:
        'Hypothesis: [Specific change] will improve [metric] because [reasoning based on data/research]',
      costOfDoingNothing:
        'Continue with unvalidated assumptions\nMiss opportunity to improve [metric] by estimated [X]%',
      context:
        'Current baseline: [Metric] = [value]\nUser research insight: [Finding]\nCompetitor/industry data: [Benchmark]',
      proposedSolution:
        'Experiment design:\n- Control: [Current experience]\n- Treatment: [Proposed change]\n- Traffic split: [X]% / [Y]%\n- Duration: [N] days',
      keyGoals:
        '- Validate/invalidate hypothesis\n- Measure impact on [primary metric]\n- Understand effect on [secondary metrics]',
      scopeInScope: 'Primary metric: [Metric]\nSecondary metrics: [List]\nUser segment: [Who]',
      scopeOutOfScope:
        'Other variations (future experiments)\nLong-term behavior changes\nQualitative feedback',
      successMetrics:
        'Success criteria:\n- [Primary metric] improves by ≥[X]%\n- No degradation in [guardrail metrics]\n- Statistical significance: p < 0.05',
      keyStakeholders: 'Experiment owner: [PM/Designer]\nAnalyst: [Name]\nEngineering: [Name]',
      timelineEstimate: 'Setup: [X] days\nRun time: [Y] days\nAnalysis: [Z] days',
    },
  },
  {
    id: 'migrationPlan',
    name: 'Migration Plan',
    icon: '🔄',
    description: 'Infrastructure/data migration',
    fields: {
      problemStatement:
        'Need to migrate [system/data] from [source] to [target] to [achieve outcome]',
      costOfDoingNothing:
        'Continued reliance on [legacy system]\n$[X]/month higher costs\n[Y] technical limitations',
      context:
        'Current state: [Architecture]\nTarget state: [Architecture]\nData volume: [Size/scale]',
      proposedSolution:
        'Migration strategy: [Big bang / Phased / Parallel run]\n\nPhases:\n1. [Phase 1]: [Scope]\n2. [Phase 2]: [Scope]\n3. [Phase 3]: [Scope]',
      keyGoals: '- Zero data loss\n- < [X] minutes downtime\n- Maintain [SLA] throughout',
      scopeInScope: '[Specific systems/data]\n[User segments]\n[Timeframe]',
      scopeOutOfScope: 'Future migrations\nFeature development during migration',
      successMetrics:
        '- 100% data integrity verified\n- Performance: [current] → [target]\n- Downtime: < [X] minutes',
      keyStakeholders: 'Migration lead: [Engineer]\nSRE: [Name]\nProduct: [PM]',
      timelineEstimate: 'Prep: [X] weeks\nMigration: [Y] weeks\nValidation: [Z] weeks',
    },
  },
  {
    id: 'vendorEvaluation',
    name: 'Vendor Evaluation',
    icon: '🏢',
    description: 'Quick vendor comparison',
    fields: {
      problemStatement: 'Need to select [type of tool/service] to solve [specific problem]',
      costOfDoingNothing:
        'Continue with [current state]\nOpportunity cost: [X]\nProductivity loss: [Y]',
      context:
        'Requirements:\n- Must have: [List]\n- Nice to have: [List]\n- Deal breakers: [List]\n\nBudget: $[X]/[period]',
      proposedSolution:
        'Vendor comparison:\n\n**[Vendor A]**: $[cost]\n✅ Pros: [List]\n❌ Cons: [List]\n\n**Recommendation**: [Vendor]',
      keyGoals:
        '- Meet [X] must-have requirements\n- Stay within budget\n- Minimize integration effort',
      scopeInScope: 'Initial vendor selection\nPOC/trial evaluation\nContract negotiation',
      scopeOutOfScope: 'Long-term vendor strategy\nMulti-year commitments',
      successMetrics:
        '- Selected vendor meets [X]% of requirements\n- ROI positive within [timeframe]',
      keyStakeholders: 'Evaluator: [Name]\nBudget owner: [Manager]\nEnd users: [Team]',
      timelineEstimate: 'Research: [X] weeks\nTrials: [Y] weeks\nDecision: [Date]',
    },
  },
  {
    id: 'toolingProposal',
    name: 'Tooling Proposal',
    icon: '🛠️',
    description: 'Propose dev tool changes',
    fields: {
      problemStatement:
        'Current [tool/process] creates friction: [Specific pain point]\nImpact: [X] hours/week lost',
      costOfDoingNothing:
        '[X] hours/week × [N] developers × $[rate] = $[Y]/year\nDeveloper satisfaction impact',
      context:
        'Current tool: [Name/version]\nPain points: [Specific issues]\nDeveloper feedback: [Quotes/data]',
      proposedSolution:
        'Adopt [new tool/process]:\n- Solves: [Specific problems]\n- Migration effort: [X] hours\n- Training needed: [Y] hours',
      keyGoals:
        '- Reduce [friction] by [X]%\n- Improve developer satisfaction\n- Increase velocity by [Y]%',
      scopeInScope: '[Specific team/project]\n[Timeframe]\n[Tool/process scope]',
      scopeOutOfScope: 'Company-wide rollout (start with pilot)\nOther tooling changes',
      successMetrics: 'Developer survey: [current] → [target]\nTime saved: [X] hours/week',
      keyStakeholders: 'Proposer: [Engineer]\nTeam lead: [Name]\nEngineering manager: [Name]',
      timelineEstimate: 'Pilot: [X] weeks\nEvaluation: [Y] weeks\nRollout decision: [Date]',
    },
  },
];

/**
 * Get a template by ID
 * @param {string} templateId
 * @returns {Object|null}
 */
export function getTemplate(templateId) {
  return TEMPLATES.find((t) => t.id === templateId) || null;
}

/**
 * Get all templates
 * @returns {Object[]}
 */
export function getAllTemplates() {
  return TEMPLATES;
}
