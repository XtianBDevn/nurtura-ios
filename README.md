# Nurtura iOS

Native iOS app for **Nurtura** — the AI-powered caregiving companion. Built with Expo (React Native) + Convex backend.

> *Care, naturally* 🌿

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Expo SDK 52 + React Native 0.76 |
| Navigation | expo-router (file-based) |
| Backend | Convex (shared with web app) |
| Auth | @convex-dev/auth (email + password) |
| Styling | React Native StyleSheet + custom design system |
| Haptics | expo-haptics |
| Icons | @expo/vector-icons (Ionicons) |

## Features

- 🏠 **Dashboard** — Time-aware greeting, stat cards, care recipients, schedule, activity feed
- ❤️ **Care Recipients** — Add/manage people you're caring for with emoji avatars
- 📋 **Care Logging** — Quick-entry for tasks, vitals, meals, activities, mood tracking
- 📅 **Schedule** — Mini calendar + event management (appointments, shifts, medications)
- 💊 **Medications** — Track active meds with dosage and frequency
- 💬 **Messages** — Care team communication
- ⏱️ **Time Tracking** — Professional caregiver shift timer
- 🤖 **Ivy AI** — AI care assistant (Plus/Professional plans)
- 🔒 **Security** — Biometric lock, HIPAA-ready, end-to-end encryption
- 🌙 **Dark Mode** — Full light/dark theme support
- 📱 **6-Step Onboarding** — Role → Profile → Accessibility → Recipient → Meet Ivy → Done

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Xcode) or Expo Go on your device

### Setup

```bash
# Clone
git clone https://github.com/XtianBDevn/nurtura-ios.git
cd nurtura-ios

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Convex URL (default points to production)

# Start dev server
npx expo start

# Press 'i' for iOS simulator, or scan QR with Expo Go
```

### Convex Backend

This app shares its backend with the [Nurtura web app](https://github.com/XtianBDevn/nurtura). The `convex/` directory contains all backend functions (schema, queries, mutations).

If deploying your own Convex instance:

```bash
npx convex dev    # Start local dev
npx convex deploy # Deploy to production
```

## Project Structure

```
nurtura-ios/
├── app/                        # Expo Router screens
│   ├── _layout.tsx             # Root layout (ConvexProvider)
│   ├── index.tsx               # Landing/welcome screen
│   ├── (auth)/                 # Auth flow
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── onboarding/             # 6-step onboarding
│   │   └── index.tsx
│   └── (tabs)/                 # Main app (bottom tabs)
│       ├── _layout.tsx         # Tab navigator
│       ├── index.tsx           # Dashboard
│       ├── recipients.tsx      # Care recipients
│       ├── log.tsx             # Log activity
│       ├── schedule.tsx        # Calendar + schedule
│       └── more.tsx            # Settings hub
├── components/                 # Reusable UI components
│   ├── NText.tsx               # Typography
│   ├── NButton.tsx             # Buttons (with haptics)
│   ├── NCard.tsx               # Card containers
│   ├── NInput.tsx              # Text inputs
│   ├── StatCard.tsx            # Dashboard stat cards
│   ├── SelectionCard.tsx       # Selectable option cards
│   └── EmojiPicker.tsx         # Emoji avatar picker
├── convex/                     # Convex backend (shared)
├── hooks/                      # Custom hooks
├── lib/                        # Theme, Convex client
├── assets/                     # Images, fonts
├── app.json                    # Expo config
└── package.json
```

## Design System

- **Primary:** Sage Green `#3D7A5F`
- **Typography:** iOS Human Interface Guidelines scale
- **Dark Mode:** Full automatic support
- **Haptics:** Tactile feedback on all interactions
- **Animations:** Smooth fade transitions between onboarding steps

## Building for App Store

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure
eas build:configure

# Build for iOS
eas build --platform ios

# Submit to App Store
eas submit --platform ios
```

## License

© 2026 Bon Air Media. All rights reserved.
