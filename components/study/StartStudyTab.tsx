
import React, { useState, useEffect, useRef } from "react";
import { useStudyStore } from "../../hooks/useStudyStore";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Play, Pause, Square, Clock, Plus, Calendar } from "lucide-react";
import { cn, formatDate } from "../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const StartStudyTab = () => {
  const { subjects, addSession } = useStudyStore();
  const [selectedId, setSelectedId] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [isManualOpen, setIsManualOpen] = useState(false);
  
  const [manualH, setManualH] = useState("");
  const [manualM, setManualM] = useState("");
  const [manualDate, setManualDate] = useState(formatDate(new Date()));

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRunning]);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStop = () => {
    if (seconds > 10 && selectedId) {
      addSession(selectedId, seconds);
    }
    setIsRunning(false);
    setSeconds(0);
  };

  const handleManualSave = (e: React.FormEvent) => {
    e.preventDefault();
    const h = parseInt(manualH) || 0;
    const m = parseInt(manualM) || 0;
    const totalSec = (h * 3600) + (m * 60);
    
    if (totalSec > 0 && selectedId) {
      addSession(selectedId, totalSec, manualDate);
      setManualH("");
      setManualM("");
      setIsManualOpen(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-10">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-black text-zinc-900">Hora de Focar</h2>
        <p className="text-zinc-500">Selecione uma matéria para cronometrar seu progresso.</p>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-200/50 space-y-8">
        <div className="space-y-4">
          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Selecione a Matéria</label>
          <select 
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            disabled={isRunning}
            className="w-full h-14 px-6 rounded-2xl border border-zinc-200 bg-zinc-50 font-bold text-zinc-900 focus:ring-2 focus:ring-zinc-900 outline-none appearance-none disabled:opacity-50"
          >
            <option value="">Escolha uma matéria...</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
        </div>

        <div className="flex flex-col items-center py-10">
          <div className="text-7xl font-mono font-black text-zinc-900 tabular-nums mb-10">
            {formatTime(seconds)}
          </div>

          <div className="flex gap-4 w-full">
            {!isRunning ? (
              <Button 
                onClick={() => setIsRunning(true)} 
                disabled={!selectedId}
                className="flex-1 h-20 text-xl font-black rounded-3xl bg-zinc-900 hover:bg-zinc-800 shadow-xl shadow-zinc-200"
              >
                <Play className="w-6 h-6 mr-3 fill-current" /> Começar
              </Button>
            ) : (
              <Button 
                onClick={() => setIsRunning(false)} 
                variant="outline"
                className="flex-1 h-20 text-xl font-black rounded-3xl border-2"
              >
                <Pause className="w-6 h-6 mr-3 fill-current" /> Pausar
              </Button>
            )}
            
            {(seconds > 0 || isRunning) && (
              <Button 
                onClick={handleStop}
                variant="destructive"
                className="w-20 h-20 rounded-3xl"
              >
                <Square className="w-6 h-6" />
              </Button>
            )}
          </div>
        </div>

        <div className="pt-8 border-t border-zinc-50 text-center">
          <button 
            onClick={() => setIsManualOpen(true)}
            className="text-zinc-400 hover:text-zinc-900 font-bold text-sm flex items-center justify-center gap-2 mx-auto transition-colors"
          >
            <Plus className="w-4 h-4" /> Registrar tempo manualmente
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isManualOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95 }} animate={{ scale: 1 }}
              className="bg-white p-8 rounded-[2rem] max-w-sm w-full shadow-2xl space-y-6"
            >
              <h3 className="text-2xl font-black text-zinc-900">Registro Manual</h3>
              <form onSubmit={handleManualSave} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase">Data</label>
                  <Input type="date" value={manualDate} onChange={e => setManualDate(e.target.value)} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase">Horas</label>
                    <Input type="number" placeholder="0" value={manualH} onChange={e => setManualH(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase">Minutos</label>
                    <Input type="number" placeholder="0" max="59" value={manualM} onChange={e => setManualM(e.target.value)} />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="ghost" className="flex-1" onClick={() => setIsManualOpen(false)}>Cancelar</Button>
                  <Button type="submit" className="flex-1 bg-zinc-900">Salvar</Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StartStudyTab;
