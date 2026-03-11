import React from 'react';
import { Box, Code, Share2, Play, HelpCircle, Menu } from 'lucide-react';
import { useAppStore } from '../core/store';

export const Header: React.FC = () => {
    const setPhase = useAppStore((state) => state.setPhase);
    const setGuideOpen = useAppStore((state) => state.setGuideOpen);
    const setTourActive = useAppStore((state) => state.setTourActive);


    return (
        <header className="h-16 bg-[#0f172a] border-b border-slate-800 flex items-center justify-between px-6 shrink-0 z-30 relative gap-4">
            <div className="flex items-center gap-3 shrink-0">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Box className="w-6 h-6 text-white" />
                </div>
                <div className="hidden sm:block">
                    <h1 className="text-white font-bold text-lg tracking-tight whitespace-nowrap flex items-baseline gap-2">
                        프롬프트 아키텍트
                        <span className="text-[10px] text-slate-400 font-medium tracking-normal bg-slate-800/50 px-1.5 py-0.5 rounded border border-slate-700">BY Jerry Y. Hong</span>
                    </h1>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                        <span className="text-sm text-blue-300/80 font-medium tracking-wide whitespace-nowrap">AI 프롬프트 엔지니어링</span>
                    </div>
                </div>
            </div>

            <div className="mx-auto hidden lg:flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-700/50 shadow-inner shrink-0">
                <button
                    onClick={() => setPhase('landing')}
                    className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-500 active:scale-95 whitespace-nowrap"
                >
                    설계(Architect)
                </button>
                <div className="relative group">
                    <button
                        className="px-5 py-2 rounded-lg text-sm font-semibold text-slate-500 cursor-not-allowed opacity-70 hover:bg-slate-800/50 transition-all whitespace-nowrap"
                        title="배포 파이프라인 기능은 현재 준비 중입니다."
                    >
                        배포
                    </button>
                    <div className="absolute -top-1 -right-2 bg-slate-800 text-[10px] font-bold px-1.5 py-0.5 rounded text-amber-500 border border-slate-700 shadow-lg pointer-events-none">준비중</div>
                </div>
                <div className="relative group">
                    <button
                        className="px-5 py-2 rounded-lg text-sm font-semibold text-slate-500 cursor-not-allowed opacity-70 hover:bg-slate-800/50 transition-all whitespace-nowrap"
                        title="분석 대시보드는 현재 준비 중입니다."
                    >
                        분석
                    </button>
                    <div className="absolute -top-1 -right-2 bg-slate-800 text-[10px] font-bold px-1.5 py-0.5 rounded text-amber-500 border border-slate-700 shadow-lg pointer-events-none">준비중</div>
                </div>
            </div>


            <div className="flex items-center gap-3 shrink-0">
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 rounded-lg border border-slate-800">
                    <Code className="w-4 h-4 text-blue-400" />
                    <span className="text-slate-300 text-xs font-mono">v2.0.4-arc</span>
                </div>
                <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
                    <Share2 className="w-5 h-5" />
                </button>
                <button
                    onClick={() => setTourActive(true)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all text-xs font-bold"
                >
                    <Play className="w-3 h-3 fill-current" />
                    가이드 투어
                </button>
                <button
                    onClick={() => setGuideOpen(true)}
                    className="p-2 text-slate-400 hover:text-white transition-colors"
                    title="사용 가이드 보기"
                >
                    <HelpCircle className="w-5 h-5" />
                </button>
                <button className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg">
                    <Menu className="w-6 h-6" />
                </button>
            </div>
        </header>
    );
};
