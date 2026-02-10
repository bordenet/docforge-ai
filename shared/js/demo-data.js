/**
 * Demo Data - Sample outputs for demonstration without LLM API keys
 * @module demo-data
 */

/**
 * Sample form data for one-pager demo
 */
export const onePagerFormData = {
  projectName: 'Smart Home Energy Monitor',
  problemStatement: 'Homeowners waste 20-30% of their energy due to lack of visibility into consumption patterns. Existing solutions are either too expensive or too complex for average users.',
  targetAudience: 'Environmentally-conscious homeowners aged 30-55 who want to reduce energy bills and carbon footprint without technical expertise.',
  proposedSolution: 'A plug-and-play device that connects to the electrical panel and provides real-time energy insights via a mobile app, with AI-powered recommendations for reducing consumption.',
  keyBenefits: '1. Reduce energy bills by 15-25%\n2. Easy 10-minute installation\n3. Personalized recommendations\n4. Carbon footprint tracking',
  successMetrics: '- 50,000 units sold in Year 1\n- Average customer saves $300/year\n- 4.5+ star app rating\n- 80% monthly active users',
  timeline: 'Q1: Hardware finalization\nQ2: Beta testing with 500 homes\nQ3: Public launch\nQ4: Expand to commercial buildings',
  resourcesNeeded: '- $2M seed funding\n- 5 engineers (2 hardware, 3 software)\n- Manufacturing partner\n- UL certification'
};

/**
 * Sample Phase 1 output (Claude)
 */
export const onePagerPhase1Output = `# Smart Home Energy Monitor - One-Pager

## Executive Summary

The Smart Home Energy Monitor addresses a critical gap in residential energy management. With homeowners wasting 20-30% of their energy due to poor visibility, our solution provides an accessible, affordable path to significant savings.

## Problem

Homeowners lack real-time visibility into their energy consumption patterns. Current solutions fall into two categories:
- **Professional-grade systems**: $500+ installation, require electrician
- **Smart plugs**: Only monitor individual devices, miss 70% of consumption

This gap leaves the average homeowner unable to identify waste or optimize usage.

## Solution

A plug-and-play monitoring device that:
1. Clips onto the electrical panel (no electrician needed)
2. Connects via WiFi to our mobile app
3. Uses AI to identify appliances and patterns
4. Provides actionable recommendations

## Target Market

- **Primary**: Homeowners aged 30-55
- **Characteristics**: Environmentally conscious, tech-comfortable, own home
- **Market size**: 45M US households

## Key Benefits

| Benefit | Impact |
|---------|--------|
| Energy savings | 15-25% reduction |
| Installation | 10 minutes, DIY |
| Insights | AI-powered recommendations |
| Tracking | Carbon footprint dashboard |

## Success Metrics

- 50,000 units sold in Year 1
- Average customer saves $300/year
- 4.5+ star app rating
- 80% monthly active users

## Timeline

| Quarter | Milestone |
|---------|-----------|
| Q1 | Hardware finalization |
| Q2 | Beta testing (500 homes) |
| Q3 | Public launch |
| Q4 | Commercial expansion |

## Resources Required

- $2M seed funding
- Team: 2 hardware + 3 software engineers
- Manufacturing partner (Shenzhen)
- UL/FCC certification

## Next Steps

1. Finalize hardware design by end of month
2. Begin manufacturing partner negotiations
3. Start beta user recruitment
`;

/**
 * Sample Phase 2 output (Gemini - Adversarial Review)
 */
export const onePagerPhase2Output = `# Adversarial Review: Smart Home Energy Monitor

## Overall Assessment: 72/100

The one-pager presents a compelling vision but has several gaps that need addressing before investor presentation.

## Strengths

1. **Clear problem statement** - The 20-30% waste figure is well-documented
2. **Differentiated solution** - DIY installation is a genuine advantage
3. **Reasonable metrics** - 50K units in Y1 is achievable

## Critical Gaps

### 1. Competitive Landscape (Missing)
No mention of Sense, Emporia, or Neurio. These are direct competitors with established products. How do you differentiate beyond "easier installation"?

### 2. Unit Economics (Unclear)
- What's the target retail price?
- What's the manufacturing cost?
- What's the customer acquisition cost?

### 3. Technical Feasibility Questions
- How does the AI identify individual appliances from aggregate data?
- What's the accuracy rate?
- Does this require machine learning training per household?

### 4. Go-to-Market Strategy (Vague)
"Public launch" in Q3 tells us nothing about:
- Distribution channels (DTC? Retail? Utility partnerships?)
- Marketing strategy
- Pricing strategy

## Recommendations

1. Add competitive analysis section
2. Include unit economics breakdown
3. Specify distribution strategy
4. Address technical accuracy claims with data

## Questions for Leadership

1. Why will customers choose this over Sense ($299, established)?
2. What's the path to profitability?
3. How defensible is the technology?
`;

/**
 * Sample Phase 3 output (Claude - Final Synthesis)
 */
export const onePagerPhase3Output = `# Smart Home Energy Monitor - Final One-Pager (v2)

## Executive Summary

The Smart Home Energy Monitor democratizes home energy management with a $149 plug-and-play device that delivers 15-25% energy savings. Unlike competitors requiring professional installation, our 10-minute DIY setup opens the market to 45M US households.

## Problem & Opportunity

Homeowners waste 20-30% of energy due to invisible consumption patterns. Existing solutions fail:
- **Sense/Emporia** ($299-$499): Require electrician, complex setup
- **Smart plugs**: Only monitor individual devices

**Our opportunity**: The "good enough" segment—users who want insights without complexity.

## Solution

Clip-on device + mobile app with AI-powered insights:
- 10-minute DIY installation
- 85% appliance identification accuracy
- Personalized saving recommendations
- Carbon footprint tracking

## Competitive Advantage

| Feature | Us | Sense | Emporia |
|---------|-----|-------|---------|
| Price | $149 | $299 | $499 |
| Installation | DIY | Electrician | Electrician |
| Accuracy | 85% | 90% | 88% |
| App rating | TBD | 3.8 | 4.1 |

**Positioning**: "The energy monitor for everyone"

## Unit Economics

- Retail price: $149
- COGS: $52
- Gross margin: 65%
- CAC target: $35
- LTV (subscription): $180

## Go-to-Market

**Phase 1 (Q3)**: Direct-to-consumer via website + Amazon
**Phase 2 (Q4)**: Utility partnerships (rebate programs)
**Phase 3 (Y2)**: Retail (Home Depot, Lowe's)

## Success Metrics

- 50,000 units in Year 1 ($7.5M revenue)
- 65% gross margin
- 80% MAU retention
- 4.5+ app store rating

## Team & Resources

- $2M seed round (closing)
- 5 engineers hired
- Manufacturing: Foxconn subsidiary
- Certifications: UL/FCC in progress

## Ask

Seeking strategic partners in:
1. Utility rebate programs
2. Smart home ecosystem integration
3. Series A introduction

---
*Document generated with DocForgeAI • Reviewed and refined through 3-phase process*
`;

/**
 * Get demo data for a document type
 * @param {string} docType - Document type ID
 * @returns {Object} Demo data with formData and phase outputs
 */
export function getDemoData(docType) {
  if (docType === 'one-pager') {
    return {
      formData: onePagerFormData,
      phases: {
        1: onePagerPhase1Output,
        2: onePagerPhase2Output,
        3: onePagerPhase3Output
      }
    };
  }
  // Return null for other doc types (not yet implemented)
  return null;
}

/**
 * Check if demo data is available for a document type
 * @param {string} docType - Document type ID
 * @returns {boolean}
 */
export function hasDemoData(docType) {
  return docType === 'one-pager';
}

