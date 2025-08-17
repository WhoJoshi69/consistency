export interface Profile {
  id: string;
  user_id: string;
  display_name: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
}

export interface DailyGoal {
  id: string;
  user_id: string;
  title: string;
  emoji: string;
  completed: boolean;
  goal_date: string;
  created_at: string;
  updated_at: string;
  profiles?: { display_name: string };
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  emoji: string;
  category_id?: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
  profiles?: { display_name: string };
  categories?: { name: string };
}