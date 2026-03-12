/**
 * Phase Output Fixtures
 *
 * Mock outputs for Phase 1 and Phase 2 to test Phase 2 and Phase 3 prompts.
 * These are generic outputs that work across document types.
 */

/**
 * Generic Phase 1 output (Claude's initial draft)
 * Used as previousResponses[1] when testing Phase 2 prompts
 */
export const genericPhase1Output = `# Document Title

## Executive Summary

This document addresses a critical business need that has emerged from extensive user research and market analysis. The proposed solution balances technical feasibility with business value, targeting a phased rollout over the next two quarters.

## Problem Statement

The core issue we're addressing stems from limitations in our current approach. Users have consistently reported friction points that impact productivity and satisfaction. Quantitative analysis shows a 35% drop in key metrics over the past six months, directly attributable to these limitations.

## Proposed Solution

Our recommended approach involves three key components:

1. **Component A**: Addresses the primary user pain point with minimal technical risk
2. **Component B**: Enables scalability for future growth
3. **Component C**: Provides the analytics foundation for continuous improvement

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Primary KPI | Baseline | +40% improvement |
| Secondary KPI | Baseline | +25% improvement |
| User satisfaction | 3.2/5 | 4.5/5 |

## Timeline

- **Phase 1**: Foundation (4 weeks)
- **Phase 2**: Core functionality (6 weeks)  
- **Phase 3**: Polish and launch (2 weeks)

## Risks and Mitigations

1. **Technical risk**: New technology stack may require additional training
   - *Mitigation*: Allocate 20% buffer time for learning curve

2. **Resource risk**: Key team members have competing priorities
   - *Mitigation*: Secure executive commitment for dedicated allocation

## Next Steps

1. Secure stakeholder approval for Phase 1 budget
2. Finalize technical architecture decisions
3. Begin sprint planning for first milestone
`;

/**
 * Generic Phase 2 output (Gemini's critique)
 * Used as previousResponses[2] when testing Phase 3 prompts
 */
export const genericPhase2Output = `## Critical Review: Document Assessment

### Overall Assessment: NEEDS IMPROVEMENT

The draft provides a solid foundation but has several areas requiring attention before stakeholder review.

### Strengths

1. **Clear problem articulation**: The problem statement effectively quantifies the business impact
2. **Structured approach**: The three-component solution is logically organized
3. **Measurable success criteria**: KPIs are specific and time-bound

### Areas for Improvement

#### 1. Executive Summary (Priority: High)
The executive summary is too brief and doesn't capture the strategic importance. Expand to include:
- Business context and urgency
- Expected ROI or value delivered
- Key decision points for stakeholders

#### 2. Risk Assessment (Priority: High)
The risk section is superficial. Missing:
- Competitive risks if we delay
- Dependency risks on third-party vendors
- Data security and compliance considerations

#### 3. Resource Requirements (Priority: Medium)
No mention of:
- Team composition and skill requirements
- Budget breakdown by phase
- External vendor or contractor needs

#### 4. Success Metrics (Priority: Medium)
While metrics are defined, there's no:
- Baseline measurement methodology
- Interim milestones for early warning
- Rollback criteria if targets aren't met

### Specific Recommendations

1. Add a "Why Now" section explaining urgency
2. Include competitive analysis table
3. Expand timeline with dependencies and critical path
4. Add stakeholder RACI matrix
5. Include glossary for technical terms

### Suggested Structural Changes

Consider reorganizing to follow the company's standard document template:
1. Executive Summary (1 page max)
2. Problem & Opportunity
3. Proposed Solution (with alternatives considered)
4. Resource Requirements
5. Timeline & Milestones
6. Risks & Mitigations
7. Success Criteria
8. Appendices

### Final Verdict

**Revision Required**: Address high-priority items before stakeholder circulation. Estimated revision effort: 2-3 hours.
`;

export default {
  phase1: genericPhase1Output,
  phase2: genericPhase2Output,
};

