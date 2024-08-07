export interface Task {
  id: number;
  title: string;
  description: string;
  state: string;
  created_at: string;
  due_date: string;
  author: number;
  isDone: boolean;
  priority: string;
}
