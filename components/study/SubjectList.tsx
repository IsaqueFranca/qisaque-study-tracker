
import React, { useState } from "react";
import { useStudyStore } from "../../hooks/useStudyStore";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Plus, Trash2, Search, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SubjectList = () => {
  const { subjects, addSubject, deleteSubject } = useStudyStore();
  const [newTitle, setNewTitle] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim()) {
      addSubject(newTitle.trim());
      setNewTitle("");
    }
  };

  const filteredSubjects = subjects.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="space-y-2">
        <h2 className="text-3xl font-black text-zinc-900 tracking-tight">Gerenciar Matérias</h2>
        <p className="text-zinc-500">Adicione os assuntos que você pretende estudar.</p>
      </div>

      <form onSubmit={handleAdd} className="flex gap-3">
        <Input 
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Ex: Cardiologia, Direito Civil..."
          className="h-14 px-6 text-lg rounded-2xl shadow-sm"
        />
        <Button type="submit" size="lg" className="h-14 px-8 rounded-2xl shadow-lg shadow-zinc-200">
          <Plus className="w-5 h-5 mr-2" />
          Adicionar
        </Button>
      </form>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <Input 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Pesquisar matéria..."
          className="pl-12 h-12 bg-zinc-100/50 border-none rounded-xl"
        />
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredSubjects.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed border-zinc-100 rounded-[2rem]">
               <p className="text-zinc-400">Nenhuma matéria encontrada.</p>
            </div>
          )}
          {filteredSubjects.map((subject) => (
            <motion.div
              key={subject.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-zinc-400" />
                </div>
                <span className="font-bold text-zinc-800 text-lg">{subject.title}</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => deleteSubject(subject.id)}
                className="text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SubjectList;
