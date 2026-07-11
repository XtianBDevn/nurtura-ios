# Nurtura — Payments Guide (Apple In-App Purchase + Stripe)

*For Bon Air Media · July 2026 · Written for a first-time app developer*

## 1. The rule you must understand first

Nurtura's paid plans (Plus, Professional) unlock **digital features inside the iOS app** (Ivy AI, more recipients, FHIR). Apple's rules for that:

- **Default rule (Guideline 3.1.1):** digital features unlocked in an iOS app must be sold through **Apple In-App Purchase (IAP)**. Apple takes 30% (15% if you're in the Small Business Program — you will be, it's for developers under $1M/year, so effectively **15%**).
- **Putting a Stripe checkout *inside* the app = rejection.** Full stop.
- **US exception (since the 2025 Epic v. Apple ruling):** US apps may *link out* to an external web checkout (e.g., Stripe). Apple requires special entitlements, shows users a disclosure sheet, and still claims a commission on those sales (27%, 12% for small business). More complexity for little savings — skip this for v1.
- **The "reader app" model (Netflix/Spotify):** it's fully allowed for users to subscribe **on your website** with Stripe and simply *sign in* to the app with an active subscription — as long as the app never directs them to the website to purchase.

**Recommended architecture for Nurtura:** Apple IAP in the iOS app + Stripe on the web app, both syncing to the same Convex `subscriptions` table. RevenueCat ties this together and is the standard tool for exactly this setup.

## 2. Recommended stack: RevenueCat

[RevenueCat](https://www.revenuecat.com/docs/getting-started/installation/expo) (`react-native-purchases`) wraps StoreKit 2, handles receipt validation, entitlements, analytics, and sends webhooks you can point at Convex. Free until $2,500/mo in revenue. Its **Web Billing** product uses Stripe under the hood, so web + iOS subscriptions live in one system.

The alternative (`expo-iap` + validating Apple receipts yourself) means building a receipt-validation server, renewal tracking, and grace-period logic by hand. Don't do this for your first app.

> **Important:** IAP libraries contain native code, so the app will no longer run in **Expo Go**. You'll use a **development build** (`npx expo run:ios` or an EAS development build) from here on. This is normal.

## 3. Step-by-step

### Step A — App Store Connect: create the subscription products

1. In [App Store Connect](https://appstoreconnect.apple.com) → your app → **Monetization → Subscriptions**.
2. Create a **Subscription Group** (e.g., "Nurtura Plans"). Users can switch between plans inside one group.
3. Add two auto-renewable subscriptions:
   - `nurtura_plus_monthly` — $9.99/month
   - `nurtura_professional_monthly` — $24.99/month
4. For each: add a localized display name, description, and (optionally) an introductory offer for the "free trial" your landing page promises. **If you advertise a free trial, you must actually configure one here.**
5. Sign the **Paid Applications Agreement** (App Store Connect → Business) and complete banking/tax info. Subscriptions won't work in review until this is done — a very common first-timer blocker.

### Step B — RevenueCat setup

1. Create a project at app.revenuecat.com; add an **App Store app** with your bundle ID `com.bonairmedia.nurtura` and an App Store Connect API key (they walk you through it).
2. Create **Entitlements**: `plus` and `professional`.
3. Create **Products** matching the two product IDs, attach them to entitlements, and build an **Offering** (the set of plans your paywall shows).

### Step C — Install the SDK

```bash
npx expo install react-native-purchases
```

Initialize once, right after login, identifying the user by their **Convex user ID** so webhooks can find them:

```tsx
// app/_layout.tsx (inside the authenticated tree)
import Purchases from 'react-native-purchases';

useEffect(() => {
  if (currentUser?._id) {
    Purchases.configure({
      apiKey: 'appl_XXXX', // RevenueCat public Apple API key — safe to embed
      appUserID: currentUser._id, // ties purchases to your Convex user
    });
  }
}, [currentUser?._id]);
```

Replace the "Coming Soon" alert in `app/(tabs)/more.tsx` with a real purchase:

```tsx
import Purchases from 'react-native-purchases';

const handleUpgrade = async (pkgIdentifier: string) => {
  try {
    const offerings = await Purchases.getOfferings();
    const pkg = offerings.current?.availablePackages.find(
      (p) => p.identifier === pkgIdentifier,
    );
    if (!pkg) return;
    await Purchases.purchasePackage(pkg); // Apple's native payment sheet appears
    // Webhook (Step D) updates Convex; the useQuery(api.subscriptions.get)
    // subscription re-renders the UI automatically. That's the Convex magic.
  } catch (e: any) {
    if (!e.userCancelled) Alert.alert('Purchase failed', e.message);
  }
};
```

Also required by Apple: a **"Restore Purchases"** button (`Purchases.restorePurchases()`) somewhere in the subscription UI, and links to your **Terms of Use and Privacy Policy** on the paywall.

### Step D — Convex: receive RevenueCat webhooks (fixes review issue C1)

First, make the mutation internal. In `convex/subscriptions.ts`, change `updateFromStripe` to a general `updateFromWebhook` registered with **`internalMutation`** (imported from `./_generated/server`), keyed by `userId` rather than found by Stripe IDs, and **delete `linkStripeCustomer`** (linking happens server-side). Add an index-friendly upsert:

```ts
// convex/subscriptions.ts
import { internalMutation } from "./_generated/server";

export const updateFromWebhook = internalMutation({
  args: {
    userId: v.id("users"),
    plan: v.union(v.literal("free"), v.literal("plus"), v.literal("professional")),
    status: v.union(v.literal("active"), v.literal("canceled"),
                    v.literal("past_due"), v.literal("trialing")),
    currentPeriodEnd: v.optional(v.number()),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId)).first();
    if (existing) await ctx.db.patch(existing._id, args);
    else await ctx.db.insert("subscriptions", args);
  },
});
```

Then the webhook endpoint in `convex/http.ts`:

```ts
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { auth } from "./auth";

const http = httpRouter();
auth.addHttpRoutes(http);

http.route({
  path: "/revenuecat/webhook",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    // RevenueCat sends an Authorization header you set in their dashboard
    if (req.headers.get("Authorization") !== `Bearer ${process.env.REVENUECAT_WEBHOOK_SECRET}`) {
      return new Response("Unauthorized", { status: 401 });
    }
    const { event } = await req.json();
    const userId = event.app_user_id; // the Convex user ID from Purchases.configure
    const entitlements: string[] = event.entitlement_ids ?? [];
    const plan = entitlements.includes("professional") ? "professional"
               : entitlements.includes("plus") ? "plus" : "free";
    const active = ["INITIAL_PURCHASE", "RENEWAL", "UNCANCELLATION", "PRODUCT_CHANGE"]
      .includes(event.type);
    await ctx.runMutation(internal.subscriptions.updateFromWebhook, {
      userId,
      plan: active ? plan : "free",
      status: active ? "active" : "canceled",
      currentPeriodEnd: event.expiration_at_ms ?? undefined,
    });
    return new Response("ok", { status: 200 });
  }),
});

export default http;
```

Configure in RevenueCat: **Integrations → Webhooks** → URL `https://<your-deployment>.convex.site/revenuecat/webhook`, plus the Authorization header value. Set `REVENUECAT_WEBHOOK_SECRET` in the Convex dashboard (Settings → Environment Variables). Handle `EXPIRATION`, `CANCELLATION`, and `BILLING_ISSUE` event types as non-active.

*(You should validate the exact payload fields against RevenueCat's current webhook docs when you wire this up — field names occasionally change between webhook versions.)*

### Step E — Enforce plans server-side

Gate features in Convex, not just the UI:

```ts
// convex/lib/plans.ts
export const PLAN_LIMITS = {
  free: { recipients: 1, historyDays: 7, ivy: false },
  plus: { recipients: 3, historyDays: Infinity, ivy: true },
  professional: { recipients: Infinity, historyDays: Infinity, ivy: true },
} as const;
```

In `careRecipients.create`, count the user's existing memberships and throw if at the limit. In Ivy endpoints, check `ivy`.

### Step F — Stripe for the web app (shared Convex backend)

Two options:

1. **RevenueCat Web Billing (easiest):** enable it in RevenueCat, connect your Stripe account, and web purchases flow through the *same* entitlements and webhook as iOS. One integration, done. Cross-platform subscriptions "just work" — a user who subscribes on the web is Plus in the iOS app.
2. **Direct Stripe (more control):** Stripe Checkout + a `checkout.session.completed` / `customer.subscription.updated` webhook to a second Convex `httpAction` that verifies `stripe-signature` (use the `stripe` npm package in a `"use node"` action) and calls the same `updateFromWebhook`. Set the Convex user ID in the checkout session's `client_reference_id` or metadata so the webhook can map customer → user.

Either way, the golden rules: **never trust the client about payment state; only webhooks write to `subscriptions`; the iOS app never links to the web checkout.**

### Step G — Test before submitting

1. **Sandbox testers:** App Store Connect → Users and Access → Sandbox Testers. Sign in on a device (Settings → App Store → Sandbox Account) and buy with fake money. Sandbox renewals are accelerated (a "month" renews every 5 minutes) — great for testing expiration handling.
2. Verify the full loop: purchase → RevenueCat dashboard shows it → Convex `subscriptions` row updates → UI shows "CURRENT" on the right plan → Ivy unlocks.
3. Test **restore purchases** after deleting/reinstalling.
4. Test cancellation via sandbox subscription management and confirm downgrade to free.

## 4. Pricing sanity check

Apple's cut applies to IAP: at 15% (Small Business Program), $9.99 nets ~$8.49, $24.99 nets ~$21.24. Stripe's web fee (~2.9% + 30¢) nets more, but you can't steer iOS users there. Price accordingly and don't show different prices per platform without expecting support questions.

## 5. Order of operations (do this after the code-review fixes)

1. Fix review items C1/C2 (this guide's Step D covers C1).
2. Enroll in the Apple Developer Program + sign Paid Apps agreement (see APP_STORE_GUIDE.md).
3. Create products (A) → RevenueCat (B) → SDK (C) → webhook (D) → enforcement (E).
4. Sandbox test (G).
5. Submit the subscriptions **together with** the app binary for review (new IAPs are reviewed with the app version).

Sources: [RevenueCat Expo docs](https://www.revenuecat.com/docs/getting-started/installation/expo) · [Expo IAP guide](https://docs.expo.dev/guides/in-app-purchases/) · [Stripe on iOS digital goods](https://support.stripe.com/questions/ios-app-guidelines-for-selling-digital-goods-and-services) · [RevenueCat on external purchase links post-Epic](https://www.revenuecat.com/blog/engineering/can-you-use-stripe-for-in-app-purchases/) · [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
