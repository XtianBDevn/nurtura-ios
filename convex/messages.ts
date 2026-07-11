import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { assertOnTeam, getTeamMembership } from "./lib/authz";

export const list = query({
  args: { careRecipientId: v.id("careRecipients") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    if (!(await getTeamMembership(ctx, userId, args.careRecipientId)))
      return [];

    return await ctx.db
      .query("messages")
      .withIndex("by_care_recipient", (q) =>
        q.eq("careRecipientId", args.careRecipientId),
      )
      .order("desc")
      .take(100);
  },
});

export const listAll = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const memberships = await ctx.db
      .query("careTeamMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const all = [];
    for (const m of memberships) {
      const msgs = await ctx.db
        .query("messages")
        .withIndex("by_care_recipient", (q) =>
          q.eq("careRecipientId", m.careRecipientId),
        )
        .order("desc")
        .take(50);
      const recipient = await ctx.db.get(m.careRecipientId);
      for (const msg of msgs) {
        all.push({
          ...msg,
          recipientName: recipient?.name ?? "Unknown",
          recipientEmoji: recipient?.avatarEmoji ?? "👤",
        });
      }
    }
    all.sort((a, b) => b.timestamp - a.timestamp);
    return all.slice(0, args.limit ?? 100);
  },
});

export const send = mutation({
  args: {
    careRecipientId: v.id("careRecipients"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await assertOnTeam(ctx, userId, args.careRecipientId);

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    return await ctx.db.insert("messages", {
      careRecipientId: args.careRecipientId,
      userId,
      userName: profile
        ? `${profile.firstName} ${profile.lastName}`
        : "Unknown",
      content: args.content,
      timestamp: Date.now(),
    });
  },
});
