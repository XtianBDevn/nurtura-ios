import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ─── Connection management ──────────────────────────────────────────

/** List all FHIR connections for the current user */
export const listConnections = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("fhirConnections")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

/** Get a specific connection */
export const getConnection = query({
  args: { connectionId: v.id("fhirConnections") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const conn = await ctx.db.get(args.connectionId);
    if (!conn || conn.userId !== userId) return null;

    // Strip tokens from client response
    return {
      ...conn,
      accessToken: conn.accessToken ? "●●●●●●●●" : undefined,
      refreshToken: conn.refreshToken ? "●●●●●●●●" : undefined,
    };
  },
});

/** Connect to a FHIR provider (called after SMART on FHIR OAuth completes) */
export const connect = mutation({
  args: {
    provider: v.string(),
    fhirBaseUrl: v.string(),
    patientId: v.optional(v.string()),
    patientName: v.optional(v.string()),
    accessToken: v.string(),
    refreshToken: v.optional(v.string()),
    tokenExpiry: v.optional(v.number()),
    scopes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check for existing connection to this provider
    const existing = await ctx.db
      .query("fhirConnections")
      .withIndex("by_user_provider", (q) =>
        q.eq("userId", userId).eq("provider", args.provider),
      )
      .first();

    if (existing) {
      // Update existing connection
      await ctx.db.patch(existing._id, {
        fhirBaseUrl: args.fhirBaseUrl,
        patientId: args.patientId,
        patientName: args.patientName,
        accessToken: args.accessToken,
        refreshToken: args.refreshToken,
        tokenExpiry: args.tokenExpiry,
        scopes: args.scopes,
        status: "connected",
        lastSync: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("fhirConnections", {
      userId,
      provider: args.provider,
      fhirBaseUrl: args.fhirBaseUrl,
      patientId: args.patientId,
      patientName: args.patientName,
      accessToken: args.accessToken,
      refreshToken: args.refreshToken,
      tokenExpiry: args.tokenExpiry,
      scopes: args.scopes,
      status: "connected",
      lastSync: Date.now(),
    });
  },
});

/** Disconnect from a FHIR provider */
export const disconnect = mutation({
  args: { connectionId: v.id("fhirConnections") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const conn = await ctx.db.get(args.connectionId);
    if (!conn || conn.userId !== userId) throw new Error("Not found");

    await ctx.db.patch(args.connectionId, {
      status: "disconnected",
      accessToken: undefined,
      refreshToken: undefined,
      tokenExpiry: undefined,
    });
  },
});

// ─── Message management ─────────────────────────────────────────────

/** List FHIR messages for the current user */
export const listMessages = query({
  args: {
    connectionId: v.optional(v.id("fhirConnections")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    if (args.connectionId) {
      return await ctx.db
        .query("fhirMessages")
        .withIndex("by_connection", (q) =>
          q.eq("fhirConnectionId", args.connectionId!),
        )
        .order("desc")
        .take(args.limit ?? 50);
    }

    return await ctx.db
      .query("fhirMessages")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(args.limit ?? 50);
  },
});

/** Store a message sent via FHIR */
export const storeMessage = mutation({
  args: {
    fhirConnectionId: v.id("fhirConnections"),
    fhirResourceId: v.optional(v.string()),
    direction: v.union(v.literal("inbound"), v.literal("outbound")),
    practitionerName: v.string(),
    practitionerReference: v.optional(v.string()),
    patientReference: v.optional(v.string()),
    subject: v.optional(v.string()),
    content: v.string(),
    category: v.optional(v.string()),
    status: v.union(
      v.literal("sent"),
      v.literal("received"),
      v.literal("read"),
      v.literal("failed"),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Verify the connection belongs to this user
    const conn = await ctx.db.get(args.fhirConnectionId);
    if (!conn || conn.userId !== userId)
      throw new Error("Invalid connection");

    return await ctx.db.insert("fhirMessages", {
      userId,
      fhirConnectionId: args.fhirConnectionId,
      fhirResourceId: args.fhirResourceId,
      direction: args.direction,
      practitionerName: args.practitionerName,
      practitionerReference: args.practitionerReference,
      patientReference: args.patientReference,
      subject: args.subject,
      content: args.content,
      category: args.category,
      status: args.status,
      sentAt: Date.now(),
    });
  },
});

/** Mark a message as read */
export const markRead = mutation({
  args: { messageId: v.id("fhirMessages") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const msg = await ctx.db.get(args.messageId);
    if (!msg || msg.userId !== userId) throw new Error("Not found");

    await ctx.db.patch(args.messageId, {
      status: "read",
      readAt: Date.now(),
    });
  },
});
