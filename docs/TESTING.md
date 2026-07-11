# Nurtura iOS Testing Guide

Use this guide before every TestFlight or App Store build.

## Fast Local Checks

Run these from `/Users/christianbryant/nurtura-ios`:

```bash
npm install
npm run typecheck
npm run lint
npm test
```

Expected result:

- TypeScript prints no errors.
- Expo lint prints no warnings or errors.
- Jest reports all test suites passing.

## Current Automated Coverage

- `__tests__/carePlan.test.ts`
  - Verifies low-risk and high-risk clinical intake paths.
  - Confirms personalized focus areas and suggestions are produced.
- `__tests__/CarePlanCard.test.tsx`
  - Verifies the generated care plan renders in React Native.

## Manual Smoke Test

1. Start the app:

   ```bash
   npx expo start
   ```

2. Open iOS Simulator or scan with Expo Go.
3. Create a new account.
4. Complete onboarding with at least:
   - caregiver role
   - caregiver name
   - one care recipient
   - medical conditions
   - medications
   - mobility/fall risk
   - quality-of-life answers
5. Confirm the app lands on the Home tab.
6. Confirm a personalized care plan appears on Home.
7. Add a care log.
8. Add a schedule entry.
9. Add a medication from More.
10. Clock in and clock out from More > Time Tracking.

## Before Publishing

Run:

```bash
npm run typecheck
npm run lint
npm test
npx expo export --platform ios --output-dir /tmp/nurtura-ios-export --no-minify
```

The export command confirms Metro, NativeWind, Expo Router, and the iOS bundle all compile.

## Dependency Audit Notes

Do not run `npm audit fix --force` on this Expo SDK 52 app. It attempts a breaking partial upgrade to Expo 57, which mismatches React 18, React Native 0.76, Expo Router 4, and `jest-expo` 52.

The `@xmldom/xmldom` advisory is handled with the `package.json` override:

```json
"overrides": {
  "@expo/plist": {
    "@xmldom/xmldom": "0.8.13"
  }
}
```

Verify it with:

```bash
npm ls @xmldom/xmldom
```

Expected: `@xmldom/xmldom@0.8.13` or newer, not `0.7.x`.
