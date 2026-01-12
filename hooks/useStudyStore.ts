
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Subject, Session, Settings, Month, SubjectSchedule } from '../types';
import { generateId, formatDate, calculateStreaks } from '../lib/utils';

// Define the state and actions for the study store
interface StudyState {
  months: Month[];
  subjects: Subject[];
  sessions: Session[];
  settings: Settings;
  activeScheduleMonths: string[];
  guestMode?: boolean;
  
  // Month Actions
  addMonth: (name: string, year: number) => void;
  editMonth: (id: string, name: string) => void;
  deleteMonth: (id: string) => void;
  duplicateMonth: (id: string) => void;
  addActiveScheduleMonth: (monthId: string) => void;
  removeActiveScheduleMonth: (monthId: string) => void;

  // Subject Actions
  // Updated addSubject to accept an optional monthId
  addSubject: (title: string, monthId?: string) => void;
  deleteSubject: (id: string) => void;
  toggleSubjectInMonth: (subjectId: string, monthId: string) => void;
  updateSubjectSchedule: (subjectId: string, monthId: string, updates: Partial<SubjectSchedule>) => void;
  toggleSubjectPlannedDay: (subjectId: string, monthId: string, dateStr: string) => void;
  toggleSubtopic: (subjectId: string, subtopicId: string) => void;
  
  // Session Actions
  addSession: (data: string | Partial<Session>, duration?: number, date?: string) => void;
  deleteSession: (id: string) => void;
  updateSessionStatus: (sessionId: string, status: 'completed' | 'incomplete') => void;
  
  // Settings Actions
  updateSettings: (updates: Partial<Settings>) => void;
  setGuestMode: (isGuest: boolean) => void;
  loadFromCloud: (uid: string) => Promise<void>;

  // Selectors
  getTotalHoursBySubject: (subjectId: string) => number;
  getSessionsByDate: (date: string) => Session[];
  getSubjectsByMonthId: (monthId: string) => Subject[];
  getStreakStats: () => any;
}

export const useStudyStore = create<StudyState>()(
  persist(
    (set, get) => ({
      months: [],
      subjects: [],
      sessions: [],
      activeScheduleMonths: [],
      settings: {
        pomodoroDuration: 25,
        userName: 'Estudante',
        healthDegree: 'Medicine',
        monthlyGoalHours: 40,
      },

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
        const month = state.months.find(m => m.id === id);
        if (!month) return state;
        const newId = generateId();
        const newMonth = { ...month, id: newId, name: `${month.name} (Cópia)` };
        const subjectsToCopy = state.subjects.filter(s => s.monthId === id);
        const newSubjects = subjectsToCopy.map(s => ({
          ...s,
          id: generateId(),
          monthId: newId,
          createdAt: Date.now()
        }));
        return {
          months: [...state.months, newMonth],
          subjects: [...state.subjects, ...newSubjects]
        };
      }),

      addActiveScheduleMonth: (monthId) => set((state) => ({
        activeScheduleMonths: Array.from(new Set([...state.activeScheduleMonths, monthId]))
      })),

      removeActiveScheduleMonth: (monthId) => set((state) => ({
        activeScheduleMonths: state.activeScheduleMonths.filter(m => m !== monthId)
      })),

      addSubject: (title, monthId) => set((state) => ({
        subjects: [...state.subjects, {
          id: generateId(),
          title,
          color: `hsl(${Math.random() * 360}, 70%, 50%)`,
          createdAt: Date.now(),
          monthId: monthId,
          subtopics: [],
          schedules: {}
        }]
      })),

      deleteSubject: (id) => set((state) => ({
        subjects: state.subjects.filter(s => s.id !== id),
        sessions: state.sessions.filter(sess => sess.subjectId !== id)
      })),

      toggleSubjectInMonth: (subjectId, monthId) => set((state) => {
        const newSubjects = state.subjects.map(s => {
          if (s.id === subjectId) {
            const schedules = { ...(s.schedules || {}) };
            if (schedules[monthId]) {
              delete schedules[monthId];
            } else {
              schedules[monthId] = { plannedDays: [], monthlyGoal: 0 };
            }
            return { ...s, schedules };
          }
          return s;
        });
        return { subjects: newSubjects };
      }),

      updateSubjectSchedule: (subjectId, monthId, updates) => set((state) => {
        const newSubjects = state.subjects.map(s => {
          if (s.id === subjectId) {
            const schedules = { ...(s.schedules || {}) };
            schedules[monthId] = { ...(schedules[monthId] || {}), ...updates };
            return { ...s, schedules };
          }
          return s;
        });
        return { subjects: newSubjects };
      }),

      toggleSubjectPlannedDay: (subjectId, monthId, dateStr) => set((state) => {
        const newSubjects = state.subjects.map(s => {
          if (s.id === subjectId) {
            const schedules = { ...(s.schedules || {}) };
            const currentSched = schedules[monthId] || { plannedDays: [] };
            const plannedDays = [...(currentSched.plannedDays || [])];
            
            const index = plannedDays.indexOf(dateStr);
            if (index > -1) {
              plannedDays.splice(index, 1);
            } else {
              plannedDays.push(dateStr);
            }
            
            schedules[monthId] = { ...currentSched, plannedDays };
            return { ...s, schedules };
          }
          return s;
        });
        return { subjects: newSubjects };
      }),

      toggleSubtopic: (subjectId, subtopicId) => set((state) => {
        const newSubjects = state.subjects.map(s => {
          if (s.id === subjectId) {
            return {
              ...s,
              subtopics: s.subtopics.map(st => 
                st.id === subtopicId ? { ...st, isCompleted: !st.isCompleted } : st
              )
            };
          }
          return s;
        });
        return { subjects: newSubjects };
      }),

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

      updateSessionStatus: (sessionId, status) => set((state) => ({
        sessions: state.sessions.map(s => s.id === sessionId ? { ...s, status } : s)
      })),

      updateSettings: (updates) => set((state) => ({
        settings: { ...state.settings, ...updates }
      })),

      setGuestMode: (isGuest) => set({ guestMode: isGuest }),

      loadFromCloud: async (uid) => {
        console.log('Stub: loadFromCloud for uid:', uid);
      },

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
        const { sessions } = get();
        return calculateStreaks(sessions);
      }
    }),
    {
      name: 'qisaque-hours-tracker'
    }
  )
);
