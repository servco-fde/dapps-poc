# FDE Databricks AI Tools Skill Strategy

## Context

Forward deployed engineers (FDEs) will build and deploy Databricks Apps across multiple repositories and customer engagements. They need a consistent way to use Databricks-provided AI tools while extending them with company and project-specific workflows.

This note captures the current working model for skill scope, composition, distribution, and documentation authority. It is exploratory context rather than an approved implementation plan.

## Core distinction

Skill location controls **discovery and distribution**, not inheritance or override precedence.

Codex discovers local skills from these scopes:

| Scope | Location | Intended use |
| --- | --- | --- |
| Repository/module | `.agents/skills/` from the working directory up to the repository root | Project, app, service, or module workflows shared through source control |
| User | `~/.agents/skills/` | Personal workflows and experiments across repositories |
| Administrator | `/etc/codex/skills` | Machine or container defaults |
| System | Bundled with Codex | OpenAI-provided general skills |

Skills with the same `name` are not merged, and a nearer repository skill is not a documented override for a global skill. Both may be exposed to the agent. Custom skills should therefore use distinct, descriptive names rather than trying to shadow supplied skills.

`AGENTS.md` is different: it forms an instruction chain in which global guidance loads first and increasingly local repository guidance applies later. Use `AGENTS.md` for durable rules that should apply to all work in its directory tree. Use skills for focused workflows that activate only when a matching task is requested.

## Recommended FDE layering

1. **Databricks platform foundation**
   - Install the official Databricks agent skills with `databricks aitools install`.
   - Treat the installed Databricks plugin or resolved skill directory as managed content; do not edit its cache.
   - Use `--scope global` when an FDE needs the foundation across many Databricks projects.
   - Use `--scope project` when a repository needs isolated, reproducible skill availability.

2. **Company/FDE workflow layer**
   - Create distinctly named skills such as `fde-databricks-app-bootstrap`, `fde-databricks-app-review`, and `fde-databricks-app-release`.
   - Package broadly reused company skills as a versioned plugin rather than copying them between user directories.
   - A company skill may orchestrate official Databricks skills and tools, but should add only company-specific sequencing, decisions, validation, and output expectations.

3. **Repository and app layer**
   - Check project-specific workflows into the repository's `.agents/skills/` directory.
   - Place module-only skills in a nested `<module>/.agents/skills/` directory when they should only be discovered from that subtree.
   - Keep app-specific commands, resource conventions, and verification requirements close to the app.

4. **Personal incubation layer**
   - Prototype individual workflows under `~/.agents/skills/`.
   - Promote useful workflows into the repository or company plugin after testing.
   - Do not rely on personal-global skills for required team behavior.

5. **Enforcement layer**
   - Put persistent repository routing and conventions in `AGENTS.md`.
   - Enforce mandatory requirements through validation, CI, hooks, permissions, or policy rather than relying only on skill instructions.

## Skill composition guidance

There is no documented `extends`, `super`, or same-name override mechanism for skills. Prefer composition:

- Give each custom workflow a unique name and narrow activation description.
- State which official Databricks skills or tools are required and in what order they should be used.
- Keep `SKILL.md` focused on inputs, decisions, steps, expected outputs, and stop conditions.
- Put detailed policies, schemas, and examples in `references/`.
- Use `scripts/` only when deterministic processing is needed.
- Use MCP for authenticated live data and controlled actions; use the skill to describe the workflow around those tools.
- Declare required MCP dependencies in `agents/openai.yaml` when packaging a compatible skill or plugin.

## Databricks Apps source-of-truth hierarchy

For Databricks Apps work, use the following order:

1. **`databricks-apps` skill** for the overall Apps/AppKit workflow and decision gates.
2. **Databricks DevHub Docs MCP** for current AppKit wiring, templates, and developer documentation.
3. **Installed AppKit documentation** via `npx @databricks/appkit docs` for exact component, hook, plugin, and server API signatures matching the installed version.
4. **Canonical Databricks Apps documentation** for platform behavior such as deployment, authentication, permissions, and runtime constraints.
5. **`databricks apps manifest` output** for the active template's plugins, resources, and scaffolding rules. Manifest rules override generic skill guidance when they explicitly address the same scaffolding behavior.

The DevHub Apps overview explicitly identifies `databricks-apps` as the source-of-truth skill. It separates AppKit documentation on DevHub from platform documentation on `docs.databricks.com`.

## DevHub Docs MCP distribution

The read-only DevHub Docs MCP server exposes `list_docs_resources` and `get_doc_resource` at:

`https://developers.databricks.com/api/mcp`

Suggested installation choices:

- Global for FDE workstations dedicated to Databricks development.
- Project-level when documentation access should be reproducible, isolated, or explicitly declared by a repository.

Example global installation:

```sh
npx add-mcp https://developers.databricks.com/api/mcp --name devhub-docs -g
```

Agents should list resources before fetching a page instead of guessing slugs. Pages may include a `Source of truth` declaration identifying the current skill and canonical documentation.

## Proposed package shape

```text
company-databricks-plugin/
├── plugin.json
├── skills/
│   ├── fde-databricks-app-bootstrap/
│   │   ├── SKILL.md
│   │   ├── references/
│   │   └── scripts/
│   ├── fde-databricks-app-review/
│   │   └── SKILL.md
│   └── fde-databricks-app-release/
│       └── SKILL.md
└── mcp.json
```

Project-specific skills would remain in each application repository rather than being added to this shared plugin.

## Open decisions

- Whether official Databricks skills should be globally installed on every FDE workstation or project-scoped through repository onboarding.
- Whether the company extension should be distributed as a private plugin, a versioned source repository, or both.
- Which workflows are genuinely common enough for the company layer versus application-specific.
- How plugin and skill versions will be pinned, upgraded, tested, and rolled back.
- Which requirements belong in advisory skills versus enforced CI, hooks, or administrator policy.
- Whether the DevHub Docs MCP server should be globally provisioned or declared per project.

## References

- [OpenAI: Build skills](https://learn.chatgpt.com/docs/build-skills)
- [OpenAI: Customization](https://learn.chatgpt.com/docs/customization/overview)
- [OpenAI: Package your plugin](https://developers.openai.com/plugins/build/plugins)
- [Databricks: Agent skills](https://developers.databricks.com/docs/tools/ai-tools/agent-skills)
- [Databricks: DevHub Docs MCP Server](https://developers.databricks.com/docs/tools/ai-tools/docs-mcp-server)
- [Databricks: Databricks Apps overview](https://developers.databricks.com/docs/apps/overview)
- [Databricks: Apps development](https://developers.databricks.com/docs/apps/development)
