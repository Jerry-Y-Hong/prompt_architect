import React from 'react';
import { useAppStore } from './core/store';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { TemplateGallery } from './components/TemplateGallery';
import { WorkspaceView } from './components/WorkspaceView';
import { BlueprintSidebar } from './components/BlueprintSidebar';
import { motion, AnimatePresence } from 'framer-motion';

const App: React.FC = () => {
  const { phase } = useAppStore();

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-blue-500/30 flex flex-col overflow-hidden relative">
      {/* Background Mesh Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full animate-mesh"></div>
        <div className="absolute bottom-[20%] right-[-5%] w-[40%] h-[40%] bg-indigo-600/5 blur-[100px] rounded-full animate-mesh" style={{ animationDelay: '-5s' }}></div>

        {/* Decorative Background Text */}
        <div className="absolute top-[15%] left-[5%] text-[12rem] font-black text-white/[0.05] select-none leading-none rotate-[-5deg]">ARCHITECT</div>
        <div className="absolute bottom-[10%] right-[5%] text-[10rem] font-black text-white/[0.05] select-none leading-none rotate-[3deg]">ENGINE</div>
      </div>

      <Header />

      <main className="flex-1 flex overflow-hidden relative z-10 p-2 lg:p-4">
        <div className="flex-1 bg-slate-800 rounded-[1.5rem] shadow-2xl flex flex-col overflow-hidden border border-slate-700 ring-1 ring-white/10">
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <AnimatePresence mode="wait">
              {phase === 'landing' ? (
                <motion.div
                  key="landing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <HeroSection />
                  <TemplateGallery />
                </motion.div>
              ) : (
                <WorkspaceView key="workspace" />
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="hidden lg:block w-[380px] ml-6">
          <BlueprintSidebar />
        </div>
      </main>
    </div>
  );
};

export default App;
