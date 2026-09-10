import type { Application, Request } from 'express';
import { z } from 'zod';

interface QueryResult {
  rows: Record<string, unknown>[];
}

interface AppKitWithLakebase {
  lakebase: {
    query(text: string, params?: unknown[]): Promise<QueryResult>;
  };
  server: {
    extend(fn: (app: Application) => void): void;
  };
}

const Identifier = z
  .string()
  .regex(
    /^[A-Za-z_][A-Za-z0-9_]*\.[A-Za-z_][A-Za-z0-9_]*\.[A-Za-z_][A-Za-z0-9_]*$/,
    'Use a three-part Unity Catalog name'
  );

const DimensionSchema = z.object({
  name: z.string().trim().min(1).max(120),
  expression: z.string().trim().min(1).max(1_000),
  description: z.string().trim().min(1).max(1_000),
});

const MeasureSchema = z.object({
  name: z.string().trim().min(1).max(120),
  expression: z.string().trim().min(1).max(1_000),
  description: z.string().trim().min(1).max(1_000),
  format: z.enum(['number', 'currency', 'percentage']),
});

const ProposalDraftSchema = z.object({
  title: z.string().trim().min(3).max(160),
  businessArea: z.string().trim().min(2).max(120),
  changeType: z.enum(['new_metric_view', 'change_existing']),
  targetMetricView: Identifier,
  targetName: Identifier,
  sourceFqn: Identifier,
  purpose: z.string().trim().min(10).max(4_000),
  ownerEmail: z.string().trim().email().max(320),
  acceptanceCriteria: z.array(z.string().trim().min(3).max(1_000)).min(1).max(20),
  dimensions: z.array(DimensionSchema).min(1).max(50),
  measures: z.array(MeasureSchema).min(1).max(50),
  rationale: z.string().trim().min(10).max(4_000),
  desiredDate: z.union([z.string().date(), z.literal('')]),
});

const CreateProposalBody = ProposalDraftSchema;
const UpdateProposalBody = z.object({
  expectedVersion: z.number().int().positive(),
  draft: ProposalDraftSchema,
});
const CreateCommentBody = z.object({
  body: z.string().trim().min(1).max(4_000),
  fieldAnchor: z.string().trim().max(160).optional().default(''),
});
const TransitionBody = z.object({
  status: z.enum(['draft', 'in_review', 'changes_requested', 'approved', 'exported', 'published']),
});

type ProposalDraft = z.infer<typeof ProposalDraftSchema>;
type ProposalStatus = z.infer<typeof TransitionBody>['status'];

const VALID_TRANSITIONS: Record<ProposalStatus, ProposalStatus[]> = {
  draft: ['in_review'],
  in_review: ['changes_requested', 'approved'],
  changes_requested: ['in_review'],
  approved: ['exported'],
  exported: ['published'],
  published: [],
};

export const canTransition = (from: ProposalStatus, to: ProposalStatus): boolean =>
  VALID_TRANSITIONS[from].includes(to);

const SCHEMA_STATEMENTS = [
  `CREATE SCHEMA IF NOT EXISTS metric_hub`,
  `CREATE TABLE IF NOT EXISTS metric_hub.proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    business_area TEXT NOT NULL,
    change_type TEXT NOT NULL CHECK (change_type IN ('new_metric_view', 'change_existing')),
    target_metric_view TEXT NOT NULL,
    target_name TEXT NOT NULL,
    source_fqn TEXT NOT NULL,
    purpose TEXT NOT NULL,
    owner_email TEXT NOT NULL,
    acceptance_criteria JSONB NOT NULL,
    rationale TEXT NOT NULL,
    desired_date DATE,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'changes_requested', 'approved', 'exported', 'published')),
    current_version INTEGER NOT NULL DEFAULT 1,
    created_by TEXT NOT NULL,
    approved_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS metric_hub.proposal_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id UUID NOT NULL REFERENCES metric_hub.proposals(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    draft_json JSONB NOT NULL,
    generated_artifact TEXT NOT NULL,
    author_email TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (proposal_id, version)
  )`,
  `CREATE TABLE IF NOT EXISTS metric_hub.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id UUID NOT NULL REFERENCES metric_hub.proposals(id) ON DELETE CASCADE,
    field_anchor TEXT,
    body TEXT NOT NULL,
    author_email TEXT NOT NULL,
    resolved BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS metric_hub.audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id UUID NOT NULL REFERENCES metric_hub.proposals(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    actor_email TEXT NOT NULL,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE INDEX IF NOT EXISTS idx_proposals_status_updated
    ON metric_hub.proposals(status, updated_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_comments_proposal_created
    ON metric_hub.comments(proposal_id, created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_audit_proposal_created
    ON metric_hub.audit_events(proposal_id, created_at)`,
];

const proposalColumns = `
  id, title, business_area, change_type, target_metric_view, target_name,
  source_fqn, purpose, owner_email, acceptance_criteria, rationale,
  desired_date, status, current_version, created_by, approved_by,
  created_at, updated_at
`;

const requestEmail = (req: Request): string => req.header('x-forwarded-email') ?? 'local-developer@databricks.invalid';

const yamlString = (value: string): string => JSON.stringify(value);

function renderFormat(format: ProposalDraft['measures'][number]['format']): string[] {
  const common = [
    '        decimal_places:',
    '          type: max',
    `          places: ${format === 'currency' ? 2 : 1}`,
  ];
  if (format === 'currency') {
    return ['      format:', '        type: currency', '        currency_code: USD', ...common];
  }
  return ['      format:', `        type: ${format}`, ...common];
}

export function generateMetricViewArtifact(draft: ProposalDraft): string {
  const criteria = draft.acceptanceCriteria.map((item) => `-- - ${item.replace(/\n/g, ' ')}`).join('\n');
  const dimensions = draft.dimensions.flatMap((dimension) => [
    `    - name: ${yamlString(dimension.name)}`,
    `      expr: ${yamlString(dimension.expression)}`,
    `      display_name: ${yamlString(dimension.name)}`,
    `      comment: ${yamlString(dimension.description)}`,
  ]);
  const measures = draft.measures.flatMap((measure) => [
    `    - name: ${yamlString(measure.name)}`,
    `      expr: ${yamlString(measure.expression)}`,
    `      display_name: ${yamlString(measure.name)}`,
    `      comment: ${yamlString(measure.description)}`,
    ...renderFormat(measure.format),
  ]);

  return [
    '-- Generated by Metric View Collaboration Hub',
    `-- Proposal: ${draft.title.replace(/\n/g, ' ')}`,
    `-- Owner: ${draft.ownerEmail}`,
    '-- Acceptance criteria:',
    criteria,
    `CREATE OR REPLACE VIEW ${draft.targetName}`,
    'WITH METRICS',
    'LANGUAGE YAML',
    'AS $$',
    '  version: 1.1',
    `  source: ${draft.sourceFqn}`,
    `  comment: ${yamlString(draft.purpose)}`,
    '  dimensions:',
    ...dimensions,
    '  measures:',
    ...measures,
    '$$;',
    '',
  ].join('\n');
}

async function initializeSchema(appkit: AppKitWithLakebase): Promise<void> {
  for (const statement of SCHEMA_STATEMENTS) {
    await appkit.lakebase.query(statement);
  }
  console.log('[lakebase] metric_hub schema is ready');
}

export async function setupProposalRoutes(appkit: AppKitWithLakebase): Promise<void> {
  await initializeSchema(appkit);

  appkit.server.extend((app) => {
    app.get('/api/proposals', async (_req, res) => {
      try {
        const result = await appkit.lakebase.query(`
          SELECT id, title, business_area, change_type, target_metric_view,
                 target_name, owner_email, status, current_version,
                 created_by, created_at, updated_at
          FROM metric_hub.proposals
          ORDER BY updated_at DESC
          LIMIT 200
        `);
        res.json(result.rows);
      } catch (error) {
        console.error('Failed to list proposals:', error);
        res.status(500).json({ error: 'Failed to list proposals' });
      }
    });

    app.get('/api/proposals/:id', async (req, res) => {
      try {
        const [proposal, versions, comments, events] = await Promise.all([
          appkit.lakebase.query(`SELECT ${proposalColumns} FROM metric_hub.proposals WHERE id = $1`, [req.params.id]),
          appkit.lakebase.query(
            `
            SELECT version, draft_json, author_email, created_at
            FROM metric_hub.proposal_versions
            WHERE proposal_id = $1 ORDER BY version DESC
          `,
            [req.params.id]
          ),
          appkit.lakebase.query(
            `
            SELECT id, field_anchor, body, author_email, resolved, created_at
            FROM metric_hub.comments
            WHERE proposal_id = $1 ORDER BY created_at ASC
          `,
            [req.params.id]
          ),
          appkit.lakebase.query(
            `
            SELECT id, event_type, actor_email, details, created_at
            FROM metric_hub.audit_events
            WHERE proposal_id = $1 ORDER BY created_at ASC
          `,
            [req.params.id]
          ),
        ]);
        if (proposal.rows.length === 0) {
          res.status(404).json({ error: 'Proposal not found' });
          return;
        }
        res.json({
          proposal: proposal.rows[0],
          versions: versions.rows,
          comments: comments.rows,
          auditEvents: events.rows,
        });
      } catch (error) {
        console.error('Failed to load proposal:', error);
        res.status(500).json({ error: 'Failed to load proposal' });
      }
    });

    app.post('/api/proposals', async (req, res) => {
      const parsed = CreateProposalBody.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Invalid proposal', fields: parsed.error.flatten().fieldErrors });
        return;
      }
      const actor = requestEmail(req);
      const draft = parsed.data;
      const artifact = generateMetricViewArtifact(draft);
      try {
        const result = await appkit.lakebase.query(
          `
          WITH inserted AS (
            INSERT INTO metric_hub.proposals (
              title, business_area, change_type, target_metric_view, target_name,
              source_fqn, purpose, owner_email, acceptance_criteria, rationale,
              desired_date, created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, NULLIF($11, '')::date, $12)
            RETURNING ${proposalColumns}
          ), versioned AS (
            INSERT INTO metric_hub.proposal_versions (
              proposal_id, version, draft_json, generated_artifact, author_email
            ) SELECT id, 1, $13::jsonb, $14, $12 FROM inserted
          ), audited AS (
            INSERT INTO metric_hub.audit_events (proposal_id, event_type, actor_email, details)
            SELECT id, 'proposal_created', $12, jsonb_build_object('version', 1) FROM inserted
          )
          SELECT * FROM inserted
        `,
          [
            draft.title,
            draft.businessArea,
            draft.changeType,
            draft.targetMetricView,
            draft.targetName,
            draft.sourceFqn,
            draft.purpose,
            draft.ownerEmail,
            JSON.stringify(draft.acceptanceCriteria),
            draft.rationale,
            draft.desiredDate,
            actor,
            JSON.stringify(draft),
            artifact,
          ]
        );
        res.status(201).json(result.rows[0]);
      } catch (error) {
        console.error('Failed to create proposal:', error);
        res.status(500).json({ error: 'Failed to create proposal' });
      }
    });

    app.put('/api/proposals/:id', async (req, res) => {
      const parsed = UpdateProposalBody.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Invalid proposal update', fields: parsed.error.flatten().fieldErrors });
        return;
      }
      const actor = requestEmail(req);
      const { draft, expectedVersion } = parsed.data;
      const nextVersion = expectedVersion + 1;
      const artifact = generateMetricViewArtifact(draft);
      try {
        const result = await appkit.lakebase.query(
          `
          WITH updated AS (
            UPDATE metric_hub.proposals
            SET title = $3, business_area = $4, change_type = $5,
                target_metric_view = $6, target_name = $7, source_fqn = $8,
                purpose = $9, owner_email = $10, acceptance_criteria = $11::jsonb,
                rationale = $12, desired_date = NULLIF($13, '')::date,
                current_version = $14, status = 'draft', updated_at = NOW()
            WHERE id = $1 AND current_version = $2 AND status IN ('draft', 'changes_requested')
            RETURNING ${proposalColumns}
          ), versioned AS (
            INSERT INTO metric_hub.proposal_versions (
              proposal_id, version, draft_json, generated_artifact, author_email
            ) SELECT id, $14, $15::jsonb, $16, $17 FROM updated
          ), audited AS (
            INSERT INTO metric_hub.audit_events (proposal_id, event_type, actor_email, details)
            SELECT id, 'proposal_revised', $17, jsonb_build_object('version', $14) FROM updated
          )
          SELECT * FROM updated
        `,
          [
            req.params.id,
            expectedVersion,
            draft.title,
            draft.businessArea,
            draft.changeType,
            draft.targetMetricView,
            draft.targetName,
            draft.sourceFqn,
            draft.purpose,
            draft.ownerEmail,
            JSON.stringify(draft.acceptanceCriteria),
            draft.rationale,
            draft.desiredDate,
            nextVersion,
            JSON.stringify(draft),
            artifact,
            actor,
          ]
        );
        if (result.rows.length === 0) {
          res.status(409).json({ error: 'Proposal changed or cannot be edited in its current status' });
          return;
        }
        res.json(result.rows[0]);
      } catch (error) {
        console.error('Failed to update proposal:', error);
        res.status(500).json({ error: 'Failed to update proposal' });
      }
    });

    app.post('/api/proposals/:id/comments', async (req, res) => {
      const parsed = CreateCommentBody.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Invalid comment' });
        return;
      }
      const actor = requestEmail(req);
      try {
        const result = await appkit.lakebase.query(
          `
          WITH inserted AS (
            INSERT INTO metric_hub.comments (proposal_id, field_anchor, body, author_email)
            SELECT id, NULLIF($2, ''), $3, $4
            FROM metric_hub.proposals WHERE id = $1
            RETURNING id, proposal_id, field_anchor, body, author_email, resolved, created_at
          ), audited AS (
            INSERT INTO metric_hub.audit_events (proposal_id, event_type, actor_email, details)
            SELECT proposal_id, 'comment_added', $4, jsonb_build_object('comment_id', id) FROM inserted
          )
          SELECT * FROM inserted
        `,
          [req.params.id, parsed.data.fieldAnchor, parsed.data.body, actor]
        );
        if (result.rows.length === 0) {
          res.status(404).json({ error: 'Proposal not found' });
          return;
        }
        res.status(201).json(result.rows[0]);
      } catch (error) {
        console.error('Failed to add comment:', error);
        res.status(500).json({ error: 'Failed to add comment' });
      }
    });

    app.patch('/api/proposals/:id/status', async (req, res) => {
      const parsed = TransitionBody.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Invalid status' });
        return;
      }
      const actor = requestEmail(req);
      try {
        const current = await appkit.lakebase.query('SELECT status FROM metric_hub.proposals WHERE id = $1', [
          req.params.id,
        ]);
        if (current.rows.length === 0) {
          res.status(404).json({ error: 'Proposal not found' });
          return;
        }
        const fromStatus = current.rows[0].status as ProposalStatus;
        const toStatus = parsed.data.status;
        if (!canTransition(fromStatus, toStatus)) {
          res.status(409).json({ error: `Transition from ${fromStatus} to ${toStatus} is not allowed` });
          return;
        }
        const result = await appkit.lakebase.query(
          `
          WITH updated AS (
            UPDATE metric_hub.proposals
            SET status = $3,
                approved_by = CASE WHEN $3 = 'approved' THEN $4 ELSE approved_by END,
                updated_at = NOW()
            WHERE id = $1 AND status = $2
            RETURNING ${proposalColumns}
          ), audited AS (
            INSERT INTO metric_hub.audit_events (proposal_id, event_type, actor_email, details)
            SELECT id, 'status_changed', $4,
                   jsonb_build_object('from', $2, 'to', $3) FROM updated
          )
          SELECT * FROM updated
        `,
          [req.params.id, fromStatus, toStatus, actor]
        );
        if (result.rows.length === 0) {
          res.status(409).json({ error: 'Proposal status changed; refresh and try again' });
          return;
        }
        res.json(result.rows[0]);
      } catch (error) {
        console.error('Failed to transition proposal:', error);
        res.status(500).json({ error: 'Failed to transition proposal' });
      }
    });

    app.get('/api/proposals/:id/artifact', async (req, res) => {
      try {
        const result = await appkit.lakebase.query(
          `
          SELECT p.target_name, v.generated_artifact
          FROM metric_hub.proposals p
          JOIN metric_hub.proposal_versions v
            ON v.proposal_id = p.id AND v.version = p.current_version
          WHERE p.id = $1
        `,
          [req.params.id]
        );
        if (result.rows.length === 0) {
          res.status(404).json({ error: 'Proposal artifact not found' });
          return;
        }
        const row = result.rows[0];
        const safeName = String(row.target_name).replace(/\./g, '_');
        res.setHeader('Content-Type', 'text/sql; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${safeName}.sql"`);
        res.send(String(row.generated_artifact));
      } catch (error) {
        console.error('Failed to export artifact:', error);
        res.status(500).json({ error: 'Failed to export artifact' });
      }
    });
  });
}
