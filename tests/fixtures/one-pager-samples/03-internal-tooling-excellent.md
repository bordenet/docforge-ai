# One-Pager: Developer Productivity Dashboard

## TL;DR
Build unified developer metrics dashboard aggregating deployment, incident, and PR data, reducing engineering manager overhead by 6 hours/week and enabling data-driven team health decisions.

## Problem
Engineering managers spend 6.2 hours/week manually collecting metrics from 7 different tools (GitHub, PagerDuty, Jira, DataDog, CircleCI, Slack, Confluence). No single view of team health. Inconsistent methodology leads to unfair performance comparisons across teams.

### Cost of Doing Nothing
- 6.2 hrs/week × 24 managers × $85/hr = $656K/year in manager time
- Delayed incident response due to fragmented visibility
- Manager burnout contributing to 2 departures in Q3 (replacement cost: $120K each)

### Why Now
Annual planning starts in 6 weeks—leadership needs consistent team velocity data. New VP of Engineering requires DORA metrics for board reporting. Build now to influence headcount decisions.

## Solution
Unified dashboard pulling data from existing tools via APIs. Display DORA metrics (deployment frequency, lead time, MTTR, change failure rate) plus custom team health indicators. Self-service for managers; automated weekly reports.

### Alternatives Considered
1. **Do Nothing**: Continue manual collection; $656K/year opportunity cost
2. **Buy LinearB/Jellyfish**: $180K/year SaaS; limited customization; data leaves our systems
3. **Spreadsheet automation**: Partial solution; still requires manual aggregation

**Chosen**: Internal dashboard—one-time build, full customization, data stays internal, integrates with existing auth.

## Goals/Benefits
- Reduce manager overhead: 6.2 hrs/week → 0.5 hrs/week (baseline → target)
- Enable DORA metrics reporting for board
- Standardize team comparison methodology

## Scope

### In-Scope
- GitHub PR metrics integration
- PagerDuty incident data
- Jira velocity metrics
- DORA metrics calculation
- Per-team and org-wide views
- Weekly email digest

### Out-of-Scope
- Individual contributor performance scoring
- Automated alerts/thresholds (Phase 2)
- Mobile app
- Historical data beyond 12 months

## Success Metrics
| Metric | Baseline | Target | Timeframe |
|--------|----------|--------|-----------|
| Manager time on metrics | 6.2 hrs/wk | 0.5 hrs/wk | 30 days post-launch |
| Dashboard adoption | 0% | 90% of managers | 60 days |
| Data freshness | 7 days (manual) | Real-time | Launch |
| Manager satisfaction (survey) | 2.1/5 | 4.0/5 | 90 days |

## Stakeholders/Team
| Role | Person | Responsibility |
|------|--------|----------------|
| Owner | Kevin Park | Delivery, manager feedback |
| Tech Lead | Priya Sharma | Architecture, integrations |
| Product | Alex Thompson | Requirements, UX |
| VP Engineering | Christine Lee | Executive sponsor |
| HR/People | Natalie Chen | Privacy review |

## Timeline/Milestones
- **Week 1**: API integration design, privacy review
- **Week 2-3**: Data pipeline, GitHub/PagerDuty integration
- **Week 4**: Dashboard UI, DORA calculations
- **Week 5**: Jira integration, email reports
- **Week 6**: Beta rollout (5 managers), iteration

## Investment/Resources
- Engineering: 2 FTE × 6 weeks = $90K
- Infrastructure (data warehouse): $5K/year
- Total: $95K
- ROI: 6.9x in Year 1 ($656K savings / $95K investment)

## Risks/Assumptions
| Risk | Mitigation |
|------|------------|
| API rate limits | Implement caching, nightly batch sync |
| Manager resistance | Involve 3 managers in design phase |
| Privacy concerns | Anonymize individual data; show team aggregates only |

**Assumptions**: All teams use GitHub, PagerDuty, and Jira. Managers want visibility, not surveillance. DORA metrics are accepted industry standard.

## Decision Needed
Approve $95K investment and 2 FTE allocation for 6-week sprint starting next Monday.

