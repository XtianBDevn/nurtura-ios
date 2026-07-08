# Agent Self-Improvement Log

This log captures operational lessons for future Nurtura agents. Use it as
memory input before dependency, audit, testing, or release work.

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
