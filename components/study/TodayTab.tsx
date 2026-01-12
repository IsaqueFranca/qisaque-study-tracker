
import React from "react";
import { useStudyStore } from "../../hooks/useStudyStore";
import { formatDate } from "../../lib/utils";
import { Clock, TrendingUp, BookOpen, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

const TodayTab = () => {
  const { subjects, sessions, getTotalHoursBySubject } = useStudyStore();
  const todayStr = formatDate(new Date());
  
  const todaySessions = sessions.filter(s => s.date === todayStr);
  const todayTotalSeconds = todaySessions.reduce((acc, s) => acc + s.duration, 0);
  const todayHours = Math.floor(todayTotalSeconds / 3600);
  const todayMinutes = Math.floor((todayTotalSeconds % 3600) / 60);

  const sortedSubjects = [...subjects].sort((a, b) => 
    getTotalHoursBySubject(b.id) - getTotalHoursBySubject(a.id)
  );

  const totalGlobalSeconds = sessions.reduce((acc, s) => acc + s.duration, 0);
  const totalGlobalHours = totalGlobalSeconds / 3600;

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-900 text-white p-8 rounded-[2rem] shadow-xl shadow-zinc-200">
          <div className="flex items-center gap-3 mb-4 opacity-70">
            <Clock className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Estudado Hoje</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black">{todayHours}</span>
            <span className="text-xl font-medium opacity-60">h {todayMinutes}m</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-zinc-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-zinc-400">
            <TrendingUp className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Total Acumulado</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-zinc-900">{totalGlobalHours.toFixed(1)}</span>
            <span className="text-xl font-medium text-zinc-400">horas</span>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-[2rem] border border-zinc-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-zinc-50 flex items-center justify-between">
          <h3 className="font-bold text-xl text-zinc-900">Resumo por Matéria</h3>
          <span className="text-sm text-zinc-400 font-medium">{subjects.length} matérias cadastradas</span>
        </div>

        {subjects.length === 0 ? (
          <div className="p-20 text-center space-y-4">
            <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto">
              <BookOpen className="w-8 h-8 text-zinc-200" />
            </div>
            <p className="text-zinc-400 font-medium">Nenhuma matéria adicionada ainda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/50">
                  <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Matéria</th>
                  <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Tempo Total</th>
                  <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Participação</th>
                </tr>
              </thead>
              <tbody>
                {sortedSubjects.map((subject, idx) => {
                  const hours = getTotalHoursBySubject(subject.id);
                  const h = Math.floor(hours);
                  const m = Math.round((hours - h) * 60);
                  const share = totalGlobalHours > 0 ? (hours / totalGlobalHours) * 100 : 0;

                  return (
                    <motion.tr 
                      key={subject.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50/30 transition-colors"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: subject.color }} />
                          <span className="font-bold text-zinc-800">{subject.title}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="font-mono font-medium text-zinc-600">
                          {h}h {m}m
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-end gap-3">
                          <div className="w-24 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-zinc-900 rounded-full" 
                              style={{ width: `${share}%` }} 
                            />
                          </div>
                          <span className="text-xs font-bold text-zinc-900 w-10 text-right">{Math.round(share)}%</span>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodayTab;
