import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    return profile;
  },
});

export const create = mutation({
  args: {
    role: v.union(v.literal("professional"), v.literal("family")),
    firstName: v.string(),
    lastName: v.string(),
    phone: v.optional(v.string()),
    certifications: v.optional(v.string()),
    hourlyRate: v.optional(v.number()),
    relationship: v.optional(v.string()),
    // Accessibility
    ageGroup: v.optional(
      v.union(v.literal("under_65"), v.literal("65_plus")),
    ),
    textSize: v.optional(
      v.union(
        v.literal("small"),
        v.literal("medium"),
        v.literal("large"),
        v.literal("extra-large"),
      ),
    ),
    highContrast: v.optional(v.boolean()),
    simplifiedNav: v.optional(v.boolean()),
    reducedMotion: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, {
        role: args.role,
        firstName: args.firstName,
        lastName: args.lastName,
        phone: args.phone,
        certifications: args.certifications,
        hourlyRate: args.hourlyRate,
        relationship: args.relationship,
        ageGroup: args.ageGroup,
        textSize: args.textSize,
        highContrast: args.highContrast,
        simplifiedNav: args.simplifiedNav,
        reducedMotion: args.reducedMotion,
      });
      return existing._id;
    }

    return await ctx.db.insert("profiles", {
      userId,
      role: args.role,
      firstName: args.firstName,
      lastName: args.lastName,
      phone: args.phone,
      onboardingComplete: false,
      certifications: args.certifications,
      hourlyRate: args.hourlyRate,
      relationship: args.relationship,
      ageGroup: args.ageGroup,
      textSize: args.textSize,
      highContrast: args.highContrast,
      simplifiedNav: args.simplifiedNav,
      reducedMotion: args.reducedMotion,
    });
  },
});

export const completeOnboarding = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (!profile) throw new Error("Profile not found");

    await ctx.db.patch(profile._id, { onboardingComplete: true });
  },
});

export const update = mutation({
  args: {
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    phone: v.optional(v.string()),
    certifications: v.optional(v.string()),
    hourlyRate: v.optional(v.number()),
    relationship: v.optional(v.string()),
    ageGroup: v.optional(
      v.union(v.literal("under_65"), v.literal("65_plus")),
    ),
    textSize: v.optional(
      v.union(
        v.literal("small"),
        v.literal("medium"),
        v.literal("large"),
        v.literal("extra-large"),
      ),
    ),
    highContrast: v.optional(v.boolean()),
    simplifiedNav: v.optional(v.boolean()),
    reducedMotion: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (!profile) throw new Error("Profile not found");

    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(args)) {
      if (value !== undefined) {
        updates[key] = value;
      }
    }

    await ctx.db.patch(profile._id, updates);
  },
});

export const updateAccessibility = mutation({
  args: {
    textSize: v.optional(
      v.union(
        v.literal("small"),
        v.literal("medium"),
        v.literal("large"),
        v.literal("extra-large"),
      ),
    ),
    highContrast: v.optional(v.boolean()),
    simplifiedNav: v.optional(v.boolean()),
    reducedMotion: v.optional(v.boolean()),
    ageGroup: v.optional(
      v.union(v.literal("under_65"), v.literal("65_plus")),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (!profile) throw new Error("Profile not found");

    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(args)) {
      if (value !== undefined) {
        updates[key] = value;
      }
    }
    await ctx.db.patch(profile._id, updates);
  },
});
