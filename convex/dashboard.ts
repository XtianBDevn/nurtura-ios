import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "./_generated/server";

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId)
      return {
        recipientCount: 0,
        todayLogs: 0,
        activeMeds: 0,
        todaySchedule: 0,
        upcomingSchedule: [],
        recentLogs: [],
      };

    // Get user's care recipients
    const memberships = await ctx.db
      .query("careTeamMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const today = new Date().toISOString().split("T")[0];

    let todayLogs = 0;
    let activeMeds = 0;
    let todaySchedule = 0;
    const upcomingSchedule: Array<{
      title: string;
      startTime?: string;
      recipientName: string;
      recipientEmoji: string;
      type: string;
      completed: boolean;
    }> = [];

    for (const m of memberships) {
      const recipient = await ctx.db.get(m.careRecipientId);
      const rName = recipient?.name ?? "Unknown";
      const rEmoji = recipient?.avatarEmoji ?? "👤";

      // Today's logs
      const logs = await ctx.db
        .query("careLogs")
        .withIndex("by_care_recipient_time", (q) =>
          q.eq("careRecipientId", m.careRecipientId),
        )
        .order("desc")
        .take(100);
      todayLogs += logs.filter(
        (l) => l.timestamp >= todayStart.getTime(),
      ).length;

      // Active medications
      const meds = await ctx.db
        .query("medications")
        .withIndex("by_care_recipient", (q) =>
          q.eq("careRecipientId", m.careRecipientId),
        )
        .collect();
      activeMeds += meds.filter((med) => med.active).length;

      // Today's schedule
      const schedItems = await ctx.db
        .query("scheduleEntries")
        .withIndex("by_care_recipient_date", (q) =>
          q.eq("careRecipientId", m.careRecipientId).eq("date", today),
        )
        .collect();
      todaySchedule += schedItems.length;
      for (const s of schedItems) {
        upcomingSchedule.push({
          title: s.title,
          startTime: s.startTime,
          recipientName: rName,
          recipientEmoji: rEmoji,
          type: s.type,
          completed: s.completed,
        });
      }
    }

    upcomingSchedule.sort((a, b) =>
      (a.startTime ?? "").localeCompare(b.startTime ?? ""),
    );

    return {
      recipientCount: memberships.length,
      todayLogs,
      activeMeds,
      todaySchedule,
      upcomingSchedule: upcomingSchedule.slice(0, 5),
    };
  },
});
