# TestFlight Walkthrough

This guide is intentionally simple. If a 10-year-old can follow it, a busy caregiver tester can too.

## Part 1: Build The Test App

Ask an adult/developer to run this from `/Users/christianbryant/nurtura-ios`:

```bash
npm install
npm run typecheck
npm run lint
npm test
eas build --platform ios --profile preview
```

When EAS finishes, it gives a build link.

## Part 2: Upload To TestFlight

Run:

```bash
eas submit --platform ios --latest
```

Wait for Apple to process the build. This can take 10 to 30 minutes.

## Part 3: Add Testers

1. Go to App Store Connect.
2. Open Nurtura.
3. Click TestFlight.
4. Add yourself as an internal tester.
5. Add family, friends, or caregivers as external testers.
6. Send the invite.

## Part 4: What Testers Should Do

Tell testers:

1. Install TestFlight from the App Store.
2. Open the invite link.
3. Install Nurtura.
4. Create an account.
5. Complete onboarding.
6. Add one care recipient.
7. Choose at least two medical conditions.
8. Add medication names.
9. Answer mobility, cognition, daily living, and quality-of-life questions.
10. Confirm the app shows a personalized care plan.
11. Add a care log.
12. Add a schedule item.
13. Add a medication from More.
14. Try Time Tracking.
15. Sign out and sign back in.

## Part 5: Tester Feedback Questions

Ask each tester:

- Could you create an account?
- Did onboarding make sense?
- Did any question feel too personal or confusing?
- Did the care plan feel useful?
- Did any button do nothing?
- Did text overlap or get cut off?
- Did the app crash?
- What was the most confusing screen?
- What should Nurtura do next?

## Part 6: Pass Or Fail Checklist

Pass means:

- App opens.
- Sign up works.
- Sign in works.
- Onboarding completes.
- Home tab loads.
- Care plan appears.
- Logs save.
- Schedule items save.
- Medications save.
- Time Tracking clocks in and out.
- No crashes.

Fail means:

- Tester gets stuck.
- App crashes.
- Data does not save.
- A button promises something but does not work.
- Health/security claims appear that are not implemented.

## Part 7: Before Publishing

Do at least one full TestFlight loop:

1. Build.
2. Test.
3. Fix.
4. Rebuild.
5. Test again.

Do not submit to App Review until the account deletion flow, privacy policy URL, and support URL are ready.
