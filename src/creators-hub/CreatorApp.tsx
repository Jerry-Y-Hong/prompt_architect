import React, { useState } from 'react';
import { CreatorWorkspace } from './CreatorWorkspace';
import { motion, AnimatePresence } from 'framer-motion';

const CreatorApp: React.FC = () => {
    const [started, setStarted] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-rose-500/30 flex flex-col relative overflow-hidden">
            {/* Light, vibrant background for creators */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-rose-400/20 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-400/20 blur-[100px] rounded-full"></div>
            </div>

            <AnimatePresence mode="wait">
                {!started ? (
                    <motion.div
                        key="landing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex-1 flex flex-col items-center justify-center z-10 px-4"
                    >
                        <div className="text-center space-y-6">
                            <h1 className="text-6xl font-black tracking-tight bg-gradient-to-r from-rose-500 to-amber-500 bg-clip-text text-transparent">
                                Viral Forge
                            </h1>
                            <p className="text-xl text-slate-600 max-w-lg mx-auto leading-relaxed">
                                The ultimate content ideation engine for creators.
                                <br />
                                Hooks, viral strategies, and scripts—built on a powerful meta-logic core.
                            </p>
                            <div className="pt-8">
                                <div
                                    onClick={() => setStarted(true)}
                                    className="inline-flex items-center justify-center px-8 py-4 bg-slate-900 text-white rounded-full font-bold shadow-2xl hover:shadow-[0_0_40px_-10px_rgba(244,63,94,0.5)] hover:-translate-y-1 transition-all cursor-pointer"
                                >
                                    Start Ideating ⚡
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="workspace"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex-1 flex flex-col z-10 h-screen"
                    >
                        {/* Header for Workspace */}
                        <header className="px-8 py-4 bg-white/50 backdrop-blur-md border-b border-slate-200 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🔥</span>
                                <h1 className="font-bold text-xl text-slate-800 tracking-tight">Viral Forge</h1>
                            </div>
                            <button
                                onClick={() => setStarted(false)}
                                className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                            >
                                ← Exit
                            </button>
                        </header>
                        <CreatorWorkspace />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CreatorApp;
