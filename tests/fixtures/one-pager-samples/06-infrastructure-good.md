# One-Pager: Database Migration to PostgreSQL

## TL;DR
Migrate from MySQL 5.7 to PostgreSQL 15 to address scaling limitations and reduce licensing costs.

## Problem
MySQL 5.7 reaches end-of-life in October. Current database struggles with complex queries—p99 latency exceeds 2 seconds during peak load. Replication lag causes data inconsistency in read replicas.

### Cost of Doing Nothing
MySQL 5.7 EOL means no security patches. Performance degradation will worsen as data grows. Estimated 3 customer-impacting incidents per quarter based on current trajectory.

## Solution
Migrate to PostgreSQL 15 using AWS DMS for minimal downtime. Implement connection pooling with PgBouncer. Optimize queries for PostgreSQL-specific features (JSONB, parallel queries).

### Alternatives Considered
1. **Upgrade to MySQL 8**: Still has licensing costs; doesn't address query limitations
2. **Aurora PostgreSQL**: Faster but $120K/year additional cost

**Chosen**: Self-managed PostgreSQL on EC2—best balance of cost and performance.

## Goals/Benefits
- Address MySQL EOL security risk
- Reduce p99 query latency from 2s to 500ms
- Eliminate replication lag issues

## Scope

### In-Scope
- Schema migration for all production tables
- Query optimization for top 50 slow queries
- Connection pooling setup
- Runbook documentation

### Out-of-Scope
- Application code changes beyond connection strings
- Analytics database migration
- Read replica geographic distribution

## Success Metrics
| Metric | Current | Target |
|--------|---------|--------|
| p99 latency | 2000ms | 500ms |
| Replication lag | 30s | <1s |
| Query timeouts/day | 47 | <5 |

## Stakeholders
- Owner: Database Team
- Engineering: Backend Team
- Operations: SRE Team

## Timeline
- Week 1-2: Schema migration scripts
- Week 3-4: Data migration testing
- Week 5: Production cutover (weekend)
- Week 6: Monitoring and optimization

## Investment
- Engineering: 2 FTE × 6 weeks
- AWS costs: Neutral (replacing MySQL RDS with PostgreSQL RDS)

## Risks
- Data migration errors: Mitigate with extensive testing
- Application compatibility: Test all queries beforehand
- Downtime during cutover: Schedule for low-traffic weekend

