# One-Pager: Enterprise SSO Integration

## TL;DR
Enable SAML/OIDC single sign-on for enterprise customers, unblocking $8.7M in pipeline deals requiring SSO as a procurement prerequisite.

## Problem
12 enterprise deals ($8.7M ARR) are blocked pending SSO support. Enterprise IT teams cannot approve tools without centralized identity management. Manual user provisioning costs customers 4.2 hours/week in admin overhead.

### Cost of Doing Nothing
$8.7M in qualified pipeline lost to competitors with SSO. Customer churn risk: 3 enterprise accounts ($2.1M ARR) evaluating alternatives. Sales cycle extended 6-8 weeks per deal due to security review escalations.

### Why Now
Q4 procurement cycles close in 8 weeks. Three deals ($3.2M) have hard deadlines. Competitor shipped SSO last quarter—we're losing technical evaluations.

## Solution
Implement SAML 2.0 and OIDC identity federation supporting Okta, Azure AD, and Google Workspace. Enable SCIM provisioning for automated user lifecycle management.

### Alternatives Considered
1. **Do Nothing**: Lose $8.7M pipeline; unacceptable given company growth targets
2. **SAML only (no SCIM)**: Addresses 70% of requirements; insufficient for largest deals
3. **Third-party auth (Auth0/Okta)**: $180K/year ongoing; reduces margin on enterprise tier

**Chosen**: Native SAML/OIDC with SCIM—one-time build cost, full control, enterprise differentiator.

## Goals/Benefits
- Unblock enterprise pipeline: $0 → $8.7M closed by Q1
- Reduce customer admin time: 4.2 hrs/week → 0.5 hrs/week
- Decrease sales cycle: 14 weeks → 8 weeks average

## Scope

### In-Scope
- SAML 2.0 SP-initiated and IdP-initiated flows
- OIDC authorization code flow
- Okta, Azure AD, Google Workspace integrations
- SCIM 2.0 user provisioning
- Admin configuration UI

### Out-of-Scope
- Custom LDAP integrations (future)
- Multi-tenant SSO (enterprise-plus tier only)
- Mobile app SSO (Phase 2)

## Success Metrics
| Metric | Baseline | Target | Timeframe |
|--------|----------|--------|-----------|
| SSO-blocked deals | 12 | 0 | Q1 |
| Enterprise ARR from SSO deals | $0 | $8.7M | Q1 |
| Customer admin time | 4.2 hrs/wk | 0.5 hrs/wk | Launch+30 |
| Sales cycle length | 14 weeks | 8 weeks | Q2 |

## Stakeholders/Team
| Role | Person | Responsibility |
|------|--------|----------------|
| Owner | Michael Torres | Delivery, stakeholder updates |
| Tech Lead | Emily Zhang | Architecture, security |
| Product | James Wilson | Requirements, customer research |
| Security | Amanda Lee | Compliance, pen testing |
| Sales | Robert Kim | Customer validation |

## Timeline/Milestones
- **Week 1**: IdP integration design, security threat model
- **Week 2-3**: SAML/OIDC implementation
- **Week 4**: SCIM provisioning
- **Week 5**: Admin UI, documentation
- **Week 6**: Security audit, customer beta (2 accounts)

## Investment/Resources
- Engineering: 2 FTE × 6 weeks = $90K
- Security penetration test: $15K
- Total: $105K
- ROI: 83x in Year 1 ($8.7M ARR / $105K investment)

## Risks/Assumptions
| Risk | Mitigation |
|------|------------|
| IdP configuration complexity | Provide step-by-step guides per IdP |
| SCIM edge cases | Limit to create/update/delete; no groups |
| Customer beta delays | Pre-committed 2 design partners |

**Assumptions**: 80% of enterprise customers use Okta, Azure AD, or Google. SCIM covers 90% of provisioning use cases.

## Decision Needed
Approve $105K investment and 2 FTE allocation for 6-week sprint starting immediately.

