# Nurtura iOS Code Review And Audit

Reviewed on July 8, 2026.

## Verdict

The app is materially healthier than the original baseline. The main user flows compile, lint, test, and bundle. Auth gating works, onboarding is rebuilt around a deeper clinical intake, time tracking is live, and Convex authorization checks now protect the highest-risk care-recipient data paths.

This is a strong TestFlight candidate after a real device QA pass. Before App Store submission, finish the remaining launch/compliance items listed below.

## Verification

| Check | Result |
|---|---|
| `npm run typecheck` | Pass |
| `npm run lint` | Pass, zero problems |
| `npm test` | Pass, 2 suites, 3 tests |
| `npx convex codegen` | Pass |
| `npx expo export --platform ios --output-dir /tmp/nurtura-ios-export --no-minify` | Pass |
| iOS Simulator screenshot | Captured in `/Users/christianbryant/nurtura-ios/docs/screenshots` |

## Fixed In This Pass

- Added auth-aware app routing in `/Users/christianbryant/nurtura-ios/app/index.tsx`.
- Removed the dead signup email-verification screen and routes users into onboarding.
- Fixed TypeScript module resolution for `@convex-dev/auth`.
- Fixed broken Schedule and More tab Convex queries.
- Added `schedule.listForUser` and `messages.listAll`.
- Added medication recipient selection.
- Wired Time Tracking to real `timeEntries` functions.
- Fixed overnight shift duration by storing `startedAt` and `endedAt`.
- Added shared Convex authorization helpers in `/Users/christianbryant/nurtura-ios/convex/lib/authz.ts`.
- Added comprehensive health-profile schema and mutations in `/Users/christianbryant/nurtura-ios/convex/healthProfiles.ts`.
- Added deterministic personalized care-plan generation in `/Users/christianbryant/nurtura-ios/lib/carePlan.ts`.
- Rebuilt onboarding around clinical intake and care-plan preview.
- Added NativeWind hybrid configuration.
- Added Jest unit tests and testing documentation.
- Removed unsupported marketing claims from the app landing page and Security modal.

## Working Feature Areas

- Landing, sign up, sign in, and auth-state redirect.
- Onboarding: caregiver role/profile, accessibility, recipient basics, conditions, allergies, medications, mobility, fall risk, cognition, ADL/IADL, quality of life, care-plan preview.
- Dashboard: stats, recipient list, recent activity, personalized care plan.
- Recipients: create and list recipients.
- Log: create task, vital, meal, activity, mood, and note entries.
- Schedule: create and list appointment, shift, medication, and task entries by date.
- More: medications, messages, subscriptions display, security status, time tracking.
- Backend: Convex schema and generated API compile.

## Remaining App Store Blockers

1. Account deletion still needs an in-app flow.
2. Password reset still needs a real backend-supported flow or should be hidden.
3. Subscription upgrade/paywall UI should stay hidden or be wired to Apple IAP before App Review.
4. Privacy policy and support URLs must exist before submission.
5. App Privacy answers must disclose health data, contact info, user content, and linked account data honestly.
6. If `supportsTablet` remains `true`, iPad screenshots and layout QA are required.

## High-Priority Technical Follow-Ups

- Add account deletion mutation and UI in More > Security & Privacy.
- Add edit/delete for recipients, logs, medications, and health profile data.
- Add pagination for long logs/messages.
- Add Sentry or equivalent crash reporting before public launch.
- Add production email verification and rate limiting for auth.
- Add server-side notification scheduling before marketing medication reminders.
- Add server-side FHIR OAuth encryption before enabling FHIR UI.

## Risk Notes

- Nurtura should not claim HIPAA compliance, end-to-end encryption, Apple Watch support, biometric lock, or clinical decision support yet.
- The generated care plan is deterministic guidance for organization and monitoring. It must be framed as caregiver support, not medical diagnosis or treatment.
- Convex IDs are not a security boundary; authorization must stay server-side. The new `assertOnTeam` pattern should be used for every new care-recipient function.

## Test Coverage Added

- `/Users/christianbryant/nurtura-ios/__tests__/carePlan.test.ts`
- `/Users/christianbryant/nurtura-ios/__tests__/CarePlanCard.test.tsx`

Recommended next tests:

- Convex authorization tests with `convex-test`.
- Onboarding mutation-chain integration test.
- Time-tracking overnight shift test.
- Auth gate render test.
