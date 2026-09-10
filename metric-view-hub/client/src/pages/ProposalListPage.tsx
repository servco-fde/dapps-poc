import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from '@databricks/appkit-ui/react';
import { ArrowRight, Plus } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { apiRequest } from '../lib/api';
import type { ProposalSummary } from '../lib/types';

export function ProposalListPage() {
  const [proposals, setProposals] = useState<ProposalSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<ProposalSummary[]>('/api/proposals')
      .then(setProposals)
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Failed to load proposals'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Proposals</h2>
          <p className="mt-1 text-muted-foreground">Draft, review, and hand off governed metric-view changes.</p>
        </div>
        <Button asChild>
          <Link to="/proposals/new">
            <Plus className="mr-2 h-4 w-4" />
            New proposal
          </Link>
        </Button>
      </div>
      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-28 w-full" />
          ))}
        </div>
      )}
      {!loading && proposals.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>No proposals yet</CardTitle>
            <CardDescription>
              Create the first structured change request for the Auto Retail metric view.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/proposals/new">Create first proposal</Link>
            </Button>
          </CardContent>
        </Card>
      )}
      <div className="space-y-3">
        {proposals.map((proposal) => (
          <Link key={proposal.id} to={`/proposals/${proposal.id}`} className="block">
            <Card className="transition-colors hover:bg-muted/30">
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={proposal.status} />
                    <span className="text-xs text-muted-foreground">Version {proposal.current_version}</span>
                  </div>
                  <h3 className="truncate text-lg font-semibold">{proposal.title}</h3>
                  <p className="truncate text-sm text-muted-foreground">
                    {proposal.target_name} · Owner {proposal.owner_email}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>Updated {new Date(proposal.updated_at).toLocaleDateString()}</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
