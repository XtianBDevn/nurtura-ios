import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { generateCarePlan } from "../lib/carePlan";
import { assertOnTeam, getTeamMembership } from "./lib/authz";

const healthArgs = {
  conditions: v.optional(v.array(v.string())),
  otherConditions: v.optional(v.string()),
  allergies: v.optional(v.array(v.string())),
  currentMedications: v.optional(v.array(v.string())),
  mobility: v.optional(
    v.union(
      v.literal("independent"),
      v.literal("cane"),
      v.literal("walker"),
      v.literal("wheelchair"),
      v.literal("bedbound"),
    ),
  ),
  fallRisk: v.optional(
    v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
  ),
  cognitiveStatus: v.optional(
    v.union(
      v.literal("alert"),
      v.literal("mild"),
      v.literal("moderate"),
      v.literal("severe"),
    ),
  ),
  adl: v.optional(v.array(v.object({ key: v.string(), level: v.number() }))),
  iadl: v.optional(v.array(v.object({ key: v.string(), level: v.number() }))),
  qualityOfLife: v.optional(
    v.object({
      mood: v.number(),
      pain: v.number(),
      sleep: v.number(),
      social: v.number(),
      energy: v.number(),
    }),
  ),
  bloodType: v.optional(v.string()),
  primaryPhysician: v.optional(v.string()),
  dietaryRestrictions: v.optional(v.array(v.string())),
  emergencyNotes: v.optional(v.string()),
};

export const get = query({
  args: { careRecipientId: v.id("careRecipients") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    if (!(await getTeamMembership(ctx, userId, args.careRecipientId)))
      return null;
    const profile = await ctx.db
      .query("healthProfiles")
      .withIndex("by_care_recipient", (q) =>
        q.eq("careRecipientId", args.careRecipientId),
      )
      .unique();
    return profile;
  },
});

export const upsert = mutation({
  args: { careRecipientId: v.id("careRecipients"), ...healthArgs },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await assertOnTeam(ctx, userId, args.careRecipientId);

    const { careRecipientId, ...fields } = args;
    const clean: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(fields)) {
      if (val !== undefined) clean[k] = val;
    }

    const existing = await ctx.db
      .query("healthProfiles")
      .withIndex("by_care_recipient", (q) =>
        q.eq("careRecipientId", careRecipientId),
      )
      .unique();

    // Compute the cached care-plan summary from the merged data.
    const merged = { ...(existing ?? {}), ...clean };
    const plan = generateCarePlan(merged as any);

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...clean,
        carePlanSummary: plan.summary,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("healthProfiles", {
      careRecipientId,
      createdBy: userId,
      ...clean,
      carePlanSummary: plan.summary,
      updatedAt: Date.now(),
    });
  },
});
