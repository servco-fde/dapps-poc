# GitHub Spec Kit comparison

Date: 2026-09-16
Status: Initial research for a possible side-by-side SDD experiment

## What Spec Kit is

[GitHub Spec Kit](https://github.com/github/spec-kit) is an agent-oriented process toolkit rather than an application framework. Its CLI initializes repository-local prompts, templates, scripts, and agent integrations; the coding agent then drives the workflow through skills or commands. The short feature path is `specify -> plan -> tasks -> implement -> converge`, governed by a project constitution. Larger changes can insert `clarify`, `checklist`, and `analyze` quality gates.

Notable features found in the repository:

- A versioned project constitution supplies binding principles and a plan-time compliance gate.
- Feature specifications prioritize independently testable user stories and include Given/When/Then scenarios, edge cases, functional requirements, measurable outcomes, entities, and assumptions.
- Planning can produce research, a data model, contracts, and a quickstart in addition to the implementation plan.
- Tasks are dependency ordered, grouped by user story, tied to file paths, and marked when they can run in parallel.
- `clarify` resolves underspecified behavior, `checklist` evaluates requirement quality, and read-only `analyze` looks for gaps or contradictions across the spec, plan, tasks, and constitution.
- `converge` inspects implementation coverage after coding and appends traceable missing work to `tasks.md`; implementation and convergence repeat until no gaps remain.
- Feature selection is explicit repository state rather than an implicit Git branch, while Git-based organization is optional.
- Extensions, presets, workflows, bundles, project overrides, and many coding-agent integrations make the process customizable.
- Spec Kit also offers separate idea-assessment and bug-fixing processes, rather than forcing every request through feature SDD.

## Comparison with this repository's Reffy workflow

| Concern | Reffy/ReffySpec here | Spec Kit |
| --- | --- | --- |
| Pre-spec context | Indexed ideation artifacts with stable manifest metadata, summaries, and optional remote publication | The feature spec is usually the first core SDD artifact; idea assessment is a separate extension |
| Change model | Proposal, optional design, tasks, and delta specs | Feature spec, technical plan, tasks, and optional research/design outputs |
| Durable truth | Deltas merge into canonical specs; completed changes move into an append-only archive; pivots supersede prior changes | Teams choose a flow-forward, flow-back, or living-spec persistence convention |
| Governance | `AGENTS.md`, `project.md`, managed skills, scenario requirements, and structural validation | A first-class versioned constitution is evaluated during planning and consistency analysis |
| Quality gates | Skill-guided review plus `plan validate`, implementation checks, and archive validation | Explicit clarify, requirements checklist, semantic cross-artifact analysis, and post-build convergence |
| Task semantics | Markdown checklist organized by implementation phase | Stable task IDs, user-story traceability, dependency order, exact paths, and parallel markers |
| Ecosystem | Repository-managed skills plus manifest-backed local/remote Reffy context | Broad agent integrations and composable extensions, presets, workflows, and bundles |

The strongest Reffy differentiators are the evidence/context layer before formal planning and the explicit delta-to-canonical-spec/archive lifecycle. Spec Kit is stronger in semantic quality gates and the closed loop between requirements, tasks, implementation, and convergence.

## Ideas worth testing or adapting

1. Add a read-only Reffy analysis skill that checks proposal, design, delta requirements, tasks, canonical specs, and project rules for ambiguity, contradictions, uncovered requirements, and tasks without traceability.
2. Add a post-implementation convergence skill that inventories scenarios and decisions against code/tests, then appends missing work without silently declaring completion.
3. Give tasks stable IDs plus optional requirement/story references, file paths, dependency notes, and a parallel-safe marker while keeping ordinary Markdown readable.
4. Introduce an optional constitution-like policy surface, or formalize the normative subset of `project.md`, so validation can distinguish binding gates from descriptive context. This should reference rather than duplicate `AGENTS.md`.
5. Offer optional research, data-model, contract, and quickstart outputs for complex changes without making them mandatory for small work.
6. Add bounded clarification and requirements-quality checklist skills before a ReffySpec change is approved.
7. Preserve Reffy's artifact manifest, canonical specs, supersession, and archive model rather than adopting Spec Kit's intentionally open-ended persistence choices.

## Suggested experiment

Run one bounded, non-urgent feature through Spec Kit on an isolated branch and compare it with the equivalent Reffy workflow. Keep the two artifact trees separate and do not let both claim canonical truth. Compare clarification quality, task traceability, uncovered implementation gaps, artifact churn, time to approval, and how clearly a later agent can reconstruct the decision history. The most promising first experiment is Spec Kit's `analyze -> implement -> converge` loop, because it complements Reffy's current planning and archival strengths without replacing its context layer.

## Repository files reviewed

- [README.md](https://github.com/github/spec-kit/blob/main/README.md)
- [SDD methodology](https://github.com/github/spec-kit/blob/main/spec-driven.md)
- [SDD command reference](https://github.com/github/spec-kit/blob/main/docs/reference/agentic-sdd.md)
- [Existing-project adoption](https://github.com/github/spec-kit/blob/main/docs/guides/existing-projects.md)
- [Spec persistence models](https://github.com/github/spec-kit/blob/main/docs/concepts/spec-persistence.md)
- [Project constitution](https://github.com/github/spec-kit/blob/main/.specify/memory/constitution.md)
- [Feature specification template](https://github.com/github/spec-kit/blob/main/templates/spec-template.md)
- [Plan template](https://github.com/github/spec-kit/blob/main/templates/plan-template.md)
- [Tasks template](https://github.com/github/spec-kit/blob/main/templates/tasks-template.md)
- [Convergence command](https://github.com/github/spec-kit/blob/main/templates/commands/converge.md)
