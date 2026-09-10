export type ProposalStatus = 'draft' | 'in_review' | 'changes_requested' | 'approved' | 'exported' | 'published';

export interface DraftDimension {
  clientId?: string;
  name: string;
  expression: string;
  description: string;
}

export interface DraftMeasure extends DraftDimension {
  format: 'number' | 'currency' | 'percentage';
}

export interface ProposalDraft {
  title: string;
  businessArea: string;
  changeType: 'new_metric_view' | 'change_existing';
  targetMetricView: string;
  targetName: string;
  sourceFqn: string;
  purpose: string;
  ownerEmail: string;
  acceptanceCriteria: string[];
  dimensions: DraftDimension[];
  measures: DraftMeasure[];
  rationale: string;
  desiredDate: string;
}

export interface ProposalSummary {
  id: string;
  title: string;
  business_area: string;
  change_type: ProposalDraft['changeType'];
  target_metric_view: string;
  target_name: string;
  owner_email: string;
  status: ProposalStatus;
  current_version: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Proposal extends ProposalSummary {
  source_fqn: string;
  purpose: string;
  acceptance_criteria: string[];
  rationale: string;
  desired_date: string | null;
  approved_by: string | null;
}

export interface ProposalVersion {
  version: number;
  draft_json: ProposalDraft;
  author_email: string;
  created_at: string;
}

export interface ProposalComment {
  id: string;
  field_anchor: string | null;
  body: string;
  author_email: string;
  resolved: boolean;
  created_at: string;
}

export interface AuditEvent {
  id: string;
  event_type: string;
  actor_email: string;
  details: Record<string, unknown>;
  created_at: string;
}

export interface ProposalDetail {
  proposal: Proposal;
  versions: ProposalVersion[];
  comments: ProposalComment[];
  auditEvents: AuditEvent[];
}
