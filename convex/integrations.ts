import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("integrations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const getByProvider = query({
  args: { provider: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db
      .query("integrations")
      .withIndex("by_user_provider", (q) =>
        q.eq("userId", userId).eq("provider", args.provider),
      )
      .unique();
  },
});

export const connect = mutation({
  args: {
    provider: v.string(),
    email: v.optional(v.string()),
    scopes: v.optional(v.string()),
    metadata: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if already exists
    const existing = await ctx.db
      .query("integrations")
      .withIndex("by_user_provider", (q) =>
        q.eq("userId", userId).eq("provider", args.provider),
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: "connected",
        email: args.email,
        lastSync: Date.now(),
        scopes: args.scopes,
        metadata: args.metadata,
      });
      return existing._id;
    }

    return await ctx.db.insert("integrations", {
      userId,
      provider: args.provider,
      status: "connected",
      email: args.email,
      lastSync: Date.now(),
      scopes: args.scopes,
      metadata: args.metadata,
    });
  },
});

export const disconnect = mutation({
  args: { provider: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const integration = await ctx.db
      .query("integrations")
      .withIndex("by_user_provider", (q) =>
        q.eq("userId", userId).eq("provider", args.provider),
      )
      .unique();

    if (integration) {
      await ctx.db.patch(integration._id, {
        status: "disconnected",
        lastSync: undefined,
      });
    }
  },
});
