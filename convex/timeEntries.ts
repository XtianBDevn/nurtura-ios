import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { assertOnTeam } from "./lib/authz";

export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const entries = await ctx.db
      .query("timeEntries")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(args.limit ?? 50);

    const enriched = [];
    for (const e of entries) {
      const recipient = await ctx.db.get(e.careRecipientId);
      enriched.push({
        ...e,
        recipientName: recipient?.name ?? "Unknown",
        recipientEmoji: recipient?.avatarEmoji ?? "👤",
      });
    }
    return enriched;
  },
});

export const clockIn = mutation({
  args: {
    careRecipientId: v.id("careRecipients"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await assertOnTeam(ctx, userId, args.careRecipientId);

    const now = new Date();
    return await ctx.db.insert("timeEntries", {
      careRecipientId: args.careRecipientId,
      userId,
      date: now.toISOString().split("T")[0],
      startTime: now.toTimeString().slice(0, 5),
      startedAt: now.getTime(),
      notes: args.notes,
      status: "active",
    });
  },
});

export const clockOut = mutation({
  args: { id: v.id("timeEntries") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const entry = await ctx.db.get(args.id);
    if (!entry) throw new Error("Not found");
    // Only the caregiver who clocked in may clock out this entry
    if (entry.userId !== userId)
      throw new Error("Not authorized for this time entry");

    const now = new Date();
    const endedAt = now.getTime();
    const endTime = now.toTimeString().slice(0, 5);
    const startedAt = entry.startedAt ?? entry._creationTime;
    const durationMinutes = Math.max(
      0,
      Math.round((endedAt - startedAt) / 60_000),
    );

    await ctx.db.patch(args.id, {
      endTime,
      endedAt,
      durationMinutes,
      status: "completed",
    });
  },
});

export const getActive = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const entries = await ctx.db
      .query("timeEntries")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(1);

    const active = entries.find((e) => e.status === "active");
    if (!active) return null;

    const recipient = await ctx.db.get(active.careRecipientId);
    return {
      ...active,
      recipientName: recipient?.name ?? "Unknown",
    };
  },
});
