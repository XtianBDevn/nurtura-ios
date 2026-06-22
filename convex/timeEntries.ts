import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

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

    const now = new Date();
    return await ctx.db.insert("timeEntries", {
      careRecipientId: args.careRecipientId,
      userId,
      date: now.toISOString().split("T")[0],
      startTime: now.toTimeString().slice(0, 5),
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

    const now = new Date();
    const endTime = now.toTimeString().slice(0, 5);

    // Calculate duration
    const [sh, sm] = entry.startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    const durationMinutes = eh * 60 + em - (sh * 60 + sm);

    await ctx.db.patch(args.id, {
      endTime,
      durationMinutes: Math.max(0, durationMinutes),
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
