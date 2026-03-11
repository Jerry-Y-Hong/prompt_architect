import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../core/store';
import { ChevronLeft, X, Sparkles, Wand2, Layout, Presentation, CheckCircle2, Zap } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface TourStep {
    targetId: string;
    title: string;
    content: string;
    icon: React.ReactNode;
    placement: 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_STEPS: TourStep[] = [
    {
        targetId: 'welcome',
        title: '프롬프트 아키텍트 투어 시작!',
        content: '여러분의 아이디어를 전문가 수준의 프롬프트로 변환하는 쉽고 빠른 길을 안내해 드릴게요. 버튼 몇 번으로 전문적인 프롬프트를 완성해 보세요!',
        icon: <Sparkles className="w-5 h-5 text-yellow-400" />,
        placement: 'center' as any
    },
    {
        targetId: 'architecture-gallery',
        title: '전문가 모델 선택',
        content: '아이디어의 성격에 맞는 아키텍처 전문가를 골라보세요. 각 모델마다 특화된 설계 능력을 가지고 있습니다.',
        icon: <Layout className="w-5 h-5 text-blue-400" />,
        placement: 'bottom'
    },
    {
        targetId: 'prompt-input-container',
        title: '아이디어 입력창',
        content: '무엇을 만들고 싶으신가요? 생각 중인 목표나 대략적인 설명을 여기에 입력해 주세요. (가시화된 커서를 확인해 보세요!)',
        icon: <Wand2 className="w-5 h-5 text-purple-400" />,
        placement: 'top'
    },
    {
        targetId: 'start-design-btn',
        title: 'AI 설계 시작',
        content: '입력을 마치셨다면 이 버튼을 눌러보세요. AI가 논리적이고 체계적인 프롬프트 블루프린트를 설계합니다.',
        icon: <Zap className="w-5 h-5 text-amber-400" />,
        placement: 'bottom'
    },
    {
        targetId: 'slide-preview-area',
        title: '프레젠테이션 미리보기',
        content: '설계된 내용이 실제 발표 자료나 문서로 어떻게 보일지 실시간으로 확인할 수 있는 공간입니다.',
        icon: <Presentation className="w-5 h-5 text-indigo-400" />,
        placement: 'top'
    },
    {
        targetId: 'ppt-export-btn',
        title: '문서로 저장하기',
        content: '완성된 결과물이 만족스러우신가요? 클릭 한 번으로 고품격 PPT 문서를 내려받을 수 있습니다.',
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
        placement: 'bottom'
    }
];

export const GuidedTour: React.FC = () => {
    const { isTourActive, currentTourStep, setTourActive, setTourStep, phase } = useAppStore();
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

    const currentStep = TOUR_STEPS[currentTourStep];

    useEffect(() => {
        if (!isTourActive) return;

        const updateRect = () => {
            const el = document.getElementById(currentStep.targetId);
            if (el) {
                const rect = el.getBoundingClientRect();
                setTargetRect(rect);

                // Only scroll if the element is not fully in view
                const isInView = (
                    rect.top >= 0 &&
                    rect.left >= 0 &&
                    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
                );

                if (!isInView) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            } else {
                setTargetRect(null);
            }
        };

        const timer = setTimeout(updateRect, 300);

        window.addEventListener('resize', updateRect);
        window.addEventListener('scroll', updateRect);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updateRect);
            window.removeEventListener('scroll', updateRect);
        };
    }, [isTourActive, currentTourStep, currentStep?.targetId, phase]);

    if (!isTourActive || !currentStep) return null;

    const handleNext = () => {
        if (currentTourStep < TOUR_STEPS.length - 1) {
            setTourStep(currentTourStep + 1);
        } else {
            setTourActive(false);
            setTourStep(0);
        }
    };

    const handlePrev = () => {
        if (currentTourStep > 0) {
            setTourStep(currentTourStep - 1);
        }
    };

    const handleClose = () => {
        setTourActive(false);
        setTourStep(0);
    };

    const getPopoverStyles = () => {
        if (currentStep.placement === 'center' as any || !targetRect) {
            return {
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                position: 'fixed' as any
            };
        }

        const { top, left, width, height, bottom } = targetRect;
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        const gap = 16;
        const popoverHeight = 250;
        const popoverWidth = 320;

        let finalTop = top + height / 2;
        let finalLeft = left + width / 2;
        let transform = 'translate(-50%, -50%)';

        // Custom positioning based on placement and viewport safety
        if (currentStep.placement === 'bottom') {
            if (bottom + gap + popoverHeight > viewportHeight) {
                // Flip to top if bottom is cut off
                finalTop = top - gap;
                transform = 'translate(-50%, -100%)';
            } else {
                finalTop = bottom + gap;
                transform = 'translateX(-50%)';
            }
        } else if (currentStep.placement === 'top') {
            if (top - gap - popoverHeight < 0) {
                // Flip to bottom if top is cut off
                finalTop = bottom + gap;
                transform = 'translateX(-50%)';
            } else {
                finalTop = top - gap;
                transform = 'translate(-50%, -100%)';
            }
        }

        // Horizontal boundary check
        const estimatedLeft = finalLeft - (transform.includes('-50%') ? popoverWidth / 2 : 0);
        if (estimatedLeft < 10) finalLeft = popoverWidth / 2 + 10;
        if (estimatedLeft + popoverWidth > viewportWidth - 10) finalLeft = viewportWidth - popoverWidth / 2 - 10;

        return { top: finalTop, left: finalLeft, transform };
    };

    return (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
            <svg className="absolute inset-0 w-full h-full pointer-events-auto">
                <defs>
                    <mask id="tour-mask">
                        <rect width="100%" height="100%" fill="white" />
                        {targetRect && (
                            <rect
                                x={targetRect.left - 8}
                                y={targetRect.top - 8}
                                width={targetRect.width + 16}
                                height={targetRect.height + 16}
                                rx="16"
                                fill="black"
                            />
                        )}
                    </mask>
                </defs>
                <rect
                    width="100%"
                    height="100%"
                    fill="black"
                    fillOpacity="0.7"
                    mask="url(#tour-mask)"
                    onClick={handleClose}
                />
            </svg>

            {targetRect && currentStep.placement !== 'center' as any && (
                <motion.div
                    initial={false}
                    animate={{
                        top: targetRect.top - 12,
                        left: targetRect.left - 12,
                        width: targetRect.width + 24,
                        height: targetRect.height + 24,
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="absolute border-4 border-blue-500/50 rounded-[24px] pointer-events-none z-[10000] shadow-[0_0_50px_rgba(59,130,246,0.3)]"
                >
                    <div className="absolute -inset-2 bg-blue-500/10 blur-xl rounded-[24px] animate-pulse" />
                </motion.div>
            )}

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                style={getPopoverStyles()}
                className="absolute w-[340px] bg-slate-900/90 border border-slate-700/50 rounded-3xl shadow-2xl p-6 pointer-events-auto z-[10001] backdrop-blur-2xl"
            >
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700/50 flex items-center justify-center">
                        {currentStep.icon}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest px-2 py-0.5 bg-blue-500/10 rounded-full border border-blue-500/20">
                                Guided Tour
                            </span>
                        </div>
                        <h3 className="text-sm font-bold text-white">{currentStep.title}</h3>
                    </div>
                    <button onClick={handleClose} className="ml-auto p-2 text-slate-400 hover:text-white rounded-xl">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <p className="text-[13px] text-slate-300 leading-relaxed mb-8">
                    {currentStep.content}
                </p>

                <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                        {TOUR_STEPS.map((_, i) => (
                            <div key={i} className={cn("h-1 rounded-full", i === currentTourStep ? "bg-blue-500 w-6" : "bg-slate-800 w-2")} />
                        ))}
                    </div>
                    <div className="flex gap-3">
                        {currentTourStep > 0 && (
                            <button onClick={handlePrev} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                                <ChevronLeft className="w-4 h-4" /> 이전
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-xl shadow-blue-500/20"
                        >
                            {currentTourStep === TOUR_STEPS.length - 1 ? '시작하기' : '다음'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
