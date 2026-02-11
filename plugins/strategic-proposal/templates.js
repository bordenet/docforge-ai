/**
 * Templates for Strategic Proposal
 * Pre-filled content mapped to docforge-ai form field IDs
 */

export const TEMPLATES = [
  {
    id: 'blank',
    name: 'Blank',
    icon: '📄',
    description: 'Start from scratch',
    fields: {},
  },
  {
    id: 'marketExpansion',
    name: 'Market Expansion',
    icon: '🌍',
    description: 'Enter new market or geography',
    fields: {
      title: 'Strategic Proposal: [Market/Geography] Expansion',
      problem:
        'Opportunity: [Market] represents $[X]B TAM with [Y]% growth.\n\nCurrent position: We have [X]% market share in [existing markets] but no presence in [target market].\n\nCompetitive pressure: [Competitors] are already established in [target market].',
      context:
        'Market dynamics:\n- [Market size and growth]\n- [Key players and market share]\n- [Customer segments]\n\nOur strengths:\n- [Advantage 1]\n- [Advantage 2]\n\nChallenges:\n- [Challenge 1]\n- [Challenge 2]',
      proposedSolution:
        'Enter [market] through [approach]:\n1. [Phase 1]: [Description] - [Timeline]\n2. [Phase 2]: [Description] - [Timeline]\n3. [Phase 3]: [Description] - [Timeline]',
      businessImpact:
        'Revenue potential: $[X]M by Year [Y]\nMarket share target: [X]% in [timeframe]\nStrategic value: [Positioning, diversification, etc.]',
      timeline:
        'Q1: [Milestone]\nQ2: [Milestone]\nQ3: [Milestone]\nQ4: [Milestone]\nYear 2: [Milestone]',
      resources:
        'Investment required: $[X]M\n- Headcount: [X] FTEs\n- Marketing: $[X]\n- Operations: $[X]\n- Partnerships: [Description]',
      risks:
        '- Regulatory: [Risk and mitigation]\n- Competitive response: [Risk and mitigation]\n- Execution: [Risk and mitigation]\n- Currency/economic: [Risk and mitigation]',
    },
  },
  {
    id: 'productStrategy',
    name: 'Product Strategy',
    icon: '🚀',
    description: 'New product line or pivot',
    fields: {
      title: 'Strategic Proposal: [Product/Product Line]',
      problem:
        "Market opportunity: [Description of unmet need]\n\nCustomer pain: [What customers struggle with today]\n\nStrategic gap: [What we're missing in our portfolio]",
      context:
        'Market size: $[X]B, growing [Y]% annually\n\nCompetitive landscape:\n- [Competitor 1]: [Position]\n- [Competitor 2]: [Position]\n\nOur right to win:\n- [Asset 1]\n- [Asset 2]',
      proposedSolution:
        'Launch [Product] that [value proposition].\n\nProduct vision:\n- [Core capability 1]\n- [Core capability 2]\n- [Core capability 3]\n\nGo-to-market: [Approach]',
      businessImpact:
        'Revenue projection:\n- Year 1: $[X]M\n- Year 2: $[X]M\n- Year 3: $[X]M\n\nStrategic value:\n- [Benefit 1]\n- [Benefit 2]',
      timeline: 'Phase 1 (MVP): [X] months\nPhase 2 (GA): [X] months\nPhase 3 (Scale): [X] months',
      resources:
        'Investment: $[X]M over [timeframe]\n- Engineering: [X] FTEs\n- Product/Design: [X] FTEs\n- GTM: [X] FTEs\n- Infrastructure: $[X]',
      risks:
        '- Build vs buy: [Analysis]\n- Cannibalization: [Risk and mitigation]\n- Technical feasibility: [Risk and mitigation]\n- Market timing: [Risk and mitigation]',
    },
  },
  {
    id: 'partnershipAlliance',
    name: 'Partnership/Alliance',
    icon: '🤝',
    description: 'Strategic partnership proposal',
    fields: {
      title: 'Strategic Proposal: Partnership with [Partner]',
      problem:
        'Strategic gap: We lack [capability/market access/technology] needed to [achieve goal].\n\nOrganic path: Building internally would take [X years] and $[Y]M.\n\nOpportunity: [Partner] has [what we need] and needs [what we have].',
      context:
        'Partner profile:\n- Company: [Description]\n- Relevant assets: [What they bring]\n- Strategic fit: [Why this makes sense]\n\nRelationship history: [Prior interactions if any]',
      proposedSolution:
        "Form [type of partnership] with [Partner]:\n\nStructure:\n- [Deal term 1]\n- [Deal term 2]\n- [Deal term 3]\n\nGovernance: [How we'll manage the relationship]",
      businessImpact:
        'Value creation:\n- Revenue synergies: $[X]M\n- Cost synergies: $[X]M\n- Strategic positioning: [Description]\n\nTimeline to value: [X] months',
      timeline:
        'Negotiation: [X] months\nLegal/diligence: [X] months\nIntegration: [X] months\nFull value: [X] months',
      resources:
        'Investment:\n- Deal costs: $[X]\n- Integration: $[X]\n- Ongoing: $[X] annually\n\nTeam: [X] FTEs dedicated to partnership',
      risks:
        '- Partner dependency: [Risk and mitigation]\n- Cultural fit: [Risk and mitigation]\n- Competitive response: [Risk and mitigation]\n- Execution: [Risk and mitigation]',
    },
  },
  {
    id: 'operationalTransformation',
    name: 'Operational Change',
    icon: '⚙️',
    description: 'Process or org transformation',
    fields: {
      title: 'Strategic Proposal: [Transformation Initiative]',
      problem:
        'Current state inefficiency:\n- [Problem 1]: Costing $[X] annually\n- [Problem 2]: [Impact]\n\nCompetitive pressure: [Competitors] operate at [X]% better [metric].',
      context:
        "Scope: [What parts of organization affected]\n\nPrevious attempts: [What's been tried and why it failed/succeeded]\n\nExternal benchmarks: [Industry standards]",
      proposedSolution:
        'Implement [transformation] across [scope]:\n\n1. [Initiative 1]: [Description]\n2. [Initiative 2]: [Description]\n3. [Initiative 3]: [Description]\n\nChange management: [Approach]',
      businessImpact:
        'Efficiency gains: $[X]M annually\nCapacity freed: [X] FTE equivalent\nQuality improvement: [X]% reduction in [defects/errors]',
      timeline: 'Design: [X] months\nPilot: [X] months\nRollout: [X] months\nOptimization: Ongoing',
      resources:
        'Investment: $[X]M\n- Consulting: $[X]\n- Technology: $[X]\n- Training: $[X]\n- Change management: $[X]',
      risks:
        '- Change resistance: [Risk and mitigation]\n- Business disruption: [Risk and mitigation]\n- Technology risk: [Risk and mitigation]\n- Talent retention: [Risk and mitigation]',
    },
  },
];

export function getTemplate(templateId) {
  return TEMPLATES.find((t) => t.id === templateId) || null;
}

export function getAllTemplates() {
  return TEMPLATES;
}
