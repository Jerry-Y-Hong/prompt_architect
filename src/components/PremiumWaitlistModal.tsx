import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Mail, CheckCircle2, Loader2, ShieldCheck, ArrowRight } from 'lucide-react';

interface PremiumWaitlistModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PremiumWaitlistModal: React.FC<PremiumWaitlistModalProps> = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus('submitting');

        try {
            const FORMSPREE_ENDPOINT = import.meta.env.VITE_FORMSPREE_ENDPOINT;

            if (FORMSPREE_ENDPOINT) {
                // Actual Formspree submission
                const response = await fetch(FORMSPREE_ENDPOINT, {
                    method: 'POST',
                    body: JSON.stringify({ email, feature: 'execution-prompt-package' }),
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Formspree submission failed');
                }
            } else {
                // Simulated submission if endpoint is not configured yet
                console.warn("⚠️ VITE_FORMSPREE_ENDPOINT 환경 변수가 설정되지 않았습니다. 성공 상태를 시뮬레이션합니다.");
                await new Promise(resolve => setTimeout(resolve, 1500));
            }
            
            setStatus('success');
            setTimeout(() => {
                onClose();
                setTimeout(() => {
                    setStatus('idle');
                    setEmail('');
                }, 300);
            }, 3000);
        } catch (error) {
            console.error("Formspree error:", error);
            setStatus('error');
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={status === 'success' ? undefined : onClose}
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="bg-slate-900 border border-slate-700/50 shadow-2xl rounded-2xl w-full max-w-lg overflow-hidden relative z-10"
                    >
                        {/* Decorative Top Glow */}
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500" />
                        
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-amber-500/10 to-transparent pointer-events-none" />

                        <div className="p-8 relative z-10">
                            <button 
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {status === 'success' ? (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="py-12 flex flex-col items-center text-center"
                                >
                                    <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-6">
                                        <CheckCircle2 className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-2xl font-black text-white mb-2">사전 예약 완료!</h3>
                                    <p className="text-slate-400">
                                        출시 소식과 첫 달 무료 혜택을<br />가장 먼저 이메일로 안내해 드리겠습니다.
                                    </p>
                                </motion.div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center border border-amber-500/30">
                                            <ShieldCheck className="w-6 h-6 text-amber-500" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-white">프리미엄 패키지 언락</h2>
                                            <p className="text-sm text-slate-400">맞춤형 실행 프롬프트 패키지 (출시 예정)</p>
                                        </div>
                                    </div>

                                    <p className="text-slate-300 leading-relaxed mb-6">
                                        이 기능이 출시되면 슬라이드의 세부 아이디어(카피, 이미지 생성 프롬프트 등)를 
                                        <strong className="text-amber-400 font-bold"> Midjourney나 ChatGPT에 바로 붙여넣을 수 있는 완벽한 지시서 세트</strong>가 제공됩니다.
                                    </p>

                                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 mb-8">
                                        <h4 className="flex items-center gap-2 text-sm font-bold text-slate-200 mb-3">
                                            <Sparkles className="w-4 h-4 text-amber-500" />
                                            사전 예약 특별 혜택
                                        </h4>
                                        <ul className="text-sm text-slate-400 space-y-2 list-disc list-inside">
                                            <li><span className="text-slate-300">정식 출시 시 가장 먼저 이메일 알림 제공</span></li>
                                            <li><span className="text-slate-300">프리미엄 기능 첫 달(1개월) 무료 구독권 증정</span></li>
                                        </ul>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label htmlFor="email" className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                                                이메일 주소
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Mail className="w-5 h-5 text-slate-500" />
                                                </div>
                                                <input
                                                    type="email"
                                                    id="email"
                                                    required
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-3 bg-slate-950/50 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-white rounded-xl placeholder:text-slate-600 transition-all outline-none"
                                                    placeholder="name@company.com"
                                                    disabled={status === 'submitting'}
                                                />
                                            </div>
                                            {status === 'error' && (
                                                <p className="mt-2 text-xs text-rose-500">
                                                    일시적인 오류가 발생했습니다. 다시 시도해주세요.
                                                </p>
                                            )}
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={status === 'submitting' || !email}
                                            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-900 font-black rounded-xl transition-all"
                                        >
                                            {status === 'submitting' ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    요청 전송 중...
                                                </>
                                            ) : (
                                                <>
                                                    사전 예약하고 혜택 받기
                                                    <ArrowRight className="w-4 h-4" />
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
