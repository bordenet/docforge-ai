/**
 * ADR Form Data Fixture
 * Field IDs match plugins/adr/config.js formFields.
 */

export default {
  title: 'Use PostgreSQL as Primary Database',
  status: 'proposed',
  context:
    'Our application has outgrown SQLite for development and needs a production-grade ' +
    'database. We need ACID compliance, support for complex queries, JSON storage, ' +
    'and good ecosystem support. The team has PostgreSQL experience from previous projects.',
  decision:
    'We will use PostgreSQL 15 as our primary relational database, deployed via AWS RDS ' +
    'with Multi-AZ configuration. We will use pgvector extension for embedding storage ' +
    'to support our upcoming AI features.',
  consequences:
    'Positive: Better performance at scale, native JSON support, strong ecosystem. ' +
    'Negative: Additional operational complexity vs SQLite, requires connection pooling. ' +
    'Neutral: Team needs to standardize on migration tooling (choosing Flyway).',
  alternatives:
    'MySQL/MariaDB: Rejected due to weaker JSON support and team preference. ' +
    'MongoDB: Rejected as we have relational data patterns. ' +
    'CockroachDB: Rejected as overkill for current scale. ' +
    'Keep SQLite: Rejected due to production requirements.',
};

