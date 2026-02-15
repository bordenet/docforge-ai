# One-Pager: Real-Time Analytics Pipeline

## TL;DR
Replace batch analytics with real-time streaming pipeline, reducing data latency from 24 hours to 30 seconds, enabling same-day campaign optimization worth $3.1M annually.

## Problem
Marketing analytics run on 24-hour batch cycles. Campaign performance data arrives next day. Marketing team cannot optimize underperforming campaigns until $47K average is already spent. A/B tests require 48+ hours for statistical significance.

### Cost of Doing Nothing
- $47K/day average wasted on underperforming campaigns × 65 campaign days/year = $3.1M/year
- Marketing team manually polls dashboards (3 hrs/day)
- Competitor campaigns react in real-time; we lose share-of-voice

### Why Now
Holiday campaign season starts in 8 weeks ($12M budget). Real-time optimization could save $800K in Q4 alone. Current batch infrastructure EOL in 6 months—rebuild required regardless.

## Solution
Implement Apache Kafka streaming pipeline with Apache Flink for real-time aggregations. Replace nightly batch ETL with continuous streaming. Maintain existing dashboard UIs; update data sources only.

### Alternatives Considered
1. **Do Nothing**: Continue batch; $3.1M/year waste; infrastructure EOL forces action
2. **Reduce batch to hourly**: Incremental improvement; still 60-minute lag; not competitive
3. **Managed service (Snowflake Streaming)**: $240K/year; vendor lock-in; same 30-second latency

**Chosen**: Self-managed Kafka/Flink—lower TCO at our scale, existing team expertise, infrastructure refresh already required.

## Goals/Benefits
- Reduce data latency: 24 hours → 30 seconds
- Enable same-day campaign optimization: $3.1M annual savings
- Reduce marketing manual monitoring: 3 hrs/day → 0.5 hrs/day

## Scope

### In-Scope
- Kafka cluster (3 brokers)
- Flink streaming jobs for core metrics
- Event ingestion from web/mobile/server
- Real-time dashboard data sources
- Alerting for metric thresholds

### Out-of-Scope
- Historical backfill (batch continues for historical)
- Machine learning feature pipelines
- Cross-platform attribution modeling
- Data warehouse replacement

## Success Metrics
| Metric | Baseline | Target | Timeframe |
|--------|----------|--------|-----------|
| Data latency | 24 hours | 30 seconds | Launch |
| Campaign optimization cycles/day | 1 | 12 | 30 days |
| Wasted campaign spend | $47K/day | $8K/day | 60 days |
| Marketing monitoring time | 3 hrs/day | 0.5 hrs/day | 30 days |

## Stakeholders/Team
| Role | Person | Responsibility |
|------|--------|----------------|
| Owner | Chris Anderson | Delivery, architecture |
| Data Engineer Lead | Lisa Park | Kafka/Flink implementation |
| Marketing Analytics | Tom Wilson | Requirements, validation |
| Platform/SRE | Nina Gupta | Infrastructure, operations |
| CFO Office | Mark Stevens | Cost tracking |

## Timeline/Milestones
- **Week 1-2**: Kafka cluster setup, event schema design
- **Week 3-4**: Event ingestion pipeline (web/mobile)
- **Week 5-6**: Flink streaming aggregations
- **Week 7**: Dashboard integration, alerting
- **Week 8**: Production cutover, monitoring

## Investment/Resources
- Engineering: 3 FTE × 8 weeks = $180K
- Infrastructure (Kafka cluster): $48K/year
- Total Year 1: $228K
- ROI: 13.6x in Year 1 ($3.1M savings / $228K investment)

## Risks/Assumptions
| Risk | Mitigation |
|------|------------|
| Data loss during cutover | Run parallel for 2 weeks; validate counts |
| Flink job failures | Dead-letter queue; manual replay capability |
| Event schema changes | Schema registry with compatibility checks |

**Assumptions**: Existing Kafka expertise on team. Dashboard UIs can consume new data sources. Marketing accepts 30-second latency as "real-time."

## Decision Needed
Approve $228K investment and 3 FTE allocation for 8-week sprint starting September 15.

