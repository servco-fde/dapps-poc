import type { AuditEvent, ProposalStatus } from './types';

const statusLabels: Record<ProposalStatus, string> = {
  draft: 'Draft',
  in_review: 'In review',
  changes_requested: 'Changes requested',
  approved: 'Approved',
  exported: 'Exported',
  published: 'Published',
};

const isProposalStatus = (value: unknown): value is ProposalStatus =>
  typeof value === 'string' && Object.prototype.hasOwnProperty.call(statusLabels, value);

const humanizeIdentifier = (value: string): string => {
  const words = value.replace(/_/g, ' ').trim();
  return words.length > 0 ? `${words[0].toUpperCase()}${words.slice(1)}` : 'Activity recorded';
};

const formatStatus = (value: string): string =>
  isProposalStatus(value) ? statusLabels[value] : humanizeIdentifier(value);

export function formatAuditEvent(event: Pick<AuditEvent, 'event_type' | 'details'>): string {
  if (event.event_type === 'status_changed') {
    const from = event.details.from;
    const to = event.details.to;

    if (typeof from === 'string' && typeof to === 'string' && from.trim() && to.trim()) {
      return `Status changed: ${formatStatus(from)} → ${formatStatus(to)}`;
    }
  }

  return humanizeIdentifier(event.event_type);
}
