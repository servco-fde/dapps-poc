import { describe, expect, it } from 'vitest';
import { canRoleTransition, canTransition, generateMetricViewArtifact, resolveRole } from './proposal-routes';

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
    const configuredAdmins = 'roberto.delgado@servco.com,other.admin@example.com';

    expect(resolveRole('Roberto.Delgado@servco.com', configuredAdmins)).toBe('admin');
    expect(resolveRole('reviewer@example.com', configuredAdmins)).toBe('reviewer');
    expect(resolveRole('reviewer@example.com', '')).toBe('reviewer');
  });

  it('allows only admins to accept an in-review proposal', () => {
    expect(canRoleTransition('admin', 'in_review', 'approved')).toBe(true);
    expect(canRoleTransition('reviewer', 'in_review', 'approved')).toBe(false);
    expect(canRoleTransition('reviewer', 'in_review', 'changes_requested')).toBe(true);
  });
});
