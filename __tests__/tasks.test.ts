import { formatTaskSummary, groupTasksByCompletion } from '../lib/tasks';

describe('formatTaskSummary', () => {
  it('formats a task with assignee info when present', () => {
    expect(
      formatTaskSummary({
        title: 'Change sheets',
        description: 'Fresh linens for the bedroom',
        assigneeName: 'Mina',
      }),
    ).toBe('Change sheets · Fresh linens for the bedroom · Assigned to Mina');
  });

  it('omits empty details without leaving broken separators', () => {
    expect(formatTaskSummary({ title: 'Water plants' })).toBe('Water plants');
  });

  it('includes a completed label when a task is done', () => {
    expect(formatTaskSummary({ title: 'Call doctor', completed: true })).toBe('Call doctor · Completed');
  });

  it('groups tasks into active and completed buckets', () => {
    const grouped = groupTasksByCompletion([
      { title: 'Water plants', completed: false },
      { title: 'Call doctor', completed: true },
    ]);

    expect(grouped.incomplete).toHaveLength(1);
    expect(grouped.completed).toHaveLength(1);
    expect(grouped.incomplete[0].title).toBe('Water plants');
    expect(grouped.completed[0].title).toBe('Call doctor');
  });
});
