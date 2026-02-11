/**
 * Templates for Power Statement
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
    id: 'saasProduct',
    name: 'SaaS Product',
    icon: '☁️',
    description: 'B2B SaaS positioning',
    fields: {
      customerType: 'enterprise',
      problem: '[Target customer type] teams waste [X hours/week] on [manual process] because current solutions [limitation].\n\nThis results in:\n- [Negative outcome 1]\n- [Negative outcome 2]\n- [Quantified business impact]',
      solution: '[Product] is the only [category] that [unique capability], enabling teams to [key benefit] without [common pain point].\n\nHow it works:\n1. [Step 1]\n2. [Step 2]\n3. [Step 3]',
      differentiation: 'Unlike [Competitor A] that [limitation], and [Competitor B] that [different limitation], [Product] is the only solution that [unique value].\n\nKey differentiators:\n- [Differentiator 1]\n- [Differentiator 2]',
      proofPoints: '- [Customer A] reduced [metric] by [X]% in [timeframe]\n- [Customer B] saved $[X] annually\n- [X] companies trust [Product]\n- [Industry award/recognition]',
      objections: '"It seems expensive" → ROI typically achieved in [X months]; [Customer] saw [X]x return\n\n"We already have [alternative]" → [Product] integrates with [alternative] and adds [capability]\n\n"Implementation seems complex" → Average onboarding is [X days/weeks]'
    }
  },
  {
    id: 'b2bService',
    name: 'B2B Service',
    icon: '🤝',
    description: 'Professional services positioning',
    fields: {
      customerType: 'enterprise',
      problem: '[Target companies] struggle to [achieve goal] because they lack [capability/expertise].\n\nTypical symptoms:\n- [Symptom 1]\n- [Symptom 2]\n- [Business impact]',
      solution: '[Service] provides [category] expertise that helps companies [achieve outcome].\n\nOur approach:\n- [Methodology element 1]\n- [Methodology element 2]\n- [Methodology element 3]',
      differentiation: 'While most [service providers] offer [generic approach], we specialize in [specific area] with [unique methodology].\n\nWhat sets us apart:\n- [Differentiator 1]\n- [Differentiator 2]',
      proofPoints: '- Helped [X] companies achieve [outcome]\n- Average client sees [X]% improvement in [metric]\n- [Industry recognition]\n- Team has [X] years combined experience in [domain]',
      objections: '"We can do this internally" → Our clients typically see [X]x faster results; we bring [specialized expertise]\n\n"How do we measure ROI?" → We establish [metrics] at project start; typical client sees [outcome]\n\n"We\'ve tried consultants before" → Our [methodology] ensures [accountability measure]'
    }
  },
  {
    id: 'consumerProduct',
    name: 'Consumer Product',
    icon: '🛒',
    description: 'D2C product positioning',
    fields: {
      customerType: 'consumer',
      problem: '[Target consumers] are frustrated with [current options] because [limitation].\n\nCommon complaints:\n- [Pain point 1]\n- [Pain point 2]\n- [Emotional impact]',
      solution: '[Product] is the first [category] designed specifically for [target audience] who [behavior/need].\n\nWhat makes it different:\n- [Feature/benefit 1]\n- [Feature/benefit 2]\n- [Feature/benefit 3]',
      differentiation: 'Traditional [products] are designed for [mass market]. [Product] is built from the ground up for [specific audience] with [specific needs].\n\nKey differences:\n- [Difference 1]\n- [Difference 2]',
      proofPoints: '- [X] 5-star reviews\n- Featured in [Publication]\n- [X]% of customers reorder within [timeframe]\n- [Influencer/celebrity] endorsement',
      objections: '"It\'s more expensive than [alternative]" → [Product] lasts [X]x longer / delivers [X]x the value\n\n"I\'m not sure it will work for me" → [Guarantee/trial offer]; [X]% satisfaction rate\n\n"I\'ve never heard of you" → Founded by [credibility]; trusted by [X] customers'
    }
  },
  {
    id: 'internalTool',
    name: 'Internal Tool',
    icon: '🔧',
    description: 'Internal stakeholder pitch',
    fields: {
      customerType: 'other',
      problem: 'Our [team/department] currently [inefficient process], costing us:\n- [X] hours per week\n- $[X] in [lost productivity/errors]\n- [Qualitative impact on team]',
      solution: '[Tool/Initiative] will [core capability], enabling our team to [key benefit].\n\nCapabilities:\n- [Capability 1]\n- [Capability 2]\n- [Capability 3]',
      differentiation: 'Unlike [current approach/tool], [Tool] is designed specifically for our [specific context/workflow].\n\nAdvantages:\n- [Advantage 1]\n- [Advantage 2]',
      proofPoints: '- [Other team/company] implemented similar solution with [X]% improvement\n- Pilot with [subset] showed [results]\n- Estimated payback period: [X months]\n- Aligns with [strategic initiative]',
      objections: '"We don\'t have budget" → ROI analysis shows [X]x return in [timeframe]\n\n"Team is too busy to adopt new tool" → Phased rollout; [X] hours training investment\n\n"What if it doesn\'t work?" → [Pilot plan]; [rollback strategy]'
    }
  }
];

export function getTemplate(templateId) {
  return TEMPLATES.find(t => t.id === templateId) || null;
}

export function getAllTemplates() {
  return TEMPLATES;
}

