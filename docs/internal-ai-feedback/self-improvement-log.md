# Internal AI Self-Improvement Log

This log captures operational lessons for future AI-assisted work on Nurtura.
Nurtura is a healthcare native mobile application, not an operating system and
not a second brain.

## 2026-07-08 - Product Naming Boundary: Nurtura Is The Healthcare Mobile App

Decision:

All docs and future agent outputs must describe Nurtura as a healthcare native
mobile application or iOS app. Internal AI workflow material must be labeled as
internal feedback, internal runbooks, engineering memory, or AI-assisted
process documentation.

Why:

Previous docs used "Agentic OS" and "second brain" language too close to the
product name. That incorrectly implied Nurtura itself was an operating system
or knowledge-management product. The user clarified the product boundary:
Nurtura is a healthcare native mobile app.

Correct naming:

- Nurtura healthcare native mobile app
- Nurtura iOS app
- Nurtura caregiving app
- internal AI feedback
- internal engineering memory
- dependency audit runbook

Avoid:

- Nurtura Agentic OS
- Nurtura operating system
- Nurtura second brain

Agent rule:

Before writing product docs, release notes, marketing copy, or internal memory,
state the product category plainly: "Nurtura is a healthcare native mobile
application for caregiving." If the document is for AI process improvement,
label it as internal AI feedback and keep it separate from product messaging.

## 2026-07-08 - Overnight Nurtura Build Log

Summary:

The overnight work focused on turning Nurtura into a more testable and
launch-ready healthcare mobile app while preserving a clean Expo SDK 52 stack.

Completed:

- Fixed broken auth/onboarding routing so returning users land in the correct
  flow.
- Rebuilt onboarding around a comprehensive clinical intake:
  conditions, allergies, medications, mobility, fall risk, cognition,
  ADL/IADL independence, and quality-of-life.
- Added a deterministic care-plan engine in `lib/carePlan.ts`.
- Added Convex `healthProfiles` support and care-recipient authorization
  helpers.
- Wired Schedule, Messages, Medications, and Time Tracking fixes.
- Added `startedAt` and `endedAt` time tracking support for overnight shifts.
- Added NativeWind hybrid styling support.
- Added Jest tests for the care-plan engine and care-plan card.
- Added testing, architecture, flowchart, screenshots, TestFlight, publishing,
  and marketing docs.
- Captured real iOS Simulator screenshots.
- Fixed the `@xmldom/xmldom` advisory without accepting a breaking partial
  Expo 57 upgrade.
- Added a dependency audit runbook explaining why `npm audit fix --force`
  must not be used casually in this app.

Verification run:

```text
npm run typecheck: PASS
npm run lint: PASS
npm test: PASS
npx expo export --platform ios --output-dir /tmp/nurtura-ios-export --no-minify: PASS
```

Important correction:

The internal memory/runbook system must not be presented as the product.
Nurtura remains the healthcare native mobile application. AI feedback docs are
supporting engineering process only.

## 2026-07-08 - Do Not Use `npm audit fix --force` On Expo SDK 52

Decision:

Use a targeted npm `overrides` patch for vulnerable transitive dependencies
instead of running `npm audit fix --force` on the Expo app.

Why:

`npm audit fix --force` attempted a breaking partial upgrade from Expo SDK 52
to Expo 57. It upgraded packages such as `expo`, `expo-splash-screen`,
`expo-constants`, `expo-asset`, `expo-linking`, `expo-notifications`, and
`jest-expo` while the app still used React 18, React Native 0.76, and
Expo Router 4. That created an incoherent dependency graph and broke Jest.

Observed failure:

```text
FAIL __tests__/CarePlanCard.test.tsx
Cannot find module 'expo-modules-core' from 'node_modules/jest-expo/src/preset/setup.js'

FAIL __tests__/carePlan.test.ts
Cannot find module 'expo-modules-core' from 'node_modules/jest-expo/src/preset/setup.js'
```

Root cause:

`jest-expo@57.0.1` expects the Expo 57 / React Native 0.86 / React 19 stack.
The project is an Expo SDK 52 app:

```text
expo 52.0.49
jest-expo 52.0.6
expo-modules-core 2.2.3
react 18.3.1
react-native 0.76.7
expo-router 4.0.22
```

Correct fix for the `@xmldom/xmldom` advisory:

Add or keep this targeted override in `package.json`:

```json
"overrides": {
  "@expo/plist": {
    "@xmldom/xmldom": "0.8.13"
  }
}
```

Then run:

```bash
npm install
npm ls @xmldom/xmldom
npm test
npm run typecheck
npm run lint
npx expo export --platform ios --output-dir /tmp/nurtura-ios-export --no-minify
```

Expected `npm ls @xmldom/xmldom` result:

```text
@xmldom/xmldom@0.8.13
@xmldom/xmldom@0.9.10
```

There must be no `@xmldom/xmldom@0.7.x` copy.

Verification result after fix:

```text
@xmldom/xmldom vulnerability: ABSENT
npm test: PASS
npm run typecheck: PASS
npm run lint: PASS
npx expo export --platform ios: PASS
```

Options considered:

- `npm audit fix --force`: rejected because it performs a breaking partial Expo
  57 upgrade and breaks the test/runtime stack.
- Full Expo 57 migration: valid future project, but must be planned as a real
  migration with React 19, React Native 0.86, Expo Router 57, NativeWind and
  Reanimated compatibility checks, simulator QA, and TestFlight regression.
- Targeted npm override: selected because it resolves the specific vulnerable
  transitive dependency while preserving the SDK 52 runtime.

Risks:

- Remaining `npm audit` findings are broader Expo SDK 52 CLI/tooling advisories.
  They require a planned SDK migration, not a forced audit command.
- Overrides should be rechecked during any future Expo upgrade and removed if
  upstream packages no longer need them.

Owner:

Nurtura iOS Builder / Dependency Agent

Review date:

Before the next Expo SDK upgrade or production release candidate.

## Agent Rule

When fixing dependency advisories in this repo:

1. Inspect the current Expo, React, React Native, Expo Router, and `jest-expo`
   versions first.
2. Do not accept npm's `--force` recommendation unless the task is explicitly a
   full Expo SDK migration.
3. Prefer targeted overrides or patch-level upgrades for transitive advisories.
4. After dependency changes, always run tests, typecheck, lint, and iOS export.
5. Document any remaining audit findings as migration work, not as silently
   ignored risk.
