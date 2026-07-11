import { getAuthUserId } from "@convex-dev/auth/server";
import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get current user's subscription
export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const sub = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return sub ?? { plan: "free" as const, status: "active" as const };
  },
});

// Initialize free subscription on signup
export const initFree = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("subscriptions", {
      userId,
      plan: "free",
      status: "active",
    });
  },
});

// Update subscription from a payment-provider webhook.
// INTERNAL ONLY: must never be exposed to clients. Call it from a
// webhook httpAction in convex/http.ts after verifying the provider's
// signature (see docs/PAYMENTS_GUIDE.md).
export const updateFromStripe = internalMutation({
  args: {
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    plan: v.union(
      v.literal("free"),
      v.literal("plus"),
      v.literal("professional"),
    ),
    status: v.union(
      v.literal("active"),
      v.literal("canceled"),
      v.literal("past_due"),
      v.literal("trialing"),
    ),
    currentPeriodEnd: v.optional(v.number()),
    cancelAtPeriodEnd: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Find by stripe subscription ID first
    let sub = await ctx.db
      .query("subscriptions")
      .withIndex("by_stripe_subscription", (q) =>
        q.eq("stripeSubscriptionId", args.stripeSubscriptionId),
      )
      .first();

    // Or by stripe customer ID
    if (!sub) {
      sub = await ctx.db
        .query("subscriptions")
        .withIndex("by_stripe_customer", (q) =>
          q.eq("stripeCustomerId", args.stripeCustomerId),
        )
        .first();
    }

    if (sub) {
      await ctx.db.patch(sub._id, {
        plan: args.plan,
        status: args.status,
        stripeCustomerId: args.stripeCustomerId,
        stripeSubscriptionId: args.stripeSubscriptionId,
        currentPeriodEnd: args.currentPeriodEnd,
        cancelAtPeriodEnd: args.cancelAtPeriodEnd,
      });
      return sub._id;
    }

    return null;
  },
});

// NOTE: the old client-callable `linkStripeCustomer` mutation was removed —
// it let any signed-in user attach an arbitrary Stripe customer ID to their
// subscription (privilege escalation). Link customers server-side when
// creating the checkout session instead (see docs/PAYMENTS_GUIDE.md).
