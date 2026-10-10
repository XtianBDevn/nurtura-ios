import { getAuthUserId } from "@convex-dev/auth/server";
import { makeFunctionReference } from "convex/server";
import { v } from "convex/values";
import { Id, TableNames } from "./_generated/dataModel";
import { internalMutation, mutation, MutationCtx } from "./_generated/server";

const PAGE = 40;

const purgeUserRef = makeFunctionReference<
  "mutation",
  { userId: Id<"users"> },
  null
>("accountDeletion:purgeUser");

type Progress = {
  deleted: number;
  pending: boolean;
};

/**
 * Deletes the signed-in account and the personal data tied to it.
 * Care recipients that only this account can access are removed, including
 * their health profile, logs, medications, and schedule. A recipient shared
 * with other caregivers stays with that team; this account's membership,
 * messages, logs, and shift records are removed.
 */
export const deleteAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const done = await purgeOnce(ctx, userId);
    if (!done) {
      await ctx.scheduler.runAfter(0, purgeUserRef, { userId });
    }
    return { complete: done };
  },
});

export const purgeUser = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const done = await purgeOnce(ctx, args.userId);
    if (!done) {
      await ctx.scheduler.runAfter(0, purgeUserRef, { userId: args.userId });
    }
  },
});

async function purgeOnce(
  ctx: MutationCtx,
  userId: Id<"users">,
): Promise<boolean> {
  const progress: Progress = { deleted: 0, pending: false };

  await deletePage(
    ctx,
    await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .take(PAGE),
    progress,
  );
  await deletePage(
    ctx,
    await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .take(PAGE),
    progress,
  );
  await deletePage(
    ctx,
    await ctx.db
      .query("chatMessages")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .take(PAGE),
    progress,
  );
  await deletePage(
    ctx,
    await ctx.db
      .query("securityEvents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .take(PAGE),
    progress,
  );
  await deletePage(
    ctx,
    await ctx.db
      .query("integrations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .take(PAGE),
    progress,
  );
  await deletePage(
    ctx,
    await ctx.db
      .query("fhirMessages")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .take(PAGE),
    progress,
  );
  await deletePage(
    ctx,
    await ctx.db
      .query("fhirConnections")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .take(PAGE),
    progress,
  );
  await deletePage(
    ctx,
    await ctx.db
      .query("timeEntries")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .take(PAGE),
    progress,
  );
  await deletePage(
    ctx,
    await ctx.db
      .query("messages")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .take(PAGE),
    progress,
  );
  await deletePage(
    ctx,
    await ctx.db
      .query("careLogs")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .take(PAGE),
    progress,
  );

  if (progress.pending) return finish(progress);

  const memberships = await ctx.db
    .query("careTeamMembers")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .take(PAGE);
  if (memberships.length === PAGE) progress.pending = true;

  for (const membership of memberships) {
    const team = await ctx.db
      .query("careTeamMembers")
      .withIndex("by_care_recipient", (q) =>
        q.eq("careRecipientId", membership.careRecipientId),
      )
      .take(2);
    const shared = team.some((member) => member._id !== membership._id);
    if (shared) {
      await ctx.db.delete(membership._id);
      progress.deleted += 1;
      continue;
    }

    const recipientPending = await deleteSoleRecipient(
      ctx,
      membership.careRecipientId,
      progress,
    );
    if (!recipientPending) {
      const recipient = await ctx.db.get(membership.careRecipientId);
      if (recipient) {
        await ctx.db.delete(recipient._id);
        progress.deleted += 1;
      }
      const stillThere = await ctx.db.get(membership._id);
      if (stillThere) {
        await ctx.db.delete(stillThere._id);
        progress.deleted += 1;
      }
    }
  }

  if (progress.pending) return finish(progress);

  await deleteAuthRecords(ctx, userId, progress);
  if (progress.pending) return finish(progress);

  const user = await ctx.db.get(userId);
  if (user) {
    await ctx.db.delete(user._id);
    progress.deleted += 1;
  }
  return finish(progress);
}

async function deleteSoleRecipient(
  ctx: MutationCtx,
  careRecipientId: Id<"careRecipients">,
  progress: Progress,
): Promise<boolean> {
  let pending = false;

  pending =
    (await deletePage(
      ctx,
      await ctx.db
        .query("healthProfiles")
        .withIndex("by_care_recipient", (q) =>
          q.eq("careRecipientId", careRecipientId),
        )
        .take(PAGE),
      progress,
    )) || pending;

  pending =
    (await deletePage(
      ctx,
      await ctx.db
        .query("careLogs")
        .withIndex("by_care_recipient", (q) =>
          q.eq("careRecipientId", careRecipientId),
        )
        .take(PAGE),
      progress,
    )) || pending;

  pending =
    (await deletePage(
      ctx,
      await ctx.db
        .query("scheduleEntries")
        .withIndex("by_care_recipient", (q) =>
          q.eq("careRecipientId", careRecipientId),
        )
        .take(PAGE),
      progress,
    )) || pending;

  pending =
    (await deletePage(
      ctx,
      await ctx.db
        .query("timeEntries")
        .withIndex("by_care_recipient", (q) =>
          q.eq("careRecipientId", careRecipientId),
        )
        .take(PAGE),
      progress,
    )) || pending;

  pending =
    (await deletePage(
      ctx,
      await ctx.db
        .query("messages")
        .withIndex("by_care_recipient", (q) =>
          q.eq("careRecipientId", careRecipientId),
        )
        .take(PAGE),
      progress,
    )) || pending;

  const medications = await ctx.db
    .query("medications")
    .withIndex("by_care_recipient", (q) =>
      q.eq("careRecipientId", careRecipientId),
    )
    .take(PAGE);
  if (medications.length === PAGE) pending = true;
  for (const medication of medications) {
    const logs = await ctx.db
      .query("medicationLogs")
      .withIndex("by_medication", (q) => q.eq("medicationId", medication._id))
      .take(PAGE);
    if (logs.length === PAGE) pending = true;
    for (const log of logs) {
      await ctx.db.delete(log._id);
      progress.deleted += 1;
    }
    if (logs.length < PAGE) {
      await ctx.db.delete(medication._id);
      progress.deleted += 1;
    }
  }

  if (pending) progress.pending = true;
  return pending;
}

async function deleteAuthRecords(
  ctx: MutationCtx,
  userId: Id<"users">,
  progress: Progress,
) {
  const sessions = await ctx.db
    .query("authSessions")
    .withIndex("userId", (q) => q.eq("userId", userId))
    .take(PAGE);
  if (sessions.length === PAGE) progress.pending = true;

  for (const session of sessions) {
    const tokens = await ctx.db
      .query("authRefreshTokens")
      .withIndex("sessionId", (q) => q.eq("sessionId", session._id))
      .take(PAGE);
    if (tokens.length === PAGE) progress.pending = true;
    for (const token of tokens) {
      await ctx.db.delete(token._id);
      progress.deleted += 1;
    }
    if (tokens.length < PAGE) {
      await ctx.db.delete(session._id);
      progress.deleted += 1;
    }
  }

  const accounts = await ctx.db
    .query("authAccounts")
    .withIndex("userIdAndProvider", (q) =>
      q.eq("userId", userId).eq("provider", "password"),
    )
    .take(PAGE);
  if (accounts.length === PAGE) progress.pending = true;

  for (const account of accounts) {
    const codes = await ctx.db
      .query("authVerificationCodes")
      .withIndex("accountId", (q) => q.eq("accountId", account._id))
      .take(PAGE);
    if (codes.length === PAGE) progress.pending = true;
    for (const code of codes) {
      await ctx.db.delete(code._id);
      progress.deleted += 1;
    }
    const rateLimit = await ctx.db
      .query("authRateLimits")
      .withIndex("identifier", (q) => q.eq("identifier", account._id))
      .unique();
    if (rateLimit) {
      await ctx.db.delete(rateLimit._id);
      progress.deleted += 1;
    }
    if (codes.length < PAGE) {
      await ctx.db.delete(account._id);
      progress.deleted += 1;
    }
  }
}

async function deletePage<TableName extends TableNames>(
  ctx: MutationCtx,
  rows: { _id: Id<TableName> }[],
  progress: Progress,
): Promise<boolean> {
  for (const row of rows) {
    await ctx.db.delete(row._id);
    progress.deleted += 1;
  }
  const more = rows.length === PAGE;
  if (more) progress.pending = true;
  return more;
}

function finish(progress: Progress): boolean {
  if (progress.pending && progress.deleted === 0) {
    throw new Error("Account deletion could not continue. Please try again.");
  }
  return !progress.pending;
}
