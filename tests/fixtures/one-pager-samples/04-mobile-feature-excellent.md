# One-Pager: Offline Mode for Mobile App

## TL;DR
Enable offline functionality for mobile app, addressing #1 customer complaint (312 support tickets/month) and reducing churn by 15% in low-connectivity markets.

## Problem
Mobile app requires constant connectivity. Users in metros, airplanes, and developing markets cannot access critical features. 312 support tickets/month cite "app doesn't work offline." 23% of churned users mention connectivity issues in exit surveys.

### Cost of Doing Nothing
- 15% excess churn in target markets = $2.8M ARR at risk
- 312 tickets/month × $12/ticket = $45K/year support cost
- Blocked expansion into Southeast Asia market ($14M TAM)

### Why Now
APAC expansion launches Q2. Southeast Asia has 40% 3G-only coverage. Competitor launched offline mode in March—we're losing head-to-head evaluations.

## Solution
Implement local SQLite database with background sync. Cache last 30 days of user data. Queue writes offline; sync when connectivity returns. Conflict resolution favors most recent change.

### Alternatives Considered
1. **Do Nothing**: Block APAC expansion; lose $14M TAM opportunity
2. **Progressive web app (PWA)**: Limited native features; 60% performance penalty
3. **Reduced offline mode (read-only)**: Addresses 50% of use cases; insufficient for power users

**Chosen**: Full offline with sync—addresses all use cases, enables APAC expansion, matches competitor parity.

## Goals/Benefits
- Reduce offline-related churn: 15% → 3% in target markets
- Eliminate offline support tickets: 312/month → 0
- Enable Southeast Asia expansion: $0 → $14M TAM addressable

## Scope

### In-Scope
- SQLite local storage (iOS + Android)
- Background sync engine
- Conflict resolution (last-write-wins)
- Offline indicator UI
- 30-day data cache

### Out-of-Scope
- Media file caching (images, videos)
- Offline analytics
- Selective sync configuration
- Desktop/web offline mode

## Success Metrics
| Metric | Baseline | Target | Timeframe |
|--------|----------|--------|-----------|
| Offline support tickets | 312/month | <20/month | 60 days |
| Churn in low-connectivity markets | 15% | 3% | 90 days |
| App store rating | 3.8 | 4.3 | 90 days |
| APAC user activation | 0 | 50K users | Q2 launch |

## Stakeholders/Team
| Role | Person | Responsibility |
|------|--------|----------------|
| Owner | Jennifer Wu | Delivery, APAC coordination |
| iOS Lead | Brian Chen | iOS implementation |
| Android Lead | Raj Patel | Android implementation |
| Backend | Michelle Kim | Sync API, conflict resolution |
| QA | David Liu | Offline testing scenarios |

## Timeline/Milestones
- **Week 1-2**: SQLite schema, sync protocol design
- **Week 3-4**: iOS offline implementation
- **Week 5-6**: Android offline implementation
- **Week 7**: Sync engine, conflict resolution
- **Week 8**: QA, edge case testing
- **Week 9-10**: Beta rollout (1K users), iteration

## Investment/Resources
- Engineering: 4 FTE × 10 weeks = $300K
- QA contractor: $20K
- Total: $320K
- ROI: 8.8x in Year 1 (($2.8M retained + expansion value) / $320K)

## Risks/Assumptions
| Risk | Mitigation |
|------|------------|
| Data corruption on sync | Extensive edge case testing; rollback capability |
| Storage limits on devices | Configurable cache size; LRU eviction |
| Battery drain from sync | Batch sync on WiFi; configurable sync frequency |

**Assumptions**: Users accept last-write-wins conflict resolution. 30-day cache sufficient for 95% of users. SQLite performs adequately at scale.

## Decision Needed
Approve $320K investment and 4 FTE allocation for 10-week sprint starting February 1.

