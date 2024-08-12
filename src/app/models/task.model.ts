export interface Task {
  id: number;
  title: string;
  description: string;
  state: string;
  created_at: string;
  contact: number;
  due_date: string;
  author: number;
  isDone: boolean;
  priority: string;
  subtask_ids: number[];
}
