import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
} from '@databricks/appkit-ui/react';
import { BookOpenCheck, CheckCircle2, ShieldCheck, Users } from 'lucide-react';
import {
  APP_CAPABILITIES,
  DOCUMENTATION_SECTION_IDS,
  PROPOSAL_WORKFLOW,
  USER_GUIDE_FAQS,
} from '../content/documentation';

export function AppGuidePage() {
  return (
    <article className="space-y-6" aria-labelledby="app-guide-title">
      <section id={DOCUMENTATION_SECTION_IDS.appPurpose} className="servco-doc-section space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">User guide</Badge>
          <Badge variant="outline">Metric collaboration</Badge>
        </div>
        <div>
          <h3 id="app-guide-title" className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Metric View Hub Guide
          </h3>
          <p className="mt-3 max-w-4xl text-muted-foreground">
            Metric View Hub gives business stakeholders, reviewers, and engineers a shared place to understand governed
            metrics, describe requested changes in business language, review versions, and prepare a deterministic
            engineering handoff.
          </p>
        </div>
        <Alert>
          <BookOpenCheck className="h-4 w-4" />
          <AlertTitle>What this app does—and does not do</AlertTitle>
          <AlertDescription>
            The app coordinates decisions and exports candidate SQL and YAML. It does not create, replace, or drop Unity
            Catalog objects.
          </AlertDescription>
        </Alert>
      </section>

      <Separator />

      <section id={DOCUMENTATION_SECTION_IDS.appCapabilities} className="servco-doc-section space-y-4">
        <div>
          <h3 className="text-xl font-semibold">What you can do</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            The experience joins governed discovery with a structured collaboration workflow.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {APP_CAPABILITIES.map((capability) => (
            <Card key={capability.title} className="servco-section-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
                  {capability.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{capability.description}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id={DOCUMENTATION_SECTION_IDS.proposalWorkflow} className="servco-doc-section space-y-4">
        <Card className="servco-section-card">
          <CardHeader>
            <CardTitle>Proposal workflow</CardTitle>
            <CardDescription>
              Each transition is enforced by the server and written to the audit history.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {PROPOSAL_WORKFLOW.map((step, index) => (
                <li key={step.status} className="servco-definition-tile rounded-lg border p-4">
                  <div className="flex items-center justify-between gap-3">
                    <Badge variant="outline">Step {index + 1}</Badge>
                    <code className="text-xs text-muted-foreground">{step.status}</code>
                  </div>
                  <h4 className="mt-3 font-semibold">{step.title}</h4>
                  <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </section>

      <section id={DOCUMENTATION_SECTION_IDS.roles} className="servco-doc-section space-y-4">
        <div>
          <h3 className="text-xl font-semibold">Roles and responsibilities</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Interface controls communicate permissions, while server checks remain authoritative.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="servco-section-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4 text-primary" aria-hidden="true" /> Reviewer
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Discovers metrics, creates proposals, reviews versions, comments, and requests changes where the lifecycle
              permits.
            </CardContent>
          </Card>
          <Card className="servco-section-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" /> Admin
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Has reviewer capabilities and can accept an in-review proposal for engineering handoff.
            </CardContent>
          </Card>
          <Card className="servco-section-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpenCheck className="h-4 w-4 text-primary" aria-hidden="true" /> Engineering
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Reviews the exported candidate in source control and owns validation and deployment outside this app.
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section id={DOCUMENTATION_SECTION_IDS.governedAccess} className="servco-doc-section">
          <Card className="servco-section-card h-full">
            <CardHeader>
              <CardTitle>Governed access</CardTitle>
              <CardDescription>Analytics identity and collaboration state use separate boundaries.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Metric queries use on-behalf-of execution, so results follow the signed-in user’s Unity Catalog
                permissions.
              </p>
              <p>
                Proposals, versions, comments, and audit events are application records in Lakebase and follow the app’s
                server-side role rules.
              </p>
            </CardContent>
          </Card>
        </section>
        <section id={DOCUMENTATION_SECTION_IDS.publicationBoundary} className="servco-doc-section">
          <Card className="servco-section-card h-full">
            <CardHeader>
              <CardTitle>Engineering handoff</CardTitle>
              <CardDescription>Approval, export, and catalog publication are deliberately distinct.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Approval records the business decision. Export produces deterministic SQL and YAML candidates.</p>
              <p>
                Engineering remains responsible for source-controlled review, testing, and deployment. A recorded
                published status does not mean this app performed a catalog write.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>

      <section id={DOCUMENTATION_SECTION_IDS.limitations} className="servco-doc-section space-y-4">
        <div>
          <h3 className="text-xl font-semibold">Limitations and common questions</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            These answers clarify the boundaries most likely to matter during a review or demo.
          </p>
        </div>
        <Accordion type="single" collapsible className="rounded-lg border bg-card px-4">
          {USER_GUIDE_FAQS.map((faq, index) => (
            <AccordionItem key={faq.question} value={`faq-${index + 1}`}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </article>
  );
}
