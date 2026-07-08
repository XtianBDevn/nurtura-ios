# Nurtura — App Store Submission Guide

*For Bon Air Media · July 2026 · First submission, start to finish*

Your project is already well set up for this: bundle ID `com.bonairmedia.nurtura`, EAS project configured (`eas.json`), owner `bonairmedia`. What remains is accounts, assets, metadata, and process.

---

## Phase 1 — Apple Developer Program (start now; slowest step)

1. **Enroll as an organization** at [developer.apple.com/programs/enroll](https://developer.apple.com/programs/enroll) — $99/year. Enrolling as "Bon Air Media" (rather than personally) shows the company name as the seller on the App Store, but requires:
   - A **D-U-N-S Number** for Bon Air Media (free from Dun & Bradstreet; Apple has a lookup/request tool). If the company doesn't have one, this takes **up to 1–2 weeks** — request it today.
   - Legal entity status (LLC/corp) and authority to sign for it. If Bon Air Media isn't a registered legal entity, you'll need to enroll as an individual (seller shows your personal name) or register the entity first.
2. After approval, sign the agreements in App Store Connect → **Business**: the free-apps agreement and the **Paid Applications Agreement** (required for subscriptions), plus banking and tax forms. Do this early — it blocks IAP review.

## Phase 2 — Prepare the app (parallel with Phase 1)

### Finish the launch blockers from CODE_REVIEW.md

The current build compiles, lints, tests, exports, and runs in iOS Simulator. Before App Review, finish the remaining launch blockers: in-app account deletion, a real password reset flow (or hide the button), privacy/support URLs, final screenshots, and no visible upgrade/paywall path unless Apple In-App Purchase is implemented.

### Required assets & pages

| Item | Notes |
|---|---|
| **App icon** | 1024×1024 PNG, no alpha/transparency, no rounded corners (Apple rounds it). Verify `assets/images/icon.png` meets this. |
| **Screenshots** | Required: 6.9" iPhone set (e.g., iPhone 16 Pro Max, 1320×2868). Since `supportsTablet: true`, you **also need 13" iPad screenshots** — or set `supportsTablet: false` for v1 to skip iPad review entirely (recommended if you haven't tested iPad layouts). Take them in Simulator (⌘S). 3–10 per size. |
| **Privacy policy URL** | Mandatory. Host on bonairmedia.com (or a simple page). Must cover health data collection, storage (Convex), sharing, retention, deletion. Given PHI, have a template reviewed — don't improvise this one. |
| **Support URL** | A page with a contact method. |
| **Terms of Use (EULA)** | Required on the paywall if you ship subscriptions. |

### App Privacy "nutrition label" (be careful here)

In App Store Connect you must declare all data collected. For Nurtura that includes: **Health & Fitness data, name, email, phone, messages, user content** — all "linked to the user." Health data declarations get extra scrutiny. Understating this is the kind of thing that gets developer accounts flagged; answer honestly. Also relevant: Guideline 5.1.3 — health data may never be used for advertising and you may need to affirm this.

### Version & build config

- `app.json` already sets `buildNumber` and EAS `autoIncrement` — good.
- Remove the unused `NSCameraUsageDescription` / `NSPhotoLibraryUsageDescription` / `NSCalendarsUsageDescription` strings until those features exist (they invite questions).
- `usesNonExemptEncryption: false` is set — correct for TLS-only apps; no export-compliance docs needed.

## Phase 3 — Build & upload with EAS

```bash
npm install -g eas-cli
eas login                          # your Expo account (owner: bonairmedia)

# One-time: let EAS create/manage certificates & provisioning profiles.
# Answer "yes" to letting EAS handle credentials — this is the whole point.
eas build --platform ios --profile production

# When the build finishes, upload to App Store Connect:
eas submit --platform ios --latest
```

First run of `eas submit` will ask for an App Store Connect **API key** (recommended) — it walks you through creating one. The build then appears in App Store Connect → TestFlight after Apple processes it (10–30 min).

## Phase 4 — TestFlight (don't skip)

1. App Store Connect → TestFlight → add yourself + a few real caregivers as **internal testers** (instant, no review).
2. For **external testers** (up to 10,000 via public link) a lightweight beta review is required — usually < 1 day.
3. Actually watch someone use it. Onboarding flows always break in the field. Fix, rebuild (`autoIncrement` bumps the build number), repeat.

## Phase 5 — App Store listing

App Store Connect → Apps → **+ New App**: platform iOS, bundle ID `com.bonairmedia.nurtura`, SKU (e.g., `nurtura-ios-001`), name **"Nurtura"** (if taken, try "Nurtura — Caregiving Hub"; names are first-come).

Fill in:

- **Subtitle** (30 chars): e.g., "Caregiving, organized"
- **Description:** lead with the problem (coordinating family/professional care), then features. No unsubstantiated medical/HIPAA claims.
- **Keywords** (100 chars): `caregiver,caregiving,elder care,medication tracker,care log,home care,dementia,respite,senior`
- **Category:** Medical (primary) or Health & Fitness — Medical fits care logging/medications. Secondary: Productivity.
- **Age rating** questionnaire: likely 12+ or 17+ due to medical/treatment info questions — answer honestly, it affects nothing negative.
- **Subscriptions:** attach the IAPs from PAYMENTS_GUIDE.md to this version so they're reviewed together.

### App Review Information (your secret weapon)

- Provide a **demo account** (email + password) with a pre-populated care recipient, meds, and logs so the reviewer sees a working app in 2 minutes. Create this in production before submitting.
- Notes field — explain: what the app does, that it's for caregivers (not medical advice), where account deletion lives, and how subscriptions map to features. Reviewers are human; make their job easy.

## Phase 6 — Submit & review

1. Select the build, answer the export-compliance prompt (encryption: standard/exempt), set release to **"Manually release this version"** (so approval doesn't auto-publish before you're ready).
2. Submit. First reviews typically take **24–48 hours**; first-time apps sometimes a few days.
3. **If rejected: this is normal.** Most first apps are. You get a specific guideline citation in Resolution Center; fix it (or clarify in a reply — sometimes it's a misunderstanding) and resubmit. Turnaround on resubmission is usually fast. Rejection is a conversation, not a verdict.

### Most likely rejections for Nurtura, pre-answered

| Guideline | Risk | Prevention |
|---|---|---|
| 5.1.1(v) | No in-app account deletion | Build it (review item C4) |
| 2.1 | Dead buttons, fake password reset | Fix/remove before submitting |
| 3.1.1 | Pricing/upgrade UI without working IAP | Ship IAP or hide all purchase UI |
| 5.1.3 / 1.4.1 | Health data handling; medical claims | Honest privacy labels; add a "not medical advice" disclaimer; no HIPAA claims |
| 2.3.1 | Screenshots/description don't match app | Only show real, working features |
| 4.0 | iPad layout broken (supportsTablet: true) | Test iPad or set supportsTablet: false |

## Phase 7 — After approval

- Release manually when ready; propagation takes a few hours.
- Watch crashes (add Sentry pre-launch) and App Store Connect → Analytics.
- Respond to reviews (you can reply as the developer).
- Updates repeat Phases 3→6 and are usually reviewed faster.

## Realistic timeline

| Step | Time |
|---|---|
| D-U-N-S + org enrollment | 1–2 weeks (start today) |
| Code-review fixes | ~1 week |
| IAP + payments wiring | 3–5 days |
| Assets, listing, privacy policy | 2–3 days |
| TestFlight beta | 1–2 weeks (worth it) |
| Review | 1–5 days, possibly with one rejection round |

**~4–6 weeks to a live app**, mostly in parallel. Completely normal for a first launch — and you're closer than most.
