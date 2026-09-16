import { describe, expect, it } from 'vitest';
import { formatAuditEvent } from './audit-events';

describe('formatAuditEvent', () => {
  it('shows the exact lifecycle transition with human-readable stages', () => {
    expect(
      formatAuditEvent({
        event_type: 'status_changed',
        details: { from: 'draft', to: 'in_review' },
      })
    ).toBe('Status changed: Draft → In review');

    expect(
      formatAuditEvent({
        event_type: 'status_changed',
        details: { from: 'changes_requested', to: 'in_review' },
      })
    ).toBe('Status changed: Changes requested → In review');
  });

  it('humanizes forward-compatible lifecycle identifiers', () => {
    expect(
      formatAuditEvent({
        event_type: 'status_changed',
        details: { from: 'quality_review', to: 'ready_to_publish' },
      })
    ).toBe('Status changed: Quality review → Ready to publish');
  });

  it('falls back safely when transition details are incomplete', () => {
    expect(
      formatAuditEvent({
        event_type: 'status_changed',
        details: { from: 'draft' },
      })
    ).toBe('Status changed');
  });

  it('humanizes other audit event types', () => {
    expect(formatAuditEvent({ event_type: 'comment_added', details: {} })).toBe('Comment added');
  });
});
