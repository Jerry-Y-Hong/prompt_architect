import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    ChevronRight,
    ChevronLeft,
    Sparkles,
    Layers,
    Layout,
    Presentation,
    CheckCircle2,
    Play
} from 'lucide-react';
import { useAppStore } from '../core/store';

const slides = [
    {
        title: "환영합니다!",
        description: "프롬프트 아키텍트는 여러분의 아이디어를 멋진 결과물로 만들어드리는 공간입니다. 복잡한 생각도 이곳에서는 쉽고 완벽하게 정리됩니다.",
        icon: <Sparkles className="w-12 h-12 text-blue-400" />,
        color: "from-blue-600/20 to-indigo-600/20"
    },
    {
        title: "각 분야의 전문가 선택",
        description: "비즈니스, 코딩, 디자인 등 각 분야의 똑똑한 AI 전문가들이 준비되어 있습니다. 여러분의 아이디어에 꼭 맞는 전문가를 선택해 보세요.",
        icon: <Layers className="w-12 h-12 text-indigo-400" />,
        color: "from-indigo-600/20 to-purple-600/20"
    },
    {
        title: "생각을 한눈에 보는 설계도",
        description: "여러분의 아이디어가 어떻게 멋진 글로 바뀌는지 그 과정(설계도)을 직접 확인할 수 있습니다. AI가 왜 이렇게 생각했는지 한눈에 보여드려요.",
        icon: <Layout className="w-12 h-12 text-emerald-400" />,
        color: "from-emerald-600/20 to-teal-600/20"
    },
    {
        title: "멋진 발표 자료로 완성",
        description: "만들어진 결과물은 즉시 예쁜 배경 이미지가 담긴 PPT 파일로 변환됩니다. 제안서나 발표 자료가 필요할 때 바로 다운로드해서 사용하세요.",
        icon: <Presentation className="w-12 h-12 text-amber-400" />,
        color: "from-amber-600/20 to-orange-600/20"
    }
];

export const QuickGuideModal: React.FC = () => {
    const { isGuideOpen, setGuideOpen, setTourActive } = useAppStore();
    const [currentSlide, setCurrentSlide] = useState(0);

    if (!isGuideOpen) return null;

    const nextSlide = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(curr => curr + 1);
        } else {
            setGuideOpen(false);
            setCurrentSlide(0);
        }
    };

    const prevSlide = () => {
        if (currentSlide > 0) {
            setCurrentSlide(curr => curr - 1);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
                >
                    {/* Close Button */}
                    <button
                        onClick={() => setGuideOpen(false)}
                        className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-all z-10"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className="p-6 bg-slate-800/50 border-t border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-slate-400">
                            <Play className="w-4 h-4" />
                            <span className="text-xs">설명이 어렵다면 직접 따라해보세요!</span>
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <motion.button
                                animate={{ 
                                    scale: [1, 1.02, 1],
                                    boxShadow: [
                                        "0 10px 15px -3px rgba(59, 130, 246, 0.2)",
                                        "0 10px 25px -3px rgba(59, 130, 246, 0.4)",
                                        "0 10px 15px -3px rgba(59, 130, 246, 0.2)"
                                    ]
                                }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                onClick={() => {
                                    setGuideOpen(false);
                                    setTimeout(() => setTourActive(true), 300);
                                }}
                                className="flex-1 sm:flex-none px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                            >
                                <Play className="w-3 h-3 fill-current" />
                                가이드 투어 시작
                            </motion.button>
                            <button
                                onClick={() => setGuideOpen(false)}
                                className="flex-1 sm:flex-none px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition-all"
                            >
                                닫기
                            </button>
                        </div>
                    </div>

                    {/* Slide Content */}
                    <div className={`p-8 md:p-12 bg-gradient-to-br transition-all duration-500 ${slides[currentSlide].color}`}>
                        <div className="flex flex-col items-center text-center space-y-6">
                            <motion.div
                                key={`icon-${currentSlide}`}
                                initial={{ scale: 0.5, opacity: 0, rotate: -15 }}
                                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                className="p-6 bg-slate-800/50 rounded-2xl border border-white/10 shadow-xl"
                            >
                                {slides[currentSlide].icon}
                            </motion.div>

                            <div className="space-y-4 max-w-md">
                                <motion.h2
                                    key={`title-${currentSlide}`}
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent"
                                >
                                    {slides[currentSlide].title}
                                </motion.h2>
                                <motion.p
                                    key={`desc-${currentSlide}`}
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-slate-300 leading-relaxed break-keep"
                                >
                                    {slides[currentSlide].description}
                                </motion.p>
                            </div>
                        </div>
                    </div>

                    {/* Footer Controls */}
                    <div className="px-8 py-6 bg-slate-900 flex items-center justify-between border-t border-slate-800">
                        {/* Progress Dots */}
                        <div className="flex gap-2">
                            {slides.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-8 bg-blue-500' : 'w-2 bg-slate-700'
                                        }`}
                                />
                            ))}
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex items-center gap-3">
                            {currentSlide > 0 && (
                                <button
                                    onClick={prevSlide}
                                    className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-1"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    이전
                                </button>
                            )}

                            <button
                                onClick={nextSlide}
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 active:scale-95"
                            >
                                {currentSlide === slides.length - 1 ? (
                                    <>
                                        <CheckCircle2 className="w-4 h-4" />
                                        시작하기
                                    </>
                                ) : (
                                    <>
                                        다음
                                        <ChevronRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
