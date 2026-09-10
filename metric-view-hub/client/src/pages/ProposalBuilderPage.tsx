import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@databricks/appkit-ui/react';
import { Plus, Trash2 } from 'lucide-react';
import { apiRequest } from '../lib/api';
import type { DraftDimension, DraftMeasure, ProposalDraft } from '../lib/types';

const initialDraft: ProposalDraft = {
  title: '',
  businessArea: 'Auto Retail',
  changeType: 'change_existing',
  targetMetricView: 'hawaii_prod.testing.vw__metrics_test',
  targetName: 'hawaii_dev.testing.vw__metrics_test_candidate',
  sourceFqn: 'hawaii_prod.testing.tbl__primary__auto_retail__vehicle_deal',
  purpose: '',
  ownerEmail: '',
  acceptanceCriteria: [],
  dimensions: [
    {
      clientId: 'initial-dimension',
      name: 'Dealership Name',
      expression: 'dealership_name',
      description: 'The dealership responsible for the vehicle deal.',
    },
  ],
  measures: [
    {
      clientId: 'initial-measure',
      name: 'Deal Count',
      expression: 'COUNT(1)',
      description: 'The number of completed vehicle deals.',
      format: 'number',
    },
  ],
  rationale: '',
  desiredDate: '',
};

export function ProposalBuilderPage() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<ProposalDraft>(initialDraft);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [criteriaRows, setCriteriaRows] = useState([{ id: 'initial-criterion', value: '' }]);

  const setField = <K extends keyof ProposalDraft>(key: K, value: ProposalDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const updateDimension = (index: number, key: keyof DraftDimension, value: string) => {
    setField(
      'dimensions',
      draft.dimensions.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item))
    );
  };

  const updateMeasure = <K extends keyof DraftMeasure>(index: number, key: K, value: DraftMeasure[K]) => {
    setField(
      'measures',
      draft.measures.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item))
    );
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const created = await apiRequest<{ id: string }>('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...draft,
          acceptanceCriteria: criteriaRows.map((item) => item.value.trim()).filter(Boolean),
        }),
      });
      void navigate(`/proposals/${created.id}`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Failed to create proposal');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={(event) => {
        void submit(event);
      }}
      className="mx-auto w-full max-w-5xl space-y-6"
    >
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Create a metric-view proposal</h2>
        <p className="mt-1 text-muted-foreground">
          Capture business intent in structured fields. The app generates the SQL/YAML handoff.
        </p>
      </div>
      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Business request</CardTitle>
          <CardDescription>
            Describe the outcome and accountable owner before defining technical fields.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="title">Proposal title</Label>
            <Input
              id="title"
              required
              minLength={3}
              value={draft.title}
              onChange={(event) => setField('title', event.target.value)}
              placeholder="Add service-contract revenue and penetration"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="business-area">Business area</Label>
            <Input
              id="business-area"
              required
              value={draft.businessArea}
              onChange={(event) => setField('businessArea', event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="change-type">Request type</Label>
            <Select
              value={draft.changeType}
              onValueChange={(value) => setField('changeType', value as ProposalDraft['changeType'])}
            >
              <SelectTrigger id="change-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="change_existing">Change an existing metric view</SelectItem>
                <SelectItem value="new_metric_view">Create a new metric view</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="purpose">Business purpose</Label>
            <Textarea
              id="purpose"
              required
              minLength={10}
              value={draft.purpose}
              onChange={(event) => setField('purpose', event.target.value)}
              placeholder="Explain the decision this metric should support and who will use it."
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="owner">Accountable owner</Label>
            <Input
              id="owner"
              type="email"
              required
              value={draft.ownerEmail}
              onChange={(event) => setField('ownerEmail', event.target.value)}
              placeholder="owner@company.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="desired-date">Desired delivery date</Label>
            <Input
              id="desired-date"
              type="date"
              value={draft.desiredDate}
              onChange={(event) => setField('desiredDate', event.target.value)}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="rationale">Rationale and impact</Label>
            <Textarea
              id="rationale"
              required
              minLength={10}
              value={draft.rationale}
              onChange={(event) => setField('rationale', event.target.value)}
              placeholder="Why is this needed, what changes, and what downstream users may be affected?"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Metric-view identity</CardTitle>
          <CardDescription>
            The generated candidate remains an engineering artifact and is never published by this form.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="space-y-2">
            <Label htmlFor="target-metric">Published view being changed</Label>
            <Input
              id="target-metric"
              required
              value={draft.targetMetricView}
              onChange={(event) => setField('targetMetricView', event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="candidate-name">Candidate target name</Label>
            <Input
              id="candidate-name"
              required
              value={draft.targetName}
              onChange={(event) => setField('targetName', event.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Use a non-production target while the proposal is under review.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="source-fqn">Source table or view</Label>
            <Input
              id="source-fqn"
              required
              value={draft.sourceFqn}
              onChange={(event) => setField('sourceFqn', event.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Dimensions</CardTitle>
            <CardDescription>Define the business slices that users can group or filter by.</CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setField('dimensions', [
                ...draft.dimensions,
                { clientId: crypto.randomUUID(), name: '', expression: '', description: '' },
              ])
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {draft.dimensions.map((dimension, index) => (
            <div
              key={dimension.clientId ?? dimension.name}
              className="grid gap-3 rounded-lg border p-4 md:grid-cols-[1fr_1fr_auto]"
            >
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  required
                  value={dimension.name}
                  onChange={(event) => updateDimension(index, 'name', event.target.value)}
                  placeholder="Sale Month"
                />
              </div>
              <div className="space-y-2">
                <Label>Expression</Label>
                <Input
                  required
                  value={dimension.expression}
                  onChange={(event) => updateDimension(index, 'expression', event.target.value)}
                  placeholder="DATE_TRUNC('MONTH', sale_date)"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="self-end"
                disabled={draft.dimensions.length === 1}
                onClick={() =>
                  setField(
                    'dimensions',
                    draft.dimensions.filter((_, itemIndex) => itemIndex !== index)
                  )
                }
                aria-label="Remove dimension"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <div className="space-y-2 md:col-span-3">
                <Label>Description</Label>
                <Textarea
                  required
                  value={dimension.description}
                  onChange={(event) => updateDimension(index, 'description', event.target.value)}
                  rows={2}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Measures</CardTitle>
            <CardDescription>Define aggregate expressions, meaning, and display intent.</CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setField('measures', [
                ...draft.measures,
                { clientId: crypto.randomUUID(), name: '', expression: '', description: '', format: 'number' },
              ])
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {draft.measures.map((measure, index) => (
            <div
              key={measure.clientId ?? measure.name}
              className="grid gap-3 rounded-lg border p-4 md:grid-cols-[1fr_1fr_12rem_auto]"
            >
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  required
                  value={measure.name}
                  onChange={(event) => updateMeasure(index, 'name', event.target.value)}
                  placeholder="Deal Count"
                />
              </div>
              <div className="space-y-2">
                <Label>Aggregate expression</Label>
                <Input
                  required
                  value={measure.expression}
                  onChange={(event) => updateMeasure(index, 'expression', event.target.value)}
                  placeholder="COUNT(1)"
                />
              </div>
              <div className="space-y-2">
                <Label>Format</Label>
                <Select
                  value={measure.format}
                  onValueChange={(value) => updateMeasure(index, 'format', value as DraftMeasure['format'])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="currency">Currency (USD)</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="self-end"
                disabled={draft.measures.length === 1}
                onClick={() =>
                  setField(
                    'measures',
                    draft.measures.filter((_, itemIndex) => itemIndex !== index)
                  )
                }
                aria-label="Remove measure"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <div className="space-y-2 md:col-span-4">
                <Label>Description</Label>
                <Textarea
                  required
                  value={measure.description}
                  onChange={(event) => updateMeasure(index, 'description', event.target.value)}
                  rows={2}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Acceptance criteria</CardTitle>
            <CardDescription>State the evidence reviewers need before engineering handoff.</CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setCriteriaRows((rows) => [...rows, { id: crypto.randomUUID(), value: '' }])}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {criteriaRows.map((criterion, index) => (
            <div key={criterion.id} className="flex gap-2">
              <Input
                required
                value={criterion.value}
                onChange={(event) =>
                  setCriteriaRows((rows) =>
                    rows.map((item, itemIndex) => (itemIndex === index ? { ...item, value: event.target.value } : item))
                  )
                }
                placeholder="Example: GPVR matches the approved finance report within 0.5%."
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={criteriaRows.length === 1}
                onClick={() => setCriteriaRows((rows) => rows.filter((_, itemIndex) => itemIndex !== index))}
                aria-label="Remove acceptance criterion"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
        <CardFooter className="justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              void navigate('/proposals');
            }}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create proposal'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
