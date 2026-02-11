/**
 * Templates for Business Justification
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
    id: 'headcountRequest',
    name: 'Headcount Request',
    icon: '👥',
    description: 'Request new positions',
    fields: {
      title: 'FY[XX] Headcount Request: [Role/Team]',
      documentType: 'headcount',
      context: 'Business need: [What capability gap exists]\n\nDemand drivers:\n- [Driver 1]\n- [Driver 2]\n\nCurrent state: [X] FTEs, [Y] open positions',
      currentState: 'Team currently at capacity with:\n- [X] projects in flight\n- [Y] hours overtime per week\n- [Z] missed commitments this quarter\n\nImpact of understaffing:\n- [Quantified impact]',
      proposedChange: 'Request: [X] new headcount\n\nBreakdown:\n- [Role 1]: [X] FTEs - $[cost]\n- [Role 2]: [X] FTEs - $[cost]\n\nTotal investment: $[annual cost]',
      alternatives: '1. Do nothing: Risk of [consequences]\n2. Contractors: Higher cost ($[X] vs $[Y]), knowledge transfer issues\n3. Automation: [X] months to build, only addresses [subset]\n\nRecommendation: Full-time hires for sustainable capacity',
      roi: 'Payback period: [X] months\nFirst year ROI: [X]%\n\nValue delivered:\n- [Quantified outcome 1]\n- [Quantified outcome 2]',
      risks: '- Hiring timeline: [X months] to full productivity; mitigate with [plan]\n- Budget constraints: Phased hiring approach if needed\n- Retention: Competitive compensation and growth path'
    }
  },
  {
    id: 'promotionJustification',
    name: 'Promotion Case',
    icon: '📈',
    description: 'Justify a promotion',
    fields: {
      title: 'Promotion Justification: [Name] to [Level]',
      documentType: 'promotion',
      context: 'Candidate: [Name]\nCurrent level: [Level]\nTime in role: [X years/months]\nProposed level: [New level]',
      currentState: '[Name] has been performing at [next level] for [duration].\n\nKey evidence:\n- [Achievement 1]\n- [Achievement 2]\n- [Achievement 3]',
      proposedChange: 'Promote [Name] to [Level] effective [date].\n\nNew compensation:\n- Base: $[X] (current: $[Y])\n- Equity refresh: [X] shares\n- Total increase: [X]%',
      alternatives: '1. Do nothing: Risk of attrition; market rate for role is $[X]\n2. Delayed promotion: [X] months; risk candidate leaves\n3. Retention bonus without title: Doesn\'t address career progression need',
      roi: 'Retention value:\n- Cost to replace: $[X] (recruiting, ramp, lost productivity)\n- Knowledge value: [Qualitative impact]\n\nIncreased contribution:\n- Expected impact at new level: [X]',
      risks: '- Peer comparison: [Name]\'s promotion aligns with [peer] who was promoted [when]\n- Budget impact: Within compensation guidelines for level\n- Team dynamics: [Consideration and mitigation]'
    }
  },
  {
    id: 'budgetRequest',
    name: 'Budget Request',
    icon: '💰',
    description: 'Request project/tool budget',
    fields: {
      title: 'Budget Request: [Project/Tool/Initiative]',
      documentType: 'budget',
      context: 'Business need: [What problem are we solving]\n\nStrategic alignment:\n- [Company priority 1]\n- [OKR alignment]',
      currentState: 'Current approach:\n- [How we do it today]\n- [Cost/effort of current approach]\n\nLimitations:\n- [Limitation 1]\n- [Limitation 2]',
      proposedChange: 'Request: $[X] for [project/tool/initiative]\n\nBreakdown:\n- [Line item 1]: $[cost]\n- [Line item 2]: $[cost]\n- [Line item 3]: $[cost]\n\nTiming: [One-time / Recurring]',
      alternatives: '1. Build in-house: $[X], [Y] months, requires [resources]\n2. Alternative vendor: $[X], [tradeoffs]\n3. Do nothing: [Consequences]\n\nRecommendation: [Option] because [reason]',
      roi: 'Investment: $[X]\nAnnual savings/value: $[Y]\nPayback period: [Z] months\nFirst year ROI: [X]%',
      risks: '- Implementation risk: [Description]; mitigate with [plan]\n- Adoption risk: [Description]; mitigate with [plan]\n- Vendor risk: [Description]; mitigate with [plan]'
    }
  },
  {
    id: 'incidentRetro',
    name: 'Incident Retro',
    icon: '⚠️',
    description: 'Post-incident summary',
    fields: {
      title: 'Incident Retro: [Incident ID/Name]',
      documentType: 'other',
      context: 'Incident: [Brief description]\nSeverity: [Sev1/2/3]\nDuration: [X hours/minutes]\nImpact: [X] customers/users affected',
      currentState: 'Timeline:\n- [Time]: Issue detected\n- [Time]: Investigation began\n- [Time]: Root cause identified\n- [Time]: Fix deployed\n- [Time]: All-clear confirmed',
      proposedChange: 'Immediate fixes (completed):\n- [Fix 1]\n- [Fix 2]\n\nPrevention measures (requested):\n- [Action 1]: [Owner], [Date]\n- [Action 2]: [Owner], [Date]',
      alternatives: 'N/A - incident response and prevention measures required',
      roi: 'Cost of incident:\n- Revenue impact: $[X]\n- Engineering time: [X] hours\n- Customer goodwill: [Qualitative]\n\nInvestment in prevention:\n- [X] engineering hours\n- Reduces recurrence risk by [X]%',
      risks: '- Recurrence risk: [High/Medium/Low] until [action] complete\n- Detection gap: [Description]; addressed by [action]\n- Process gap: [Description]; addressed by [action]'
    }
  }
];

export function getTemplate(templateId) {
  return TEMPLATES.find(t => t.id === templateId) || null;
}

export function getAllTemplates() {
  return TEMPLATES;
}

