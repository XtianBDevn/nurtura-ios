import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { careRecipientId: v.id("careRecipients") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("messages")
      .withIndex("by_care_recipient", (q) =>
        q.eq("careRecipientId", args.careRecipientId),
      )
      .order("desc")
      .take(100);
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
