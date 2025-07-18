export interface Task {
  id: string;
  user_id: string;
  created_at: string;
  title: string;
  status: 'todo' | 'done';
  category?: string;
  dueDate?: string;
  description?: string;
}

export interface WeddingInfo {
  bride: string;
  groom: string;
  date: string;
  venue?: string;
  theme?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
} 