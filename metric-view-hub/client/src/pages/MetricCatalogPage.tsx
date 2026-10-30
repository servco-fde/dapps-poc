import { useState } from 'react';
import { Link } from 'react-router';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  BarChart,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  LineChart,
  Skeleton,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Label,
  Empty,
  EmptyDescription,
  type MetricViewColumnDisplay,
  type UseMetricViewResult,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  useMetricView,
} from '@databricks/appkit-ui/react';
import { formatLabel, formatValue } from '@databricks/appkit-ui/js';
import { BookOpen, Database, Info, ShieldCheck } from 'lucide-react';
import metricDefinitions from '../../../config/metric-views/definitions.json';
import metricMetadata from '../../../config/metric-views/metadata.generated.json';
import { DOCUMENTATION_ROUTES, DOCUMENTATION_SECTION_IDS } from '../content/documentation';

const examples = {
  auto_retail: {
    label: 'Auto Retail',
    title: 'Auto Retail sales and F&I performance',
    description:
      'Governed dealership sales, gross-profit, and product-penetration metrics queried as the signed-in user.',
    coverage: 'Source dates from 2024',
    kpis: [
      ['deal_count', 'Completed deals'],
      ['gpvr', 'Front-end gross per retail vehicle'],
      ['finance_penetration', 'Share of deals financed'],
      ['total_product_penetration', 'Share with any F&I product'],
    ],
    breakdown: {
      title: 'Deal volume by dealership',
      description: 'Top eight dealerships by completed deal count.',
      dimension: 'dealership_name',
      measure: 'deal_count',
    },
    trend: {
      title: 'Monthly GPVR',
      description: 'Gross profit per retail vehicle over time.',
      dimension: 'sale_date',
      measure: 'gpvr',
    },
  },
  sample_orders: {
    label: 'Sample Orders',
    title: 'Sample Orders sales performance',
    description: 'Governed sample order revenue, customer activity, and market segments queried as the signed-in user.',
    coverage: 'Sample orders from January 1995 onward',
    kpis: [
      ['order_count', 'Distinct orders'],
      ['total_revenue', 'Total order revenue · source units'],
      ['unique_customers', 'Distinct customers with orders'],
      ['avg_order_value', 'Average revenue per order · source units'],
    ],
    breakdown: {
      title: 'Orders by market segment',
      description: 'Market segments ranked by distinct order count.',
      dimension: 'market_segment',
      measure: 'order_count',
    },
    trend: {
      title: 'Monthly order revenue',
      description: 'Total revenue by order month · source units.',
      dimension: 'order_date',
      measure: 'total_revenue',
    },
  },
} as const;

type ExampleKey = keyof typeof examples;

function QueryEmpty() {
  return (
    <Empty>
      <EmptyDescription>No data returned. Try another metric view or check source access.</EmptyDescription>
    </Empty>
  );
}

function QueryError({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
      {message}
    </div>
  );
}

function AutoRetailExample() {
  const summary = useMetricView('auto_retail', {
    measures: ['deal_count', 'gpvr', 'finance_penetration', 'total_product_penetration'],
  });
  const breakdown = useMetricView('auto_retail', {
    measures: ['deal_count', 'gpvr'],
    dimensions: ['dealership_name'],
    orderBy: [{ field: 'deal_count', direction: 'DESC' }],
    limit: 8,
  });
  const trend = useMetricView('auto_retail', {
    measures: ['gpvr'],
    dimensions: ['sale_date'],
    timeGrain: 'month',
    timeDimension: 'sale_date',
    orderBy: [{ field: 'sale_date', direction: 'ASC' }],
  });

  return <MetricExample metricKey="auto_retail" summary={summary} breakdown={breakdown} trend={trend} />;
}

function SampleOrdersExample() {
  const summary = useMetricView('sample_orders', {
    measures: ['order_count', 'total_revenue', 'unique_customers', 'avg_order_value'],
  });
  const breakdown = useMetricView('sample_orders', {
    measures: ['order_count'],
    dimensions: ['market_segment'],
    orderBy: [{ field: 'order_count', direction: 'DESC' }],
    limit: 8,
  });
  const trend = useMetricView('sample_orders', {
    measures: ['total_revenue'],
    dimensions: ['order_date'],
    timeGrain: 'month',
    timeDimension: 'order_date',
    orderBy: [{ field: 'order_date', direction: 'ASC' }],
  });
  return <MetricExample metricKey="sample_orders" summary={summary} breakdown={breakdown} trend={trend} />;
}

export function MetricCatalogPage() {
  const [metricKey, setMetricKey] = useState<ExampleKey>('auto_retail');
  return (
    <div className="servco-page mx-auto max-w-7xl space-y-6">
      <div className="space-y-2">
        <Label htmlFor="metric-view-selector">Metric view</Label>
        <Select
          value={metricKey}
          onValueChange={(value) => {
            if (value === 'auto_retail' || value === 'sample_orders') setMetricKey(value);
          }}
        >
          <SelectTrigger id="metric-view-selector" className="w-full sm:w-80">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(examples).map(([key, example]) => (
              <SelectItem key={key} value={key}>
                {example.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {metricKey === 'auto_retail' ? <AutoRetailExample /> : <SampleOrdersExample />}
    </div>
  );
}

function MetricExample({
  metricKey,
  summary,
  breakdown,
  trend,
}: {
  metricKey: ExampleKey;
  summary: UseMetricViewResult;
  breakdown: UseMetricViewResult;
  trend: UseMetricViewResult;
}) {
  const example = examples[metricKey];
  const members: {
    measures: Record<string, MetricViewColumnDisplay>;
    dimensions: Record<string, MetricViewColumnDisplay>;
  } = metricMetadata.metricViews[metricKey];
  const measures = Object.keys(members.measures);
  const dimensions = Object.keys(members.dimensions);
  const summaryRow = summary.data?.[0];

  return (
    <div className="space-y-6">
      <Alert className="border-primary/30 bg-accent/40">
        <Info className="h-4 w-4" />
        <AlertTitle>This is a reference implementation</AlertTitle>
        <AlertDescription>
          <p className="max-w-4xl">
            Metric View Hub demonstrates one configurable Databricks application. Its Auto Retail and Sample Orders
            data, resource bindings, roles, and proposal workflow are preconfigured examples that should change with
            your use case.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline">
              <Link to={DOCUMENTATION_ROUTES.app}>How Metric View Hub works</Link>
            </Button>
            <Button asChild size="sm">
              <Link to={`${DOCUMENTATION_ROUTES.fde}#${DOCUMENTATION_SECTION_IDS.referenceStatus}`}>
                Explore the FDE reference guide
              </Link>
            </Button>
          </div>
        </AlertDescription>
      </Alert>

      <section className="servco-hero flex flex-col gap-6 rounded-xl p-6 md:flex-row md:items-start md:justify-between md:p-8">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-white/25 bg-white text-primary">Published</Badge>
            <Badge
              asChild
              variant="outline"
              className="border-primary-foreground/40 bg-primary-foreground/10 text-primary-foreground"
            >
              <Link to={`${DOCUMENTATION_ROUTES.fde}#${DOCUMENTATION_SECTION_IDS.domainData}`}>
                {example.label} · example domain
              </Link>
            </Badge>
            <Badge
              asChild
              variant="outline"
              className="border-primary-foreground/40 bg-primary-foreground/10 text-primary-foreground"
            >
              <Link to={`${DOCUMENTATION_ROUTES.fde}#${DOCUMENTATION_SECTION_IDS.executionIdentity}`}>OBO access</Link>
            </Badge>
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">{example.title}</h2>
            <p className="mt-3 max-w-3xl text-white/80">{example.description}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-primary-foreground/40 text-primary-foreground">
              Example binding
            </Badge>
            <Link
              to={`${DOCUMENTATION_ROUTES.fde}#${DOCUMENTATION_SECTION_IDS.governedMetrics}`}
              className="servco-hero-code inline-block rounded px-2.5 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground"
            >
              <code className="break-all">{metricDefinitions.metricViews[metricKey].source}</code>
            </Link>
          </div>
        </div>
        <div className="grid shrink-0 gap-3 text-sm text-white/80 md:min-w-64">
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary-foreground" /> Unity Catalog governed
          </span>
          <span className="flex items-center gap-2">
            <Database className="h-4 w-4 text-primary-foreground" /> SQL warehouse analytics
          </span>
          <span className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary-foreground" /> {measures.length} measures · {dimensions.length}{' '}
            dimensions
          </span>
        </div>
      </section>

      {!summary.loading && !summary.error && !summary.data?.length && <QueryEmpty />}
      {summary.error && <QueryError message={summary.error} />}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summary.loading &&
          Array.from({ length: 4 }, (_, index) => (
            <Card key={index} className="servco-kpi-card">
              <CardContent className="space-y-3 p-6">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-9 w-36" />
                <Skeleton className="h-3 w-44" />
              </CardContent>
            </Card>
          ))}
        {!summary.loading &&
          summaryRow &&
          example.kpis.map(([field, context]) => (
            <Card key={field} className="servco-kpi-card">
              <CardHeader className="pb-2">
                <CardDescription>{formatLabel(field, summary.metadata?.[field])}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="break-all text-2xl font-bold tabular-nums">
                  {formatValue(summaryRow[field], summary.metadata?.[field]?.format)}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {context} · {example.coverage}
                </p>
              </CardContent>
            </Card>
          ))}
      </section>

      <Tabs defaultValue="overview" className="min-w-0 space-y-4">
        <TabsList className="servco-tabs-list max-w-full overflow-x-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="measures">Measures</TabsTrigger>
          <TabsTrigger value="dimensions">Dimensions</TabsTrigger>
          <TabsTrigger value="governance">Governance</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="grid gap-4 xl:grid-cols-2">
          <Card className="servco-section-card">
            <CardHeader>
              <CardTitle>{example.breakdown.title}</CardTitle>
              <CardDescription>
                {example.breakdown.description} {example.coverage}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {breakdown.loading && <Skeleton className="h-[360px] w-full" />}
              {breakdown.error && <QueryError message={breakdown.error} />}
              {!breakdown.loading && !breakdown.error && !breakdown.data?.length && <QueryEmpty />}
              {!breakdown.loading && !breakdown.error && !!breakdown.data?.length && (
                <BarChart
                  data={breakdown.data}
                  xKey={example.breakdown.dimension}
                  yKey={example.breakdown.measure}
                  orientation="horizontal"
                  height={360}
                  colorPalette="categorical"
                  valueFormatter={(value, field) => formatValue(value, breakdown.metadata?.[field]?.format)}
                />
              )}
            </CardContent>
          </Card>
          <Card className="servco-section-card">
            <CardHeader>
              <CardTitle>{example.trend.title}</CardTitle>
              <CardDescription>
                {example.trend.description} {example.coverage}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {trend.loading && <Skeleton className="h-[360px] w-full" />}
              {trend.error && <QueryError message={trend.error} />}
              {!trend.loading && !trend.error && !trend.data?.length && <QueryEmpty />}
              {!trend.loading && !trend.error && !!trend.data?.length && (
                <LineChart
                  data={trend.data}
                  xKey={example.trend.dimension}
                  yKey={example.trend.measure}
                  height={360}
                  showSymbol={false}
                  valueFormatter={(value, field) => formatValue(value, trend.metadata?.[field]?.format)}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="measures">
          <Card className="servco-section-card">
            <CardHeader>
              <CardTitle>Governed measures</CardTitle>
              <CardDescription>Measures available from the selected metric view.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(members.measures).map(([measure, metadata]) => (
                <div key={measure} className="servco-definition-tile break-words min-w-0 rounded-lg border p-3">
                  <div className="font-medium">{formatLabel(measure, metadata)}</div>
                  <code className="text-xs text-muted-foreground">{measure}</code>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="dimensions">
          <Card className="servco-section-card">
            <CardHeader>
              <CardTitle>Governed dimensions</CardTitle>
              <CardDescription>Supported slices for analysis and proposal comparison.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(members.dimensions).map(([dimension, metadata]) => (
                <div key={dimension} className="servco-definition-tile break-words min-w-0 rounded-lg border p-3">
                  <div className="font-medium">{formatLabel(dimension, metadata)}</div>
                  <code className="text-xs text-muted-foreground">{dimension}</code>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="governance">
          <Card className="servco-section-card">
            <CardHeader>
              <CardTitle>Access and publication boundary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Metric results use on-behalf-of execution and therefore follow each signed-in user’s Unity Catalog
                permissions.
              </p>
              <p>
                Proposals and reviews are application data in Lakebase. Approval creates an engineering handoff; it
                never replaces this Unity Catalog view directly.
              </p>
              <p>
                The deployed app service principal owns the dedicated <code>metric_hub</code> Lakebase schema. Local
                development uses a separate developer-owned schema.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
