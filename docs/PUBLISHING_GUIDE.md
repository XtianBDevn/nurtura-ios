# Nurtura Publishing Guide

## Current Status

Nurtura can compile, lint, test, and export an iOS bundle. It is ready for TestFlight QA after final environment checks. It is not ready for App Store submission until the launch blockers below are finished.

## Must Finish Before App Review

1. Add account deletion inside the app.
2. Add a real password reset flow, or hide the forgot-password button.
3. Hide upgrade/paywall UI unless Apple In-App Purchase is implemented.
4. Publish a privacy policy URL.
5. Publish a support URL.
6. Add App Store screenshots from the final production build.
7. Confirm App Privacy nutrition labels.

## Apple Developer Setup

1. Enroll in the Apple Developer Program.
2. Use the Bon Air Media organization account if available.
3. In App Store Connect, complete agreements, tax, and banking.
4. Create or confirm the app record for bundle ID:

```text
com.bonairmedia.nurtura
```

## Build Commands

Preview build for TestFlight:

```bash
eas build --platform ios --profile preview
```

Production build:

```bash
eas build --platform ios --profile production
```

Submit latest build:

```bash
eas submit --platform ios --latest
```

## App Store Metadata

Suggested subtitle:

```text
Caregiving, organized
```

Suggested keywords:

```text
caregiver,caregiving,elder care,medication tracker,care log,home care,dementia,senior
```

Category:

- Primary: Medical or Health & Fitness.
- Secondary: Productivity.

Use Medical only if privacy policy, support, and disclaimers are strong.

## Review Notes Template

```text
Nurtura helps caregivers organize care recipients, care logs, medications, schedules, messages, and shift time tracking.

The app does not diagnose, treat, or replace medical advice.

Demo account:
Email: [demo email]
Password: [demo password]

Suggested review path:
1. Sign in with the demo account.
2. Open Home to see the care dashboard and care plan.
3. Open Log to add a care activity.
4. Open Schedule to add an appointment.
5. Open More to view medications and time tracking.

Account deletion is available at:
[Add exact path before submission]
```

## Privacy Label Notes

Declare health data, contact info, identifiers, user content, messages, and diagnostics if collected. Do not use health data for advertising.

## Release Strategy

1. Internal TestFlight with the team.
2. External TestFlight with 10 to 25 caregivers.
3. Fix onboarding and data-save issues.
4. Submit manually released build.
5. Release after approval.
6. Monitor crashes and reviews daily for the first week.
