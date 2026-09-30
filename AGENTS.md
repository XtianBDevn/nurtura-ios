<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->

## Cursor Cloud specific instructions

Cloud agents do not have an iOS Simulator. Run the app in Expo web against a local anonymous Convex backend. Do not use the hosted URLs in `.env.example` or the fallback in `app/_layout.tsx` for this work.

- Install with `npm ci`. Do not run `npm audit fix --force`; it upgrades Expo past the SDK 52 lockfile.
- `CONVEX_AGENT_MODE=anonymous npx convex dev` serves the backend at `http://127.0.0.1:3210` and writes `EXPO_PUBLIC_CONVEX_URL` to `.env.local`. Keep that process running. `npx convex dev --once` provisions or pushes code, then exits and stops the backend.
- Password sign-in needs deployment env vars `JWT_PRIVATE_KEY` and `JWKS`. Generate them with `node generateKeys.mjs` and set them with `npx convex env set 'NAME=value'` while `npx convex dev` is running. The private key is space-separated PKCS8. Set `SITE_URL=http://127.0.0.1:8081` for Expo web.
- `CI=1 EXPO_NO_TELEMETRY=1 npx expo start --web --port 8081 --host localhost` serves the UI.
- `npm run typecheck`, `npm test`, and `npx expo export --platform ios --output-dir /tmp/nurtura-ios-export --no-minify` are the checks used during setup. `npm run lint` exits 0 with one unused-var warning in `app/(tabs)/recipients.tsx`.
