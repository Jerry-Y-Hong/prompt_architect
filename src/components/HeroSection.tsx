import React from 'react';
import { Sparkles, ArrowRight, Wand2, Zap, ShieldCheck, Box } from 'lucide-react';
import { useAppStore } from '../core/store';
import { motion } from 'framer-motion';

const SUGGESTIONS = [
    { text: "습관 추적 앱 UI 디자인", id: "ui-design" },
    { text: "고성능 이커머스 마케팅 플랜", id: "ecommerce-strategist" },
    { text: "알고리즘 중심 파이썬 전문가", id: "python-expert" }
];

export const HeroSection: React.FC = () => {
    const { userInput, setUserInput, setPhase, setArchitectureType, inputHistory, addToHistory, clearHistory } = useAppStore();

    const handleStart = () => {
        if (userInput.trim()) {
            addToHistory(userInput);
            setPhase('analyzing');
        }
    };

    const handleChipClick = (suggestion: { text: string, id: string }) => {
        // Append to existing input instead of replacing
        const currentInput = userInput.trim();
        const newInput = currentInput ? `${currentInput}\n\n[추가] ${suggestion.text}` : suggestion.text;
        
        setUserInput(newInput);
        addToHistory(newInput); // Add to history when clicking a suggestion
        setArchitectureType(suggestion.id);
        
        // Optional: We can auto-start here, or wait for the user to click start.
        // Let's keep it auto-starting to maintain fluid UX.
        setPhase('analyzing');
    };

    return (
        <div className="max-w-5xl mx-auto pt-4 pb-2 px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-6"
            >
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-bold tracking-widest uppercase mb-3 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                    <Sparkles className="w-2.5 h-2.5" />
                    프로페셔널 아키텍트 엔진
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-2 tracking-tight leading-tight">
                    <span className="whitespace-nowrap">엔터프라이즈급 <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300">프롬프트 아키텍처</span></span><br />
                    설계 시스템
                </h2>
                <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-blue-500/50"></div>
                    <span className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-blue-200 tracking-wide">AI 프롬프트 엔지니어링</span>
                    <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-blue-500/50"></div>
                </div>
                <p className="text-blue-50/70 text-sm max-w-2xl mx-auto font-medium leading-relaxed break-keep">
                    단순한 텍스트 생성을 넘어, AI의 논리 구조를 설계합니다.
                </p>
            </motion.div>

            <div className="flex flex-wrap items-center justify-center gap-3 mb-4 max-w-2xl mx-auto">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/20 border border-slate-700/30 backdrop-blur-sm group/feature hover:bg-slate-800/40 transition-all">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider">빠른 반복 실행</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/20 border border-slate-700/30 backdrop-blur-sm group/feature hover:bg-slate-800/40 transition-all">
                    <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider">가드레일 보호</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/20 border border-slate-700/30 backdrop-blur-sm group/feature hover:bg-slate-800/40 transition-all">
                    <Box className="w-3.5 h-3.5 text-blue-300" />
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider">모듈형 로직</span>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="relative group mb-4"
            >
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
                <div id="prompt-input-container" className="relative bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-2 flex flex-col md:flex-row gap-3 shadow-2xl shadow-blue-500/10 ring-1 ring-white/10 focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500/50 transition-all">
                    <div className="flex-1 relative">
                        <Wand2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400/70" />
                        <input
                            autoFocus
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="앱 아이디어나 프롬프트 목표를 입력하세요..."
                            className="w-full bg-transparent border-none focus:ring-0 py-5 pl-12 pr-4 text-white font-medium placeholder:text-slate-500"
                            onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                        />
                        {userInput === "" && (
                            <motion.div
                                animate={{ opacity: [1, 0, 1] }}
                                transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                                className="absolute left-12 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-blue-500 rounded-full pointer-events-none"
                            />
                        )}
                    </div>
                    <button
                        id="start-design-btn"
                        onClick={handleStart}
                        className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-500 transition-all flex items-center justify-center gap-2 group/btn active:scale-95 shadow-lg shadow-blue-500/20"
                    >
                        엔지니어링 시작
                        <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                </div>
            </motion.div>

            {inputHistory.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mb-6 bg-slate-800/20 border border-slate-700/30 rounded-2xl p-4 backdrop-blur-sm"
                >
                    <div className="flex items-center justify-between mb-3 px-1">
                        <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Box className="w-3 h-3" />
                            최근 사용한 아이디어
                        </h4>
                        <button
                            onClick={clearHistory}
                            className="text-[10px] text-slate-500 hover:text-rose-400 font-bold transition-colors"
                        >
                            히스토리 초기화
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {inputHistory.map((item, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    setUserInput(item);
                                    setPhase('analyzing');
                                }}
                                className="px-4 py-2 bg-blue-500/5 border border-blue-500/10 hover:border-blue-500/40 hover:bg-blue-500/10 rounded-xl text-sm font-medium text-blue-300/80 hover:text-blue-100 transition-all flex items-center gap-2 group/h"
                            >
                                <Sparkles className="w-3 h-3 opacity-30 group-hover/h:opacity-100 transition-opacity" />
                                <span className="max-w-[200px] truncate">{item}</span>
                            </button>
                        ))}
                    </div>
                </motion.div>
            )}

            <div className="flex flex-col items-center gap-3 mb-2">
                <div className="flex items-center gap-2 text-slate-500 font-bold text-[10px] tracking-widest uppercase">
                    <Wand2 className="w-3 h-3 text-blue-500/50" />
                    추천 예시 프롬프트
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                    {SUGGESTIONS.map((s, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleChipClick(s)}
                            className="px-5 py-2.5 bg-slate-800/40 border border-slate-700 hover:border-blue-500/50 hover:bg-blue-500/5 rounded-full text-xs font-bold text-slate-400 hover:text-blue-300 transition-all active:scale-95 flex items-center gap-2 group/chip"
                        >
                            <Sparkles className="w-3 h-3 opacity-0 group-hover/chip:opacity-100 transition-opacity" />
                            {s.text}
                        </button>
                    ))}
                </div>
            </div>

        </div>
    );
};
