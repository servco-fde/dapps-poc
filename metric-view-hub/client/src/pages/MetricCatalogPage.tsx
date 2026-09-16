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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  useMetricView,
} from '@databricks/appkit-ui/react';
import { formatLabel, formatValue } from '@databricks/appkit-ui/js';
import { BookOpen, Database, Info, ShieldCheck } from 'lucide-react';
import { DOCUMENTATION_ROUTES, DOCUMENTATION_SECTION_IDS } from '../content/documentation';

const measures = [
  'deal_count',
  'gpvr',
  'pvr_with_reserve',
  'pvr_without_reserve',
  'finance_penetration',
  'vsc_penetration',
  'gap_penetration',
  'total_product_penetration',
  'total_product_gross',
  'accessory_penetration',
  'reserve_penetration',
  'aftermarket_penetration',
];

const dimensions = [
  'sale_date',
  'dealership_name',
  'dealership_island',
  'vehicle_type_description',
  'deal_type_description',
  'vehicle_make',
  'vehicle_model',
  'vehicle_year',
  'primary_salesperson_name',
  'secondary_salesperson_name',
  'f_and_i_manager_name',
  'sale_manager_name',
];

function QueryError({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
      {message}
    </div>
  );
}

export function MetricCatalogPage() {
  const summary = useMetricView('auto_retail', {
    measures: ['deal_count', 'gpvr', 'finance_penetration', 'total_product_penetration'],
  });
  const byDealership = useMetricView('auto_retail', {
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

  const summaryRow = summary.data?.[0];

  return (
    <div className="servco-page mx-auto max-w-7xl space-y-6">
      <Alert className="border-primary/30 bg-accent/40">
        <Info className="h-4 w-4" />
        <AlertTitle>This is a reference implementation</AlertTitle>
        <AlertDescription>
          <p className="max-w-4xl">
            Metric View Hub demonstrates one configurable Databricks application. Its Auto Retail data, resource
            bindings, roles, and proposal workflow are preconfigured examples that should change with your use case.
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
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-white/25 bg-white text-primary">Published</Badge>
            <Badge
              asChild
              variant="outline"
              className="border-primary-foreground/40 bg-primary-foreground/10 text-primary-foreground"
            >
              <Link to={`${DOCUMENTATION_ROUTES.fde}#${DOCUMENTATION_SECTION_IDS.domainData}`}>
                Auto Retail · example domain
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
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              Auto Retail sales and F&amp;I performance
            </h2>
            <p className="mt-3 max-w-3xl text-white/80">
              Governed dealership sales, gross-profit, and product-penetration metrics queried as the signed-in user.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-primary-foreground/40 text-primary-foreground">
              Example binding
            </Badge>
            <Link
              to={`${DOCUMENTATION_ROUTES.fde}#${DOCUMENTATION_SECTION_IDS.governedMetrics}`}
              className="servco-hero-code inline-block rounded px-2.5 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground"
            >
              <code>hawaii_prod.testing.vw__metrics_test</code>
            </Link>
          </div>
        </div>
        <div className="grid shrink-0 gap-3 text-sm text-white/80 md:min-w-64">
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#7bd0ee]" /> Unity Catalog governed
          </span>
          <span className="flex items-center gap-2">
            <Database className="h-4 w-4 text-[#7bd0ee]" /> SQL warehouse analytics
          </span>
          <span className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-[#7bd0ee]" /> 32 measures · 14 dimensions
          </span>
        </div>
      </section>

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
          (
            [
              ['deal_count', 'Completed deals'],
              ['gpvr', 'Front-end gross per retail vehicle'],
              ['finance_penetration', 'Share of deals financed'],
              ['total_product_penetration', 'Share with any F&I product'],
            ] as const
          ).map(([field, context]) => (
            <Card key={field} className="servco-kpi-card">
              <CardHeader className="pb-2">
                <CardDescription>{formatLabel(field, summary.metadata?.[field])}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tabular-nums">
                  {formatValue(summaryRow[field], summary.metadata?.[field]?.format)}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{context} · source dates from 2024</p>
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
              <CardTitle>Deal volume by dealership</CardTitle>
              <CardDescription>Top eight dealerships by completed deal count.</CardDescription>
            </CardHeader>
            <CardContent>
              {byDealership.loading && <Skeleton className="h-[360px] w-full" />}
              {byDealership.error && <QueryError message={byDealership.error} />}
              {byDealership.data && (
                <BarChart
                  data={byDealership.data}
                  xKey="dealership_name"
                  yKey="deal_count"
                  orientation="horizontal"
                  height={360}
                  colorPalette="categorical"
                  valueFormatter={(value, field) => formatValue(value, byDealership.metadata?.[field]?.format)}
                />
              )}
            </CardContent>
          </Card>
          <Card className="servco-section-card">
            <CardHeader>
              <CardTitle>Monthly GPVR</CardTitle>
              <CardDescription>Gross profit per retail vehicle over time.</CardDescription>
            </CardHeader>
            <CardContent>
              {trend.loading && <Skeleton className="h-[360px] w-full" />}
              {trend.error && <QueryError message={trend.error} />}
              {trend.data && (
                <LineChart
                  data={trend.data}
                  xKey="sale_date"
                  yKey="gpvr"
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
              <CardDescription>Frequently used measures available from the selected metric view.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {measures.map((measure) => (
                <div key={measure} className="servco-definition-tile min-w-0 rounded-lg border p-3">
                  <div className="font-medium">{measure.replace(/_/g, ' ')}</div>
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
              {dimensions.map((dimension) => (
                <div key={dimension} className="servco-definition-tile min-w-0 rounded-lg border p-3">
                  <div className="font-medium">{dimension.replace(/_/g, ' ')}</div>
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
