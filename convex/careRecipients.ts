import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { assertOnTeam, getTeamMembership } from "./lib/authz";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Get all care team memberships for this user
    const memberships = await ctx.db
      .query("careTeamMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const recipients = [];
    for (const m of memberships) {
      const recipient = await ctx.db.get(m.careRecipientId);
      if (recipient) {
        recipients.push({ ...recipient, memberRole: m.role });
      }
    }
    return recipients;
  },
});

export const get = query({
  args: { id: v.id("careRecipients") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    // Verify user is on the care team
    const membership = await ctx.db
      .query("careTeamMembers")
      .withIndex("by_user_and_recipient", (q) =>
        q.eq("userId", userId).eq("careRecipientId", args.id),
      )
      .unique();
    if (!membership) return null;

    const recipient = await ctx.db.get(args.id);
    return recipient ? { ...recipient, memberRole: membership.role } : null;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    dateOfBirth: v.optional(v.string()),
    careType: v.union(
      v.literal("senior"),
      v.literal("disability"),
      v.literal("childcare"),
      v.literal("general"),
    ),
    conditions: v.optional(v.string()),
    notes: v.optional(v.string()),
    emergencyContact: v.optional(v.string()),
    emergencyPhone: v.optional(v.string()),
    avatarEmoji: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const recipientId = await ctx.db.insert("careRecipients", {
      name: args.name,
      dateOfBirth: args.dateOfBirth,
      careType: args.careType,
      conditions: args.conditions,
      notes: args.notes,
      emergencyContact: args.emergencyContact,
      emergencyPhone: args.emergencyPhone,
      avatarEmoji: args.avatarEmoji || "👤",
      createdBy: userId,
    });

    // Auto-add creator as primary care team member
    await ctx.db.insert("careTeamMembers", {
      careRecipientId: recipientId,
      userId,
      role: "primary",
    });

    return recipientId;
  },
});

export const update = mutation({
  args: {
    id: v.id("careRecipients"),
    name: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    careType: v.optional(
      v.union(
        v.literal("senior"),
        v.literal("disability"),
        v.literal("childcare"),
        v.literal("general"),
      ),
    ),
    conditions: v.optional(v.string()),
    notes: v.optional(v.string()),
    emergencyContact: v.optional(v.string()),
    emergencyPhone: v.optional(v.string()),
    avatarEmoji: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await assertOnTeam(ctx, userId, args.id);

    const { id, ...updates } = args;
    const clean: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(updates)) {
      if (val !== undefined) clean[k] = val;
    }
    await ctx.db.patch(id, clean);
  },
});

export const getTeam = query({
  args: { careRecipientId: v.id("careRecipients") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    if (!(await getTeamMembership(ctx, userId, args.careRecipientId)))
      return [];

    const members = await ctx.db
      .query("careTeamMembers")
      .withIndex("by_care_recipient", (q) =>
        q.eq("careRecipientId", args.careRecipientId),
      )
      .collect();

    const enriched = [];
    for (const m of members) {
      const profile = await ctx.db
        .query("profiles")
        .withIndex("by_user", (q) => q.eq("userId", m.userId))
        .unique();
      enriched.push({
        ...m,
        name: profile
          ? `${profile.firstName} ${profile.lastName}`
          : "Unknown",
        profileRole: profile?.role,
      });
    }
    return enriched;
  },
});
