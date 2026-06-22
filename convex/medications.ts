import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { careRecipientId: v.id("careRecipients") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("medications")
      .withIndex("by_care_recipient", (q) =>
        q.eq("careRecipientId", args.careRecipientId),
      )
      .collect();
  },
});

export const create = mutation({
  args: {
    careRecipientId: v.id("careRecipients"),
    name: v.string(),
    dosage: v.string(),
    frequency: v.string(),
    instructions: v.optional(v.string()),
    timeOfDay: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("medications", {
      ...args,
      active: true,
      createdBy: userId,
    });
  },
});

export const toggleActive = mutation({
  args: { id: v.id("medications") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const med = await ctx.db.get(args.id);
    if (!med) throw new Error("Not found");
    await ctx.db.patch(args.id, { active: !med.active });
  },
});

export const logMedication = mutation({
  args: {
    medicationId: v.id("medications"),
    careRecipientId: v.id("careRecipients"),
    status: v.union(
      v.literal("taken"),
      v.literal("missed"),
      v.literal("skipped"),
    ),
    scheduledDate: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("medicationLogs", {
      ...args,
      userId,
      timestamp: Date.now(),
    });
  },
});

export const getLogs = query({
  args: {
    careRecipientId: v.id("careRecipients"),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("medicationLogs")
      .withIndex("by_care_recipient_date", (q) =>
        q
          .eq("careRecipientId", args.careRecipientId)
          .eq("scheduledDate", args.date),
      )
      .collect();
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const memberships = await ctx.db
      .query("careTeamMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const allMeds = [];
    for (const m of memberships) {
      const meds = await ctx.db
        .query("medications")
        .withIndex("by_care_recipient", (q) =>
          q.eq("careRecipientId", m.careRecipientId),
        )
        .collect();
      const recipient = await ctx.db.get(m.careRecipientId);
      for (const med of meds) {
        allMeds.push({
          ...med,
          recipientName: recipient?.name ?? "Unknown",
          recipientEmoji: recipient?.avatarEmoji ?? "👤",
        });
      }
    }
    return allMeds;
  },
});
