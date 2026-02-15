# One-Pager: Engineering On-Call Rotation Redesign

## TL;DR
Restructure on-call rotations to reduce burnout and improve incident response times.

## Problem
Current on-call model has engineers covering 7-day rotations alone. Burnout is high—3 engineers quit citing on-call burden in exit interviews. Average incident response time is 12 minutes during off-hours due to alert fatigue (847 alerts/week, only 12% actionable).

### Cost of Doing Nothing
Continued attrition will cost $120K per departure (recruiting + ramp-up). Customer SLA breaches are increasing—2 last quarter resulted in $45K in credits. Team morale scores at 2.3/5.

## Solution
Implement follow-the-sun rotation with regional teams. Create tiered alerting—L1 automated, L2 on-call, L3 escalation. Reduce alert noise through alert consolidation and runbook automation.

### Alternatives Considered
1. **Do Nothing**: Accept attrition and SLA risk; unacceptable
2. **Hire dedicated SRE team**: $400K/year; 6-month hiring timeline
3. **Outsource to PagerDuty Managed**: $180K/year; lose tribal knowledge

**Chosen**: Internal rotation redesign—fastest, lowest cost, retains expertise.

## Goals/Benefits
- Reduce on-call burden: 168 hrs/rotation → 40 hrs/rotation
- Improve response time: 12 min → 5 min
- Reduce alert noise: 847/week → <200/week

## Scope

### In-Scope
- Rotation schedule redesign
- Alert consolidation and tuning
- Runbook automation for L1 alerts
- On-call compensation policy update

### Out-of-Scope
- New monitoring infrastructure
- Cross-team on-call sharing
- Weekend/holiday coverage policy

## Success Metrics
| Metric | Current | Target |
|--------|---------|--------|
| Alerts per week | 847 | <200 |
| Response time | 12 min | 5 min |
| On-call hours per rotation | 168 | 40 |
| Team morale score | 2.3/5 | 4.0/5 |

## Stakeholders
- Owner: Engineering Manager
- HR: Compensation policy
- SRE: Alert tuning
- Legal: On-call compensation compliance

## Timeline
- Week 1: Alert audit and consolidation plan
- Week 2-3: Alert tuning and runbook creation
- Week 4: New rotation rollout
- Week 5: Feedback and iteration

## Investment
- Engineering time: 1 FTE × 5 weeks for automation
- On-call compensation increase: $15K/year additional

## Risks
- Coverage gaps during transition: Overlap old and new rotations for 1 week
- Alert tuning may miss critical alerts: Conservative approach; add back as needed

