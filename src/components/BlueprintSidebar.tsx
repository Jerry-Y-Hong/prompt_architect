import React from 'react';
import { CheckCircle2, Circle, Layers, Terminal, Info, ChevronRight } from 'lucide-react';
import { useAppStore } from '../core/store';

export const BlueprintSidebar: React.FC = () => {
    const { phase, architectureType } = useAppStore();

    const steps = [
        { id: 'landing', label: '정의(Definition)', desc: '핵심 목표 식별' },
        { id: 'analyzing', label: '분석(Analysis)', desc: '컨텍스트 추출' },
        { id: 'refining', label: '정제(Refining)', desc: '제약 조건 최적화' },
        { id: 'engineering', label: '설계(Engineering)', desc: '로직 컴포넌트 조립' },
        { id: 'completed', label: '최종 블루프린트', desc: '엔터프라이즈급 프롬프트' }
    ];

    const getStepStatus = (id: string) => {
        const phaseOrder = ['landing', 'analyzing', 'refining', 'engineering', 'completed'];
        const currentIdx = phaseOrder.indexOf(phase);
        const stepIdx = phaseOrder.indexOf(id);

        if (stepIdx < currentIdx) return 'completed';
        if (stepIdx === currentIdx) return 'active';
        return 'pending';
    };

    return (
        <aside className="bg-slate-900/90 border-l border-slate-800 flex flex-col h-full overflow-hidden backdrop-blur-md">
            <div className="p-6 border-b border-slate-800">
                <h3 className="text-white font-bold mb-1 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-400" />
                    아키텍처 패널
                </h3>
                <p className="text-slate-300/70 text-xs font-medium">시스템 구축 모니터링 중</p>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                <div className="mb-8">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">파이프라인 상태</h4>
                    <div className="space-y-6">
                        {steps.map((step) => {
                            const status = getStepStatus(step.id);
                            return (
                                <div key={step.id} className="relative flex gap-4 group">
                                    {step.id !== 'completed' && (
                                        <div className={`absolute left-[11px] top-6 w-[2px] h-10 ${status === 'completed' ? 'bg-blue-500' : 'bg-slate-800'}`} />
                                    )}

                                    <div className="relative z-10 pt-1">
                                        {status === 'completed' ? (
                                            <CheckCircle2 className="w-6 h-6 text-blue-400 bg-slate-900 rounded-full" />
                                        ) : status === 'active' ? (
                                            <div className="w-6 h-6 rounded-full border-4 border-blue-500 bg-slate-900 animate-pulse" />
                                        ) : (
                                            <Circle className="w-6 h-6 text-slate-700 bg-slate-900" />
                                        )}
                                    </div>

                                    <div>
                                        <p className={`text-sm font-bold ${status === 'active' ? 'text-blue-400' : 'text-slate-300'}`}>
                                            {step.label}
                                        </p>
                                        <p className="text-[11px] text-slate-400 font-medium">{step.desc}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-blue-600 rounded-2xl p-5 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-700"></div>
                    <h4 className="text-xs font-black uppercase tracking-widest mb-2 opacity-80">선택된 프레임워크</h4>
                    <p className="text-xl font-bold mb-4">{architectureType}</p>
                    <button
                        onClick={() => alert(`${architectureType} 프레임워크의 상세 문서 및 기술 사양 페이지는 준비 중입니다.`)}
                        className="flex items-center gap-2 text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg transition-all w-full justify-center"
                    >
                        기술 사양 보기
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="p-4 bg-slate-900 text-slate-400 font-mono text-[10px] flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Terminal className="w-3 h-3 text-green-400" />
                    <span>SYS_CLK: OK</span>
                </div>
                <div className="flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    <span>v2.0</span>
                </div>
            </div>
        </aside>
    );
};
