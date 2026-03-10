import React from 'react';
import { Box, Code, Settings, Share2, Menu } from 'lucide-react';
import { useAppStore } from '../core/store';

export const Header: React.FC = () => {
    const { setPhase } = useAppStore();

    return (
        <header className="h-16 bg-[#0f172a] border-b border-slate-800 flex items-center px-6 shrink-0 z-30 relative">
            <div className="flex items-center gap-3 absolute left-6">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Box className="w-6 h-6 text-white" />
                </div>
                <div className="hidden sm:block">
                    <h1 className="text-white font-bold text-lg tracking-tight">프롬프트 아키텍트</h1>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                        <span className="text-sm text-blue-300/80 font-medium tracking-wide">프롬프트 자동 생성기</span>
                    </div>
                </div>
            </div>

            <div className="mx-auto hidden md:flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-700/50 shadow-inner">
                <button
                    onClick={() => setPhase('landing')}
                    className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-500 active:scale-95"
                >
                    설계(Architect)
                </button>
                <div className="relative group">
                    <button
                        className="px-5 py-2 rounded-lg text-sm font-semibold text-slate-500 cursor-not-allowed opacity-70 hover:bg-slate-800/50 transition-all"
                        title="배포 파이프라인 기능은 현재 준비 중입니다."
                    >
                        배포
                    </button>
                    <div className="absolute -top-1 -right-2 bg-slate-800 text-[10px] font-bold px-1.5 py-0.5 rounded text-amber-500 border border-slate-700 shadow-lg pointer-events-none">준비중</div>
                </div>
                <div className="relative group">
                    <button
                        className="px-5 py-2 rounded-lg text-sm font-semibold text-slate-500 cursor-not-allowed opacity-70 hover:bg-slate-800/50 transition-all"
                        title="분석 대시보드는 현재 준비 중입니다."
                    >
                        분석
                    </button>
                    <div className="absolute -top-1 -right-2 bg-slate-800 text-[10px] font-bold px-1.5 py-0.5 rounded text-amber-500 border border-slate-700 shadow-lg pointer-events-none">준비중</div>
                </div>
            </div>


            <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 rounded-lg border border-slate-800">
                    <Code className="w-4 h-4 text-blue-400" />
                    <span className="text-slate-300 text-xs font-mono">v2.0.4-arc</span>
                </div>
                <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
                    <Share2 className="w-5 h-5" />
                </button>
                <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
                    <Settings className="w-5 h-5" />
                </button>
                <button className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg">
                    <Menu className="w-6 h-6" />
                </button>
            </div>
        </header>
    );
};
