import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { contentTemplates, contentTargetAudiences, contentEmotionalHooks, contentNiches, type ContentTemplate } from '../config/content-domain';
import { generateContentWithGemini } from '../core/ai-client';

type Step = 0 | 1 | 2 | 3 | 4;

export const CreatorWorkspace: React.FC = () => {
    const [currentStep, setCurrentStep] = useState<Step>(0);
    const [selectedTemplate, setSelectedTemplate] = useState<ContentTemplate | null>(null);
    const [selectedNiche, setSelectedNiche] = useState<string>('');
    const [selectedAudiences, setSelectedAudiences] = useState<string[]>([]);
    const [selectedHooks, setSelectedHooks] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [finalReport, setFinalReport] = useState<string | null>(null);

    const [isTrendSurfer, setIsTrendSurfer] = useState(false);

    // Parsed report states
    const [parsedPersona, setParsedPersona] = useState<any>(null);
    const [parsedScript, setParsedScript] = useState<string>('');
    const [parsedKoreanScript, setParsedKoreanScript] = useState<string>('');
    const [parsedHookInfo, setParsedHookInfo] = useState<string>('');
    const [parsedSpokenAudio, setParsedSpokenAudio] = useState<string>('');

    // Monetization States
    const [userCredits, setUserCredits] = useState(150);
    const [isAudioGenerating, setIsAudioGenerating] = useState(false);
    const [audioProgress, setAudioProgress] = useState(0);
    const [audioGenerated, setAudioGenerated] = useState(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');

    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            setVoices(availableVoices);

            if (availableVoices.length > 0 && !selectedVoiceURI) {
                const defaultVoice = availableVoices.find(v => (v.lang.includes('ko') || v.lang.includes('ko-KR')) && v.name.includes('Natural')) ||
                    availableVoices.find(v => v.lang.includes('ko')) ||
                    availableVoices.find(v => v.name.includes('Natural')) ||
                    availableVoices[0];
                if (defaultVoice) setSelectedVoiceURI(defaultVoice.voiceURI);
            }
        };

        loadVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
    }, [selectedVoiceURI]);

    const CreditBadge = () => (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-full border border-amber-200 shadow-sm shrink-0">
            <span className="text-amber-500 text-sm">🪙</span>
            <span className="text-xs font-bold text-slate-700">{userCredits} Credits</span>
            <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center cursor-help group relative">
                <span className="text-[10px] text-white">?</span>
                <div className="absolute bottom-full mb-2 right-0 w-48 p-2 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                    Credits are used for premium AI voice and video features. (크레딧은 프리미엄 기능을 위해 사용됩니다)
                </div>
            </div>
        </div>
    );


    // Pre-fill test cases or allow empty starts
    const handleTemplateSelect = (template: ContentTemplate) => {
        setSelectedTemplate(template);
        setIsTrendSurfer(template.id === 'trend-surfer');
        // Reset process
        setCurrentStep(1);
        setSelectedAudiences([]);
        setSelectedHooks([]);
        setSelectedNiche('');
        setFinalReport(null);
        setParsedPersona(null);
        setParsedScript('');
        setParsedKoreanScript('');
        setParsedHookInfo('');
        setParsedSpokenAudio('');
    };

    const handleNicheSelect = (niche: string) => {
        setSelectedNiche(niche);
        setCurrentStep(2);
    };

    const handleAudienceSelect = (audience: string) => {
        setSelectedAudiences(prev =>
            prev.includes(audience)
                ? prev.filter(a => a !== audience)
                : [...prev, audience]
        );
    };

    const handleHookSelect = (hook: string) => {
        setSelectedHooks(prev =>
            prev.includes(hook)
                ? prev.filter(h => h !== hook)
                : [...prev, hook]
        );
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        setFinalReport(null);
        setParsedPersona(null);
        setParsedScript('');
        setParsedKoreanScript('');
        setParsedHookInfo('');

        // Fake progress logic for UI sugar
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 5;
            setGenerationProgress(progress);
            if (progress > 90) clearInterval(progressInterval);
        }, 100);

        try {
            await generateReport();
        } catch (error) {
            console.error('Error in handleGenerate:', error);
            setFinalReport(`Error: Failed to generate report. Please check API Key and connection.\n${error}`);
        } finally {
            clearInterval(progressInterval);
            setGenerationProgress(100);
            setIsGenerating(false);
            setAudioGenerated(false); // Reset audio state for new report
            setAudioProgress(0);
        }
    };

    const handleAudioSynthesis = () => {
        if (userCredits < 10) {
            alert("Insufficient Credits! Please top up. (크레딧이 부족합니다)");
            return;
        }

        setUserCredits(prev => prev - 10);
        setIsAudioGenerating(true);
        setAudioProgress(0);

        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            setAudioProgress(progress);
            if (progress >= 100) {
                clearInterval(interval);
                setIsAudioGenerating(false);
                setAudioGenerated(true);
            }
        }, 300);
    };

    const playAudioPreview = (type: 'script' | 'insight' = 'script') => {
        let textRaw = "";

        if (type === 'insight') {
            textRaw = parsedHookInfo;
        } else {
            textRaw = parsedSpokenAudio || parsedKoreanScript || parsedScript || finalReport || "";
        }

        if (!textRaw || textRaw.includes("Parsing Failed")) {
            console.warn("No valid script found for audio preview.");
            return;
        }

        window.speechSynthesis.cancel();

        // --- SCRUB METADATA & TITLES ---
        let textToSpeak = textRaw
            .replace(/<[\s\S]*?>/g, '') // Strip XML tags
            .replace(/^(?:\[?제목\]?:?|Title:|제목).*$/gmi, '')  // Very aggressively remove Title lines
            .replace(/^(?:서론|본론|결론|Intro|Outro|Body).*$/gmi, '') // Remove Section headers
            .replace(/\[[\s\S]*?\]/g, '') // Remove [Music], [Intro] etc
            .replace(/\([\s\S]*?\)/g, '') // Remove (BGM), (Narration) etc
            .replace(/#+\s?.*$/gm, '')    // Remove Markdown headers
            .replace(/\*\*/g, '')         // Remove bold
            .replace(/\n\s*\n/g, '\n')
            .replace(/\s+/g, ' ')
            .trim();

        if (!textToSpeak) return;

        // Basic emotion simulation for Browser TTS
        // The Web Speech API is very flat by default in Korean. 
        // We simulate emotion by breaking the text by punctuation and slight pitch/rate tweaks.
        const sentences = textToSpeak.match(/[^.!?]+[.!?]+/g) || [textToSpeak];

        const playSentence = (index: number) => {
            if (index >= sentences.length) return;

            const sentence = sentences[index].trim();
            if (!sentence) {
                playSentence(index + 1);
                return;
            }

            const utterance = new SpeechSynthesisUtterance(sentence);
            const voicesList = window.speechSynthesis.getVoices();

            let targetVoice = null;

            if (type === 'insight') {
                // Force a female announcer-style voice
                targetVoice = voicesList.find(v => v.lang.includes('ko') && (v.name.includes('여') || v.name.includes('Female') || v.name.includes('SunHi') || v.name.includes('Sora')))
                    || voicesList.find(v => v.lang.includes('ko'));
            } else {
                // Standard selection for script
                targetVoice = voicesList.find(v => v.voiceURI === selectedVoiceURI)
                    || voicesList.find(v => v.lang.includes('ko'));
            }

            if (targetVoice) {
                utterance.voice = targetVoice;
            }

            // Default
            utterance.rate = type === 'insight' ? 1.05 : 1.0;
            utterance.pitch = type === 'insight' ? 1.15 : 1.0;

            // Emotional Heuristics
            if (sentence.includes('!')) {
                // Excited/Emphatic
                utterance.pitch = 1.2;
                utterance.rate = 1.1;
            } else if (sentence.includes('?')) {
                // Questioning
                utterance.pitch = 1.1;
                utterance.rate = 0.95;
            } else if (sentence.length > 50) {
                // Fast for long trailing sentences
                utterance.rate = 1.05;
            }

            utterance.onend = () => {
                playSentence(index + 1);
            };

            window.speechSynthesis.speak(utterance);
        };

        playSentence(0);
    };

    const generateReport = async () => {
        if (!selectedTemplate) return;

        let systemInstruction = "You are a world-class Viral Content Strategist. Your targeted audience is Korean, so ALL content MUST be generated in natural, fluent Korean language (한국어로 작성해주세요). Output ONLY valid XML mapping the content blueprint. Do NOT include markdown blocks like ```xml. Your output must start with <system_persona> and end with </spoken_audio_korean>. CRITICAL: In the script section, do NOT write words like 'Title:', '제목:', '서론:', '본론:', '결론:', '옵션 A'. Just output the pure spoken text.";

        let userPrompt = '';
        if (isTrendSurfer) {
            userPrompt = `
Generate a viral content blueprint using the following parameters:
- Format: ${selectedTemplate.title}
- Niche/Domain: ${selectedNiche}
- Target Audience: ${selectedAudiences.join(', ')}
- Psychological Hook: ${selectedHooks.join(', ')}
- Specialized Logic: ${selectedTemplate.specializedLogic}

Strictly follow this XML structure and provide highly specific, actionable, and creative content:
<system_persona>
  <role>Real-time Viral Trend Analyst</role>
  <format>Trend Surfer Analysis</format>
  <niche>${selectedNiche}</niche>
  <target>${selectedAudiences.join(', ')}</target>
  <trigger>${selectedHooks.join(', ')}</trigger>
</system_persona>

<logical_framework>
  <step1_trend_scan>
    [해당 틈새시장(${selectedNiche})에서 현재 폭발적으로 뜨고 있는 구체적이고 현실적인 최근 트렌드 1가지를 한국어로 서술]
  </step1_trend_scan>
  <step2_hook_mapping>
    [타겟(${selectedAudiences.join(', ')})을 위해 "${selectedHooks.join(', ')}" 후킹 요소를 사용하여 트렌드를 어떻게 매핑할지 한국어로 설명]
  </step2_hook_mapping>
  <step3_full_narrative_script>
    [요약하지 않은 완성된 전체 스크립트를 한국어로 제공. 절대 '제목:', '서론:', '본론:' 등의 메타데이터 헤더를 포함하지 말 것.]
  </step3_full_narrative_script>
</logical_framework>

<spoken_audio_korean>
[매우 중요: 스크립트에서 실제로 입으로 소리 내어 읽을 한국어 대사만 정확히 제공할 것. 화면 지시문, '제목:', '서론:' 등의 메타데이터를 절대 포함하지 말고 오직 TTS 오디오 엔진으로 보낼 텍스트만 작성.]
</spoken_audio_korean>
`;
        } else {
            userPrompt = `
Generate a viral content blueprint using the following parameters:
- Format: ${selectedTemplate.title}
- Target Audience: ${selectedAudiences.join(', ')}
- Psychological Hook: ${selectedHooks.join(', ')}
- Specialized Logic: ${selectedTemplate.specializedLogic}

Strictly follow this XML structure and provide highly specific, actionable, and creative content:
<system_persona>
  <role>Senior Viral Architect</role>
  <format>${selectedTemplate.title}</format>
  <target>${selectedAudiences.join(', ')}</target>
  <trigger>${selectedHooks.join(', ')}</trigger>
</system_persona>

<logical_framework>
  <core_concept>
    [포맷과 훅을 연결하는 핵심 아이디어를 1문단의 한국어로 설명]
  </core_concept>
  <ab_testing_variations>
    <option_a>
      <title>[강력한 후킹이 포함된 옵션 A 제목 (한국어)]</title>
      <script_intro>[실행 가능한 시각적/언어적 스크립트 옵션 A (한국어)]</script_intro>
    </option_a>
    <option_b>
      <title>[강력한 후킹이 포함된 옵션 B 제목 (한국어)]</title>
      <script_intro>[실행 가능한 시각적/언어적 스크립트 옵션 B (한국어)]</script_intro>
    </option_b>
  </ab_testing_variations>
</logical_framework>

<spoken_audio_korean>
[매우 중요: 스크립트에서 실제로 입으로 소리 내어 읽을 한국어 대사만 1개의 옵션을 택하여 정확히 제공할 것. '제목:', '본론:', '화면 지시문' 등의 메타데이터를 절대 포함하지 말고 오직 TTS 오디오 엔진으로 보낼 텍스트만 작성.]
</spoken_audio_korean>
`;
        }


        // Call AI Client
        const responseText = await generateContentWithGemini(systemInstruction, userPrompt);
        // Clean up any markdown blocks just in case
        const cleanedResult = responseText.trim().replace(/^```xml\n?/, '').replace(/\n?```$/, '');
        setFinalReport(cleanedResult);

        // --- Parsing Logic ---
        try {
            // Attempt to parse Persona
            const roleMatch = cleanedResult.match(/<(?:role|role_name)>([\s\S]*?)<\/(?:role|role_name)>/i);
            const targetMatch = cleanedResult.match(/<(?:target|target_audience)>([\s\S]*?)<\/(?:target|target_audience)>/i);
            const triggerMatch = cleanedResult.match(/<(?:trigger|psychological_hook)>([\s\S]*?)<\/(?:trigger|psychological_hook)>/i);

            if (roleMatch || targetMatch || triggerMatch) {
                setParsedPersona({
                    role: roleMatch ? roleMatch[1].trim() : 'Content Strategist',
                    target: targetMatch ? targetMatch[1].trim() : 'General',
                    trigger: triggerMatch ? triggerMatch[1].trim() : 'None'
                });
            }

            // Attempt to parse Dedicated Spoken Audio
            const spokenAudioMatch = cleanedResult.match(/<spoken_audio_korean>([\s\S]*?)<\/spoken_audio_korean>/i);
            if (spokenAudioMatch && spokenAudioMatch[1]) {
                setParsedSpokenAudio(spokenAudioMatch[1].trim());
            }

            // Based on format, parse interesting parts for Generated Concepts
            if (isTrendSurfer) {
                const step1Match = cleanedResult.match(/<step1_trend_scan>([\s\S]*?)<\/step1_trend_scan>/i);
                if (step1Match) setParsedHookInfo(step1Match[1].trim().substring(0, 150) + '...');

                const step3Match = cleanedResult.match(/<step3_full_narrative_script>([\s\S]*?)<\/step3_full_narrative_script>/i) ||
                    cleanedResult.match(/<step3_blueprint_generation>([\s\S]*?)<\/step3_blueprint_generation>/i);
                if (step3Match) setParsedScript(step3Match[1].trim());
            } else {
                // Core concept / Hook Info
                const conceptMatch = cleanedResult.match(/<core_concept>([\s\S]*?)<\/core_concept>/i) ||
                    cleanedResult.match(/<hook_idea>([\s\S]*?)<\/hook_idea>/i);
                if (conceptMatch && conceptMatch[1]) {
                    setParsedHookInfo(conceptMatch[1].trim());
                }

                // Script / Options
                const optionA = cleanedResult.match(/<option_a>([\s\S]*?)<\/option_a>/i);
                const abTesting = cleanedResult.match(/<ab_testing_variations>([\s\S]*?)<\/ab_testing_variations>/i);
                const variations = cleanedResult.match(/<variations>([\s\S]*?)<\/variations>/i);
                const scriptIntro = cleanedResult.match(/<script_intro>([\s\S]*?)<\/script_intro>/ig);

                if (optionA && optionA[1]) {
                    setParsedScript(optionA[1].trim());
                } else if (scriptIntro && scriptIntro.length > 0) {
                    // Combine multiple script intros if found
                    setParsedScript(scriptIntro.map(match => match.replace(/<\/?(?:script_intro|script)>/ig, '')).join('\n\n---\n\n'));
                } else if (abTesting && abTesting[1]) {
                    setParsedScript(abTesting[1].trim());
                } else if (variations && variations[1]) {
                    setParsedScript(variations[1].trim());
                } else {
                    // Ultimate fallback
                    const framework = cleanedResult.match(/<(?:logical_framework|content_blueprint|blueprint)>([\s\S]*?)<\/(?:logical_framework|content_blueprint|blueprint)>/i);
                    if (framework && framework[1]) {
                        setParsedScript(framework[1].trim());
                    } else if (!conceptMatch) {
                        // If everything failed, just dump the whole thing so it's not empty, but indicate it's raw
                        // But also try to find the largest block of text as a fallback
                        const fallbackText = cleanedResult.replace(/<[\s\S]*?>/g, '\n').trim();
                        setParsedScript(fallbackText || "Raw Output (Parsing Failed):\n\n" + cleanedResult);
                    }
                }
            }

        } catch (e) {
            console.error("Failed to parse AI output nicely", e);
        }
    };

    return (
        <div className="flex-1 w-full h-full flex flex-col lg:flex-row gap-6 p-4 lg:p-8 overflow-hidden bg-slate-50 relative z-10">

            {/* Left: Input Modules */}
            <div className="flex-1 flex flex-col gap-8 overflow-y-auto pb-20 pr-4 custom-scrollbar">

                {/* Step 0: Format */}
                <motion.div
                    className={`p-6 rounded-3xl border transition-all duration-500 ${currentStep >= 0 ? 'bg-white shadow-xl border-slate-200' : 'opacity-40 grayscale pointer-events-none'}`}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold">1</div>
                        <h2 className="text-2xl font-bold text-slate-800">What are we creating today? <span className="text-lg text-slate-500 font-normal ml-2">(오늘은 무엇을 제작할까요?)</span></h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {contentTemplates.map(t => (
                            <div
                                key={t.id}
                                onClick={() => handleTemplateSelect(t)}
                                className={`p-4 rounded-2xl cursor-pointer border-2 transition-all ${selectedTemplate?.id === t.id ? 'border-rose-500 bg-rose-50' : 'border-slate-100 hover:border-rose-200 bg-slate-50'}`}
                            >
                                <div className="text-3xl mb-2">{t.icon}</div>
                                <h3 className="font-bold text-slate-800 mb-1">{t.title}</h3>
                                <p className="text-xs text-slate-500 leading-relaxed">{t.description}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Dynamically inserted Step 1.5: Niche (Only for Trend Surfer) */}
                {isTrendSurfer && (
                    <motion.div
                        className={`p-6 rounded-3xl border transition-all duration-700 ${currentStep >= 1 ? 'bg-white shadow-xl border-emerald-200 opacity-100' : 'hidden'}`}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: currentStep >= 1 ? 1 : 0, height: 'auto', y: currentStep >= 1 ? 0 : 20 }}
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">2</div>
                            <h2 className="text-2xl font-bold text-slate-800">Which niche/field are you interested in? <span className="text-lg text-slate-500 font-normal ml-2">(어떤 분야에 관심이 있나요?)</span></h2>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {contentNiches.map(n => (
                                <div
                                    key={n}
                                    onClick={() => handleNicheSelect(n)}
                                    className={`px-5 py-3 rounded-full cursor-pointer text-sm font-semibold transition-all shadow-sm border ${selectedNiche === n ? 'bg-emerald-600 text-white border-emerald-600 scale-105' : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50'}`}
                                >
                                    {n}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Step 1/2: Audience */}
                <motion.div
                    id="step-audience"
                    className={`p-6 rounded-3xl border transition-all duration-700 ${isTrendSurfer ? (currentStep >= 2 ? 'bg-white shadow-xl border-slate-200 opacity-100' : 'opacity-30 blur-[2px] pointer-events-none bg-slate-100/50 border-transparent') : (currentStep >= 1 ? 'bg-white shadow-xl border-slate-200 opacity-100' : 'opacity-30 blur-[2px] pointer-events-none bg-slate-100/50 border-transparent')} ${isTrendSurfer && currentStep < 1 ? 'hidden' : ''}`}
                    animate={{ y: (isTrendSurfer ? currentStep >= 2 : currentStep >= 1) ? 0 : 20 }}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold">{isTrendSurfer ? '3' : '2'}</div>
                        <h2 className="text-2xl font-bold text-slate-800">Who is your target audience? <span className="text-lg text-slate-500 font-normal ml-2">(타겟 청중은 누구인가요?)</span></h2>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {contentTargetAudiences.map(a => {
                            const isActive = selectedAudiences.includes(a);
                            return (
                                <div
                                    key={a}
                                    onClick={() => handleAudienceSelect(a)}
                                    className={`px-5 py-3 rounded-full cursor-pointer text-sm font-semibold transition-all shadow-sm border ${isActive ? 'bg-slate-800 text-white border-slate-800 scale-105 ring-2 ring-slate-400 ring-offset-2' : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300 hover:bg-amber-50'}`}
                                >
                                    {isActive && <span className="mr-2">✓</span>}
                                    {a}
                                </div>
                            );
                        })}
                    </div>
                    {selectedAudiences.length > 0 && (
                        <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.02, x: 5 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                                const nextStep = isTrendSurfer ? 3 : 2;
                                setCurrentStep(nextStep as Step);
                                setTimeout(() => {
                                    document.getElementById('step-hook')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }, 100);
                            }}
                            className="mt-8 px-8 py-4 bg-amber-600 text-white rounded-2xl font-bold shadow-lg shadow-amber-200 hover:bg-amber-700 transition-all flex items-center gap-3 w-fit"
                        >
                            <span>Confirm & Next (확인 및 다음)</span>
                            <span className="text-xl">→</span>
                        </motion.button>
                    )}
                </motion.div>

                {/* Step 2/3: Hook */}
                <motion.div
                    id="step-hook"
                    className={`p-6 rounded-3xl border transition-all duration-700 ${isTrendSurfer ? (currentStep >= 3 ? 'bg-white shadow-xl border-slate-200 opacity-100' : 'opacity-20 blur-[4px] pointer-events-none bg-slate-100/50 border-transparent') : (currentStep >= 2 ? 'bg-white shadow-xl border-slate-200 opacity-100' : 'opacity-20 blur-[4px] pointer-events-none bg-slate-100/50 border-transparent')} ${isTrendSurfer && currentStep < 2 ? 'hidden' : ''}`}
                    animate={{ y: (isTrendSurfer ? currentStep >= 3 : currentStep >= 2) ? 0 : 20 }}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">{isTrendSurfer ? '4' : '3'}</div>
                        <h2 className="text-2xl font-bold text-slate-800">Which psychological hook? <span className="text-lg text-slate-500 font-normal ml-2">(어떤 심리적 후킹 요소를 사용할까요?)</span></h2>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {contentEmotionalHooks.map(h => {
                            const isActive = selectedHooks.includes(h);
                            return (
                                <div
                                    key={h}
                                    onClick={() => handleHookSelect(h)}
                                    className={`px-5 py-3 rounded-full cursor-pointer text-sm font-semibold transition-all shadow-sm border ${isActive ? 'bg-slate-800 text-white border-slate-800 scale-105 ring-2 ring-slate-400 ring-offset-2' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'}`}
                                >
                                    {isActive && <span className="mr-2">⚡</span>}
                                    {h}
                                </div>
                            );
                        })}
                    </div>
                    {selectedHooks.length > 0 && (
                        <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.02, x: 5 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                                const nextStep = isTrendSurfer ? 4 : 3;
                                setCurrentStep(nextStep as Step);
                                setTimeout(() => {
                                    // Scroll to the bottom to see the "Forge" button if it appeared
                                    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                                }, 100);
                            }}
                            className="mt-8 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-3 w-fit"
                        >
                            <span>Finalize Selection (선택 완료)</span>
                            <span className="text-xl">→</span>
                        </motion.button>
                    )}
                </motion.div>

            </div>

            {/* Right: Live Preview & Report */}
            <div className="w-full lg:w-[450px] flex flex-col gap-6">

                <div className="flex-1 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col relative">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80 backdrop-blur-md flex items-center justify-between z-10">
                        <div className="flex flex-col">
                            <h3 className="font-bold text-slate-800 text-sm sm:text-base">Ideation Canvas</h3>
                            <span className="text-[10px] text-slate-500 font-normal">아이디에이션 캔버스</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <CreditBadge />
                            {((!isTrendSurfer && currentStep === 3) || (isTrendSurfer && currentStep === 4)) && !finalReport && !isGenerating && (
                                <button
                                    onClick={handleGenerate}
                                    className="px-4 py-2 bg-gradient-to-r from-rose-500 to-amber-500 text-white text-sm font-bold rounded-full shadow-lg hover:shadow-rose-500/30 transition-all hover:scale-105 whitespace-nowrap"
                                >
                                    Forge ⚡
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto relative">
                        {!isGenerating && !finalReport && (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50 space-y-4">
                                <div className="w-24 h-24 border-4 border-dashed border-slate-300 rounded-full flex items-center justify-center">
                                    <span className="text-4xl text-slate-300">💡</span>
                                </div>
                                <p className="font-medium text-center px-8">Select your audience and hooks to see the live blueprint here.</p>
                            </div>
                        )}

                        {isGenerating && (
                            <div className="h-full flex flex-col items-center justify-center space-y-8">
                                <div className="w-32 h-32 relative">
                                    <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                                    <div
                                        className="absolute inset-0 border-4 border-rose-500 rounded-full border-t-transparent animate-spin"
                                    ></div>
                                    <div className="absolute inset-0 flex items-center justify-center text-2xl">🔥</div>
                                </div>
                                <div className="text-center space-y-2">
                                    <p className="font-bold text-slate-800 text-lg">
                                        {generationProgress < 30 && "Analyzing Trends... (트렌드 분석 중)"}
                                        {generationProgress >= 30 && generationProgress < 60 && "Mapping Psychology... (심리 상태 매핑 중)"}
                                        {generationProgress >= 60 && generationProgress < 90 && "Extracting Hooks... (후킹 요소 추출 중)"}
                                        {generationProgress >= 90 && "Finalizing Blueprint... (초안 완성 중)"}
                                    </p>
                                    <p className="text-sm text-slate-500 font-mono">{generationProgress}% Completed (진행률)</p>
                                </div>
                            </div>
                        )}

                        {finalReport && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, staggerChildren: 0.1 }}
                                className="w-full flex flex-col gap-6 w-full"
                            >
                                {/* Header */}
                                <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-200 shrink-0">
                                        <span className="text-white text-lg">✨</span>
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Your Viral Blueprint <span className="text-lg font-normal text-slate-500 ml-2 hidden sm:inline">(생성된 콘텐츠 초안)</span></h2>
                                    </div>
                                </div>

                                {/* Persona Badge */}
                                {parsedPersona && (
                                    <div className="flex flex-col gap-4">
                                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex">
                                            <div className="px-4 py-2 bg-slate-800 text-slate-100 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-md">
                                                <span className="text-amber-400">🤖 AI ROLE:</span> {parsedPersona.role}
                                            </div>
                                        </motion.div>

                                        <div className="flex flex-wrap gap-2">
                                            {selectedAudiences.map(a => (
                                                <span key={a} className="px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-full border border-amber-200">
                                                    Target: {a}
                                                </span>
                                            ))}
                                            {selectedHooks.map(h => (
                                                <span key={h} className="px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-full border border-indigo-200">
                                                    Hook: {h}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Core Insight / Hook */}
                                {parsedHookInfo && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                                        className="relative p-6 rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-200"
                                    >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
                                        <h3 className="text-indigo-100 font-bold mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                                            <span className="text-xl">💡</span> Core Insight
                                        </h3>
                                        <p className="text-white text-lg font-medium leading-relaxed">
                                            "{parsedHookInfo}"
                                        </p>
                                    </motion.div>
                                )}

                                {/* Actionable Script */}
                                {parsedScript && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                                        className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative"
                                    >
                                        <div className="absolute -left-[1px] top-8 bottom-8 w-[4px] bg-rose-400 rounded-r-lg"></div>
                                        <h3 className="font-extrabold text-slate-800 mb-4 text-lg flex items-center gap-2">
                                            <span className="text-xl">🎬</span> Actionable Script / Blueprint
                                        </h3>
                                        <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap">
                                            {parsedScript}
                                        </div>
                                    </motion.div>
                                )}



                                {/* Premium CTA - Functional AI Voice Preview */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="p-1 rounded-[2rem] bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500 bg-[length:200%_auto] animate-gradient-x shadow-xl mt-4"
                                >
                                    <div className="bg-white rounded-[1.9rem] p-6 text-center space-y-4">
                                        <div className="inline-flex items-center justify-center w-12 h-12 bg-rose-50 rounded-full text-2xl">
                                            {isAudioGenerating ? "⌛" : audioGenerated ? "🔊" : "🎙️"}
                                        </div>

                                        <div className="space-y-1">
                                            <h4 className="font-bold text-slate-800">
                                                {isAudioGenerating ? "Synthesizing AI Voice..." : audioGenerated ? "AI Voice Preview Ready!" : "Listen to AI Voice Preview?"}
                                            </h4>
                                            {!isAudioGenerating && !audioGenerated && (
                                                <div className="flex flex-col items-center gap-2 mt-2 px-4">
                                                    <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Select Human-Friendly Voice (Neural HD)</label>
                                                    <select
                                                        value={selectedVoiceURI}
                                                        onChange={(e) => setSelectedVoiceURI(e.target.value)}
                                                        className="w-full max-w-xs text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                                                    >
                                                        {voices.filter(v => v.lang.includes('ko')).map(v => (
                                                            <option key={v.voiceURI} value={v.voiceURI}>
                                                                {v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('Online') ? '✨ ' : '• '}
                                                                🇰🇷 {v.name.replace('Microsoft ', '').replace('Online (Natural) - Korean (Korea)', 'HD').replace(' - Korean (Korea)', ' Standard')}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                            <p className="text-sm text-slate-500 italic">
                                                {isAudioGenerating ? "목소리 합성 중..." : audioGenerated ? "미리보기가 준비되었습니다" : "방금 만든 대본을 AI 목소리로 들어보시겠어요?"}
                                            </p>
                                        </div>

                                        {!audioGenerated && !isAudioGenerating && (
                                            <button
                                                onClick={handleAudioSynthesis}
                                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                                            >
                                                <span>Generate AI Audio</span>
                                                <span className="px-2 py-0.5 bg-amber-500 text-[10px] rounded-full text-white uppercase">10 Credits</span>
                                            </button>
                                        )}

                                        {isAudioGenerating && (
                                            <div className="w-full space-y-2">
                                                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <motion.div
                                                        className="h-full bg-rose-500"
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${audioProgress}%` }}
                                                    />
                                                </div>
                                                <p className="text-[10px] text-slate-400 font-mono">{audioProgress}% Synthesized</p>
                                            </div>
                                        )}

                                        {audioGenerated && (
                                            <div className="flex flex-col gap-3 w-full animate-fade-in">
                                                <div className="bg-indigo-950/80 border border-indigo-400/50 rounded-xl p-5 mb-2 shadow-inner">
                                                    <p className="text-base text-white leading-relaxed">
                                                        <span className="font-bold text-amber-300 text-lg mr-1">💡 데모 안내:</span> 기획 의도(코어 인사이트)는 가이드 음성으로 즉각 재생됩니다. <br />완벽한 감정 연기가 포함된 <span className="font-bold text-rose-400">실제 스크립트 오디오/비디오 트랙은 유료 AI 음성 합성 서버(ElevenLabs 등)를 통해 별도 렌더링</span> 됩니다.
                                                    </p>
                                                </div>
                                                <div className="flex gap-3 w-full">
                                                    <button
                                                        onClick={() => playAudioPreview('insight')}
                                                        className="flex-1 py-4 bg-indigo-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all shadow-lg active:scale-95 animate-pulse-subtle"
                                                    >
                                                        <span className="text-xl">🎙️</span> 기획 의도 듣기 (가이드)
                                                    </button>
                                                    <button
                                                        onClick={() => playAudioPreview('script')}
                                                        className="flex-1 py-4 bg-slate-700 text-slate-200 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-600 transition-all shadow-lg active:scale-95"
                                                    >
                                                        <span className="text-xl">▶</span> 스크립트 오디오 (샘플)
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        <p className="text-[10px] text-slate-400">Powered by ElevenLabs Meta-API (Functional Demo)</p>
                                    </div>
                                </motion.div>

                                {/* Technical XML Toggle Base */}
                                <div className="mt-8 pt-8 border-t border-slate-200">
                                    <details className="group">
                                        <summary className="cursor-pointer text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors flex items-center gap-2">
                                            <span>Dev: View Raw XML</span>
                                            <span className="group-open:rotate-180 transition-transform">▼</span>
                                        </summary>
                                        <div className="mt-4 p-4 bg-slate-900 rounded-2xl overflow-x-auto text-slate-400 font-mono text-[10px] leading-relaxed border border-slate-800 shadow-inner">
                                            <pre className="whitespace-pre-wrap"><code className="language-xml">{finalReport}</code></pre>
                                        </div>
                                    </details>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
