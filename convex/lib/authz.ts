/**
 * Shared authorization helpers.
 *
 * Authentication ("who is this?") is handled by getAuthUserId.
 * These helpers handle authorization ("may this user touch this
 * care recipient's data?") via care-team membership.
 *
 * Works in both queries and mutations (MutationCtx is structurally
 * assignable to QueryCtx).
 */
import { QueryCtx } from "../_generated/server";
import { Doc, Id } from "../_generated/dataModel";

/** Returns the caller's care-team membership for a recipient, or null. */
export async function getTeamMembership(
  ctx: QueryCtx,
  userId: Id<"users">,
  careRecipientId: Id<"careRecipients">,
): Promise<Doc<"careTeamMembers"> | null> {
  return await ctx.db
    .query("careTeamMembers")
    .withIndex("by_user_and_recipient", (q) =>
      q.eq("userId", userId).eq("careRecipientId", careRecipientId),
    )
    .unique();
}

/** Throws unless the user is on the recipient's care team. Use in mutations. */
export async function assertOnTeam(
  ctx: QueryCtx,
  userId: Id<"users">,
  careRecipientId: Id<"careRecipients">,
): Promise<Doc<"careTeamMembers">> {
  const membership = await getTeamMembership(ctx, userId, careRecipientId);
  if (!membership) {
    throw new Error("Not authorized for this care recipient");
  }
  return membership;
}
