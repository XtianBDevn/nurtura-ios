# Nurtura Agent Workflow And Second-Brain Guide

![Agent workflow loop](../assets/images/nurtura-agentic-os-loop.svg)

## Purpose
Nurtura is an iOS app for caregiving. This folder is not the product.

This knowledgebase is an internal second-brain and agent workflow layer for
building, testing, documenting, and launching the Nurtura iOS app. Human
operators and AI agents can use the same source notes, runbooks, checklists,
and campaign docs without confusing the workflow system for the app itself.

## Self-Improvement Memory

Before dependency, audit, testing, or release work, read:

- `agent-ingestion-index.md`
- `agent-self-improvement-log.md`
- `dependency-audit-runbook.md` for npm audit or package work

This file records agent failure modes and corrected operating rules. The first
entry documents why `npm audit fix --force` must not be used on the Expo SDK 52
app and how to fix the `@xmldom/xmldom` advisory safely.

## Folder Pattern

```text
second-brain-knowledgebase/
  00-index/
  01-product/
  02-implementation/
  03-testing/
  04-app-store-submission/
  05-marketing/
  06-agentic-os/
  assets/images/
  copied-project-docs/
```

## Internal Agent Roles

| Agent | Job | Output |
| --- | --- | --- |
| Research Agent | Re-check Apple, FTC, HHS, FDA, and marketing sources | Updated `source-notes.md` |
| iOS Builder Agent | Fix app, Watch, backend, and StoreKit implementation issues | Code changes |
| QA Agent | Run unit, UI, device, Watch, accessibility, and TestFlight QA | QA report |
| Submission Agent | Prepare App Store Connect metadata and review notes | Submission checklist |
| Marketing Agent | Create campaign content and ASO assets | Campaign calendar and copy |
| Memory Agent | Keep the knowledgebase current after decisions | Changelog and doc refresh |

## Operating Loop

1. Intake the task.
2. Gather project state and official sources.
3. Identify health/privacy/App Review risk.
4. Make code or doc changes.
5. Verify with tests and review.
6. Update knowledgebase.
7. Ship to TestFlight, App Store, or campaign channel.
8. Record learnings and unresolved decisions.

## Decision Log Template

```markdown
## YYYY-MM-DD - Decision Title

Decision:

Why:

Options considered:

Risks:

Owner:

Review date:
```

## Launch Memory Checklist

- [ ] App Store metadata current.
- [ ] Privacy labels match implementation.
- [ ] Health claims reviewed.
- [ ] Watch app behavior documented.
- [ ] TestFlight feedback summarized.
- [ ] Marketing claims match actual product.
- [ ] Source links checked within 7 days of submission.
- [ ] Agent ingestion index reviewed before assigning work.
- [ ] Agent self-improvement log reviewed before dependency or release work.
