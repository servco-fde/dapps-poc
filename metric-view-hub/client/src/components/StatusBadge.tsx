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

const statusClasses: Record<ProposalStatus, string> = {
  draft: 'servco-status-draft',
  in_review: 'servco-status-review',
  changes_requested: 'servco-status-changes',
  approved: 'servco-status-approved',
  exported: 'servco-status-exported',
  published: 'servco-status-published',
};

export function StatusBadge({ status }: { status: ProposalStatus }) {
  return (
    <Badge variant="outline" className={statusClasses[status]}>
      {labels[status]}
    </Badge>
  );
}
