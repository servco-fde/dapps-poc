import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@databricks/appkit-ui/react';
import { ArrowUpRight, Boxes, CircleDot, GitBranch, ShieldCheck } from 'lucide-react';
import { ReferenceClassificationBadges } from '../components/ReferenceClassificationBadges';
import {
  ARCHITECTURE_STEPS,
  CUSTOMIZATION_STEPS,
  DOCUMENTATION_SECTION_IDS,
  PUBLIC_BINDINGS,
  REFERENCE_ITEMS,
  REPOSITORY_GUIDES,
  SOURCE_MAP,
} from '../content/documentation';

function ExternalLinkHint() {
  return <span className="sr-only"> (opens in a new tab)</span>;
}

export function FdeReferenceGuidePage() {
  return (
    <article className="space-y-6" aria-labelledby="fde-guide-title">
      <section id={DOCUMENTATION_SECTION_IDS.referenceStatus} className="servco-doc-section space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>Reference implementation</Badge>
          <Badge variant="outline">FDE documentation</Badge>
        </div>
        <div>
          <h3 id="fde-guide-title" className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            FDE Reference Guide
          </h3>
          <p className="mt-3 max-w-4xl text-muted-foreground">
            Metric View Hub demonstrates Databricks primitives working together inside the tenant. Its Auto Retail
            domain, bound resources, application roles, and proposal workflow are preconfigured examples—not defaults
            every Databricks App should inherit.
          </p>
        </div>
        <Alert>
          <Boxes className="h-4 w-4" />
          <AlertTitle>Start from the primitives, not the sample choices</AlertTitle>
          <AlertDescription>
            Preserve the governed platform capabilities that fit your problem, then replace the data, resources,
            identity model, workflow, and user experience your own application requires.
          </AlertDescription>
        </Alert>
      </section>

      <Separator />

      <section id={DOCUMENTATION_SECTION_IDS.architecture} className="servco-doc-section space-y-4">
        <div>
          <h3 className="text-xl font-semibold">Reference architecture</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            The working app joins governed reads, collaborative state, and a deliberately external publication path.
          </p>
        </div>
        <ol className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {ARCHITECTURE_STEPS.map((step, index) => (
            <li key={step.title}>
              <Card className="servco-section-card h-full">
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <Badge variant="outline">{index + 1}</Badge>
                    <GitBranch className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  </div>
                  <CardTitle className="pt-2 text-base">{step.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">{step.description}</CardContent>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card id={DOCUMENTATION_SECTION_IDS.domainData} className="servco-doc-section servco-section-card">
          <CardHeader>
            <CardTitle className="text-base">Domain data is an example</CardTitle>
            <CardDescription>Metric Hub default · Replace for your app</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Auto Retail sales, F&I performance, dealership dimensions, and penetration measures demonstrate the UX. They
            are not a required Databricks application domain.
          </CardContent>
        </Card>
        <Card id={DOCUMENTATION_SECTION_IDS.governedMetrics} className="servco-doc-section servco-section-card">
          <CardHeader>
            <CardTitle className="text-base">Governed metric semantics</CardTitle>
            <CardDescription>Databricks primitive · Environment binding</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            AppKit alias <code>{PUBLIC_BINDINGS.metricViewAlias}</code> reads <code>{PUBLIC_BINDINGS.metricView}</code>.
            Bind your own governed Metric View or query surface.
          </CardContent>
        </Card>
        <Card id={DOCUMENTATION_SECTION_IDS.executionIdentity} className="servco-doc-section servco-section-card">
          <CardHeader>
            <CardTitle className="text-base">Execution identity is deliberate</CardTitle>
            <CardDescription>Databricks primitive · Example implementation</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Analytics uses OBO execution so Unity Catalog evaluates the signed-in user. A new app should choose user or
            service-principal execution per capability and request only necessary scopes.
          </CardContent>
        </Card>
        <Card id={DOCUMENTATION_SECTION_IDS.resourceBindings} className="servco-doc-section servco-section-card">
          <CardHeader>
            <CardTitle className="text-base">Bindings belong to this environment</CardTitle>
            <CardDescription>Environment binding · Replace for your app</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Warehouse: <code>{PUBLIC_BINDINGS.sqlWarehouse}</code>
            </p>
            <p>
              Lakebase project/schema: <code>{PUBLIC_BINDINGS.lakebaseProject}</code> /{' '}
              <code>{PUBLIC_BINDINGS.lakebaseSchema}</code>
            </p>
            <p>
              These names describe the reference deployment; they are not reusable credentials or universal defaults.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4" aria-labelledby="primitive-map-title">
        <div>
          <h3 id="primitive-map-title" className="text-xl font-semibold">
            Primitive and adaptation map
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Read each row as a design decision: what the platform supplies, what this app chose, and what you should
            reconsider.
          </p>
        </div>

        <div className="hidden overflow-x-auto rounded-lg border bg-card md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-44">Capability</TableHead>
                <TableHead className="min-w-52">Databricks primitive</TableHead>
                <TableHead className="min-w-64">Metric Hub example</TableHead>
                <TableHead className="min-w-72">Expected adaptation</TableHead>
                <TableHead className="min-w-64">Classification</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {REFERENCE_ITEMS.map((item) => (
                <TableRow key={item.capability}>
                  <TableCell className="font-medium align-top">{item.capability}</TableCell>
                  <TableCell className="align-top">{item.primitive}</TableCell>
                  <TableCell className="align-top text-muted-foreground">{item.example}</TableCell>
                  <TableCell className="align-top text-muted-foreground">{item.adaptation}</TableCell>
                  <TableCell className="align-top">
                    <ReferenceClassificationBadges classifications={item.classifications} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="grid gap-4 md:hidden">
          {REFERENCE_ITEMS.map((item) => (
            <Card key={item.capability} className="servco-section-card">
              <CardHeader>
                <CardTitle className="text-base">{item.capability}</CardTitle>
                <CardDescription>{item.primitive}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <div className="font-medium">Metric Hub example</div>
                  <p className="mt-1 text-muted-foreground">{item.example}</p>
                </div>
                <div>
                  <div className="font-medium">Expected adaptation</div>
                  <p className="mt-1 text-muted-foreground">{item.adaptation}</p>
                </div>
                <ReferenceClassificationBadges classifications={item.classifications} />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id={DOCUMENTATION_SECTION_IDS.customization} className="servco-doc-section space-y-4">
        <div>
          <h3 className="text-xl font-semibold">Customization checklist</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Work from product intent toward environment bindings; do not begin by copying resource identifiers.
          </p>
        </div>
        <Accordion type="single" collapsible className="rounded-lg border bg-card px-4">
          {CUSTOMIZATION_STEPS.map((step, index) => (
            <AccordionItem key={step.title} value={`customization-${index + 1}`}>
              <AccordionTrigger>
                <span className="flex items-center gap-3 text-left">
                  <Badge variant="outline">{index + 1}</Badge>
                  {step.title}
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 text-muted-foreground">
                <p>{step.description}</p>
                <div className="flex flex-wrap gap-2">
                  {step.files.map((file) => (
                    <code key={file} className="rounded bg-muted px-2 py-1 text-xs text-foreground">
                      {file}
                    </code>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section id={DOCUMENTATION_SECTION_IDS.operatingModes} className="servco-doc-section space-y-4">
        <div>
          <h3 className="text-xl font-semibold">Local and deployed operating modes</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Local development still depends on managed Databricks services and does not fully reproduce deployed OBO.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="servco-section-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CircleDot className="h-4 w-4 text-primary" aria-hidden="true" /> Local development
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>AppKit runs the client and server locally while analytics and Lakebase remain remote services.</p>
              <p>Each FDE selects an explicit CLI profile and a unique validated Lakebase schema.</p>
              <p>
                Analytics runs as the CLI-authenticated developer; deployed browser-user OBO requires separate proof.
              </p>
            </CardContent>
          </Card>
          <Card className="servco-section-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" /> Deployed application
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>The app service principal owns application state and uses declared resource bindings.</p>
              <p>Supported user-scoped analytics calls carry the signed-in user’s identity and permissions.</p>
              <p>Deployment does not grant permission to publish the exported metric-view candidate.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id={DOCUMENTATION_SECTION_IDS.sourceMap} className="servco-doc-section space-y-4">
        <div>
          <h3 className="text-xl font-semibold">Source map</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Use these files to trace the demonstrated behavior. Repository access may require your GitHub identity.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {SOURCE_MAP.map((source) => (
            <Card key={source.path} className="servco-section-card">
              <CardHeader>
                <CardTitle className="text-base">{source.area}</CardTitle>
                <CardDescription>
                  <code>{source.path}</code>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p>{source.purpose}</p>
                <Button asChild variant="outline" size="sm">
                  <a href={source.href} target="_blank" rel="noreferrer">
                    View source <ArrowUpRight className="ml-2 h-4 w-4" aria-hidden="true" />
                    <ExternalLinkHint />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="servco-section-card">
          <CardHeader>
            <CardTitle>Repository guides</CardTitle>
            <CardDescription>
              In-app guidance summarizes the implementation; setup commands and build history remain in the repository.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            {REPOSITORY_GUIDES.map((guide) => (
              <a
                key={guide.title}
                href={guide.href}
                target="_blank"
                rel="noreferrer"
                className="servco-definition-tile rounded-lg border p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex items-center justify-between gap-3 font-medium">
                  {guide.title}
                  <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{guide.description}</p>
                <ExternalLinkHint />
              </a>
            ))}
          </CardContent>
        </Card>
      </section>
    </article>
  );
}
