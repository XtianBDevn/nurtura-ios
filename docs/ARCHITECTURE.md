# Nurtura iOS Architecture

## Overview

Nurtura is an Expo Router app with a Convex backend. The app is organized around file-based screens in `/Users/christianbryant/nurtura-ios/app`, shared UI in `/Users/christianbryant/nurtura-ios/components`, and backend functions in `/Users/christianbryant/nurtura-ios/convex`.

## Client Flow

1. `/Users/christianbryant/nurtura-ios/app/_layout.tsx`
   - Creates the Convex client.
   - Wraps the app in `ConvexAuthProvider`.
   - Uses SecureStore so auth tokens live in iOS Keychain.
   - Loads NativeWind CSS.
2. `/Users/christianbryant/nurtura-ios/app/index.tsx`
   - Acts as the launch gate.
   - Sends authenticated and onboarded users to `/(tabs)`.
   - Sends authenticated but incomplete users to `/onboarding`.
   - Shows marketing only to signed-out users.
3. `/Users/christianbryant/nurtura-ios/app/onboarding/index.tsx`
   - Creates the caregiver profile.
   - Creates the first care recipient.
   - Saves the health profile.
   - Generates a personalized care-plan preview.
   - Marks onboarding complete.
4. `/Users/christianbryant/nurtura-ios/app/(tabs)`
   - Main app shell: Home, Care, Log, Schedule, More.

## Backend Flow

Convex tables are defined in `/Users/christianbryant/nurtura-ios/convex/schema.ts`.

Important modules:

- `profiles.ts`: caregiver profile and onboarding state.
- `careRecipients.ts`: people receiving care and care-team membership.
- `healthProfiles.ts`: structured clinical intake and cached care-plan summary.
- `careLogs.ts`: daily logs, vitals, meals, moods, tasks, notes.
- `schedule.ts`: appointments, shifts, medication events, tasks.
- `medications.ts`: active medications and medication logs.
- `messages.ts`: care-team communication.
- `timeEntries.ts`: caregiver shift timer.
- `subscriptions.ts`: subscription state. Stripe updates are internal-only.
- `lib/authz.ts`: shared team-membership authorization helpers.

## Personalized Care Plan

The care-plan engine lives at `/Users/christianbryant/nurtura-ios/lib/carePlan.ts`.

It is intentionally pure and deterministic:

- No React imports.
- No Convex imports.
- No network calls.
- Unit-testable.

Inputs include:

- conditions
- allergies
- current medications
- mobility
- fall risk
- cognitive status
- ADL/IADL independence
- quality-of-life signals

Output includes:

- risk level
- risk score
- focus areas
- suggested actions
- readable summary

## Styling

The app uses a hybrid styling model:

- Existing shared components still use the established React Native theme tokens.
- New premium onboarding and care-plan surfaces use NativeWind class names.
- Tailwind config maps to the existing Nurtura color and spacing language.

## Security Model

- Auth identity is derived server-side with Convex Auth.
- Client functions do not pass user IDs for authorization.
- Care-recipient data is protected by team membership checks through `assertOnTeam` and `getTeamMembership`.
- Tokens are stored in iOS Keychain through Expo SecureStore.

## Build And Test

```bash
npm run typecheck
npm run lint
npm test
npx convex codegen
npx expo export --platform ios --output-dir /tmp/nurtura-ios-export --no-minify
```
