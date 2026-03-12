/**
 * Business Justification Form Data Fixture
 * Field IDs match plugins/business-justification/config.js formFields.
 */

export default {
  title: 'Customer Support Automation Platform Investment',
  documentType: 'investment-request',
  context:
    'Our customer support team handles 5,000+ tickets per month with an average ' +
    'response time of 4 hours. Support costs have grown 40% YoY while customer ' +
    'satisfaction has declined. Competitors are offering 24/7 instant support.',
  currentState:
    'Support is handled by a team of 15 agents using Zendesk. Agents manually ' +
    'categorize tickets, search knowledge base articles, and draft responses. ' +
    'Current CSAT score is 72%, target is 85%.',
  proposedChange:
    'Implement AI-powered support automation that can auto-categorize tickets, ' +
    'suggest responses to agents, and handle tier-1 queries autonomously. ' +
    'This will reduce response time by 60% and allow agents to focus on complex issues.',
  alternatives:
    'Option 1: Hire 5 more agents ($400K/year). ' +
    'Option 2: Outsource tier-1 support ($250K/year). ' +
    'Option 3: This proposal - AI automation ($180K one-time + $50K/year).',
  roi:
    'Year 1: -$230K (investment + first year). Years 2-3: +$150K/year savings. ' +
    '3-year NPV: +$70K. Additional value: Improved CSAT (projected +13 points), ' +
    '24/7 coverage, scalability for growth.',
  risks:
    'AI accuracy may not meet expectations initially (mitigated by human-in-loop). ' +
    'Agent resistance to new tools (mitigated by change management program). ' +
    'Vendor lock-in (mitigated by contractual data portability clause).',
};

