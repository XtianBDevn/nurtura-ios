# Agent Ingestion Index

Read these files first when bootstrapping an agent for Nurtura iOS work.

## Always Read

1. `nurtura-agentic-os-guide.md`
   - Operating loop, agent roles, launch memory checklist.
2. `agent-self-improvement-log.md`
   - Known agent failure modes and corrected rules.

## Read For Dependency Or Audit Work

1. `dependency-audit-runbook.md`
   - Safe npm audit workflow.
   - Expo SDK 52 compatibility guardrails.
   - `@xmldom/xmldom` override verification.
2. `/Users/christianbryant/nurtura-ios/docs/TESTING.md`
   - App-level verification commands.

## Read For Release Work

1. `/Users/christianbryant/nurtura-ios/docs/PUBLISHING_GUIDE.md`
2. `/Users/christianbryant/nurtura-ios/docs/APP_STORE_GUIDE.md`
3. `/Users/christianbryant/nurtura-ios/docs/TESTFLIGHT_WALKTHROUGH.md`
4. `../04-app-store-submission/nurtura-app-store-submission-guide.md`

## Read For Health, Privacy, Or Marketing Claims

1. `/Users/christianbryant/nurtura-ios/docs/CODE_REVIEW.md`
2. `../00-index/source-notes.md`
3. `../05-marketing/nurtura-ios-healthcare-marketing-guide.md`

## Agent Startup Checklist

- [ ] Identify current task type: code, docs, audit, release, marketing, QA.
- [ ] Load the matching files above.
- [ ] Check whether the task touches Convex; if yes, read `/Users/christianbryant/nurtura-ios/convex/_generated/ai/guidelines.md`.
- [ ] If dependency work, do not run `npm audit fix --force`.
- [ ] After changes, run the relevant verification commands.
- [ ] Update the self-improvement log when a new failure mode or rule is discovered.
