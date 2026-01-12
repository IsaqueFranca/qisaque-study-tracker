
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Subject, Session, Settings, Month, SubjectSchedule } from '../types';
import { generateId, formatDate, calculateStreaks } from '../lib/utils';

// Unified StudyState to fix missing properties and actions identified in errors
interface StudyState {
  subjects: Subject[];
  sessions: Session[];
  months: Month[];
  activeScheduleMonths: string[];
  settings: Settings;
  isGuest: boolean;
  
  // Month Actions
  addMonth: (name: string, year: number) => void;
  editMonth: (id: string, name: string) => void;
  deleteMonth: (id: string) => void;
  duplicateMonth: (id: string) => void;
  
  // Subject Actions
  addSubject: (title: string, monthId?: string) => void;
  deleteSubject: (id: string) => void;
  toggleSubtopic: (subjectId: string, subtopicId: string) => void;
  
  // Session Actions
  addSession: (data: string | Partial<Session>, duration?: number, date?: string) => void;
  deleteSession: (id: string) => void;
  updateSessionStatus: (id: string, status: 'completed' | 'incomplete') => void;
  
  // Settings & Auth Actions
  updateSettings: (updates: Partial<Settings>) => void;
  loadFromCloud: (uid: string) => Promise<void>;
  setGuestMode: (mode: boolean) => void;

  // Schedule Actions
  addActiveScheduleMonth: (month: string) => void;
  removeActiveScheduleMonth: (month: string) => void;
  toggleSubjectInMonth: (subjectId: string, monthId: string) => void;
  updateSubjectSchedule: (subjectId: string, monthId: string, updates: Partial<SubjectSchedule>) => void;
  toggleSubjectPlannedDay: (subjectId: string, monthId: string, dateStr: string) => void;

  // Selectors
  getTotalHoursBySubject: (subjectId: string) => number;
  getSessionsByDate: (date: string) => Session[];
  getSubjectsByMonthId: (monthId: string) => Subject[];
  getStreakStats: () => any;
}

export const useStudyStore = create<StudyState>()(
  persist(
    (set, get) => ({
      subjects: [],
      sessions: [],
      months: [],
      activeScheduleMonths: [],
      isGuest: false,
      settings: {
        pomodoroDuration: 25,
        userName: 'Estudante',
        healthDegree: 'Medicine',
        monthlyGoalHours: 40,
      },

      // Month Actions
      addMonth: (name, year) => set((state) => ({
        months: [...state.months, { id: generateId(), name, year }]
      })),

      editMonth: (id, name) => set((state) => ({
        months: state.months.map(m => m.id === id ? { ...m, name } : m)
      })),

      deleteMonth: (id) => set((state) => ({
        months: state.months.filter(m => m.id !== id),
        subjects: state.subjects.filter(s => s.monthId !== id)
      })),

      duplicateMonth: (id) => set((state) => {
        const monthToDup = state.months.find(m => m.id === id);
        if (!monthToDup) return state;
        const newMonthId = generateId();
        const newMonth = { ...monthToDup, id: newMonthId, name: `${monthToDup.name} (Cópia)` };
        
        const subjectsToDup = state.subjects.filter(s => s.monthId === id);
        const newSubjects = subjectsToDup.map(s => ({
          ...s,
          id: generateId(),
          monthId: newMonthId,
          createdAt: Date.now()
        }));
        
        return {
          months: [...state.months, newMonth],
          subjects: [...state.subjects, ...newSubjects]
        };
      }),

      // Subject Actions
      addSubject: (title, monthId) => set((state) => ({
        subjects: [...state.subjects, {
          id: generateId(),
          title,
          color: `hsl(${Math.random() * 360}, 70%, 50%)`,
          createdAt: Date.now(),
          monthId: monthId || undefined,
          subtopics: [],
          schedules: {}
        }]
      })),

      deleteSubject: (id) => set((state) => ({
        subjects: state.subjects.filter(s => s.id !== id),
        sessions: state.sessions.filter(sess => sess.subjectId !== id)
      })),

      toggleSubtopic: (subjectId, subtopicId) => set((state) => ({
        subjects: state.subjects.map(s => {
          if (s.id !== subjectId) return s;
          return {
            ...s,
            subtopics: s.subtopics.map(st => st.id === subtopicId ? { ...st, isCompleted: !st.isCompleted } : st)
          };
        })
      })),

      // Session Actions
      // Updated to handle both (subjectId, duration, date) and an object as seen in ScheduleTab
      addSession: (data, duration, date) => set((state) => {
        let newSession: Session;
        if (typeof data === 'string') {
          newSession = {
            id: generateId(),
            subjectId: data,
            duration: duration || 0,
            date: date || formatDate(new Date()),
            startTime: Date.now(),
            status: 'completed'
          };
        } else {
          newSession = {
            id: generateId(),
            subjectId: data.subjectId || '',
            duration: data.duration || 0,
            date: data.date || formatDate(new Date()),
            startTime: data.startTime || Date.now(),
            status: data.status || 'completed'
          };
        }
        return { sessions: [...state.sessions, newSession] };
      }),

      deleteSession: (id) => set((state) => ({
        sessions: state.sessions.filter(s => s.id !== id)
      })),

      updateSessionStatus: (id, status) => set((state) => ({
        sessions: state.sessions.map(s => s.id === id ? { ...s, status } : s)
      })),

      // Settings & Auth Actions
      updateSettings: (updates) => set((state) => ({
        settings: { ...state.settings, ...updates }
      })),

      loadFromCloud: async (uid) => {
        // Mocking cloud load since Firebase is removed but component expects it
        console.log("Loading data for user:", uid);
      },

      setGuestMode: (isGuest) => set({ isGuest }),

      // Schedule Actions
      addActiveScheduleMonth: (month) => set((state) => ({
        activeScheduleMonths: [...new Set([...state.activeScheduleMonths, month])]
      })),

      removeActiveScheduleMonth: (month) => set((state) => ({
        activeScheduleMonths: state.activeScheduleMonths.filter(m => m !== month)
      })),

      toggleSubjectInMonth: (subjectId, monthId) => set((state) => ({
        subjects: state.subjects.map(s => {
          if (s.id !== subjectId) return s;
          const schedules = { ...s.schedules };
          if (schedules[monthId]) {
            delete schedules[monthId];
          } else {
            schedules[monthId] = { plannedDays: [], monthlyGoal: 0 };
          }
          return { ...s, schedules };
        })
      })),

      updateSubjectSchedule: (subjectId, monthId, updates) => set((state) => ({
        subjects: state.subjects.map(s => {
          if (s.id !== subjectId) return s;
          const schedules = { ...s.schedules };
          schedules[monthId] = { ...(schedules[monthId] || {}), ...updates };
          return { ...s, schedules };
        })
      })),

      toggleSubjectPlannedDay: (subjectId, monthId, dateStr) => set((state) => ({
        subjects: state.subjects.map(s => {
          if (s.id !== subjectId) return s;
          const schedules = { ...s.schedules };
          const schedule = schedules[monthId] || { plannedDays: [], monthlyGoal: 0 };
          const plannedDays = [...(schedule.plannedDays || [])];
          
          if (plannedDays.includes(dateStr)) {
            schedules[monthId] = { ...schedule, plannedDays: plannedDays.filter(d => d !== dateStr) };
          } else {
            schedules[monthId] = { ...schedule, plannedDays: [...plannedDays, dateStr] };
          }
          return { ...s, schedules };
        })
      })),

      // Selectors
      getTotalHoursBySubject: (subjectId) => {
        const totalSeconds = get().sessions
          .filter(s => s.subjectId === subjectId && s.status === 'completed')
          .reduce((acc, s) => acc + s.duration, 0);
        return totalSeconds / 3600;
      },

      getSessionsByDate: (date) => {
        return get().sessions.filter(s => s.date === date);
      },

      getSubjectsByMonthId: (monthId) => {
        return get().subjects.filter(s => s.monthId === monthId);
      },

      getStreakStats: () => {
        return calculateStreaks(get().sessions);
      }
    }),
    {
      name: 'qisaque-storage'
    }
  )
);
