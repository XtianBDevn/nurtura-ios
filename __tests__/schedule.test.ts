import { canUseRecurringSchedules, toDateInputValue } from '../lib/schedule';

describe('schedule helpers', () => {
  it('formats a local date value for Convex queries', () => {
    const date = new Date(2026, 6, 10, 23, 45, 0);
    expect(toDateInputValue(date)).toBe('2026-07-10');
  });

  it('allows recurring schedules for premium plans', () => {
    expect(canUseRecurringSchedules('free')).toBe(false);
    expect(canUseRecurringSchedules('plus')).toBe(true);
    expect(canUseRecurringSchedules('professional')).toBe(true);
  });
});
