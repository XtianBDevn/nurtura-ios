# Nurtura Testing And QA Guide

![TestFlight QA loop](../assets/images/nurtura-testflight-qa-loop.svg)

## Test Strategy
Nurtura is a care coordination app, so testing needs to cover correctness,
privacy, accessibility, offline/poor-network behavior, and real-device Watch
interactions.

## Automated Tests

Run from the repo:

```bash
cd /Users/christianbryant/iOS/Nurtura
swift test
```

Current baseline observed on July 8, 2026:
- Sandboxed `swift test` can fail at manifest compilation on macOS with `sandbox_apply: Operation not permitted`.
- Unsandboxed `swift test` proceeds to compile but currently fails because `ConvexAPI.completeOnboarding(profile:)` references `OnboardingProfile`, and that type is not visible to the `NurturaShared` package target.
- SwiftPM also warns that app UI files are unhandled by the package target: `NurturaApp.swift`, `RootView.swift`, `AuthFlow.swift`, and `OnboardingFlow.swift`. That may be intentional for a shared package, but the Xcode app target must include them.

Existing tests cover:
- Core model computed values
- Codable contracts
- Subscription tier behavior
- Accessibility settings defaults
- Auth value types and Keychain wrapper
- Convex request/response shape
- Watch sync response decoding

Add next:
- URL encoding tests for query parameters in `ConvexAPI`.
- Mocked network tests for 401 refresh retry.
- Auth decoder test if backend returns OAuth snake_case fields.
- Watch sync stale-data/sign-out tests.
- Subscription StoreKit tests if subscriptions are native IAP.

## Manual iOS QA Matrix

| Area | Test | Expected |
| --- | --- | --- |
| Auth | Sign up, sign in, sign out | Tokens saved/cleared correctly |
| Onboarding | Family, professional, patient paths | Profile saved and dashboard opens |
| Care recipients | Create and view recipient | Data persists and respects tier limits |
| Medications | Add medication and mark status | Logs reflect taken/missed/snoozed/pending |
| Schedule | Add appointment, shift, reminder | Correct day/time and assigned user |
| Messages | Send care team message | Delivery and history work |
| Ivy chat | Free tier limit and paid unlimited state | Correct limits and upgrade prompts |
| Time tracking | Clock in/out | Duration and billing fields are correct |
| Data export | Request export | Secure link returned |
| Delete account | Delete flow | Requires confirmation and clears data |

## Apple Watch QA Matrix

| Area | Test | Expected |
| --- | --- | --- |
| Install | TestFlight install on paired Watch | Watch app appears and launches |
| Sync | First sync after iOS login | Care recipients, medications, schedule appear |
| Sign out | iOS sign out | Watch clears sensitive data |
| Connectivity | iPhone unreachable | Watch shows safe stale/offline state |
| Privacy | Wrist glance | No sensitive details unless user opted in |
| Reminder action | Mark/snooze medication where supported | iOS/backend state updates |

## Accessibility QA

- VoiceOver: all buttons, tabs, medication rows, and Watch actions have clear labels.
- Dynamic Type: no clipping at largest sizes.
- Contrast: text remains readable in high contrast mode.
- Reduced Motion: no essential state depends on animation.
- Simplified navigation: only Dashboard, Recipients, Settings appear as intended.

## Health Privacy QA

- Confirm no health data is sent to advertising SDKs.
- Confirm analytics events avoid medication names, diagnoses, notes, and contacts.
- Confirm privacy policy names all data categories collected.
- Confirm consent appears before HealthKit, notifications, and any sensitive integrations.
- Confirm screenshots and demo data use fictional people only.

## TestFlight Plan

Apple states TestFlight can distribute beta builds, manage testers, and collect
feedback, and uploaded builds can be tested for up to 90 days.

Tester groups:
- Internal: founder/developer/admin.
- Family caregiver group: 10-25 testers.
- Professional caregiver group: 10-25 testers.
- Accessibility group: 5-10 testers using VoiceOver, Dynamic Type, or reduced motion.
- Watch group: 5-10 testers with paired Apple Watch devices.

Feedback prompts:
- What was confusing in onboarding?
- Did medication/schedule language feel safe and clear?
- Did the Watch app show the right amount of information?
- Did you ever worry about privacy?
- What task did Nurtura make easier?

Exit criteria:
- Zero critical crashes for 7 days.
- No known auth/session privacy leak.
- No known Watch stale-data issue.
- All App Store metadata and privacy answers reviewed.
- Testers can complete primary flow without coaching.
