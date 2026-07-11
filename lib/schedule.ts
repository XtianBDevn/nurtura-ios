export function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function canUseRecurringSchedules(plan?: string | null) {
  return plan === 'plus' || plan === 'professional';
}
