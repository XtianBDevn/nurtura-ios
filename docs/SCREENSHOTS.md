# Nurtura Screenshots

Real iOS Simulator screenshots captured from Expo Go are stored in:

`/Users/christianbryant/nurtura-ios/docs/screenshots`

## Captured

| File | Screen | Notes |
|---|---|---|
| `01-landing.png` | Marketing landing | Captured after unsupported HIPAA/Watch claims were removed. |
| `02-signup.png` | Create account | Captured from the real simulator. The app copy was later tightened from 6 to 8 password characters; recapture before App Store submission. |

## Capture Commands

Start the app:

```bash
npx expo start --ios --clear
```

Capture the current simulator screen:

```bash
mkdir -p docs/screenshots
xcrun simctl io booted screenshot docs/screenshots/01-landing.png
```

Open a route through Expo:

```bash
xcrun simctl openurl booted 'exp://192.168.1.151:8083/--/(auth)/signup'
```

Then capture:

```bash
xcrun simctl io booted screenshot docs/screenshots/02-signup.png
```

## Required Before App Store

Capture at least these screens on the final production build:

- Landing
- Sign up
- Onboarding role
- Onboarding health intake
- Personalized care plan preview
- Home dashboard
- Log activity
- Schedule
- More > Time Tracking

If `supportsTablet` remains enabled in `/Users/christianbryant/nurtura-ios/app.json`, capture iPad screenshots too.
