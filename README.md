# Nurtura iOS

Nurtura is a native iOS caregiving companion built with Expo, React Native, NativeWind, and Convex. It helps family and professional caregivers organize recipients, daily logs, medications, schedules, messages, and time tracking from one mobile app.

## What Works Now

- Auth with Convex Auth password sign-in and iOS Keychain token storage.
- Auth-aware routing: returning users go to onboarding or the main app automatically.
- Comprehensive onboarding with caregiver profile, accessibility preferences, recipient setup, clinical intake, and a generated care plan.
- Structured health intake: conditions, allergies, medications, mobility, fall risk, cognition, ADL/IADL independence, and quality of life.
- Personalized care-plan engine in `/Users/christianbryant/nurtura-ios/lib/carePlan.ts`.
- Dashboard with stats, recipients, recent activity, and the personalized care plan.
- Care recipients, care logs, schedule entries, medications, messages, subscriptions, and shift time tracking.
- NativeWind hybrid styling for new premium onboarding and care-plan UI, while preserving the existing theme system.
- Unit tests for care-plan logic and care-plan UI.

## Stack

| Layer | Technology |
|---|---|
| App | Expo SDK 52, React Native 0.76, Expo Router |
| Backend | Convex |
| Auth | `@convex-dev/auth` |
| Styling | NativeWind plus existing React Native design tokens |
| Tests | Jest, jest-expo, React Native Testing Library |
| Build | EAS |

## Setup

```bash
npm install
cp .env.example .env
npx expo start
```

Then press `i` for iOS Simulator, or scan the QR code with Expo Go.

## Quality Gates

Run these before any TestFlight build:

```bash
npm run typecheck
npm run lint
npm test
npx expo export --platform ios --output-dir /tmp/nurtura-ios-export --no-minify
```

Current verified state:

- TypeScript: passing.
- Expo lint: passing with zero problems.
- Jest: passing.
- iOS export: passing.

## Important Docs

- Code review: `/Users/christianbryant/nurtura-ios/docs/CODE_REVIEW.md`
- Testing guide: `/Users/christianbryant/nurtura-ios/docs/TESTING.md`
- Architecture: `/Users/christianbryant/nurtura-ios/docs/ARCHITECTURE.md`
- Process flow: `/Users/christianbryant/nurtura-ios/docs/PROCESS_FLOW.md`
- Screenshots: `/Users/christianbryant/nurtura-ios/docs/SCREENSHOTS.md`
- TestFlight walkthrough: `/Users/christianbryant/nurtura-ios/docs/TESTFLIGHT_WALKTHROUGH.md`
- Publishing guide: `/Users/christianbryant/nurtura-ios/docs/PUBLISHING_GUIDE.md`
- 90-day marketing guide: `/Users/christianbryant/nurtura-ios/docs/MARKETING_90_DAY_GUIDE.md`

## Project Map

```text
app/                 Expo Router screens
app/onboarding/      Comprehensive onboarding and clinical intake
app/(tabs)/          Home, Care, Log, Schedule, More
components/          Shared React Native and NativeWind components
convex/              Backend schema, queries, mutations, auth
lib/carePlan.ts      Deterministic personalized care-plan engine
docs/                Review, QA, screenshots, publishing, marketing
__tests__/           Unit tests
```

## Notes For Health Data

Nurtura organizes caregiver-entered information and suggested routines. It is not a diagnosis tool, treatment tool, emergency service, or substitute for medical advice. Do not market HIPAA compliance, end-to-end encryption, Apple Watch support, biometric lock, or clinical decision support until those are fully implemented, reviewed, and backed by policy.

## License

Copyright 2026 Bon Air Media. All rights reserved.
