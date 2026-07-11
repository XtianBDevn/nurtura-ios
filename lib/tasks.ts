export interface TaskSummaryFields {
  title?: string;
  description?: string;
  assigneeName?: string;
  completed?: boolean;
}

export interface TaskLike {
  completed?: boolean;
}

export function formatTaskSummary(fields: TaskSummaryFields) {
  const parts = [
    fields.title,
    fields.description,
    fields.completed ? 'Completed' : undefined,
    fields.assigneeName ? `Assigned to ${fields.assigneeName}` : undefined,
  ].filter((value) => Boolean(value && value.trim()));

  return parts.join(' · ');
}

export function groupTasksByCompletion<T extends TaskLike>(tasks: T[]) {
  return {
    incomplete: tasks.filter((task) => !task.completed),
    completed: tasks.filter((task) => Boolean(task.completed)),
  };
}
