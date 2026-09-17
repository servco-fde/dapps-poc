# FDE SDD framework alignment

Date: 2026-09-17
Status: Team-alignment note

## Context

This POC used Reffy and ReffySpec to practice spec-driven development (SDD), preserve ideation context, review
proposed changes, track implementation tasks, maintain canonical specifications, and archive completed changes.
That tooling was a POC choice, not a prerequisite for Databricks Apps development or a mandated FDE standard.

Other SDD frameworks can support the same broad goal. Individual tool choice is flexible during exploration, but a
team of FDEs needs a familiar, repeatable shared process when collaborating or handing work between people and
coding agents.

## Alignment needed

Before treating any SDD framework as the FDE default, the team should discuss and agree on:

- the shared framework and minimum workflow all FDEs can recognize;
- which artifacts are canonical and where they live;
- proposal, review, approval, implementation, validation, and archive stages;
- requirement-to-task and requirement-to-test traceability expectations;
- how small fixes can use a lighter path without bypassing important controls;
- how coding-agent instructions remain portable across IDEs and workstations; and
- how existing projects using another framework will interoperate or migrate.

Until that agreement exists, `.reffy/` documents how this POC was developed. It should not be interpreted as an
organization-wide requirement or as evidence that alternative SDD frameworks were rejected.
