import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { assertOnTeam, getTeamMembership } from "./lib/authz";

export const list = query({
  args: { careRecipientId: v.id("careRecipients"), date: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    if (!(await getTeamMembership(ctx, userId, args.careRecipientId)))
      return [];

    if (args.date) {
      return await ctx.db
        .query("scheduleEntries")
        .withIndex("by_care_recipient_date", (q) =>
          q.eq("careRecipientId", args.careRecipientId).eq("date", args.date!),
        )
        .collect();
    }
    return await ctx.db
      .query("scheduleEntries")
      .withIndex("by_care_recipient", (q) =>
        q.eq("careRecipientId", args.careRecipientId),
      )
      .order("desc")
      .take(50);
  },
});

export const listToday = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const today = new Date().toISOString().split("T")[0];

    const memberships = await ctx.db
      .query("careTeamMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const entries = [];
    for (const m of memberships) {
      const items = await ctx.db
        .query("scheduleEntries")
        .withIndex("by_care_recipient_date", (q) =>
          q.eq("careRecipientId", m.careRecipientId).eq("date", today),
        )
        .collect();
      const recipient = await ctx.db.get(m.careRecipientId);
      for (const item of items) {
        entries.push({
          ...item,
          recipientName: recipient?.name ?? "Unknown",
          recipientEmoji: recipient?.avatarEmoji ?? "👤",
        });
      }
    }
    entries.sort((a, b) => (a.startTime ?? "").localeCompare(b.startTime ?? ""));
    return entries;
  },
});

export const listForUser = query({
  args: { date: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const memberships = await ctx.db
      .query("careTeamMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const entries = [];
    for (const m of memberships) {
      const items = args.date
        ? await ctx.db
            .query("scheduleEntries")
            .withIndex("by_care_recipient_date", (q) =>
              q.eq("careRecipientId", m.careRecipientId).eq("date", args.date!),
            )
            .collect()
        : await ctx.db
            .query("scheduleEntries")
            .withIndex("by_care_recipient", (q) =>
              q.eq("careRecipientId", m.careRecipientId),
            )
            .order("desc")
            .take(50);
      const recipient = await ctx.db.get(m.careRecipientId);
      for (const item of items) {
        entries.push({
          ...item,
          recipientName: recipient?.name ?? "Unknown",
          recipientEmoji: recipient?.avatarEmoji ?? "👤",
        });
      }
    }
    entries.sort((a, b) => (a.startTime ?? "").localeCompare(b.startTime ?? ""));
    return entries;
  },
});

export const create = mutation({
  args: {
    careRecipientId: v.id("careRecipients"),
    type: v.union(
      v.literal("shift"),
      v.literal("appointment"),
      v.literal("reminder"),
      v.literal("medication"),
      v.literal("task"),
    ),
    title: v.string(),
    description: v.optional(v.string()),
    date: v.string(),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await assertOnTeam(ctx, userId, args.careRecipientId);

    return await ctx.db.insert("scheduleEntries", {
      ...args,
      assignedTo: userId,
      completed: false,
      createdBy: userId,
    });
  },
});

export const toggleComplete = mutation({
  args: { id: v.id("scheduleEntries") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const entry = await ctx.db.get(args.id);
    if (!entry) throw new Error("Not found");
    await assertOnTeam(ctx, userId, entry.careRecipientId);
    await ctx.db.patch(args.id, { completed: !entry.completed });
  },
});
