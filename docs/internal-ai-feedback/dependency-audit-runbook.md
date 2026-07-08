# Dependency Audit Runbook

Use this runbook whenever an agent sees an npm audit warning, dependency
warning, or failed test caused by package drift in `nurtura-ios`.

## Golden Rule

Do not run:

```bash
npm audit fix --force
```

unless the explicit task is a full Expo SDK migration.

For this Expo SDK 52 app, `--force` can partially upgrade packages to Expo 57
and create a broken hybrid of:

- Expo 57 tooling
- Expo Router 4
- React 18
- React Native 0.76
- `jest-expo` 57 expecting React Native 0.86 / React 19

That broken state has already produced:

```text
Cannot find module 'expo-modules-core' from 'node_modules/jest-expo/src/preset/setup.js'
```

## Step 1: Capture Current Runtime Versions

Run:

```bash
node -e "for (const p of ['expo','jest-expo','expo-modules-core','react','react-native','expo-router','expo-constants','expo-linking','expo-splash-screen']) { try { console.log(p, require(p + '/package.json').version) } catch(e) { console.log(p, 'MISSING') } }"
```

Expected coherent SDK 52 state:

```text
expo 52.0.x
jest-expo 52.0.x
expo-modules-core 2.2.x
react 18.3.1
react-native 0.76.x
expo-router 4.0.x
expo-constants 17.0.x
expo-linking 7.0.x
expo-splash-screen 0.29.x
```

If you see Expo 57 while React is still 18 or React Native is still 0.76, stop
and restore the SDK 52 set before doing anything else.

## Step 2: Understand The Vulnerability Source

For `@xmldom/xmldom`:

```bash
npm ls @xmldom/xmldom
```

The safe tree should have no `0.7.x` copy.

Expected:

```text
@xmldom/xmldom@0.8.13
@xmldom/xmldom@0.9.10
```

The project uses a targeted override:

```json
"overrides": {
  "@expo/plist": {
    "@xmldom/xmldom": "0.8.13"
  }
}
```

## Step 3: Apply A Targeted Fix

Preferred order:

1. Patch-level direct dependency update within the same Expo SDK.
2. `package.json` `overrides` for vulnerable transitive dependencies.
3. Planned Expo SDK migration as its own project.

Do not mix SDK families to satisfy audit output.

## Step 4: Verify

Run:

```bash
npm install
npm ls @xmldom/xmldom
npm run typecheck
npm run lint
npm test
npx expo export --platform ios --output-dir /tmp/nurtura-ios-export --no-minify
```

All commands must pass except `npm audit` may still report broader Expo SDK 52
tooling advisories. Treat those as planned migration work, not as permission to
force-upgrade.

To verify the specific `@xmldom/xmldom` advisory is gone:

```bash
node <<'NODE'
const { spawnSync } = require('child_process');
const out = spawnSync('npm', ['audit', '--json'], { encoding: 'utf8' });
const data = JSON.parse(out.stdout);
console.log('@xmldom/xmldom vulnerability:', data.vulnerabilities['@xmldom/xmldom'] ? 'PRESENT' : 'ABSENT');
console.log('remaining total vulnerabilities:', data.metadata.vulnerabilities.total);
console.log('remaining high vulnerabilities:', data.metadata.vulnerabilities.high);
NODE
```

Expected for the targeted xmldom fix:

```text
@xmldom/xmldom vulnerability: ABSENT
```

## Step 5: If The Stack Was Already Force-Upgraded

Restore SDK 52-compatible versions in `package.json`:

```json
"expo": "~52.0.0",
"expo-asset": "~11.0.0",
"expo-constants": "~17.0.0",
"expo-linking": "~7.0.0",
"expo-notifications": "~0.29.0",
"expo-router": "~4.0.0",
"expo-splash-screen": "~0.29.0",
"react": "18.3.1",
"react-native": "0.76.7",
"jest-expo": "~52.0.0"
```

Then run:

```bash
npm install
npm test
npm run typecheck
npm run lint
```

## Step 6: When A Full Expo Upgrade Is Appropriate

Open a dedicated migration task. It should include:

- Expo SDK target selection.
- React and React Native target versions.
- Expo Router migration notes.
- NativeWind / Reanimated compatibility check.
- Jest preset update.
- iOS simulator smoke test.
- EAS/TestFlight regression plan.

Do not combine that migration with a one-line security advisory fix.
