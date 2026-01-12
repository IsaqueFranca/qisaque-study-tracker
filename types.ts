
export type HealthDegree = 'Medicine' | 'Pharmacy' | 'Nursing' | 'Dentistry' | 'Physiotherapy' | 'Biomedicine' | 'Nutrition' | 'Clinical Analysis' | 'Radiology';

export interface Subtopic {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface SubjectSchedule {
  monthlyGoal?: number;
  plannedDays?: string[];
  isCompleted?: boolean;
  notes?: string;
}

export interface Subject {
  id: string;
  title: string;
  color: string;
  createdAt: number;
  monthId?: string;
  subtopics: Subtopic[];
  schedules?: Record<string, SubjectSchedule>;
}

export interface Month {
  id: string;
  name: string;
  year: number;
}

export interface Session {
  id: string;
  subjectId: string;
  duration: number; // Segundos
  date: string; // ISO Date YYYY-MM-DD
  startTime: number;
  status?: 'completed' | 'incomplete';
}

export interface Settings {
  pomodoroDuration: number;
  userName: string;
  healthDegree?: HealthDegree;
  finalGoal?: string;
  monthlyGoalHours?: number;
  shortBreakDuration?: number;
}
