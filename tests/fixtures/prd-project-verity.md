# Product Requirements Document: Vertical Authority Ranking (Project Verity)

## 1. Executive Summary

Google Search ranking quality in specialized verticals (Medical, Legal, Financial) has stagnated despite 40% content growth over 18 months. Users abandon 28% of vertical searches within 2 minutes due to low-quality results. Project Verity introduces a Vertical Authority Signal into the primary ranking engine, weighting content based on verifiable creator credentials and peer-validated publication history. Target: reduce query re-refinement rate from 34% to 26% and decrease quality-related support tickets by 40% within 6 months of launch.

## 2. Problem Statement

### 2.1 Current State

The current ranking engine over-indexes on Link Authority and Freshness, allowing high-traffic SEO blogs to outrank credentialed experts in specialized domains.

- **Support Data (Q4 2024):** 1,247 complaints about irrelevant medical results; 892 complaints about legal results; 87% cite "too many non-expert sources in top results"
- **User Behavior (Mixpanel):** 34% of users refine queries within 60 seconds; 18% abandon entirely (vs. 12% in general search)
- **Revenue Risk (Salesforce CRM):** 12 enterprise customers initiated Bing pilots citing "low vertical relevance"

### 2.2 Impact

- **User Exposure:** 2.4M MAUs across Medical, Legal, and Financial verticals currently exposed to unverified expert advice
- **Operational Cost:** $2.4M annual support spend addressing "irrelevant result" complaints
- **Business Risk:** $1.8B vertical search advertising revenue at risk from 3% potential migration to alternatives

## 3. Value Proposition

### 3.1 Value to Customers/Users

- **Trust on First Click:** Increase probability of finding credentialed expert in top 3 results from 47% to 72%
- **Time Savings:** Reduce median vertical search session time from 4.2 minutes to 3.6 minutes (14% reduction)
- **Safety:** Reduce exposure to non-credentialed medical/legal advice in top 5 results by 80%

### 3.2 Value to Google

- **Revenue Protection:** Defend $1.8B annual vertical search advertising revenue from competitor pressure
- **Operational Efficiency:** $1.3M annual savings via 45% reduction in quality-related support tickets (from 274 to 164 tickets/month)
- **Competitive Moat:** Integration of external credentialing data creates barrier that behavior-only engines (Bing, DuckDuckGo) cannot replicate

## 4. Goals and Objectives

### 4.1 Business Goals

1. Reduce vertical search churn risk from 3% to <1% within 6 months
2. Decrease support tickets tagged "Vertical Quality" by 40% within 3 months of GA
3. Increase CTR on sponsored vertical results from 2.1% to 2.8% within 6 months

### 4.2 User Goals

1. Access expert-validated content without manually verifying author credentials
2. Reduce cognitive load when filtering high-stakes information (medical, legal, financial)
3. Find authoritative sources on first or second attempt instead of third

### 4.3 Success Metrics

| Metric | Type | Baseline | Target | Timeline | Source of Truth | Counter-Metric |
|--------|------|----------|--------|----------|-----------------|-----------------|
| **Query Re-refinement Rate** | Leading | 34% | 26% | Month 1 | Search logs | Don't suppress legitimate multi-step research (floor: 18%) |
| **Domain Authority Match** | Leading | 47% | 72% | Month 2 | Weekly quality audit | Don't penalize newer quality content (retain 15% non-credentialed) |
| **User Satisfaction Score** | Lagging | 7.2/10 | 8.1/10 | Month 6 | NPS survey (500 respondents) | — |
| **Bounce Rate (vertical queries)** | Lagging | 18% | 13% | Month 6 | Analytics pipeline | Ensure freshness (max 5% increase in stale results >24mo) |

### 4.4 Hypothesis Kill Switch

**Rollback immediately if any condition is true for 30 consecutive minutes during rollout:**

1. **Domain Authority Match fails to reach 65%** — model not identifying credentialed sources
2. **Bounce Rate increases beyond 20%** — ranking changes degraded satisfaction
3. **Support tickets increase by >10% MoM** — unintended side effects
4. **P95 latency increases beyond 150ms** — model inference too expensive

**Decision Point:** Day 30 post-launch. Review with Search Quality + Engineering leads. Rollback Plan: Disable feature flag within 4 hours; restore old ranking; conduct 2-week post-mortem.

## 5. Customer FAQ (Working Backwards)

### 5.1 External FAQ

**Q: How do I know the person writing this article is actually an expert?**

A: Our updated engine cross-references authors against official professional registries (State Medical Boards, Bar Associations, PubMed/Crossref publication history) to prioritize content written by verified professionals. For medical queries, this means board-certified physicians; for legal queries, bar-certified attorneys.

**Q: Will this hide grassroots or new perspectives?**

A: No. We prioritize experts for high-stakes advice but maintain a percentage of results for high-quality community content, ensuring diversity of perspectives while surfacing verified experts first.

**Q: How do I get started?**

A: No action required. Starting [launch date], vertical searches automatically benefit from improved ranking.

### 5.2 Customer Evidence & Research

- **Support Ticket #142587 (Jan 2024):** *"I am an oncologist. Why is a keto-blog outranking the New England Journal of Medicine for 'immunotherapy side effects'?"* — Dr. Michael Rodriguez, Oncology Research Director, Mayo Clinic
- **Customer Interviews (Nov 2024):** 11 of 12 medical professionals cited "non-credentialed sources in top results" as major frustration
- **Internal Research:** 72% of surveyed users assume Google has already verified author credentials before ranking
- **Competitive Loss Data:** 12 enterprise customers initiated Bing pilots citing vertical search quality as secondary concern (Salesforce CRM)

## 6. Competitive Landscape

### 6.1 Direct Competitors

| Competitor | What They Offer | Our Differentiation |
|------------|-----------------|---------------------|
| **Bing Search** | Basic vertical ranking via freshness signals; no credentialing layer | We layer domain-specific credentialing signals (licenses, publication history, peer-review markers); validated 15% better relevance in testing |
| **DuckDuckGo** | Privacy-first but no vertical-specific ranking | We invest in domain-specific ML models; DuckDuckGo lacks scale to build vertical models |
| **Perplexity AI** | LLM-based answer synthesis | We focus on source transparency; users prefer verified sources over LLM summaries for high-stakes queries |

### 6.2 Competitive Moat

- **Credentialing Data Pipeline:** Proprietary ingestion from 50+ state medical boards, bar associations, and peer-review databases creates defensible data asset
- **Scale Advantage:** 1.2M+ monthly domain-specific search signals enable continuous model improvement
- **Regulatory Relationships:** Established data-sharing agreements with state credentialing bodies create barriers to entry

## 7. Proposed Solution

### 7.1 Core Functionality

The new ranking model incorporates three new signals alongside existing ranking factors:

1. **Credentialing Signal:** Identifies medical licenses (state board verification), legal bar memberships, and published research history (PubMed/Crossref integration)
2. **Domain-Specific Quality Signal:** Weights peer-review status, publication venue prestige (impact factor), and author citation history
3. **Freshness Within Expertise:** For vertical queries, deprioritizes publication date if author has established domain expertise (prevents burying authoritative older content)

**Result:** Vertical search top 10 results average 72% credentialed sources (vs. 47% today).

### 7.2 Alternatives Considered

| Alternative | Rejected Because | Trade-off |
|-------------|------------------|-----------|
| Full LLM-based answer synthesis | Loss of source transparency; regulatory risk in medical/legal; 6-month timeline vs. 8-week current | Faster value for casual researchers; unsafe for professionals |
| Manual expert curation | Doesn't scale past 50 verticals; $8M annual cost | 100% accuracy; slow expansion |
| Third-party credentialing API (Doctolib) | Vendor dependency; incomplete coverage; 60+ day integration | Faster launch; less engineering effort |
| User-provided expertise ratings | Susceptible to abuse; millions of ratings needed for validity; 4-month validation | Lower infrastructure cost; unknown data quality |

**Decision:** Build in-house model using public credentialing data (state boards, bar associations, PubMed). Highest accuracy, acceptable timeline, no vendor lock-in.



### 7.3 User Experience

No visible UI change. The ranking algorithm improves silently. Users benefit from better results without understanding the mechanism. Examples:

- Medical query "breast cancer treatment options" surfaces oncologists instead of health bloggers
- Legal query "trademark law" surfaces bar-certified attorneys ahead of legal blogs

### 7.4 Key Workflows

**Workflow 1 — Medical Query:**
1. User enters "new type 2 diabetes medications"
2. Query classifier identifies as medical vertical
3. Model loads medical-specific feature weights
4. Retrieves credentialing data for top candidates; identifies 47 endocrinologists, 23 GPs, 30 health writers
5. Re-ranks to surface endocrinologists in top 5
6. Returns results; user clicks board-certified source

**Workflow 2 — Legal Query:**
1. User enters "can employer mandate vaccine?"
2. Query classifier identifies legal vertical
3. Model loads legal-specific weights
4. Retrieves bar association verification; surfaces bar-certified employment attorneys in top 3
5. De-prioritizes blog posts
6. User finds authoritative interpretation

## 8. Scope

### 8.1 In Scope

- Credentialing data pipeline from 50 state medical boards and bar associations
- PubMed and Crossref API integration for publication history
- ML ranking model with medical and legal feature sets
- A/B test against control group (50% of users) for 4 weeks
- Feature flag for gradual rollout (1% → 10% → 50% → 100%)
- Real-time monitoring for ranking quality, bounce rate, support metrics

### 8.2 Out of Scope

| Item | Rationale | Future Phase? |
|------|-----------|---------------|
| Financial vertical (stock research) | SEC regulatory complexity; defer pending legal review | Yes: Phase 2 (Month 6) |
| Multi-language support | Single-market launch (US only); international agreements required | Yes: Phase 2 (Q3) |
| User-facing "why this result" explanation | Nice-to-have; not critical for MVP | Yes: Phase 2 (Month 4) |
| Academic paper ranking (arxiv.org) | Focus on established peer-review (PubMed, Crossref) only | No: Not planned |

## 9. Requirements

### 9.1 Functional Requirements

| ID | User Story | Problem | Door | Acceptance Criteria (Success) | Acceptance Criteria (Failure) |
|----|-----------|---------|------|------------------------------|-------------------------------|
| **FR1** | As a medical researcher, I want to find results from board-certified physicians, so that I trust medical information | P1 | 🚪 One-Way | Given query "cancer treatment," 80% of top 5 authored by board-certified physicians | If >50% of top 5 are non-physicians, ranking failed |
| **FR2** | As a user, I want irrelevant results de-ranked, so that I don't waste time filtering | P2 | 🔄 Two-Way | Re-query rate drops to 26% by Month 2 | If re-query rate doesn't drop below 28%, investigate model accuracy |
| **FR3** | As a system, I must identify credentialed sources via state medical board verification, so that ranking can prioritize experts | P1 | 🚪 One-Way | Credential lookup succeeds within 500ms for 95%+ of real doctors | If lookup fails for 5%+ of real doctors, investigate data quality |
| **FR4** | As a system, I must retrieve publication history from PubMed API, so that we can weight peer-review status | P1 | 🚪 One-Way | API query returns publication count within 500ms | If API timeout >10% of requests, implement caching layer |
| **FR5** | As an engineer, I must toggle ranking changes via feature flag, so that we safely rollout to 1% → 10% → 50% → 100% | P3 | 🔄 Two-Way | Flag enabled for 1% executes only for 1% of queries | If flag not working, fallback to old ranking |

### 9.2 Non-Functional Requirements

| ID | Category | Requirement | Threshold | Measurement |
|----|----------|-------------|-----------|-------------|
| **NFR1** | Performance | Query latency overhead (p95) | <100ms additional vs. baseline | Datadog dashboard |
| **NFR2** | Performance | Ranking model inference time | <15ms per query | Staging profiling logs |
| **NFR3** | Reliability | Credentialing data service uptime | 99.95% | Automated alerts |
| **NFR4** | Reliability | Model serving availability | 99.9% | Load balancer health checks |
| **NFR5** | Scalability | Support 2.1B daily vertical queries | <150ms p95 latency at peak | Load testing results |
| **NFR6** | Security | Credentialing data access control | Only Search Ranking service can query | IAM policies, audit logs |
| **NFR7** | Compliance | HIPAA compliance for medical data | De-identify all PII in logs | Data retention + encryption policies |

### 9.3 Constraints & Dependencies

**Technical Constraints:**
- Must integrate with existing TensorFlow ranking infrastructure
- Must maintain backward compatibility with current ranking API
- Credentialing data pipeline must complete within 24 hours
- Model file size must remain <5GB

**Business & Regulatory Constraints:**
- HIPAA compliance required (no storage of patient data; only provider credentials)
- State medical board data licensing agreements required (3-month procurement for all 50 states)
- Legal review before publishing ranking methodology (2-week SLA)

**Upstream Dependencies:**
- State medical board API agreements (Legal + Data team; signed with 12 states, 38 in negotiation) — **Mitigation:** Launch with 12 states Phase 1; phase in others over 2 months
- PubMed API access approval (NIH liaison; Ready) — **Low risk**
- Feature flag infrastructure (Search Infra team; Complete) — **Low risk**

**Downstream Dependencies:**
- Search Marketing team needs blog post explaining ranking change (publish Day of launch)
- Support team needs training 2 weeks pre-launch + FAQ document
- Search Quality team needs real-time monitoring dashboard (deploy by Day -3)

## 10. User Personas

### 10.1 Dr. Sarah — Medical Professional Researcher (Primary)
- **Context:** 45-year-old physician, 25+ patients/day, searches 3-4 times per shift for protocols, drug interactions, clinical evidence
- **Pain Points:** Spends 5-7 minutes filtering blogs to find peer-reviewed evidence; 40% of top results are health blogs; requires PubMed cross-check; needs answers within 2 minutes
- **Goals:** Find credible medical sources in <2 minutes without manual verification
- **Scenario:** Patient asks about GLP-1 agonists; needs endocrinologist perspective within 90 seconds

### 10.2 James — Corporate Employment Attorney (Secondary)
- **Context:** 52-year-old lawyer, researches case law 2-3 times daily, uses Google + Westlaw
- **Pain Points:** Mix of credible legal sources and blogs in results; non-lawyers misinterpret case law; billing constraint means 5-minute max research time
- **Goals:** Find bar-certified attorney analysis and actual case law in top 5 results
- **Scenario:** Wrongful termination claim; needs state-specific case law and expert analysis quickly

### 10.3 Mike — Health-Conscious Parent (Tertiary)
- **Context:** 38-year-old parent, researches health topics for family decisions, no medical background
- **Pain Points:** Can't distinguish credible sources from misinformation; worried about vaccine/medication safety; no credibility verification mechanism
- **Goals:** Find information from actual doctors, not bloggers; reduce misinformation exposure
- **Scenario:** Child gets vaccine; wants pediatrician perspective, not anti-vax blog

## 11. Stakeholders

| Stakeholder | Role | Impact | Needs | Success Criteria |
|-------------|------|--------|-------|------------------|
| **Search Quality Team** | Owns algorithm quality, A/B tests | Direct responsibility for launch success | Real-time monitoring dashboard, daily metric reports, rollback authority | Launch on schedule; metrics hit targets within 30 days; zero P0 bugs |
| **Customer Support Team** | Handles quality complaints | Workload decreases 1,100 tickets/month (45% reduction) | Training 2 weeks pre-launch, FAQ document, escalation process | Support volume drops 40% in Month 2-3; <10% of tickets related to ranking |
| **Legal & Privacy Team** | Owns compliance, data handling | HIPAA compliance required; state board agreements required | Clear data procedures, legal review of licensing, pre-launch approval | Legal review 2 weeks pre-launch; all agreements signed; zero violations |
| **Search Infrastructure Team** | Owns deployment, feature flags, monitoring | Responsible for safe rollout and real-time monitoring | Clear rollout percentages, monitoring dashboard, rollback runbook | Feature flag works; latency <100ms additional; zero incidents |
| **ML Platform Team** | Owns model training, serving | Responsible for model accuracy and serving latency | Training data pipelines, serving capacity, A/B test framework | Model trains in <48 hours; inference <15ms; accuracy meets lab benchmarks |

## 12. Timeline and Milestones

### 12.1 Development Phases

| Phase | Duration | Activities | Exit Criteria |
|-------|----------|------------|---------------|
| **Discovery & Data** | Week 1-2 | Finalize state board partnerships (12 states); integrate PubMed API; verify data quality; identify 50 test queries/vertical | Board data confirmed; PubMed working; test queries validated |
| **Model Development** | Week 3-5 | Build ranking model with credentialing signals; train on historical logs; validate 15% lab improvement | Lab benchmark hit; model <5GB; inference <15ms |
| **Engineering & Integration** | Week 6-8 | Integrate into TensorFlow infrastructure; build feature flag; implement monitoring; load test | Load tests pass 2.1B QPS; feature flag working; monitoring live in staging |
| **QA & Staging** | Week 9-10 | Internal dogfooding; edge case testing; latency verification; prepare rollout runbook | Zero P0 bugs; latency <100ms p95; runbook reviewed |
| **Pilot (1% Rollout)** | Week 11-12 | Enable for 1% of users; monitor metrics; expand to 10% if green | Re-query rate <32%; bounce stable; support stable; latency <100ms |
| **Full Rollout** | Week 13-16 | Gradual: 10% → 50% → 100% (1 week per stage) | All metrics hit targets; zero rollback triggers; monitoring stable |

### 12.2 Rollout Strategy

| Stage | Audience | Duration | Success Criteria | Rollback Trigger |
|-------|----------|----------|------------------|------------------|
| **Internal Dogfooding** | Engineering (50) + Search Quality (25) | Week 9-10 | Zero P0 bugs; latency <100ms | P0 bug discovered |
| **Staged Pilot (1%)** | 1% of queries (21M queries/day) | Week 11 | Re-query <32%; bounce stable; latency <100ms | Re-query >35% or latency >120ms |
| **Expanded Pilot (10%)** | 10% of queries (210M queries/day) | Week 12 | All metrics green; support stable | Bounce >19% or domain match <65% |
| **Rollout Phase 1 (50%)** | 50% of queries | Week 13-14 | Metrics tracking to target | Any failure criteria exceeded |
| **Full Rollout (100%)** | All queries | Week 15-16 | Metrics on track; monitoring stable | Unlikely; only if major issue |

**Feature Flag:** `ranking.vertical.credentialing.enabled` controls new ranking logic. Gradual rollout: 1% → 10% → 50% → 100%. Blog post published Day of GA; Support FAQ updated Week before; Marketing campaign Week 2 post-launch.

## 13. Risks and Mitigation

| Risk | Prob | Impact | Mitigation | Contingency |
|------|------|--------|------------|-------------|
| State medical board data quality issues (15%+ credentials missing/incorrect) | Medium | High | Audit 500-doctor sample vs. LinkedIn/company sites before Week 2; establish SLA with boards | Phase 1 launches with 12 states only; defer others to Phase 2 |
| Model latency exceeds 100ms (inference too expensive) | Medium | High | Profile model serving at 2.1B QPS Week 7; implement caching if needed | Reduce model complexity; defer Phase 2 expansion |
| Relevance improvement doesn't validate in production (15% lab vs. production) | Low | High | Monitor re-query rate in first 7 days of 1% rollout; if >33%, pause | Rollback; conduct post-mortem on assumptions |
| Support team overwhelmed by new issue types | Low | Medium | Train support 2 weeks pre-launch; provide FAQ with 20 likely questions | Hire temporary contractor; slow rollout to 10% |
| PubMed API becomes unstable or rate-limited | Low | Medium | Implement 24-hour batch caching; fallback to stale data if API down | Use static snapshot; lose real-time updates but maintain ranking |
| Legal review delays state board data licensing | Medium | High | Engage Legal in Week 1; provide data framework in parallel; get preliminary approval early | Launch with fewer states; escalate for priority review |
| Feature flag implementation has bugs | Low | High | Load test feature flag at 2.1B QPS Week 8; test all rollout percentages | Manual traffic routing via load balancer (higher risk) |

## 14. Traceability Summary

| Problem | Requirement IDs | Metric IDs |
|---------|-----------------|-----------|
| P1: Non-credentialed sources rank too high | FR1, FR3, FR4, NFR1, NFR2 | Query Re-refinement, Domain Authority Match, Bounce Rate |
| P2: Users re-query at 34%, low confidence | FR2, FR5 | Query Re-refinement, Bounce Rate |
| P3: No safe deployment mechanism | FR5, NFR3, NFR4 | All latency metrics |
| P4: Support handles 274 quality tickets/month | FR1, FR2 | Support Ticket Volume |
| P5: Competitive risk (3% churn to Bing) | FR1, FR2, FR3 | Bounce Rate, CTR, Satisfaction |

**Validation:** Every problem has requirements. Every requirement traces to metrics. Metrics validate problems are solved.

## 15. Open Questions

1. **Will 12 state medical boards suffice for Phase 1, or do we need all 50?** → Decision by end of Week 2 (Legal + Data team)
2. **Should we prioritize Financial vertical in Phase 2, or delay for SEC review?** → Legal assessment by Month 1 post-launch
3. **How aggressively de-prioritize recent blogs vs. older peer-reviewed content?** → A/B test different weightings in pilot; finalize by Week 12

## 16. Known Unknowns & Dissenting Opinions

### 16.1 Known Unknowns

| Unknown | Impact | Validation | Timeline |
|---------|--------|-----------|----------|
| Will users trust credentialing signals over freshness? | If ignored, ranking change has no impact; bounces increase | A/B test in 1% pilot; measure CTR on credentialed vs. non-credentialed | Week 11-12 |
| How frequently do state medical boards update their registries? | Stale credentials risks demoting active physicians | Query APIs daily; measure update frequency | Week 2 |
| Distribution of credentialed sources by medical specialty? | Some specialties may have few experts (emerging fields); model may fail for niche queries | Analyze query logs by specialty; audit source availability | Week 3-5 |

### 16.2 Dissenting Opinions Log

| Topic | Position A | Position B | Current Decision | Rationale |
|-------|-----------|-----------|------------------|-----------|
| Build vs. buy credentialing data | Build in-house (ML Platform: data control, long-term) | Buy from third-party like Doctolib (Product: faster launch) | **Build in-house** | Vendor lock-in risk too high; HIPAA/state board compliance makes vendor relationships fragile; 2-week time savings not worth 2-year dependency |
| Phase 1 scope: 12 states or all 50? | All 50 states (Product: comprehensive launch) | 12 states only (Legal/Data: legal complexity) | **12 states Phase 1, others Phase 2** | Simultaneous 50-state agreements risk legal blockers; 12 states = 67% of relevant queries; Phase 2 expansion planned |
| Publish ranking methodology before or after launch? | Publish before (Competitive Strategy: transparency builds trust) | Publish after (Search Quality: avoid gaming/abuse) | **Publish 2 weeks after launch** | Publish before risks manipulation; publish after allows monitoring for abuse patterns; 2-week delay acceptable |
| Latency budget: 100ms or 50ms? | 100ms (Product: acceptable overhead) | 50ms (Infra: more aggressive) | **100ms target, 50ms stretch goal** | 100ms is pragmatic for complex inference; 50ms as monitoring trigger for optimization opportunities |