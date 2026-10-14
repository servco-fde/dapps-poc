import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Application, Request, Response } from 'express';
import {
  canRoleTransition,
  canTransition,
  generateMetricViewArtifact,
  resolveAppSchema,
  resolveRole,
  setupProposalRoutes,
} from './proposal-routes';

const draft = {
  title: 'Add finance penetration',
  businessArea: 'Auto Retail',
  changeType: 'change_existing' as const,
  targetMetricView: 'hawaii_prod.testing.vw__metrics_test',
  targetName: 'hawaii_dev.testing.vw__metrics_test_candidate',
  sourceFqn: 'hawaii_prod.testing.tbl__primary__auto_retail__vehicle_deal',
  purpose: 'Give dealership leaders a governed finance penetration measure.',
  ownerEmail: 'owner@example.com',
  acceptanceCriteria: ['Matches the approved finance report.'],
  dimensions: [
    {
      name: 'Dealership Name',
      expression: 'dealership_name',
      description: 'The dealership responsible for the deal.',
    },
  ],
  measures: [
    {
      name: 'Finance Penetration',
      expression: "COUNT(1) FILTER (WHERE deal_type = 'Finance') * 1.0 / COUNT(1)",
      description: 'The share of deals financed through the dealership.',
      format: 'percentage' as const,
    },
  ],
  rationale: 'Teams currently calculate this metric differently in separate reports.',
  desiredDate: '2026-09-30',
};

describe('generateMetricViewArtifact', () => {
  it('renders deterministic, reviewable metric-view SQL and YAML', () => {
    const first = generateMetricViewArtifact(draft);
    const second = generateMetricViewArtifact(draft);

    expect(first).toBe(second);
    expect(first).toContain('CREATE OR REPLACE VIEW hawaii_dev.testing.vw__metrics_test_candidate');
    expect(first).toContain('source: hawaii_prod.testing.tbl__primary__auto_retail__vehicle_deal');
    expect(first).toContain('type: percentage');
    expect(first).toContain('comment: "The share of deals financed through the dealership."');
  });
});

describe('proposal workflow', () => {
  it('allows the review and approval path', () => {
    expect(canTransition('draft', 'in_review')).toBe(true);
    expect(canTransition('in_review', 'approved')).toBe(true);
    expect(canTransition('approved', 'exported')).toBe(true);
    expect(canTransition('exported', 'published')).toBe(true);
  });

  it('rejects publication and approval shortcuts', () => {
    expect(canTransition('draft', 'approved')).toBe(false);
    expect(canTransition('in_review', 'published')).toBe(false);
    expect(canTransition('published', 'draft')).toBe(false);
  });
});

describe('application roles', () => {
  it('matches configured admins case-insensitively and defaults other users to reviewer', () => {
    const configuredAdmins = [
      'roberto.delgado@servco.com',
      'tausif.islam@servco.com',
      'iden.watanabe@servco.com',
      'sam.ikemoto@servco.com',
      'katerina.walter@servco.com',
    ].join(',');

    expect(resolveRole('Roberto.Delgado@servco.com', configuredAdmins)).toBe('admin');
    expect(resolveRole('iden.watanabe@servco.com', configuredAdmins)).toBe('admin');
    expect(resolveRole('sam.ikemoto@servco.com', configuredAdmins)).toBe('admin');
    expect(resolveRole('katerina.walter@servco.com', configuredAdmins)).toBe('admin');
    expect(resolveRole('reviewer@example.com', configuredAdmins)).toBe('reviewer');
    expect(resolveRole('reviewer@example.com', '')).toBe('reviewer');
  });

  it('allows only admins to accept an in-review proposal', () => {
    expect(canRoleTransition('admin', 'in_review', 'approved')).toBe(true);
    expect(canRoleTransition('reviewer', 'in_review', 'approved')).toBe(false);
    expect(canRoleTransition('reviewer', 'in_review', 'changes_requested')).toBe(true);
  });
});

describe('application schema', () => {
  it('accepts an isolated local schema and rejects unsafe identifiers', () => {
    expect(resolveAppSchema('metric_hub_local_roberto')).toBe('metric_hub_local_roberto');
    expect(() => resolveAppSchema('metric-hub; DROP SCHEMA metric_hub')).toThrow(
      'Use a lowercase PostgreSQL schema identifier'
    );
  });
});

describe('version-aware status transitions', () => {
  afterEach(() => vi.unstubAllEnvs());

  async function routeHarness() {
    vi.stubEnv('APP_ADMIN_EMAILS', 'admin@example.com');
    let version = 1;
    let status = 'in_review';
    let approvedBy: string | null = null;
    const events: Array<{ from: string; to: string; version: number }> = [];
    let transitionSql = '';
    let beforeUpdate: (() => void) | undefined;
    let handler: (req: Request, res: Response) => Promise<void> = async () => {
      throw new Error('Status route was not registered');
    };

    await setupProposalRoutes({
      lakebase: {
        query: async (sql: string, params: unknown[] = []) => {
          if (sql.includes('SELECT status, current_version')) {
            return { rows: [{ status, current_version: version }] };
          }
          if (sql.includes('WITH updated AS') && sql.includes('status_changed')) {
            transitionSql = sql;
            beforeUpdate?.();
            beforeUpdate = undefined;
            // Model the WHERE clause: only a matching status AND version may write.
            if (params[1] !== status || params[2] !== version || !sql.includes('AND current_version = $3')) {
              return { rows: [] };
            }
            const from = status;
            status = params[3] as string;
            if (status === 'approved') approvedBy = params[4] as string;
            if (sql.includes("'version', $3")) events.push({ from, to: status, version });
            return { rows: [{ status, current_version: version, approved_by: approvedBy }] };
          }
          return { rows: [] };
        },
      },
      server: {
        extend: (register) => {
          const app = {
            get: () => undefined,
            post: () => undefined,
            put: () => undefined,
            patch: (path: string, callback: typeof handler) => {
              if (path === '/api/proposals/:id/status') handler = callback;
            },
          } as unknown as Application;
          register(app);
        },
      },
    });

    const transition = async (body: unknown, email = 'admin@example.com') => {
      let code = 200;
      let payload: Record<string, unknown> = {};
      const request = {
        body,
        params: { id: 'proposal-1' },
        header: (name: string) => name === 'x-forwarded-email' ? email : undefined,
      } as unknown as Request;
      const response = {
        status(value: number) { code = value; return this; },
        json(value: Record<string, unknown>) { payload = value; return this; },
      } as unknown as Response;
      await handler(request, response);
      return { code, payload };
    };
    return {
      transition,
      revise: () => { version += 1; status = 'in_review'; },
      raceWithRevision: () => { beforeUpdate = () => { version += 1; }; },
      get state() { return { status, version, approvedBy, events, transitionSql }; },
    };
  }

  it('requires a positive reviewed version', async () => {
    const harness = await routeHarness();
    expect((await harness.transition({ status: 'approved' })).code).toBe(400);
    expect((await harness.transition({ status: 'approved', expectedVersion: 0 })).code).toBe(400);
    expect(harness.state.events).toEqual([]);
  });

  it('rejects an old approval after revision, then audits approval of the reviewed version', async () => {
    const harness = await routeHarness();
    harness.revise();
    expect((await harness.transition({ status: 'approved', expectedVersion: 1 })).code).toBe(409);
    expect(harness.state).toMatchObject({ status: 'in_review', approvedBy: null, events: [] });

    expect((await harness.transition({ status: 'approved', expectedVersion: 2 })).code).toBe(200);
    expect(harness.state).toMatchObject({
      status: 'approved', approvedBy: 'admin@example.com',
      events: [{ from: 'in_review', to: 'approved', version: 2 }],
    });
    expect(harness.state.transitionSql).toContain('WHERE id = $1 AND status = $2 AND current_version = $3');
  });

  it('rejects a revision between read and update without recording an approval event', async () => {
    const harness = await routeHarness();
    harness.raceWithRevision();
    expect((await harness.transition({ status: 'approved', expectedVersion: 1 })).code).toBe(409);
    expect(harness.state).toMatchObject({ status: 'in_review', version: 2, approvedBy: null, events: [] });
  });

  it('preserves the admin-only approval permission', async () => {
    const harness = await routeHarness();
    expect((await harness.transition({ status: 'approved', expectedVersion: 1 }, 'reviewer@example.com')).code)
      .toBe(403);
    expect(harness.state.events).toEqual([]);
  });
});
