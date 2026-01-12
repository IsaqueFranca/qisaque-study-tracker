
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, BookOpen, Play, BarChart3, Settings as SettingsIcon, GraduationCap, Menu
} from "lucide-react";
import { useStudyStore } from "./hooks/useStudyStore";
import TodayTab from "./components/study/TodayTab";
import SubjectList from "./components/study/SubjectList";
import StartStudyTab from "./components/study/StartStudyTab";
import StatisticsTab from "./components/study/StatisticsTab";
import SettingsPage from "./components/study/SettingsPage";
import { Button } from "./components/ui/button";
import { cn } from "./lib/utils";

type Tab = "inicio" | "materias" | "timer" | "analise" | "ajustes";

const App = () => {
  const [tab, setTab] = useState<Tab>("inicio");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { settings, updateSettings } = useStudyStore();

  const navItems = [
    { id: "inicio", label: "Início", icon: Home },
    { id: "materias", label: "Assuntos", icon: BookOpen },
    { id: "timer", label: "Estudar", icon: Play },
    { id: "analise", label: "Relatórios", icon: BarChart3 },
    { id: "ajustes", label: "Ajustes", icon: SettingsIcon },
  ];

  const NavContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-zinc-100 w-64 p-6">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        <h1 className="font-bold text-xl text-zinc-900">QIsaque</h1>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => { setTab(item.id as Tab); setIsMobileMenuOpen(false); }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm",
              tab === item.id 
                ? "bg-zinc-900 text-white shadow-lg shadow-zinc-200" 
                : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
            )}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-zinc-50">
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center">
          Foco & Produtividade
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 flex overflow-hidden">
      {/* Sidebar Desktop */}
      <aside className="hidden md:block">
        <NavContent />
      </aside>

      {/* Sidebar Mobile */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              className="fixed inset-y-0 left-0 z-50 md:hidden"
            >
              <NavContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 border-b border-zinc-100 bg-white flex items-center justify-between px-6 md:px-10 shrink-0">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-6 h-6" />
            </Button>
            <h2 className="font-bold text-zinc-900 capitalize">{tab === 'inicio' ? 'Dashboard' : tab}</h2>
          </div>
          <div className="text-sm font-medium text-zinc-500">
            {settings.userName}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-5xl mx-auto w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {tab === "inicio" && <TodayTab />}
                {tab === "materias" && <SubjectList />}
                {tab === "timer" && <StartStudyTab />}
                {tab === "analise" && <StatisticsTab />}
                {tab === "ajustes" && (
                  <SettingsPage 
                    settings={settings} 
                    onUpdateSettings={updateSettings} 
                    onBack={() => setTab("inicio")} 
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
