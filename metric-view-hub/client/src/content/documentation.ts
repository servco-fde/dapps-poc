export const DOCUMENTATION_ROUTES = {
  root: '/docs',
  app: '/docs/app',
  fde: '/docs/fde',
} as const;

export const DOCUMENTATION_SECTION_IDS = {
  appPurpose: 'purpose-and-audience',
  appCapabilities: 'supported-tasks',
  proposalWorkflow: 'proposal-workflow',
  roles: 'roles-and-responsibilities',
  governedAccess: 'governed-access',
  publicationBoundary: 'publication-boundary',
  limitations: 'limitations-and-faqs',
  referenceStatus: 'reference-status',
  architecture: 'architecture',
  domainData: 'domain-data',
  governedMetrics: 'governed-metrics',
  executionIdentity: 'execution-identity',
  resourceBindings: 'resource-bindings',
  customization: 'customization-checklist',
  sourceMap: 'source-map',
  operatingModes: 'operating-modes',
} as const;

export const REFERENCE_CLASSIFICATIONS = [
  'Databricks primitive',
  'Example implementation',
  'Metric Hub default',
  'Environment binding',
  'Replace for your app',
] as const;

export type ReferenceClassification = (typeof REFERENCE_CLASSIFICATIONS)[number];

export interface AppCapability {
  title: string;
  description: string;
}

export interface ProposalWorkflowStep {
  status: string;
  title: string;
  description: string;
}

export interface GuideFaq {
  question: string;
  answer: string;
}

export interface ReferenceItem {
  capability: string;
  primitive: string;
  example: string;
  adaptation: string;
  classifications: readonly ReferenceClassification[];
  sectionId?: string;
}

export interface CustomizationStep {
  title: string;
  description: string;
  files: readonly string[];
}

export interface SourceMapItem {
  area: string;
  path: string;
  purpose: string;
  href: string;
}

export const PUBLIC_BINDINGS = {
  appName: 'metric-view-hub',
  metricViewAlias: 'auto_retail',
  metricView: 'hawaii_prod.testing.vw__metrics_test',
  sqlWarehouse: 'metric-view-hub-dev',
  lakebaseProject: 'metric-view-hub',
  lakebaseSchema: 'metric_hub',
} as const;

export const APP_CAPABILITIES: readonly AppCapability[] = [
  {
    title: 'Discover governed metrics',
    description:
      'Browse the published Auto Retail metric view, its headline measures, supported dimensions, trends, and governance context.',
  },
  {
    title: 'Describe a proposed change',
    description:
      'Capture business purpose, accountable ownership, source and target identifiers, dimensions, measures, and acceptance criteria in a guided form.',
  },
  {
    title: 'Review and collaborate',
    description:
      'Move proposals through a server-enforced lifecycle, compare immutable versions, discuss individual fields, and preserve an audit history.',
  },
  {
    title: 'Hand off to engineering',
    description:
      'Download deterministic SQL and YAML candidates for source-controlled engineering review without granting the app permission to mutate Unity Catalog.',
  },
] as const;

export const PROPOSAL_WORKFLOW: readonly ProposalWorkflowStep[] = [
  {
    status: 'draft',
    title: 'Draft',
    description: 'The author describes the business outcome and the proposed metric definition.',
  },
  {
    status: 'in_review',
    title: 'In review',
    description: 'Reviewers discuss the current immutable version; an admin can accept it or request changes.',
  },
  {
    status: 'changes_requested',
    title: 'Changes requested',
    description: 'The author revises the proposal and submits a new version for review.',
  },
  {
    status: 'approved',
    title: 'Approved',
    description: 'The business definition is accepted for engineering handoff, not published to Unity Catalog.',
  },
  {
    status: 'exported',
    title: 'Exported',
    description: 'The deterministic SQL and YAML candidate has been downloaded for engineering work.',
  },
  {
    status: 'published',
    title: 'Publication recorded',
    description: 'The app records an external publication event; it does not perform that deployment itself.',
  },
] as const;

export const USER_GUIDE_FAQS: readonly GuideFaq[] = [
  {
    question: 'Does accepting a proposal update the published metric view?',
    answer:
      'No. Acceptance authorizes an engineering handoff. The app produces a candidate artifact, while engineering review and deployment remain separate.',
  },
  {
    question: 'Why might I see different metric results from another user?',
    answer:
      'Metric queries use on-behalf-of execution, so Unity Catalog evaluates each signed-in user’s permissions. Application proposal data uses a separate Lakebase authorization boundary.',
  },
  {
    question: 'Who can accept an in-review proposal?',
    answer:
      'Only an application admin can perform the acceptance transition. Reviewers can inspect, comment, submit, resubmit, and request changes where the workflow permits.',
  },
  {
    question: 'What does “published” mean in this app?',
    answer:
      'It is a record that publication occurred through an external engineering process. It is not proof that this application created or replaced a Unity Catalog object.',
  },
] as const;

export const ARCHITECTURE_STEPS = [
  {
    title: 'Authenticated browser user',
    description: 'Uses the Databricks App UI and carries workspace identity into supported OBO analytics calls.',
  },
  {
    title: 'Databricks App and AppKit',
    description: 'Hosts the React client, Express routes, resource integrations, and runtime identity contexts.',
  },
  {
    title: 'Governed analytics and app state',
    description:
      'Reads the Unity Catalog Metric View through a SQL warehouse and stores collaboration records in Lakebase.',
  },
  {
    title: 'Engineering handoff',
    description:
      'Exports a deterministic candidate for source control, review, and deployment outside this application.',
  },
] as const;

export const REFERENCE_ITEMS: readonly ReferenceItem[] = [
  {
    capability: 'Application hosting and composition',
    primitive: 'Databricks Apps and AppKit',
    example: 'React Router client, Express server, and AppKit plugins deployed as Metric View Hub.',
    adaptation:
      'Keep the platform foundation, then replace the domain pages, navigation, and capability mix for the use case.',
    classifications: ['Databricks primitive', 'Example implementation', 'Replace for your app'],
  },
  {
    capability: 'Business domain',
    primitive: 'Application-owned product design',
    example: 'Auto Retail sales and F&I performance, including dealership and product-penetration concepts.',
    adaptation:
      'Replace the domain language, measures, dimensions, workflows, and user guidance with the target problem.',
    classifications: ['Metric Hub default', 'Replace for your app'],
    sectionId: DOCUMENTATION_SECTION_IDS.domainData,
  },
  {
    capability: 'Governed metric semantics',
    primitive: 'Unity Catalog Metric Views and AppKit Analytics',
    example: `The ${PUBLIC_BINDINGS.metricViewAlias} alias binds to ${PUBLIC_BINDINGS.metricView}.`,
    adaptation:
      'Bind a governed Metric View for the new domain, or use parameterized analytics queries when no Metric View exists.',
    classifications: ['Databricks primitive', 'Environment binding', 'Replace for your app'],
    sectionId: DOCUMENTATION_SECTION_IDS.governedMetrics,
  },
  {
    capability: 'Analytics compute',
    primitive: 'Databricks SQL Warehouse',
    example: `${PUBLIC_BINDINGS.sqlWarehouse} executes the reference app’s governed metric queries.`,
    adaptation:
      'Select and bind a warehouse whose sizing, permissions, startup behavior, and lifecycle fit the target app.',
    classifications: ['Databricks primitive', 'Environment binding', 'Replace for your app'],
    sectionId: DOCUMENTATION_SECTION_IDS.resourceBindings,
  },
  {
    capability: 'Analytics identity',
    primitive: 'Databricks Apps user authorization and OBO execution',
    example: 'Metric queries execute as the signed-in user and respect that user’s Unity Catalog permissions.',
    adaptation: 'Choose the execution identity deliberately and request only the user API scopes the app requires.',
    classifications: ['Databricks primitive', 'Example implementation', 'Replace for your app'],
    sectionId: DOCUMENTATION_SECTION_IDS.executionIdentity,
  },
  {
    capability: 'Collaboration state',
    primitive: 'Databricks Lakebase',
    example: `Proposals, versions, comments, transitions, and audit events live in the ${PUBLIC_BINDINGS.lakebaseSchema} schema.`,
    adaptation:
      'Adapt the schema and ownership model, use developer-isolated local schemas, or omit Lakebase for a read-only app.',
    classifications: ['Databricks primitive', 'Example implementation', 'Environment binding', 'Replace for your app'],
    sectionId: DOCUMENTATION_SECTION_IDS.resourceBindings,
  },
  {
    capability: 'Application authorization',
    primitive: 'Server-side route authorization',
    example: 'Authenticated users are reviewers by default; configured admins alone can accept proposals.',
    adaptation:
      'Map the target organization’s roles and keep authoritative checks on the server rather than only hiding UI controls.',
    classifications: ['Example implementation', 'Metric Hub default', 'Replace for your app'],
  },
  {
    capability: 'Workflow and auditability',
    primitive: 'Lakebase transactions plus application rules',
    example: 'A versioned proposal lifecycle preserves comments, status transitions, and immutable definition history.',
    adaptation:
      'Replace the lifecycle and records with the target decision process while retaining the auditability it needs.',
    classifications: ['Example implementation', 'Metric Hub default', 'Replace for your app'],
  },
  {
    capability: 'Resource and deployment configuration',
    primitive: 'Databricks app configuration and Declarative Automation Bundles',
    example:
      'app.yaml and databricks.yml declare startup behavior, user scopes, settings, targets, and bound resources.',
    adaptation:
      'Use explicitly selected profiles and environment-specific bindings; never inherit this POC’s workspace choices silently.',
    classifications: ['Databricks primitive', 'Environment binding', 'Replace for your app'],
  },
  {
    capability: 'Catalog publication boundary',
    primitive: 'Unity Catalog governance plus external engineering delivery',
    example: 'The app downloads SQL and YAML candidates but never runs CREATE, REPLACE, or DROP against Unity Catalog.',
    adaptation:
      'Keep an explicit handoff or design a separately authorized publication workflow with its own review controls.',
    classifications: ['Example implementation', 'Replace for your app'],
  },
] as const;

export const CUSTOMIZATION_STEPS: readonly CustomizationStep[] = [
  {
    title: 'Reframe the product and domain',
    description:
      'Replace Metric View Hub and Auto Retail language with the target users, decisions, tasks, and success criteria.',
    files: ['client/src/App.tsx', 'client/src/pages/', 'client/src/content/documentation.ts'],
  },
  {
    title: 'Choose the governed data surface',
    description:
      'Select the target Metric View or analytics queries, then regenerate and review the typed contracts before UI work.',
    files: ['config/metric-views/definitions.json', 'shared/appkit-types/metric-views.d.ts'],
  },
  {
    title: 'Bind fit-for-purpose compute',
    description:
      'Select a SQL warehouse and other resources explicitly for each environment rather than inheriting this POC’s values.',
    files: ['databricks.yml', 'app.yaml', 'app.local.yaml'],
  },
  {
    title: 'Decide whether the app needs persistent state',
    description:
      'Adapt the Lakebase schema and ownership model for a collaborative workflow, or remove it for a read-only experience.',
    files: ['server/server.ts', 'server/routes/', 'app.yaml'],
  },
  {
    title: 'Design identity and authorization',
    description:
      'Choose OBO or service-principal execution per capability, request minimal scopes, and enforce product roles on the server.',
    files: ['databricks.yml', 'server/routes/', 'client/src/pages/'],
  },
  {
    title: 'Replace workflow and artifacts',
    description:
      'Model the target decision lifecycle, audit history, and handoff format instead of treating the proposal flow as universal.',
    files: ['server/routes/proposals/', 'client/src/pages/ProposalBuilderPage.tsx'],
  },
  {
    title: 'Apply the target brand and verify every environment',
    description:
      'Use approved design tokens, responsive layouts, explicit profiles, automated checks, and separate local/deployed identity tests.',
    files: ['client/src/index.css', 'client/src/', 'README.md'],
  },
] as const;

const REPOSITORY_ROOT_URL = 'https://github.com/rdelgd/dapps-poc/blob/main';

export const SOURCE_MAP: readonly SourceMapItem[] = [
  {
    area: 'Application shell and routes',
    path: 'metric-view-hub/client/src/App.tsx',
    purpose: 'Primary navigation, route hierarchy, global reference marker, and resource-status shell.',
    href: `${REPOSITORY_ROOT_URL}/metric-view-hub/client/src/App.tsx`,
  },
  {
    area: 'Metric catalog experience',
    path: 'metric-view-hub/client/src/pages/MetricCatalogPage.tsx',
    purpose: 'Metric View queries, KPI cards, charts, definitions, governance context, and reference cues.',
    href: `${REPOSITORY_ROOT_URL}/metric-view-hub/client/src/pages/MetricCatalogPage.tsx`,
  },
  {
    area: 'Governed metric binding',
    path: 'metric-view-hub/config/metric-views/definitions.json',
    purpose: 'Maps the client-visible metric alias to the Unity Catalog Metric View and execution identity.',
    href: `${REPOSITORY_ROOT_URL}/metric-view-hub/config/metric-views/definitions.json`,
  },
  {
    area: 'AppKit composition',
    path: 'metric-view-hub/server/server.ts',
    purpose: 'Registers analytics, Lakebase, server plugins, and application routes.',
    href: `${REPOSITORY_ROOT_URL}/metric-view-hub/server/server.ts`,
  },
  {
    area: 'Proposal workflow',
    path: 'metric-view-hub/server/routes/proposals/proposal-routes.ts',
    purpose: 'Lakebase schema, role checks, transitions, history, comments, and deterministic artifact export.',
    href: `${REPOSITORY_ROOT_URL}/metric-view-hub/server/routes/proposals/proposal-routes.ts`,
  },
  {
    area: 'Resource bindings and targets',
    path: 'metric-view-hub/databricks.yml',
    purpose: 'Declares the app, settings, user scopes, deployment targets, and environment-specific resource bindings.',
    href: `${REPOSITORY_ROOT_URL}/metric-view-hub/databricks.yml`,
  },
] as const;

export const REPOSITORY_GUIDES = [
  {
    title: 'Application README',
    description: 'Local commands, architecture summary, current bindings, and runtime controls.',
    href: `${REPOSITORY_ROOT_URL}/metric-view-hub/README.md`,
  },
  {
    title: 'Reference-app POC playbook',
    description: 'The build journal, decisions, prompts, verification evidence, and reusable FDE lessons.',
    href: `${REPOSITORY_ROOT_URL}/reference-app-poc-playbook.md`,
  },
  {
    title: 'Workstation onboarding',
    description: 'The guarded entry point for preparing this repository for local development.',
    href: `${REPOSITORY_ROOT_URL}/init.md`,
  },
] as const;
