/**
 * One-Pager Form Data Fixture
 *
 * Realistic form field values for testing One-Pager prompt generation.
 * Field IDs match plugins/one-pager/config.js formFields.
 */

export default {
  title: 'Mobile App Performance Optimization Initiative',
  problemStatement:
    'Our mobile app has seen a 40% increase in crash rates over the past quarter, ' +
    'with average app startup time growing from 2.1s to 4.8s. Customer complaints about ' +
    'performance have increased 3x, and our App Store rating has dropped from 4.5 to 3.8 stars.',
  costOfDoingNothing:
    'Projected $2.1M annual revenue loss from user churn if performance issues persist. ' +
    'Risk of further App Store rating decline below 3.5 stars, which would trigger ' +
    'reduced visibility in search results. Engineering team morale declining due to ' +
    'constant firefighting.',
  context:
    'The performance degradation coincides with our rapid feature expansion over Q3-Q4. ' +
    'Technical debt has accumulated as we prioritized feature velocity over infrastructure. ' +
    'Competitor apps load 60% faster on average.',
  proposedSolution:
    'Three-phase optimization program: (1) Immediate: Fix top 5 crash-causing bugs, ' +
    '(2) Short-term: Implement lazy loading and reduce bundle size by 40%, ' +
    '(3) Medium-term: Re-architect data layer with efficient caching.',
  keyGoals:
    'Reduce crash rate by 80% (from 2.4% to 0.5%), improve startup time to under 2s, ' +
    'restore App Store rating to 4.3+ stars, reduce performance-related support tickets by 60%.',
  scopeInScope:
    'iOS and Android apps, startup performance, crash reduction, memory optimization, ' +
    'network request efficiency, App Store performance metrics.',
  scopeOutOfScope:
    'Backend API performance (separate initiative), new feature development, ' +
    'web application performance, third-party SDK updates.',
  successMetrics:
    'Crash-free sessions > 99.5%, cold start time < 2.0s, hot start time < 0.5s, ' +
    'App Store rating >= 4.3 stars, P95 memory usage < 150MB.',
  timeline:
    'Phase 1: 2 weeks (bug fixes), Phase 2: 4 weeks (lazy loading), ' +
    'Phase 3: 6 weeks (re-architecture). Total: 12 weeks.',
  resourcesNeeded:
    '2 senior mobile engineers (full-time), 1 QA engineer (50%), ' +
    'access to performance monitoring tools (DataDog, Firebase), ' +
    'device lab for cross-device testing.',
  risks:
    'Re-architecture may surface additional issues requiring scope expansion. ' +
    'Key engineer may be pulled for critical production issues. ' +
    'Third-party SDK updates may introduce new performance regressions.',
  stakeholders:
    'Engineering Lead (sponsor), Product Manager (requirements), ' +
    'Customer Success (user feedback), Marketing (App Store presence).',
};

