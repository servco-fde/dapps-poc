import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from '@databricks/appkit-ui/react';
import { ArrowLeft, Download, MessageSquare } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { apiRequest } from '../lib/api';
import type { CurrentUser, ProposalDetail, ProposalStatus } from '../lib/types';

const nextActions: Record<
  ProposalStatus,
  Array<{ status: ProposalStatus; label: string; variant?: 'default' | 'destructive' | 'outline' }>
> = {
  draft: [{ status: 'in_review', label: 'Submit for review' }],
  in_review: [
    { status: 'changes_requested', label: 'Request changes', variant: 'outline' },
    { status: 'approved', label: 'Accept' },
  ],
  changes_requested: [{ status: 'in_review', label: 'Resubmit for review' }],
  approved: [{ status: 'exported', label: 'Mark exported' }],
  exported: [{ status: 'published', label: 'Record publication' }],
  published: [],
};

export function ProposalDetailPage() {
  const { proposalId } = useParams();
  const [detail, setDetail] = useState<ProposalDetail | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [fieldAnchor, setFieldAnchor] = useState('');
  const [working, setWorking] = useState(false);

  const load = useCallback(async () => {
    if (!proposalId) return;
    try {
      const [loadedDetail, loadedUser] = await Promise.all([
        apiRequest<ProposalDetail>(`/api/proposals/${proposalId}`),
        apiRequest<CurrentUser>('/api/me'),
      ]);
      setDetail(loadedDetail);
      setCurrentUser(loadedUser);
      setError(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Failed to load proposal');
    } finally {
      setLoading(false);
    }
  }, [proposalId]);

  useEffect(() => {
    void load();
  }, [load]);

  const transition = async (status: ProposalStatus) => {
    if (!proposalId) return;
    setWorking(true);
    try {
      await apiRequest(`/api/proposals/${proposalId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Failed to update status');
    } finally {
      setWorking(false);
    }
  };

  const addComment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!proposalId || !comment.trim()) return;
    setWorking(true);
    try {
      await apiRequest(`/api/proposals/${proposalId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: comment, fieldAnchor }),
      });
      setComment('');
      setFieldAnchor('');
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Failed to add comment');
    } finally {
      setWorking(false);
    }
  };

  if (loading)
    return (
      <div className="mx-auto max-w-6xl space-y-4">
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  if (!detail)
    return (
      <div className="mx-auto max-w-6xl rounded-md border border-destructive/30 bg-destructive/10 p-4 text-destructive">
        {error ?? 'Proposal not found'}
      </div>
    );

  const { proposal, versions, comments, auditEvents } = detail;
  const draft = versions[0]?.draft_json;
  const allowedActions = nextActions[proposal.status].filter(
    (action) => action.status !== 'approved' || currentUser?.role === 'admin'
  );

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link to="/proposals">
          <ArrowLeft className="mr-2 h-4 w-4" />
          All proposals
        </Link>
      </Button>
      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}
      <section className="flex flex-col gap-5 rounded-xl border bg-card p-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={proposal.status} />
            <span className="text-sm text-muted-foreground">Version {proposal.current_version}</span>
            {currentUser && (
              <span className="rounded-full border px-2 py-0.5 text-xs font-medium capitalize text-muted-foreground">
                {currentUser.role}
              </span>
            )}
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{proposal.title}</h2>
            <p className="mt-2 max-w-3xl text-muted-foreground">{proposal.purpose}</p>
          </div>
          <code className="inline-block rounded bg-muted px-2 py-1 text-sm">{proposal.target_name}</code>
        </div>
        <div className="flex flex-wrap gap-2">
          {allowedActions.map((action) => (
            <Button
              key={action.status}
              variant={action.variant ?? 'default'}
              disabled={working}
              onClick={() => void transition(action.status)}
            >
              {action.label}
            </Button>
          ))}
          <Button asChild variant="outline">
            <a href={`/api/proposals/${proposal.id}/artifact`}>
              <Download className="mr-2 h-4 w-4" />
              Download artifact
            </a>
          </Button>
        </div>
      </section>
      {proposal.status === 'in_review' && currentUser?.role === 'reviewer' && (
        <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          Admin acceptance is required. As a reviewer, you can comment or request changes.
        </div>
      )}

      <Tabs defaultValue="definition" className="space-y-4">
        <TabsList>
          <TabsTrigger value="definition">Definition</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
          <TabsTrigger value="discussion">Discussion ({comments.length})</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        <TabsContent value="definition" className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Business context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <div className="text-muted-foreground">Business area</div>
                <div className="font-medium">{proposal.business_area}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Owner</div>
                <div className="font-medium">{proposal.owner_email}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Rationale</div>
                <p>{proposal.rationale}</p>
              </div>
              <div>
                <div className="text-muted-foreground">Desired date</div>
                <div>
                  {proposal.desired_date ? new Date(proposal.desired_date).toLocaleDateString() : 'Not specified'}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Acceptance criteria</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-2 pl-5 text-sm">
                {proposal.acceptance_criteria.map((criterion) => (
                  <li key={criterion}>{criterion}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Dimensions</CardTitle>
              <CardDescription>Structured fields in the current proposal version.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {draft?.dimensions.map((dimension) => (
                <div key={dimension.name} className="rounded-lg border p-3">
                  <div className="font-medium">{dimension.name}</div>
                  <code className="text-xs text-muted-foreground">{dimension.expression}</code>
                  <p className="mt-2 text-sm text-muted-foreground">{dimension.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Measures</CardTitle>
              <CardDescription>Aggregations and display intent in the current proposal version.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {draft?.measures.map((measure) => (
                <div key={measure.name} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium">{measure.name}</span>
                    <span className="text-xs uppercase text-muted-foreground">{measure.format}</span>
                  </div>
                  <code className="text-xs text-muted-foreground">{measure.expression}</code>
                  <p className="mt-2 text-sm text-muted-foreground">{measure.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="comparison">
          <Card>
            <CardHeader>
              <CardTitle>Published versus proposed</CardTitle>
              <CardDescription>Field-level summary for engineering review.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <h3 className="font-semibold">Published reference</h3>
                <code className="block rounded bg-muted p-3 text-xs">{proposal.target_metric_view}</code>
                <p className="text-sm text-muted-foreground">
                  The app reads this governed view using OBO. It remains unchanged by this workflow.
                </p>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold">Proposed candidate</h3>
                <code className="block rounded bg-muted p-3 text-xs">{proposal.target_name}</code>
                <p className="text-sm text-muted-foreground">
                  {draft?.dimensions.length ?? 0} dimensions · {draft?.measures.length ?? 0} measures · source{' '}
                  {proposal.source_fqn}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="discussion" className="grid gap-4 lg:grid-cols-[1fr_22rem]">
          <Card>
            <CardHeader>
              <CardTitle>Review discussion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {comments.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">No comments yet.</p>
              )}
              {comments.map((item) => (
                <div key={item.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                    <span>{item.author_email}</span>
                    <span>{new Date(item.created_at).toLocaleString()}</span>
                  </div>
                  {item.field_anchor && (
                    <code className="mt-2 inline-block rounded bg-muted px-2 py-1 text-xs">{item.field_anchor}</code>
                  )}
                  <p className="mt-2 text-sm">{item.body}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Add comment</CardTitle>
              <CardDescription>Anchor feedback to a field when useful.</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(event) => {
                  void addComment(event);
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="field-anchor">Field anchor</Label>
                  <Input
                    id="field-anchor"
                    value={fieldAnchor}
                    onChange={(event) => setFieldAnchor(event.target.value)}
                    placeholder="measures.gpvr"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comment">Comment</Label>
                  <Textarea
                    id="comment"
                    required
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    rows={5}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={working || !comment.trim()}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Add comment
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Immutable activity history</CardTitle>
              <CardDescription>Proposal creation, revisions, comments, and state changes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {auditEvents.map((event) => (
                <div key={event.id} className="flex flex-col gap-1 border-b pb-3 text-sm last:border-0">
                  <div className="font-medium">{event.event_type.replace(/_/g, ' ')}</div>
                  <div className="text-muted-foreground">
                    {event.actor_email} · {new Date(event.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
