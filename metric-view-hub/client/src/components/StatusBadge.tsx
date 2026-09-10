import { Badge } from '@databricks/appkit-ui/react';
import type { ProposalStatus } from '../lib/types';

const labels: Record<ProposalStatus, string> = {
  draft: 'Draft',
  in_review: 'In review',
  changes_requested: 'Changes requested',
  approved: 'Approved',
  exported: 'Exported',
  published: 'Published',
};

export function StatusBadge({ status }: { status: ProposalStatus }) {
  const variant =
    status === 'approved' || status === 'published'
      ? 'default'
      : status === 'changes_requested'
        ? 'destructive'
        : 'secondary';
  return <Badge variant={variant}>{labels[status]}</Badge>;
}
