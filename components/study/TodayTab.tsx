
import React from "react";
import { useStudyStore } from "../../hooks/useStudyStore";
import { formatDate } from "../../lib/utils";
import { Clock, TrendingUp, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

const TodayTab = () => {
  const { subjects, sessions, getTotalHoursBySubject } = useStudyStore();
  const todayStr = formatDate(new Date());
  
  const todaySessions = sessions.filter(s => s.date === todayStr);
  const todayTotalSeconds = todaySessions.reduce((acc, s) => acc + s.duration, 0);
  const todayHours = Math.floor(todayTotalSeconds / 3600);
  const todayMinutes = Math.floor((todayTotalSeconds % 3600) / 60);

  const totalGlobalSeconds = sessions.reduce((acc, s) => acc + s.duration, 0);
  const totalGlobalHours = totalGlobalSeconds / 3600;

  // Ordenar matérias por tempo estudado (maior primeiro)
  const sortedSubjects = [...subjects].sort((a, b) => 
    getTotalHoursBySubject(b.id) - getTotalHoursBySubject(a.id)
  );

  return (
    <div className="space-y-8">
      {/* Resumo Rápido */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-zinc-900 text-white p-8 rounded-[2rem] shadow-xl shadow-zinc-200"
        >
          <div className="flex items-center gap-3 mb-4 opacity-70">
            <Clock className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Estudado Hoje</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black">{todayHours}</span>
            <span className="text-xl font-medium opacity-60">h {todayMinutes}m</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-8 rounded-[2rem] border border-zinc-100 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4 text-zinc-400">
            <TrendingUp className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Total Geral Acumulado</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-zinc-900">{totalGlobalHours.toFixed(1)}</span>
            <span className="text-xl font-medium text-zinc-400">horas</span>
          </div>
        </motion.div>
      </div>

      {/* Tabela de Matérias e Horas */}
      <div className="bg-white rounded-[2rem] border border-zinc-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-zinc-50 flex items-center justify-between">
          <h3 className="font-bold text-xl text-zinc-900 tracking-tight">Tempo Estudado por Matéria</h3>
          <span className="text-sm text-zinc-400 font-medium">{subjects.length} matérias adicionadas</span>
        </div>

        {subjects.length === 0 ? (
          <div className="p-20 text-center space-y-4">
            <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mx-auto">
              <BookOpen className="w-10 h-10 text-zinc-200" />
            </div>
            <p className="text-zinc-400 font-medium">Nenhuma matéria adicionada.<br/>Vá para a aba "Assuntos" para começar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/50">
                  <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Matéria</th>
                  <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Tempo Total</th>
                  <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Participação</th>
                </tr>
              </thead>
              <tbody>
                {sortedSubjects.map((subject, idx) => {
                  const hoursDecimal = getTotalHoursBySubject(subject.id);
                  const h = Math.floor(hoursDecimal);
                  const m = Math.round((hoursDecimal - h) * 60);
                  const share = totalGlobalHours > 0 ? (hoursDecimal / totalGlobalHours) * 100 : 0;

                  return (
                    <motion.tr 
                      key={subject.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50/30 transition-colors"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: subject.color }} />
                          <span className="font-bold text-zinc-800 text-lg">{subject.title}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="font-mono font-bold text-zinc-900 text-xl">
                            {h}h {m}m
                          </span>
                          <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-tighter">Acumulado</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-end gap-4">
                          <div className="w-32 h-2 bg-zinc-100 rounded-full overflow-hidden hidden sm:block">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${share}%` }}
                              className="h-full bg-zinc-900 rounded-full" 
                            />
                          </div>
                          <span className="text-sm font-black text-zinc-900 w-12 text-right">{Math.round(share)}%</span>
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
