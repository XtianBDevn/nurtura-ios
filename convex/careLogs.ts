import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { assertOnTeam, getTeamMembership } from "./lib/authz";

export const list = query({
  args: {
    careRecipientId: v.id("careRecipients"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    if (!(await getTeamMembership(ctx, userId, args.careRecipientId)))
      return [];

    const logs = await ctx.db
      .query("careLogs")
      .withIndex("by_care_recipient_time", (q) =>
        q.eq("careRecipientId", args.careRecipientId),
      )
      .order("desc")
      .take(args.limit ?? 50);

    // Enrich with user info
    const enriched = [];
    for (const log of logs) {
      const profile = await ctx.db
        .query("profiles")
        .withIndex("by_user", (q) => q.eq("userId", log.userId))
        .unique();
      enriched.push({
        ...log,
        userName: profile
          ? `${profile.firstName} ${profile.lastName}`
          : "Unknown",
      });
    }
    return enriched;
  },
});

export const listRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Get user's care recipients
    const memberships = await ctx.db
      .query("careTeamMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const allLogs = [];
    for (const m of memberships) {
      const logs = await ctx.db
        .query("careLogs")
        .withIndex("by_care_recipient_time", (q) =>
          q.eq("careRecipientId", m.careRecipientId),
        )
        .order("desc")
        .take(10);

      const recipient = await ctx.db.get(m.careRecipientId);
      for (const log of logs) {
        allLogs.push({
          ...log,
          recipientName: recipient?.name ?? "Unknown",
          recipientEmoji: recipient?.avatarEmoji ?? "👤",
        });
      }
    }

    // Sort by timestamp desc and limit
    allLogs.sort((a, b) => b.timestamp - a.timestamp);
    return allLogs.slice(0, args.limit ?? 20);
  },
});

export const create = mutation({
  args: {
    careRecipientId: v.id("careRecipients"),
    type: v.union(
      v.literal("task"),
      v.literal("vital"),
      v.literal("meal"),
      v.literal("note"),
      v.literal("activity"),
      v.literal("mood"),
    ),
    title: v.string(),
    description: v.optional(v.string()),
    vitalType: v.optional(v.string()),
    vitalValue: v.optional(v.string()),
    vitalUnit: v.optional(v.string()),
    mealType: v.optional(v.string()),
    moodScore: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await assertOnTeam(ctx, userId, args.careRecipientId);

    return await ctx.db.insert("careLogs", {
      ...args,
      userId,
      timestamp: Date.now(),
    });
  },
});

const EMPTY_STATS = {
  total: 0,
  today: 0,
  thisWeek: 0,
  byType: { task: 0, vital: 0, meal: 0, note: 0, activity: 0, mood: 0 },
};

export const stats = query({
  args: { careRecipientId: v.id("careRecipients") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return EMPTY_STATS;
    if (!(await getTeamMembership(ctx, userId, args.careRecipientId)))
      return EMPTY_STATS;

    const logs = await ctx.db
      .query("careLogs")
      .withIndex("by_care_recipient", (q) =>
        q.eq("careRecipientId", args.careRecipientId),
      )
      .collect();

    const now = Date.now();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const weekStart = new Date(now - 7 * 24 * 60 * 60 * 1000);

    return {
      total: logs.length,
      today: logs.filter((l) => l.timestamp >= todayStart.getTime()).length,
      thisWeek: logs.filter((l) => l.timestamp >= weekStart.getTime()).length,
      byType: {
        task: logs.filter((l) => l.type === "task").length,
        vital: logs.filter((l) => l.type === "vital").length,
        meal: logs.filter((l) => l.type === "meal").length,
        note: logs.filter((l) => l.type === "note").length,
        activity: logs.filter((l) => l.type === "activity").length,
        mood: logs.filter((l) => l.type === "mood").length,
      },
    };
  },
});
