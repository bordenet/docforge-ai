/**
 * PRD Form Data Fixture
 *
 * Realistic form field values for testing PRD prompt generation.
 * Field IDs match plugins/prd/config.js formFields.
 */

export default {
  title: 'AI-Powered Document Search Platform',
  problem:
    'Enterprise users spend an average of 15 minutes searching for internal documents. ' +
    'The current search system relies on exact keyword matching, missing relevant results ' +
    'when users use different terminology. This leads to duplicated work, delayed decisions, ' +
    'and frustrated employees.',
  userPersona:
    'Primary: Knowledge workers in enterprise organizations managing 10,000+ documents. ' +
    'Secondary: IT administrators who need to configure and maintain the search infrastructure. ' +
    'Both groups value speed, accuracy, and minimal training requirements.',
  context:
    'The company has grown 3x in the past two years, and document volume has outpaced ' +
    'our search infrastructure. Competitors are offering AI-powered search solutions, ' +
    'and we risk losing enterprise deals without a competitive offering.',
  competitors:
    'Algolia (strong technical search, weak enterprise features), Elasticsearch (powerful but ' +
    'complex to operate), Google Cloud Search (good integration but limited customization), ' +
    'Microsoft Search (tight Office 365 integration but poor cross-platform support).',
  customerEvidence:
    '47% of support tickets mention "cannot find document" or "where is the file". ' +
    'Q3 customer survey showed search satisfaction at 2.1/5 (down from 3.2/5 in Q1). ' +
    'Lost 3 enterprise deals citing inadequate search capabilities.',
  goals:
    'Primary: Reduce average document search time by 60% (from 15 min to 6 min). ' +
    'Secondary: Achieve 85% user satisfaction score for search experience. ' +
    'Tertiary: Support 100K documents per tenant without performance degradation.',
  requirements:
    'Semantic search using vector embeddings, faceted filters by document type/date/author, ' +
    'saved search functionality, shareable search result links, SSO integration, ' +
    'admin dashboard with usage analytics.',
  constraints:
    'Must integrate with existing SSO infrastructure (Okta). Budget ceiling of $50K/year ' +
    'for third-party services. Must support on-premises deployment option for regulated industries. ' +
    'Target launch: Q2 2026.',
  documentScope:
    'Full PRD covering problem analysis, user research, requirements specification, ' +
    'success metrics, timeline, and risk assessment.',
};

