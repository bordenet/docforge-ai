/**
 * Templates for PR-FAQ (Amazon-style)
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
    id: 'customerProduct',
    name: 'Customer Product',
    icon: '🛍️',
    description: 'Customer-facing product launch',
    fields: {
      title: 'New Customer Product',
      problem: 'Customers today struggle with [specific pain point] when trying to [accomplish goal].\n\nThis results in:\n- [Negative outcome 1]\n- [Negative outcome 2]\n- [Quantified impact]',
      solution: '[Company] announces [Product Name], a [category] that [core value proposition].\n\nKey capabilities:\n- [Capability 1]\n- [Capability 2]\n- [Capability 3]',
      customerQuote: '"Before [Product], I spent [time/effort] on [task]. Now I can [benefit] in [fraction of time]. It\'s changed how I [activity]." - [Customer Name], [Title] at [Company]',
      internalFaq: '- How long will development take?\n- What is the total investment required?\n- How does this fit with our current product strategy?\n- What are the main technical risks?\n- How will we measure success?',
      metrics: '- Customer adoption: [X] users in first [timeframe]\n- Revenue impact: $[X] in first year\n- Customer satisfaction: [X] NPS\n- Retention improvement: [X]%'
    }
  },
  {
    id: 'internalPlatform',
    name: 'Internal Platform',
    icon: '🏗️',
    description: 'Internal tool or platform',
    fields: {
      title: 'Internal Platform Launch',
      problem: 'Teams currently spend [X hours/week] on [manual process], leading to:\n- Inconsistent [outcomes]\n- Delayed [deliverables]\n- [Quantified productivity loss]',
      solution: '[Platform Name] is an internal platform that enables teams to [core capability].\n\nFeatures:\n- [Feature 1]: [Benefit]\n- [Feature 2]: [Benefit]\n- [Feature 3]: [Benefit]',
      customerQuote: '"[Platform] has transformed how our team operates. What used to take [old time] now takes [new time], and the quality is more consistent." - [Name], [Team]',
      internalFaq: '- Who will maintain this platform?\n- How will we handle onboarding?\n- What is the migration path from current tools?\n- What is the cost of development vs. buy?\n- How will we measure adoption?',
      metrics: '- Time saved: [X] hours/week per team\n- Adoption: [X]% of target teams in [timeframe]\n- Error reduction: [X]%\n- Developer satisfaction: [X] score'
    }
  },
  {
    id: 'processInitiative',
    name: 'Process Initiative',
    icon: '⚙️',
    description: 'Process or policy change',
    fields: {
      title: 'Process Initiative Announcement',
      problem: 'Current [process/policy] creates friction:\n- [Pain point 1]\n- [Pain point 2]\n\nImpact: [Quantified business impact]',
      solution: '[Company] introduces [Initiative Name], a new approach to [area] that [key change].\n\nKey changes:\n- [Change 1]\n- [Change 2]\n- [Change 3]',
      customerQuote: '"The new [process] is so much simpler. I no longer have to [old pain point], and I can focus on [value-add activity]." - [Name], [Role]',
      internalFaq: '- How will this affect existing workflows?\n- What training is required?\n- How will we handle exceptions?\n- What is the rollout timeline?\n- How will we communicate changes?',
      metrics: '- Process time reduction: [X]%\n- Compliance rate: [X]%\n- Employee satisfaction: [X] improvement\n- Cost savings: $[X] annually'
    }
  }
];

export function getTemplate(templateId) {
  return TEMPLATES.find(t => t.id === templateId) || null;
}

export function getAllTemplates() {
  return TEMPLATES;
}

