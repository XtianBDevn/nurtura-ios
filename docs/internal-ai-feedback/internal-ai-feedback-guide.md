# Nurtura Internal AI Feedback Guide

## Product Boundary

Nurtura is a healthcare native mobile application for caregiving.

This folder is only an internal AI feedback and engineering-memory area. It
exists so agents and human operators can preserve implementation lessons,
dependency guardrails, QA notes, and launch process improvements without
confusing those internal workflows for the Nurtura product.

## Purpose

Use these docs to improve future AI-assisted work on the Nurtura iOS app:

- preserve known failure modes
- prevent repeated dependency mistakes
- document verification commands
- keep release and health-claim guardrails visible
- record overnight work logs and decision notes

## Required Reading

Before dependency, audit, testing, or release work, read:

- `agent-ingestion-index.md`
- `self-improvement-log.md`
- `dependency-audit-runbook.md` for npm audit or package work

## Internal Agent Roles

| Internal role | Job | Output |
| --- | --- | --- |
| Research support | Re-check Apple, FTC, HHS, FDA, and marketing sources | Updated source notes |
| iOS implementation support | Fix app, backend, testing, and release implementation issues | Code changes |
| QA support | Run unit, simulator, accessibility, and TestFlight QA | QA report |
| Submission support | Prepare App Store Connect metadata and review notes | Submission checklist |
| Marketing support | Create campaign content and ASO assets | Campaign calendar and copy |
| Memory support | Keep internal AI feedback docs current after decisions | Changelog and doc refresh |

## Operating Loop

1. Intake the task.
2. Confirm the product boundary: Nurtura is the healthcare mobile app.
3. Gather project state and official sources.
4. Identify health, privacy, App Review, and dependency risk.
5. Make code or doc changes.
6. Verify with tests, lint, typecheck, and app export as appropriate.
7. Update internal feedback docs only when a reusable lesson is learned.
8. Record unresolved decisions clearly.

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
- [ ] TestFlight feedback summarized.
- [ ] Marketing claims match actual product.
- [ ] Source links checked within 7 days of submission.
- [ ] Internal AI feedback log reviewed before dependency or release work.
- [ ] New reusable agent lessons documented in `self-improvement-log.md`.
