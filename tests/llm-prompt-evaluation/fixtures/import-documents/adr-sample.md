# ADR-0023: Adopt Event Sourcing for Order Management

## Status
Proposed

## Context

Our order management system is experiencing growing pains:

1. **Audit requirements**: Regulators require complete history of order modifications
2. **Debugging difficulty**: When orders fail, we can't easily trace what happened
3. **Performance issues**: The orders table has grown to 50M rows with complex queries
4. **Integration complexity**: Multiple systems need to react to order changes

The current approach uses a traditional CRUD model with an audit log table. However, the audit log is incomplete (only captures some changes) and querying it is slow.

## Decision

We will adopt event sourcing for the order management domain. This means:

1. **Events are the source of truth**: Instead of storing current state, we store a sequence of events (OrderCreated, ItemAdded, PaymentReceived, OrderShipped, etc.)

2. **Projections for queries**: We'll build read models (projections) optimized for specific query patterns

3. **Event store**: We'll use EventStoreDB as our event store

4. **Gradual migration**: Start with new orders, backfill historical data over 6 months

```
┌─────────────┐     ┌──────────────┐     ┌────────────────┐
│   Commands  │────▶│  Event Store │────▶│  Projections   │
└─────────────┘     └──────────────┘     └────────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  Subscribers │ (Notifications, Analytics, etc.)
                    └──────────────┘
```

## Consequences

### Positive
- Complete audit trail by design (every change is an event)
- Easy debugging (replay events to reproduce issues)
- Decoupled integrations via event subscription
- Natural fit for CQRS and read/write optimization

### Negative
- Steeper learning curve for team
- Eventual consistency requires careful handling
- Increased storage requirements
- Complex migration path from existing system

### Neutral
- Need to define event schema versioning strategy
- Will require new monitoring and alerting approaches

## Alternatives Considered

1. **Enhance existing audit log**: Rejected because it doesn't solve performance issues and is bolted-on rather than built-in

2. **Use CDC (Change Data Capture)**: Rejected because it captures physical changes, not business events

3. **PostgreSQL triggers**: Rejected due to performance concerns and lack of event semantics

## References

- Martin Fowler: Event Sourcing (link)
- EventStoreDB Documentation (link)
- Internal RFC: Event Schema Guidelines (link)

