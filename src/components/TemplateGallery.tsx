import React from 'react';
import { ARCHITECTURE_TEMPLATES } from '../config/domain';
import { useAppStore } from '../core/store';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const TemplateGallery: React.FC = () => {
    const { architectureType, setArchitectureType } = useAppStore();

    return (
        <div className="px-6 mb-6 mt-4">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">아키텍처 선택</h3>
                    <p className="text-slate-300/80 text-sm font-medium">프롬프트의 논리적 프레임워크를 선택하세요</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                    어드밴스드 모드 활성화
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {ARCHITECTURE_TEMPLATES.map((tpl) => (
                    <button
                        key={tpl.id}
                        onClick={() => setArchitectureType(tpl.id)}
                        className={cn(
                            "group relative text-left p-4 rounded-xl border transition-all duration-300",
                            tpl.id === 'strategic-architect' && "md:col-span-2 lg:col-span-4", // Span full width on large screens
                            architectureType === tpl.id
                                ? (tpl.id === 'strategic-architect'
                                    ? "bg-slate-900 border-teal-400 shadow-[0_0_30px_rgba(45,212,191,0.2)] -translate-y-1 ring-1 ring-teal-400/50"
                                    : "bg-slate-800/80 border-blue-500 shadow-2xl shadow-blue-500/20 -translate-y-1 ring-1 ring-blue-500/50")
                                : (tpl.id === 'strategic-architect'
                                    ? "bg-slate-900/60 border-teal-900/60 hover:bg-slate-900/80 hover:border-teal-500/50 hover:shadow-[0_0_15px_rgba(45,212,191,0.2)] hover:-translate-y-1"
                                    : "bg-slate-900/40 border-slate-800 hover:bg-slate-800/60 hover:border-slate-700 hover:-translate-y-1")
                        )}
                    >
                        {tpl.id === 'strategic-architect' && (
                            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 via-transparent to-orange-500/5 rounded-2xl pointer-events-none"></div>
                        )}
                        <div className="flex items-center gap-3 mb-2">
                            <div className={cn(
                                "shrink-0 w-8 h-8 rounded-lg shadow-lg border flex items-center justify-center text-base group-hover:scale-110 transition-transform ring-1 ring-white/5",
                                tpl.id === 'strategic-architect' ? "bg-black border-teal-500/30 text-teal-400" : "bg-slate-800 border-slate-700"
                            )}>
                                {tpl.icon}
                            </div>
                            <h4 className={cn(
                                "font-bold truncate transition-colors",
                                tpl.id === 'strategic-architect' ? "text-orange-500 group-hover:text-orange-400" : "text-white group-hover:text-blue-400"
                            )}>{tpl.title}</h4>
                        </div>

                        <p className={cn(
                            "text-xs leading-relaxed mb-3 transition-colors",
                            tpl.id === 'strategic-architect' ? "text-teal-100/70 group-hover:text-teal-50" : "text-slate-300 group-hover:text-white"
                        )}>{tpl.description}</p>
                        <div className="flex flex-wrap gap-1.5 relative z-10">
                            {tpl.tags.map(tag => (
                                <span key={tag} className={cn(
                                    "text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border",
                                    tpl.id === 'strategic-architect'
                                        ? "bg-teal-950/50 text-teal-300 border-teal-800/50"
                                        : "bg-slate-800 text-slate-300 border-slate-700"
                                )}>
                                    {tag}
                                </span>
                            ))}
                        </div>

                        {architectureType === tpl.id && (
                            <div className={cn(
                                "absolute top-4 right-4",
                                tpl.id === 'strategic-architect' ? "text-teal-400" : "text-blue-600"
                            )}>
                                <div className={cn(
                                    "w-6 h-6 rounded-full flex items-center justify-center",
                                    tpl.id === 'strategic-architect' ? "bg-teal-500/20 shadow-[0_0_10px_rgba(45,212,191,0.5)]" : "bg-blue-600"
                                )}>
                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};
