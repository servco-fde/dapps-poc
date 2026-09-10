import {
  Badge,
  BarChart,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  LineChart,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  useMetricView,
} from '@databricks/appkit-ui/react';
import { formatLabel, formatValue } from '@databricks/appkit-ui/js';
import { BookOpen, Database, ShieldCheck } from 'lucide-react';

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
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="flex flex-col gap-4 rounded-xl border bg-card p-6 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>Published</Badge>
            <Badge variant="outline">Auto Retail</Badge>
            <Badge variant="secondary">OBO access</Badge>
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Auto Retail sales and F&amp;I performance</h2>
            <p className="mt-2 max-w-3xl text-muted-foreground">
              Governed dealership sales, gross-profit, and product-penetration metrics queried as the signed-in user.
            </p>
          </div>
          <code className="inline-block rounded bg-muted px-2 py-1 text-sm">hawaii_prod.testing.vw__metrics_test</code>
        </div>
        <div className="grid min-w-64 gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" /> Unity Catalog governed
          </span>
          <span className="flex items-center gap-2">
            <Database className="h-4 w-4" /> SQL warehouse analytics
          </span>
          <span className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" /> 32 measures · 14 dimensions
          </span>
        </div>
      </section>

      {summary.error && <QueryError message={summary.error} />}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summary.loading &&
          Array.from({ length: 4 }, (_, index) => (
            <Card key={index}>
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
            <Card key={field}>
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

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="measures">Measures</TabsTrigger>
          <TabsTrigger value="dimensions">Dimensions</TabsTrigger>
          <TabsTrigger value="governance">Governance</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="grid gap-4 xl:grid-cols-2">
          <Card>
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
          <Card>
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
          <Card>
            <CardHeader>
              <CardTitle>Governed measures</CardTitle>
              <CardDescription>Frequently used measures available from the selected metric view.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {measures.map((measure) => (
                <div key={measure} className="rounded-lg border p-3">
                  <div className="font-medium">{measure.replace(/_/g, ' ')}</div>
                  <code className="text-xs text-muted-foreground">{measure}</code>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="dimensions">
          <Card>
            <CardHeader>
              <CardTitle>Governed dimensions</CardTitle>
              <CardDescription>Supported slices for analysis and proposal comparison.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {dimensions.map((dimension) => (
                <div key={dimension} className="rounded-lg border p-3">
                  <div className="font-medium">{dimension.replace(/_/g, ' ')}</div>
                  <code className="text-xs text-muted-foreground">{dimension}</code>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="governance">
          <Card>
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
                The deployed app service principal owns only the dedicated <code>metric_hub</code> Lakebase schema.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
