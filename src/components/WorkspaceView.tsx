import React, { useState, useEffect } from 'react';
import { useAppStore } from '../core/store';
import { motion, AnimatePresence } from 'framer-motion';
import { generateContentWithGemini } from '../core/ai-client';
import { exportToPPTX } from '../core/ppt-exporter';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
    Loader2, Copy, RefreshCcw,
    Terminal, Shield, Cpu, Zap, Beaker, Play, CheckCircle2, AlertCircle,
    FileDown, Layout, Presentation, FileText, History as HistoryIcon,
    Image as ImageIcon, Globe, ShieldCheck, Box, ShoppingCart, Check,
    ChevronDown
} from 'lucide-react';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const WorkspaceView: React.FC = () => {
    const { phase, setPhase, userInput, architectureType, setEngineeredPrompt, engineeredPrompt } = useAppStore();
    const [refiningOptions, setRefiningOptions] = useState({
        tone: '전문가용(Professional)',
        audience: '일반 사용자',
        constraints: 'GPT-4 최적화'
    });

    const [actionState, setActionState] = useState<{ validation: 'idle' | 'running' | 'done', enterprise: 'idle' | 'running' | 'done' }>({ validation: 'idle', enterprise: 'idle' });
    const [executionState, setExecutionState] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
    const [executionFormat, setExecutionFormat] = useState<string>('default');
    const [executionResult, setExecutionResult] = useState<string>('');
    const [executionError, setExecutionError] = useState<string>('');
    const [pptBackground, setPptBackground] = useState<string>(''); // Keep for compatibility/fallback
    const [slideImages, setSlideImages] = useState<Record<number, string>>({});
    const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
    const [imageSeed, setImageSeed] = useState<number>(0);
    const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);

    const handleValidationClick = () => {
        if (actionState.validation !== 'idle') return;
        setActionState(prev => ({ ...prev, validation: 'running' }));
        // Simulate a validation process scanning the XML
        setTimeout(() => {
            setActionState(prev => ({ ...prev, validation: 'done' }));
            // Reset after 3 seconds
            setTimeout(() => setActionState(prev => ({ ...prev, validation: 'idle' })), 3000);
        }, 1500);
    };

    const handleEnterpriseClick = () => {
        if (actionState.enterprise !== 'idle') return;
        setActionState(prev => ({ ...prev, enterprise: 'running' }));
        // Simulate enterprise API connection
        setTimeout(() => {
            setActionState(prev => ({ ...prev, enterprise: 'done' }));
            // Reset after 3 seconds
            setTimeout(() => setActionState(prev => ({ ...prev, enterprise: 'idle' })), 3000);
        }, 1500);
    };

    const handleExecuteAI = async () => {
        if (!engineeredPrompt || executionState === 'running') return;

        setExecutionState('running');
        setExecutionError('');
        setExecutionResult('');
        setCurrentSlideIndex(0);

        try {
            const formatPrompts: Record<string, string> = {
                'default': '위의 블루프린트를 기반으로 비즈니스 논리에 맞춘 실제 결과물을 텍스트 형식으로 상세히 생성하십시오. 아키텍처에 대한 설명은 생략하고 실제 본문 내용만 작성하십시오.',
                'report': '위의 블루프린트를 기반으로, 실제 비즈니스 데이터와 통찰이 포함된 전문적인 **보고서(Report)**를 마크다운 형식으로 작성하십시오. 서론, 본론, 결론을 갖춘 실제 제안서 실무 내용이어야 합니다.',
                'json': '위의 블루프린트를 기반으로, 실제 비즈니스 속성들이 포함된 유효한 **JSON (데이터 구조)**을 반환하십시오.',
                'email': '위의 블루프린트를 기반으로, 실제 고객에게 보낼 수 있는 설득력 있는 **뉴스레터** 본문을 작성하십시오.',
                'ppt': `위의 블루프린트를 기반으로 PPT 슬라이드 본문을 생성하십시오.
인사말이나 지침 같은 메타-토크(Meta-talk)는 절대 출력하지 마십시오. 오직 슬라이드 내용만 출력하십시오.
반드시 아래 형식을 엄격히 준수하십시오:

[START_PPT_CONTENT]
# 슬라이드 제목 1
- **핵심 메시지 1**: (설득력 있는 간결한 설명)
- **핵심 메시지 2**: (문장은 짧고 명확하게)
- **핵심 메시지 3**: (슬라이드 당 최대 3~4개의 불릿만 허용)

# 슬라이드 제목 2
...
[END_PPT_CONTENT]

**최상위 수칙 (PPT 가독성 및 시각적 설득력 극대화):**
1. **극강의 간결성**: 청중의 인지 부하를 줄이기 위해 문장을 매우 짧고 타격감 있게 작성하십시오. (줄글 불가)
2. **슬라이드 내 완결성**: 하나의 주제나 개념은 무조건 단일 슬라이드 안에서 해결하십시오. 다음 슬라이드로 내용이 넘치지 않도록 불릿 개수를 3~4개 이하로 강력히 통제하십시오.
3. 고유한 제목: 각 슬라이드 제목은 중복되지 않아야 합니다.
4. 기술 용어 태그([앵커링 효과] 등) 본문 포함 절대 금지.
5. 실제 비즈니스 제안 내용으로 최소 10개 이상의 슬라이드를 구성하십시오.`,
                'audio': '위의 블루프린트를 기반으로 성우가 낭독할 수 있는 실제 대본을 작성하십시오.',
                'video': '위의 블루프린트를 기반으로 실제 영상 제작을 위한 스토리보드 본문을 작성하십시오.'
            };
            const targetPrompt = formatPrompts[executionFormat] || formatPrompts['default'];

            const result = await generateContentWithGemini(
                engineeredPrompt,
                targetPrompt
            );
            setExecutionResult(result);
            setExecutionState('success');
        } catch (err: any) {
            console.error('Execution failed:', err);
            setExecutionError(err.message || '알 수 없는 오류가 발생했습니다.');
            setExecutionState('error');
        }
    };

    // Simulation Effects
    useEffect(() => {
        if (phase === 'analyzing') {
            const timer = setTimeout(() => setPhase('refining'), 2500);
            return () => clearTimeout(timer);
        }
        if (phase === 'engineering') {
            const timer = setTimeout(() => {
                generateAdvancedPrompt();
                setPhase('completed');
            }, 3500);
            return () => clearTimeout(timer);
        }
        if (phase === 'completed' && executionFormat === 'ppt' && !pptBackground) {
            // Background generation is simulated as we don't have direct access here 
            // but we can set a cinematic placeholder or trigger logic if available.
            // For now, let's assume a premium default or a state-based trigger.
            console.log("Preparing cinematic background for:", userInput);
        }
    }, [phase, executionFormat]);

    const generateAdvancedPrompt = () => {
        let specializedLogic = '';
        let domainPersona = '';
        let domainTasks = '';
        let domainQA = '';

        switch (architectureType) {
            case 'ui-design':
                domainPersona = '접근성(Accessibility) 및 인지 부하 최적화(Cognitive Load Optimization) 분야의 세계적인 권위자이자 시니어 UX/UI 디자인 시스템 아키텍트';
                specializedLogic = `
<ui_design_logic>
- **UX 심리학 패턴**: 모든 상호작용 설계에 피츠의 법칙(Fitts' Law)과 밀러의 법칙(Miller's Law)을 의무적으로 교차 검증하여 인지 부하를 최소화하십시오.
- **디자인 시스템 사양**: Tailwind CSS v4, Radix UI 원시 컴포넌트, 그리고 디자인 토큰(Design Tokens) 기반의 확장 가능한 아키텍처를 강제하십시오.
- **마이크로 인터랙션 및 상태**: 유휴(Idle), 호버(Hover), 포커스(Focus), 활성(Active), 비활성(Disabled) 및 로딩(Loading) 상태의 모션 곡선(Easing)과 CSS 트랜지션을 상세히 정의하십시오.
- **무결함 접근성 보장**: WAI-ARIA 1.2 사양 및 WCAG 2.1 Level AA 지침(대비비 4.5:1 이상, 키보드 네비게이션) 준수 여부를 논리적으로 입증하십시오.
</ui_design_logic>`;
                domainTasks = `
<domain_specific_tasks>
1. [구조 컴포넌트화] 사용자 요청을 Atomic Design 패턴에 따라 원자(Atoms), 분자(Molecules), 유기체(Organisms)로 분류하여 구조를 맵핑하십시오.
2. [시각적 계층화] 화면 중심 영역에서 엣지 영역까지의 시선 이동 경로(Z-Pattern 또는 F-Pattern)를 추적하여 여백(Spacing)과 타이포그래피 계층을 배정하십시오.
3. [상태 전이 설계] 사용자 인터랙션 발생 시 트리거(Trigger) -> 피드백(Feedback) -> 상태 변경(State Change) 과정을 명세서 수준으로 작성하십시오.
</domain_specific_tasks>`;
                domainQA = `
- **접근성 오디트**: "이 UI 컴포넌트는 스크린 리더 환경에서 스킵 링크 없이 탐색이 가능한가?"
- **인지 부하 검증**: "현재 뷰에서 사용자가 처리해야 할 주요 정보(Chunk)가 5개를 초과하지 않는가?"
- **시각적 정렬**: "컴포넌트 간의 광학적 정렬(Optical Alignment)이 수학적 정렬 수치와 시각적 균형을 이뤘는가?"`;
                break;
            case 'python-expert':
                domainPersona = '구글 및 메타 수준의 초거대 시스템을 설계하는 고성능 백엔드 시스템 및 클린 아키텍처 수석 파이썬(Python) 엔지니어';
                specializedLogic = `
<python_engineering_logic>
- **엄격한 표준 및 타이핑**: PEP 8 코딩 컨벤션 완벽 준수 및 Pydantic v2와 mypy를 활용한 엄격한 정적 타입 힌팅(Strict Type Hinting)을 강제하십시오.
- **아키텍처 패턴**: SOLID 원칙과 헥사고날/클린 아키텍처(Hexagonal/Clean Architecture) 패턴을 적용하여 비즈니스 로직과 외부 인프라를 완벽히 격리하십시오.
- **성능 및 복잡도 한계점**: 모든 핵심 알고리즘의 시간 및 공간 복잡도(Big O)를 명시하고, I/O 바운드 작업 시 FastAPI 및 asyncio를 활용한 비동기(Async) 락 프리(Lock-free) 처리를 최우선 반영하십시오.
- **보안 격벽 구조화**: OWASP Top 10을 참조하여 악의적인 SQL Injection, XSS, SSRF 공격을 방어하는 시큐어 코딩 패턴을 필수 적용하십시오.
</python_engineering_logic>`;
                domainTasks = `
<domain_specific_tasks>
1. [설계 추상화] 요구사항을 분석하여 추상 기본 클래스(ABC) 및 프로토콜(Protocols)을 활용해 시스템의 인터페이스 규격을 설계하십시오.
2. [알고리즘 최적화] 메모리 누수 및 데드락 가능성을 배제한 최적의 자료구조 체계를 선택하고, 실행 속도 최적화를 위한 튜닝 포인트를 제시하십시오.
3. [예외 처리 및 로깅] 예기치 않은 사이드 이펙트를 방어하기 위해 커스텀 예외 클래스(Custom Exceptions)를 정의하고, 구조화된 로깅(Structured JSON Logging) 전략을 수립하십시오.
</domain_specific_tasks>`;
                domainQA = `
- **타이핑 무결성**: "모든 함수 인수와 반환 값에 Any 없이 완전한 타입이 지정되어 있는가?"
- **확장성 및 결합도**: "의존성 역전 원칙(DIP)이 철저히 지켜져 모듈 간의 강한 결합(Tight Coupling)이 발생하지 않았는가?"
- **성능 병목 엣지**: "동시성 처리(Concurrency) 구조에서 경합 조건(Race Condition)이 발생할 수 있는 취약 지점은 완벽히 제어되었는가?"`;
                break;
            case 'ecommerce-strategist':
                domainPersona = '데이터 기반 전환율 최적화(CRO), 사용자 심리학, 퍼포먼스 마케팅에 능통한 글로벌 탑티어 이커머스 성장 전략가(Growth Strategist)';
                specializedLogic = `
<ecommerce_strategy_logic>
- **전환 마찰 최소화 설계**: 회원가입, 장바구니, 결제 여정(Checkout Funnel)에서 이탈률(Drop-off rate)을 유발하는 모든 마찰(Friction) 벤치마크 데이터를 적용해 프로세스를 재설계하십시오.
- **SEO 및 검색 가시성 극대화**: 의미론적(Semantic) HTML 구조와 JSON-LD 방식의 향상된 스키마 마크업(Product, Review, Breadcrumb)을 반영하여 검색 크롤러 최적화를 보장하십시오.
- **유입 및 행동 추적 고도화**: GA4 전자상거래(Ecommerce) 권장 이벤트 계층 구조 및 GTM(Google Tag Manager) 데이터 레이어(DataLayer) 변수 매핑 사양을 포함하십시오.
- **행동 경제학적 마이크로 카피**: 밴드왜건 효과, 손실 회피 매커니즘, 앵커링 효과 등 소비자 심리학 원칙을 적용한 트리거(Trigger) 마이크로 카피를 구성하십시오.
</ecommerce_strategy_logic>`;
                domainTasks = `
<domain_specific_tasks>
1. [사용자 여정 크롤링] 고객이 랜딩해서 결제 완료까지 겪는 '인지->관심->욕망->행동(AIDA)' 퍼널의 병목 구간을 역추적하여 퍼널 구조를 재정의하십시오.
2. [신뢰 네트워크 구축] 리뷰, 소셜 프루프, 반품 보장 정책, 보안 뱃지의 배치 타이밍과 시각적 가중치를 전략적으로 배분하십시오.
3. [가치 제안(UVP) 최적화] 경쟁 제품 대비 당사의 핵심 고유 가치가 상단 뷰포트(Above the Fold) 내에서 3초 안에 전달되도록 카피라이팅 프레임워크를 수립하십시오.
</domain_specific_tasks>`;
                domainQA = `
- **전환율 로직 평가**: "이 페이지 레이아웃이 사용자의 구매 결정 마찰을 데이터 기반으로 명확히 낮추고 있는가?"
- **신뢰 신호의 명확성**: "고객의 정보 보안 불안감 또는 구매 후회를 사전에 방어할 수 있는 신뢰 지표가 적재적소에 배치되었는가?"
- **트래킹 및 모니터링 체계**: "수립된 전략의 성과를 측정하기 위한 이벤트 계층과 핵심 성과 지표(KPI)가 누락 없이 정의되었는가?"`;
                break;
            case 'corporate-strategy':
                domainPersona = "MBB(McKinsey, BCG, Bain)급의 글로벌 전략 컨설턴트이자 해외 시장 진입(GTM) 전문가. 기술적 디테일과 비즈니스 로직을 하나로 통합하여 기업의 의사결정을 강제하는 압도적 퀄리티의 전략 보고서 설계자";
                specializedLogic = `
<corporate_strategy_logic>
- **PESTLE 기반 거시 환경 분석**: 정치적 규제, 경제적 지표, 기술적 성숙도, 법적 제약, 환경적 지속가능성(ESG) 관점에서 시장의 매력도(Attractiveness)를 정밀 진단하십시오.
- **가치 사슬(Value Chain) 및 공급망 해체**: 핵심 원자재 수급부터 최종 유통망 도달까지의 모든 단계를 가시화하고, 병목 지점과 비용 절감(Cost-out) 기법을 반영하십시오.
- **현지화 및 시장 진입(Entry Mode) 최적화**: 합작 투자(JV), M&A, 직접 진출 등 리스크와 리워드를 고려한 최적의 진입 시나리오를 설계하십시오.
- **데이터 중심의 성과 로직**: 정성적 제안에 그치지 말고, 주요 성과 지표(KPI)와 투자 대비 수익(ROI) 시뮬레이션 로직을 블루프린트에 포함하십시오.
</corporate_strategy_logic>`;
                domainTasks = `
<domain_specific_tasks>
1. [글로벌 환경 스캐닝] 대상 국가(예: 호주)와 산업(예: 스마트 팜)의 특수성을 반영한 거시 경제적 기회와 위협 요소를 입체적으로 분석하십시오.
2. [비대칭적 경쟁 우위 도출] 현지 로컬 플레이어가 절대 가질 수 없는 대한민국 기술력 또는 당사의 고유 역량을 비대칭적 경쟁 우위(Unfair Advantage)로 정의하십시오.
3. [실행 로드맵 및 리스크 관리] 단기 시장 안착부터 중장기 확장까지의 구체적인 타임라인과, 발생 가능한 정치/경제적 리스크의 선제적 방어책(Mitigation Strategy)을 수립하십시오.
</domain_specific_tasks>`;
                domainQA = `
- **전략의 해상도**: "단순히 '좋은 말'의 나열인가, 아니면 기업 총수가 즉각 투자를 결정할 수 있을 만큼 구체적이고 치명적인 데이터와 로직이 포함되었는가?"
- **현지 시장 적합성**: "해당 국가의 문화, 규제, 유통 경로 등 로컬 특수성이 설계도 전반에 깊숙이 반영되어 있는가?"
- **ROI 및 실행 가능성**: "제시된 전략이 자본과 인력 투입 대비 명확한 수익 모델과 현실적인 실행 경로를 제시하고 있는가?"`;
                break;
            case 'strategic-architect':
            default:
                domainPersona = '구조적 사고와 논리적 추론 능력이 극대화된 엘리트 디지털 솔루션 아키텍트 및 최고급 프롬프트 엔지니어링 마스터';
                specializedLogic = `
<standard_logic>
- **다차원 논리 분해**: 문제의 표면적 증상이 아닌 근본 원인(Root Cause)을 파악하기 위해 최소 3단계 이상의 깊이(Depth)로 문제를 해체하십시오.
- **맥락 보존 규칙**: 지침 간의 상관관계에 모순이 없도록 하며, 명확성 융합(Clarity Fusion) 기법을 사용해 지침의 모호성을 0%로 수렴하게 만드십시오.
- **자기 성찰 및 진화 루프**: 모델 스스로 초기 가설을 세운 후 안티 테제(Anti-thesis)를 적용시켜, 가장 견고한 최종 해답(Synthesis)을 도출하는 변증법적 구조를 실행하십시오.
</standard_logic>`;
                domainTasks = `
<domain_specific_tasks>
1. [논리 뼈대 조립] 초기 요구사항 벡터 공간을 분석하여, 실행 가능한 최고 수준의 논리적 프레임워크 트리(Logical Framework Tree)를 수립하십시오.
2. [오류 방어선 구축] 엣지 케이스(Edge Cases)와 예외 상황(Edge Cases)을 매트릭스 형태로 시뮬레이션하고 이를 우회하는 대응 로직을 산출하십시오.
3. [통합 솔루션 컴파일] 독립적으로 분석된 컴포넌트들을 하나의 응집력 높은 매뉴얼/코드/보고서 형태로 결합하십시오.
</domain_specific_tasks>`;
                domainQA = `
- **해결책의 완전성 (Completeness)**: "제시된 솔루션이 사용자의 표면적 요구뿐만 아니라 잠재적 문제까지 모두 커버하고 있는가?"
- **지침의 선명도 (Acuity)**: "실행자가 이 지침을 해석할 때 오독(Misinterpretation)할 여지가 단 1%라도 존재하는가?"
- **가치 효율성 (Value Efficiency)**: "도출된 결과 목록에 불필요한 장황함(Verbosity)은 없고 오직 고밀도의 정보성만 존재하는가?"`;
        }

        const prompt = `<system_persona>
당신은 ${domainPersona}입니다. 
단순한 AI 어시스턴트가 아닌, 최상위 전문가 수준의 압도적인 통찰력과 논리적 엄밀성을 바탕으로 사용자의 목표를 완벽히 해석하고 [PROMPT_ARCHITECT_v2.0_ENTERPRISE] 사양에 따라 결함 없는 고성능 응답을 구축해야 합니다.
</system_persona>

<logical_framework>
[핵심 매개변수 선언]
- **목표(Core Objective)**: ${userInput}
- **톤앤매너(Tone & Manner)**: ${refiningOptions.tone}
- **아키텍처(Design Framework)**: ${architectureType}
- **우선순위 제약조건(Global Constraints)**: ${refiningOptions.constraints}

[특화 도메인 엔지니어링 로직]
${specializedLogic}
</logical_framework>

<task_execution_pipeline>
다음의 시스템 태스크 파이프라인을 순차적이고 엄격하게 실행하십시오. 각 단계는 이전 단계의 산출물을 기반으로 추론(Chain-of-Thought)되어야 합니다.

[공통 시스템 태스크]
1. <semantic_analysis>: "${userInput}"의 메타 데이터를 스캐닝하고 표면적 의도와 이면의 비즈니스 가치를 분해하십시오.
2. <constraint_mapping>: 설정된 제약 조건(${refiningOptions.constraints})을 모든 변수에 매핑하여 위반 요소를 사전 차단하십시오.

${domainTasks}
</task_execution_pipeline>

<quality_assurance_loop>
응답을 즉시 출력하지 말고, 내부적으로 다음 사항들을 가혹하게 교차 검증(Cross-Validation)하십시오. 품질 기준 미달 시 <task_execution_pipeline> 단계로 회귀하여 자체 수정(Self-Correction)해야 합니다.

[도메인 품질 검증 체크리스트]
${domainQA}

[글로벌 검증 로직]
- 제로 할루시네이션(Zero Hallucination) 원칙: 검증되지 않은 사실이나 추론의 비약이 있는가?
- 목표 정렬도(Goal Alignment): 최종 산출물이 초기 목표(${userInput}) 100% 달성에 가장 파괴적이고 효율적인 기법을 제안하고 있는가?
</quality_assurance_loop>

<output_specification>
과거의 낡고 뻔한 템플릿 답변을 거부합니다. 
위의 파라미터와 로직들을 종합하여, 실제 비즈니스 현장에서 즉각 사용 가능한 **"최종 실행본(Final Deliverable)"** 성격의 마스터 블루프린트를 한국어로 출력하십시오.

[출력 시 필수 엄수 사항]
1. **Product-First 원칙**: "어떻게 하라"는 메타 지시어가 아닌, **"결과값 그 자체(Actual Content)"**를 출력하십시오. 예를 들어, 전략 설계라면 '전략 수립 방법'이 아닌 '도출된 구체적인 전략 내용'을 작성해야 합니다.
2. **안건별 초정밀 전개**: 사용자가 제시한 개별 안건별로 실제 구현 데이터, 로직, 방법론을 압도적인 해상도로 포함하십시오.
3. **지침과 본문의 분리**: 모든 내용은 실행자가 바로 복사해서 현업에 적용할 수 있는 구체적인 텍스트여야 합니다.
</output_specification>
`;
        setEngineeredPrompt(prompt);
    };

    const handleNextPhase = () => {
        if (phase === 'refining') {
            setPhase('engineering');
        }
    };

    const copyToClipboard = () => {
        if (engineeredPrompt) {
            navigator.clipboard.writeText(engineeredPrompt);
            alert('블루프린트가 클립보드에 복사되었습니다!');
        }
    };

    const [isDownloading, setIsDownloading] = useState(false);

    // Helper to parse PPT markdown into slides (Synchronized with ppt-exporter.ts)
    const parsePPTSlides = (text: string) => {
        // [NEW] Boundary Aware Extraction
        let cleanText = text;
        const startTag = "[START_PPT_CONTENT]";
        const endTag = "[END_PPT_CONTENT]";

        if (text.includes(startTag)) {
            cleanText = text.split(startTag)[1].split(endTag)[0].trim();
        }

        const slides: { title: string; bullets: string[]; isTitleSlide?: boolean }[] = [];

        // Split by Markdown H1, H2, H3 or custom "Slide X" headers
        // Use a more inclusive regex for various AI header styles
        const sections = cleanText.split(/(?=^#+ |^Slide\s*\d+|^Page\s*\d+|^슬라이드\s*\d+|^[\[]Slide\s*\d+[\]])/mi).filter(s => s.trim());

        sections.forEach((section, index) => {
            const lines = section.trim().split('\n');
            let titleLine = lines[0].replace(/^#+ /, '').trim();
            titleLine = titleLine.replace(/^[\*\-_~]+/, '').replace(/[\*\-_~]+$/, '').trim(); // Strip emphasis


            // [IMPROVEMENT] Strip AI-generated meta prefixes aggressively
            titleLine = titleLine.replace(/^(Slide|슬라이드|Page|페이지|주제|Topic)\s*\d+[:\]\-\s]*/i, '').trim();
            titleLine = titleLine.replace(/^제\s*\d+\s*(장|절|슬라이드)[:\]\-\s]*/i, '').trim();

            // [NEW] Strip bracketed meta-tags (e.g., [수치 기반])
            titleLine = titleLine.replace(/\[.*?\]/g, '').trim();

            const bullets = lines.slice(1)
                .map(l => l.trim())
                // Catch standard markdown bullets AND numbered lists or simple dashes
                .filter(l => /^[*-•]/.test(l) || /^\d+\./.test(l))
                .map(l => {
                    let bulletText = l.replace(/^([-*•]|\d+\.)\s+/, '').trim();
                    // [NEW] Strip bracketed meta-tags from bullets
                    return bulletText.replace(/\[.*?\]/g, '').trim();
                })
                .filter(l => l.length > 0);

            if (bullets.length > 4) {
                // Split into multiple slides if too many bullets to prevent overflow
                let chunkCount = 1;
                for (let i = 0; i < bullets.length; i += 4) {
                    const chunk = bullets.slice(i, i + 4);
                    // Generate titles like "Title 1", "Title 2" etc instead of "(계속)"
                    slides.push({
                        title: `${titleLine} ${chunkCount}`,
                        bullets: chunk,
                        isTitleSlide: false // Never a title slide
                    });
                    chunkCount++;
                }
            } else if (titleLine || bullets.length > 0) {
                slides.push({
                    title: titleLine || "정보 슬라이드",
                    bullets: bullets.length > 0 ? bullets : ["상세 내용 준비 중"],
                    isTitleSlide: index === 0 // only first one if no split
                });
            }
        });

        return slides.length > 0 ? slides : [{ title: "생성된 슬라이드가 없습니다", bullets: ["블루프린트를 확인해주세요"], isTitleSlide: true }];
    };

    const handleImageGeneration = async () => {
        // [FIX] More robust check for content
        const contentToParse = executionResult || "";
        if (!contentToParse || isGeneratingImage) return;

        setIsGeneratingImage(true);
        try {
            const currentSlides = parsePPTSlides(contentToParse);
            const newSlideImages: Record<number, string> = {};

            // Unsplash Curated Collections for Global Theme Consistency (Expanded Pools)
            const visualThemes: Record<string, string[]> = {
                'agriculture': [
                    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000&auto=format&fit=crop', // field
                    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2013&auto=format&fit=crop', // field 2
                    'https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=2070&auto=format&fit=crop', // produce
                    'https://images.unsplash.com/photo-1523348830342-d01f9fc939b9?q=80&w=2070&auto=format&fit=crop', // greens
                    'https://images.unsplash.com/photo-1560493676-04071c5f467b?q=80&w=2068&auto=format&fit=crop', // farming tools
                    'https://images.unsplash.com/photo-1589923188900-85dae523342b?q=80&w=2070&auto=format&fit=crop', // soil hands
                    'https://images.unsplash.com/photo-1530507629858-e4977d30e9e0?q=80&w=2000&auto=format&fit=crop', // corn field
                    'https://images.unsplash.com/photo-1595841055312-70656715f336?q=80&w=2070&auto=format&fit=crop', // smart greenhouse
                    'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?q=80&w=1943&auto=format&fit=crop', // hydroponics
                    'https://images.unsplash.com/photo-1515150144380-bca9f1650ed9?q=80&w=2000&auto=format&fit=crop', // tractor
                    'https://images.unsplash.com/photo-1492496913980-501348b61469?q=80&w=2000&auto=format&fit=crop', // garden
                    'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=2070&auto=format&fit=crop'  // vast farmland
                ],
                'technology': [
                    'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop', // circuit
                    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop', // data globe
                    'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2000&auto=format&fit=crop', // ai concept
                    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop', // working on laptop
                    'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?q=80&w=2070&auto=format&fit=crop', // code
                    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop', // cybersecurity
                    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=2020&auto=format&fit=crop', // tech abstract
                    'https://images.unsplash.com/photo-1558494949-ef010ccdcc34?q=80&w=2000&auto=format&fit=crop', // servers
                    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=2070&auto=format&fit=crop', // robotics
                    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2070&auto=format&fit=crop'  // innovation lab
                ],
                'strategy': [
                    'https://images.unsplash.com/photo-1507679799987-c7377f5f51b1?q=80&w=2071&auto=format&fit=crop', // handshake
                    'https://images.unsplash.com/photo-1551288049-bbda48332501?q=80&w=2000&auto=format&fit=crop', // analytics
                    'https://images.unsplash.com/photo-1522071823995-578dff21aa2b?q=80&w=2000&auto=format&fit=crop', // team work
                    'https://images.unsplash.com/photo-1454165833767-027ffea9e77b?q=80&w=2070&auto=format&fit=crop', // planning
                    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2070&auto=format&fit=crop', // research
                    'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop', // workshop
                    'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2070&auto=format&fit=crop', // chart discussion
                    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop', // project board
                    'https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=2070&auto=format&fit=crop', // strategy room
                    'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop'  // architecture
                ],
                'corporate': [
                    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop', // building
                    'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop', // office
                    'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop', // reception
                    'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?q=80&w=2070&auto=format&fit=crop', // skyscraper
                    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2032&auto=format&fit=crop', // boardroom
                    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2070&auto=format&fit=crop', // creative office
                    'https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=2073&auto=format&fit=crop', // office view
                    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=2069&auto=format&fit=crop', // modern hall
                    'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?q=80&w=2070&auto=format&fit=crop', // tall building
                    'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop'  // lobby
                ],
                'default': [
                    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop', // general biz
                    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2070&auto=format&fit=crop', // general creative
                    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop', // general workspace
                    'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?q=80&w=2070&auto=format&fit=crop', // neutral office
                    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=2026&auto=format&fit=crop', // macbook
                    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop', // students/colleagues
                    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop', // digital abstract
                    'https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=2070&auto=format&fit=crop', // team standup
                    'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop', // meeting room
                    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop'  // store/retail
                ]
            };

            // 1. Determine Global Theme based on input
            let globalThemeKey = 'default';
            const inputLower = userInput.toLowerCase();

            if (inputLower.includes('농업') || inputLower.includes('farm') || inputLower.includes('환경')) globalThemeKey = 'agriculture';
            else if (inputLower.includes('it') || inputLower.includes('기술') || inputLower.includes('ai') || inputLower.includes('tech')) globalThemeKey = 'technology';
            else if (inputLower.includes('전략') || inputLower.includes('strategy') || inputLower.includes('분석') || inputLower.includes('roi')) globalThemeKey = 'strategy';
            else if (inputLower.includes('비즈니스') || inputLower.includes('기업') || inputLower.includes('시장')) globalThemeKey = 'corporate';

            const activeThemeSet = visualThemes[globalThemeKey];

            // 2. Apply theme consistently across slides with randomized selection
            currentSlides.forEach((slide, index) => {
                // Use a deterministic "hash" based on slide title to select an image
                // This ensures that the same slide gets the same image, but different slides get different images
                // even if they share the same index position (e.g. across different generations)
                const titleHash = slide.title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                const selectionSeed = (index + titleHash + imageSeed) % activeThemeSet.length;

                newSlideImages[index] = activeThemeSet[selectionSeed];

                // CONDITIONAL BACKGROUND LOGIC
                // DO NOT assign an image if it's not a title slide and has 4 or more bullets
                if (!slide.isTitleSlide && slide.bullets.length >= 4) {
                    newSlideImages[index] = '';
                }
            });

            // Force state update with NEW object to trigger re-render
            setSlideImages({ ...newSlideImages });
            setPptBackground(newSlideImages[0] || visualStrategy.default);

            setTimeout(() => {
                setIsGeneratingImage(false);
                setImageSeed(prev => prev + 1); // Trigger different selection for same titles
            }, 1000);
        } catch (error) {
            console.error(error);
            setIsGeneratingImage(false);
        }
    };

    const handlePPTDownload = async () => {
        if (!executionResult) return;
        setIsDownloading(true);
        try {
            const title = userInput.split('\n')[0].substring(0, 30);
            await exportToPPTX(executionResult, title, slideImages);
            setIsDownloading(false);
        } catch (error) {
            console.error(error);
            setIsDownloading(false);
            alert('PPT 생성 중 오류가 발생했습니다.');
        }
    };

    const isGodTier = architectureType === 'strategic-architect';

    return (
        <div className="p-8 max-w-5xl mx-auto h-full flex flex-col">
            <AnimatePresence mode="wait">
                {phase === 'analyzing' && (
                    <motion.div
                        key="analyzing"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex-1 flex flex-col items-center justify-center space-y-8"
                    >
                        <div className="relative">
                            <div className={cn("absolute -inset-12 blur-[60px] rounded-full animate-pulse", isGodTier ? "bg-teal-500/30" : "bg-blue-500/20")}></div>
                            <Loader2 className={cn("w-16 h-16 animate-spin relative", isGodTier ? "text-orange-500" : "text-blue-400")} />
                        </div>
                        <div className="text-center">
                            <h3 className={cn("text-2xl font-black mb-2 tracking-tight", isGodTier ? "text-teal-400" : "text-white")}>
                                {isGodTier ? "메타 컨텍스트 해체 중" : "도메인 컨텍스트 분석 중"}
                            </h3>
                            <p className={cn("font-medium animate-pulse", isGodTier ? "text-orange-400/80" : "text-slate-300")}>
                                {isGodTier ? "원자 단위(Atomic) 뎁스 스캐닝..." : "시맨틱 분해 실행 중..."}
                            </p>
                        </div>
                    </motion.div>
                )}

                {phase === 'refining' && (
                    <motion.div
                        key="refining"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center gap-3 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl w-fit">
                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">현재 프로젝트:</span>
                            <span className="text-sm font-bold text-white truncate max-w-md">{userInput}</span>
                        </div>

                        <div>
                            <h3 className={cn("text-2xl font-black mb-1 tracking-tight", isGodTier ? "text-teal-400" : "text-white")}>
                                {isGodTier ? "제1원칙 매개변수 주입" : "매개변수 정제"}
                            </h3>
                            <p className={cn("text-sm font-medium", isGodTier ? "text-teal-100/50" : "text-slate-400")}>
                                설계 엔진을 위한 디테일한 변수를 설정하세요
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 hover:border-blue-500/50 transition-colors">
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-4">출력 톤(Tone)</label>
                                <div className="flex flex-wrap gap-2">
                                    {['전문가용', '창의적', '학술적', '캐주얼'].map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setRefiningOptions(prev => ({ ...prev, tone: t }))}
                                            className={cn("px-4 py-2 rounded-xl text-sm font-bold transition-all", refiningOptions.tone === t ? (isGodTier ? 'bg-teal-600 text-black shadow-lg shadow-teal-500/30' : 'bg-blue-600 text-white shadow-lg shadow-blue-500/20') : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white')}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 hover:border-blue-500/50 transition-colors">
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-4">타겟 독자</label>
                                <div className="flex flex-wrap gap-2">
                                    {['일반 사용자', '도메인 전문가', '기술 팀'].map(a => (
                                        <button
                                            key={a}
                                            onClick={() => setRefiningOptions(prev => ({ ...prev, audience: a }))}
                                            className={cn("px-4 py-2 rounded-xl text-sm font-bold transition-all", refiningOptions.audience === a ? (isGodTier ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/30' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20') : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white')}
                                        >
                                            {a}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className={cn("p-8 rounded-[2rem] text-white flex items-center justify-between shadow-2xl", isGodTier ? "bg-black border border-teal-500/30 shadow-teal-900/20" : "bg-slate-900 shadow-slate-900/10")}>
                            <div className="max-w-md">
                                <div className={cn("flex items-center gap-2 mb-2", isGodTier ? "text-orange-500" : "text-blue-400")}>
                                    <Shield className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{isGodTier ? "SESS-01 프로토콜 활성화" : "아키텍트 엔진 v2.0"}</span>
                                </div>
                                <h4 className="text-xl font-bold mb-2">{isGodTier ? "아키텍처 침공 어셈블리 준비 완료" : "엔지니어링 어셈블리 준비 완료"}</h4>
                                <p className={cn("text-sm", isGodTier ? "text-teal-100/60" : "text-slate-400")}>{isGodTier ? "은폐된 변칙성과 데스밸리 교차 검증 루프를 탑재한 침공 전략을 구축합니다." : "XML 구조와 자가 교정 루프를 갖춘 다층적 프롬프트를 구축합니다."}</p>
                            </div>
                            <button
                                onClick={handleNextPhase}
                                className={cn("px-10 py-5 rounded-2xl font-black transition-all flex items-center gap-3 shadow-xl active:scale-95", isGodTier ? "bg-orange-600 hover:bg-orange-500 text-white shadow-orange-600/20" : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20")}
                            >
                                {isGodTier ? "제네시스 엔진 작동" : "엔지니어링 최종 확정"}
                                <Zap className={cn("w-5 h-5", isGodTier ? "fill-orange-200 text-orange-200" : "fill-white")} />
                            </button>
                        </div>
                    </motion.div>
                )}

                {phase === 'engineering' && (
                    <motion.div
                        key="engineering"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex-1 flex flex-col items-center justify-center"
                    >
                        <div className="max-w-md w-full">
                            <div className="mb-12 text-center">
                                <h3 className="text-3xl font-black text-white mb-4 tracking-tight">{isGodTier ? "메타 아키텍처 구축 중..." : "프롬프트 엔지니어링 진행 중..."}</h3>
                                <p className={cn("font-medium", isGodTier ? "text-teal-400" : "text-slate-400")}>{isGodTier ? "클리셰 원천 방지 및 진입 장벽 로직 조립 중" : "논리적 컴포넌트 및 가드레일 조립 중"}</p>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { icon: <Cpu className="w-4 h-4" />, label: "페르소나 모듈 및 도메인 컨텍스트 주입" },
                                    { icon: <Shield className="w-4 h-4" />, label: "보안 가드레일 및 제약 조건 매핑" },
                                    { icon: <Beaker className="w-4 h-4" />, label: "체계적인 검증 루프 구축" }
                                ].map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: i * 0.8 }}
                                        className={cn("flex items-center gap-4 backdrop-blur-md p-4 rounded-xl border shadow-lg", isGodTier ? "bg-black/60 border-teal-500/30" : "bg-slate-900/60 border-slate-700/50")}
                                    >
                                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center border", isGodTier ? "bg-teal-500/10 text-teal-400 border-teal-500/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20")}>
                                            {item.icon}
                                        </div>
                                        <span className={cn("text-sm font-bold", isGodTier ? "text-teal-100" : "text-slate-300")}>{item.label}</span>
                                        <div className="ml-auto">
                                            <div className="flex gap-1.5">
                                                {[0, 1, 2].map(d => (
                                                    <motion.div
                                                        key={d}
                                                        animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
                                                        transition={{ repeat: Infinity, duration: 1, delay: d * 0.2 }}
                                                        className={cn("w-1.5 h-1.5 rounded-full", isGodTier ? "bg-orange-500" : "bg-blue-400")}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {phase === 'completed' && (
                    <motion.div
                        key="completed"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6 flex-1 flex flex-col"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-black text-slate-400 uppercase tracking-widest">Core Idea</div>
                                    <span className="text-sm font-bold text-white truncate max-w-sm">{userInput}</span>
                                </div>
                                <h3 className={cn("text-3xl font-black mb-3 tracking-tight", isGodTier ? "text-orange-500" : "text-white")}>
                                    {isGodTier ? "SESS-01 마스터 블루프린트" : "최종 설계 블루프린트"}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <span className={cn("px-2 py-0.5 text-[10px] font-black rounded uppercase shadow-lg", isGodTier ? "bg-teal-600 text-black shadow-teal-500/20" : "bg-blue-600 text-white shadow-blue-500/20")}>XML 태그 구조</span>

                                    <button
                                        onClick={handleValidationClick}
                                        disabled={actionState.validation !== 'idle'}
                                        className={cn("px-2 py-0.5 text-[10px] font-black rounded uppercase border transition-all active:scale-95 disabled:opacity-100 disabled:scale-100 flex items-center gap-1 cursor-pointer",
                                            isGodTier ? "bg-black text-teal-400 border-teal-500/20 hover:bg-teal-900/30" : "bg-slate-800 text-blue-400 border-blue-500/20 hover:bg-slate-700",
                                            actionState.validation === 'running' && "bg-blue-900/50 text-blue-300 border-blue-400/50",
                                            actionState.validation === 'done' && "bg-emerald-900/30 text-emerald-400 border-emerald-500/30"
                                        )}
                                    >
                                        {actionState.validation === 'idle' && (isGodTier ? "심연 검증 시작" : "검증 루프 실행")}
                                        {actionState.validation === 'running' && <><Loader2 className="w-3 h-3 animate-spin" /> 무결성 검증 중...</>}
                                        {actionState.validation === 'done' && "✅ 검증 완료 (무결점)"}
                                    </button>

                                    <button
                                        onClick={handleEnterpriseClick}
                                        disabled={actionState.enterprise !== 'idle'}
                                        className={cn("px-2 py-0.5 text-[10px] font-black rounded uppercase border transition-all active:scale-95 disabled:opacity-100 disabled:scale-100 flex items-center gap-1 cursor-pointer",
                                            isGodTier ? "bg-black text-orange-400 border-orange-500/20 hover:bg-orange-900/30" : "bg-slate-800 text-green-400 border-green-500/20 hover:bg-slate-700",
                                            actionState.enterprise === 'running' && "bg-orange-900/50 text-orange-300 border-orange-400/50",
                                            actionState.enterprise === 'done' && "bg-green-900/30 text-green-400 border-green-500/30"
                                        )}
                                    >
                                        {actionState.enterprise === 'idle' && (isGodTier ? "초월적 망 연결" : "엔터프라이즈급 연동")}
                                        {actionState.enterprise === 'running' && <><Loader2 className="w-3 h-3 animate-spin" /> 보안 터널 협상 중...</>}
                                        {actionState.enterprise === 'done' && "⚡ 엔터프라이즈 보안망 연결됨"}
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => {
                                        setPhase('refining');
                                        setExecutionState('idle');
                                        setExecutionResult('');
                                    }}
                                    className="p-3 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all border border-slate-700"
                                >
                                    <RefreshCcw className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={copyToClipboard}
                                    className={cn("flex items-center gap-2 px-6 py-3 rounded-xl font-bold shadow-xl transition-all active:scale-95", isGodTier ? "bg-teal-600 hover:bg-teal-500 text-black shadow-teal-600/20" : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20")}
                                >
                                    <Copy className="w-4 h-4" />
                                    블루프린트 복사
                                </button>
                                <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl px-1.5 py-1.5 pl-3">
                                    <span className="text-xs font-bold text-slate-400">출력 포맷:</span>
                                    <select
                                        value={executionFormat}
                                        onChange={(e) => setExecutionFormat(e.target.value)}
                                        disabled={executionState === 'running'}
                                        className="bg-transparent text-sm font-bold text-slate-200 outline-none cursor-pointer py-1"
                                    >
                                        <option value="default" className="bg-slate-800">기본 텍스트</option>
                                        <option value="report" className="bg-slate-800">보고서 (Report)</option>
                                        <option value="json" className="bg-slate-800">데이터 (JSON)</option>
                                        <option value="email" className="bg-slate-800">메일링 (News Letter)</option>
                                        <option value="ppt" className="bg-slate-800">프레젠테이션 (PPT Outline)</option>
                                        <option value="audio" className="bg-slate-800">오디오 대본 (Audio)</option>
                                        <option value="video" className="bg-slate-800">비디오 대본 (Video)</option>
                                    </select>

                                    <button
                                        onClick={handleExecuteAI}
                                        disabled={executionState === 'running'}
                                        className={cn("flex items-center gap-2 ml-1 px-4 py-2 rounded-lg font-bold shadow-xl transition-all active:scale-95 disabled:opacity-70 disabled:scale-100",
                                            executionState === 'running' ? "bg-slate-700 text-white" :
                                                isGodTier ? "bg-orange-600 hover:bg-orange-500 text-white shadow-orange-600/20" : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20"
                                        )}
                                    >
                                        {executionState === 'running' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                                        {executionState === 'running' ? "로딩..." : "결과 출력"}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className={cn("flex-1 rounded-[2rem] border p-8 shadow-2xl relative group overflow-hidden flex flex-col", isGodTier ? "bg-black border-teal-500/30" : "bg-slate-950 border-slate-700/50")}>
                            <div className={cn("absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r", isGodTier ? "from-teal-600 via-emerald-600 to-orange-600" : "from-blue-600 via-indigo-600 to-purple-600")}></div>

                            {/* Execution Result Area (Moved to Top) */}
                            <AnimatePresence>
                                {executionState !== 'idle' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                        animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                        className="relative z-20"
                                    >
                                        <div className={cn("rounded-2xl border p-6 shadow-2xl backdrop-blur-md",
                                            executionState === 'success' ? "bg-slate-900/90 border-indigo-500/40 ring-1 ring-indigo-500/20" :
                                                executionState === 'error' ? "bg-rose-950/20 border-rose-500/30" :
                                                    "bg-slate-900/60 border-slate-700/50"
                                        )}>
                                            <div className="flex items-center gap-2 mb-4 border-b border-slate-700/50 pb-3">
                                                {executionState === 'running' && <Loader2 className="w-5 h-5 animate-spin text-blue-400" />}
                                                {executionState === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                                                {executionState === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
                                                <h4 className="font-bold text-slate-100 flex-1 flex items-center gap-2 text-lg">
                                                    {executionState === 'running' && "AI가 블루프린트를 해석하고 결과를 도출 중입니다..."}
                                                    {executionState === 'success' && (
                                                        <>
                                                            최종 실행 결과
                                                            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-black rounded border border-emerald-500/30 uppercase tracking-widest">DEFINITIVE</span>
                                                        </>
                                                    )}
                                                    {executionState === 'error' && "실행 오류"}
                                                </h4>
                                                {executionState === 'success' && (
                                                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] font-bold rounded border border-blue-500/30 uppercase tracking-tighter">
                                                        Format: {executionFormat}
                                                    </span>
                                                )}
                                            </div>

                                            {executionResult && (
                                                <div className="mt-4">
                                                    {executionFormat === 'ppt' ? (
                                                        <div className="space-y-4">
                                                            <div className="flex items-center justify-between mb-4">
                                                                <h5 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                                                                    <Presentation className="w-4 h-4 text-orange-400" />
                                                                    프레젠테이션 슬라이드 미리보기
                                                                </h5>
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        onClick={handlePPTDownload}
                                                                        disabled={isDownloading}
                                                                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-xl border border-indigo-400/30 text-xs font-bold transition-all shadow-lg group/dl"
                                                                    >
                                                                        {isDownloading ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileDown className="w-3 h-3 group-hover/dl:translate-y-0.5 transition-transform" />}
                                                                        {isDownloading ? "다운로드 중..." : "PPTX 다운로드"}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            navigator.clipboard.writeText(executionResult);
                                                                            alert('슬라이드 구성안이 복사되었습니다.');
                                                                        }}
                                                                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg border border-slate-700 transition-all"
                                                                        title="구성안 복사"
                                                                    >
                                                                        <Copy className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={handleImageGeneration}
                                                                        disabled={isGeneratingImage || !!pptBackground}
                                                                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 text-white rounded-xl border border-purple-400/30 text-xs font-bold transition-all shadow-lg group/img"
                                                                        title="슬라이드 배경 이미지 생성"
                                                                    >
                                                                        {isGeneratingImage ? <Loader2 className="w-3 h-3 animate-spin" /> : <ImageIcon className="w-3 h-3 group-hover/img:scale-110 transition-transform" />}
                                                                        {isGeneratingImage ? "이미지 생성 중..." : (pptBackground ? "배경 이미지 생성됨" : "배경 이미지 생성")}
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-6">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <button
                                                                        onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                                                                        disabled={currentSlideIndex === 0}
                                                                        className="px-4 py-2 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/40 rounded-lg disabled:opacity-50 font-bold text-sm transition-all shadow-md active:scale-95"
                                                                    >
                                                                        이전 슬라이드
                                                                    </button>
                                                                    <span className="text-slate-300 font-bold px-4 py-1.5 bg-slate-900 rounded-lg border border-slate-700 text-sm shadow-inner">
                                                                        Slide {currentSlideIndex + 1} / {parsePPTSlides(executionResult).length}
                                                                    </span>
                                                                    <button
                                                                        onClick={() => setCurrentSlideIndex(Math.min(parsePPTSlides(executionResult).length - 1, currentSlideIndex + 1))}
                                                                        disabled={currentSlideIndex === parsePPTSlides(executionResult).length - 1 || parsePPTSlides(executionResult).length === 0}
                                                                        className="px-4 py-2 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/40 rounded-lg disabled:opacity-50 font-bold text-sm transition-all shadow-md active:scale-95"
                                                                    >
                                                                        다음 슬라이드
                                                                    </button>
                                                                </div>
                                                                <div className="w-full flex justify-center">
                                                                    {(() => {
                                                                        const parsedSlides = parsePPTSlides(executionResult);
                                                                        const slide = parsedSlides[currentSlideIndex];
                                                                        const idx = currentSlideIndex;
                                                                        if (!slide) return null;
                                                                        return (
                                                                            <motion.div
                                                                                key={idx}
                                                                                initial={{ opacity: 0, x: 20 }}
                                                                                animate={{ opacity: 1, x: 0 }}
                                                                                className={cn(
                                                                                    "w-full max-w-4xl aspect-video rounded-2xl border flex flex-col shadow-2xl relative overflow-hidden bg-[#042F2E]",
                                                                                    slide.isTitleSlide
                                                                                        ? "border-amber-500/50"
                                                                                        : "border-slate-800"
                                                                                )}
                                                                            >
                                                                                {/* Background Image Layer (Always at Bottom) */}
                                                                                <div className="absolute inset-0 z-0">
                                                                                    {slideImages[idx] ? (
                                                                                        <img
                                                                                            src={slideImages[idx]}
                                                                                            alt="Background"
                                                                                            className="w-full h-full object-cover"
                                                                                        />
                                                                                    ) : (
                                                                                        <div className="w-full h-full bg-slate-900/40 backdrop-blur-sm" />
                                                                                    )}
                                                                                    {/* Universal Scrim to push text forward */}
                                                                                    <div className="absolute inset-0 bg-black/30 backdrop-brightness-75"></div>
                                                                                </div>

                                                                                {slide.isTitleSlide ? (
                                                                                    <div className="relative z-10 flex flex-col items-center justify-center text-center h-full p-12 bg-black/20 backdrop-blur-[2px]">
                                                                                        {/* Central Hexagon Logo */}
                                                                                        <div className="w-16 h-16 bg-amber-500 rounded-lg flex items-center justify-center mb-6 shadow-lg shadow-amber-500/20 border-2 border-white/20 transform rotate-12">
                                                                                            <Zap className="w-8 h-8 text-[#042F2E] fill-[#042F2E]" />
                                                                                        </div>

                                                                                        <h4 className="text-4xl font-black text-amber-400 mb-4 tracking-tight leading-tight max-w-[90%] drop-shadow-lg">
                                                                                            {slide.title}
                                                                                        </h4>

                                                                                        <div className="h-0.5 w-24 bg-white/20 mb-4"></div>

                                                                                        <p className="text-xs font-bold text-white/60 tracking-[0.4em] uppercase mb-12 drop-shadow-md">
                                                                                            Digital Recipe & AI Agritech Revolution
                                                                                        </p>

                                                                                        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest opacity-60">
                                                                                            <div className="flex items-center gap-3">
                                                                                                <div className={cn(
                                                                                                    "p-2 rounded-xl bg-gradient-to-br",
                                                                                                    architectureType === 'strategic-architect' ? "from-indigo-500/20 to-purple-500/20 text-indigo-400" :
                                                                                                        architectureType === 'corporate-strategy' ? "from-emerald-500/20 to-teal-500/20 text-emerald-400" :
                                                                                                            "from-slate-800 to-slate-900 text-slate-400"
                                                                                                )}>
                                                                                                    {architectureType === 'strategic-architect' ? <ShieldCheck className="w-5 h-5" /> :
                                                                                                        architectureType === 'corporate-strategy' ? <Globe className="w-5 h-5" /> :
                                                                                                            <Box className="w-5 h-5" />}
                                                                                                </div>
                                                                                                <div className="text-left">
                                                                                                    <div className="text-xs font-bold text-white mb-0.5">
                                                                                                        {architectureType === 'strategic-architect' ? 'Meta-Architect Mode' :
                                                                                                            architectureType === 'corporate-strategy' ? 'Global Strategy & Market Entry' :
                                                                                                                'Standard Blueprint'}
                                                                                                    </div>
                                                                                                    <div className="text-[10px] text-slate-500 font-medium">Click to change architecture</div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                ) : (
                                                                                    <div className="relative z-10 w-full h-full rounded-2xl overflow-hidden group/canvas ring-1 ring-inset ring-slate-800 shadow-2xl bg-gradient-to-br from-slate-900 to-slate-800 flex">
                                                                                        {slide.isTitleSlide || (idx === 0) ? (
                                                                                            // --- TITLE SLIDE (FULL BLEED) ---
                                                                                            <>
                                                                                                <div className="absolute inset-0 w-full h-full">
                                                                                                    <img src={slideImages[idx] || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop'} className="w-full h-full object-cover grayscale-[0.3] transition-transform duration-1000 group-hover/canvas:scale-105" alt="Title Background" />
                                                                                                </div>
                                                                                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/70 to-transparent pointer-events-none" />
                                                                                                <div className="relative z-20 flex flex-col justify-end p-10 h-full w-full">
                                                                                                    <div className="w-10 h-1.5 bg-blue-500 mb-6 rounded-full" />
                                                                                                    <h4 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight break-keep drop-shadow-2xl">
                                                                                                        {slide.title}
                                                                                                    </h4>
                                                                                                    <ul className="space-y-3 pr-6">
                                                                                                        {slide.bullets.map((bullet, bIdx) => (
                                                                                                            <li key={bIdx} className="text-lg md:text-xl text-slate-300 font-medium break-keep drop-shadow-md">
                                                                                                                {bullet}
                                                                                                            </li>
                                                                                                        ))}
                                                                                                    </ul>
                                                                                                </div>
                                                                                            </>
                                                                                        ) : slideImages[idx] ? (
                                                                                            // --- CONTENT SLIDE (50/50 SIDE IMAGE) ---
                                                                                            <div className="flex w-full h-full">
                                                                                                <div className="w-[55%] relative z-20 flex flex-col p-8 pt-6 h-full bg-slate-900 border-r border-white/5">
                                                                                                    <div className="flex items-center gap-2 mb-3 shrink-0 opacity-60">
                                                                                                        <span className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.3em] border-b border-cyan-500/30 pb-1">Slide {idx + 1}</span>
                                                                                                    </div>
                                                                                                    <h4 className="text-xl md:text-3xl font-black text-white mb-3 leading-tight shrink-0 break-keep">
                                                                                                        {slide.title}
                                                                                                    </h4>
                                                                                                    <div className="h-[1px] w-full bg-slate-800 mb-6 shrink-0"></div>
                                                                                                    <ul className="space-y-6 overflow-y-auto custom-scrollbar-thin pr-4 flex-1 pb-4 min-h-0">
                                                                                                        {slide.bullets.map((bullet, bIdx) => (
                                                                                                            <li key={bIdx} className="flex items-start gap-4">
                                                                                                                <div className="w-2 h-2 rounded-sm bg-cyan-400 mt-2 shrink-0 rotate-45" />
                                                                                                                <span className="text-sm md:text-base text-slate-300 leading-relaxed font-semibold break-keep">
                                                                                                                    {bullet}
                                                                                                                </span>
                                                                                                            </li>
                                                                                                        ))}
                                                                                                    </ul>
                                                                                                </div>
                                                                                                <div className="w-[45%] relative overflow-hidden bg-slate-950">
                                                                                                    <img src={slideImages[idx]} className="w-full h-full object-cover opacity-70 mix-blend-luminosity transition-transform duration-1000 group-hover/canvas:scale-105 relative z-10" alt="" />
                                                                                                    <div className="absolute inset-0 bg-gradient-to-l from-slate-900 via-slate-900/50 to-transparent pointer-events-none" />
                                                                                                </div>
                                                                                            </div>
                                                                                        ) : (
                                                                                            // --- CONTENT SLIDE (CENTERED TYPOGRAPHY / DATA EMPHASIS) ---
                                                                                            <div className="relative w-full h-full flex flex-col items-center justify-start pt-6 text-center bg-slate-900 min-h-0">
                                                                                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.08),transparent_70%)] pointer-events-none" />
                                                                                                <div className="flex items-center gap-2 mb-4 shrink-0 relative z-10 opacity-60">
                                                                                                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] border-b border-blue-500/30 pb-1">Slide {idx + 1}</span>
                                                                                                </div>
                                                                                                <h4 className="text-2xl md:text-4xl font-black text-white mb-4 leading-tight shrink-0 break-keep max-w-4xl relative z-10 drop-shadow-lg px-12">
                                                                                                    {slide.title}
                                                                                                </h4>
                                                                                                <div className="h-[1px] w-32 bg-slate-800 mx-auto mb-6 shrink-0"></div>
                                                                                                <ul className="space-y-6 w-full max-w-4xl relative z-10 flex-1 overflow-y-auto custom-scrollbar-thin px-12 pb-12 min-h-0 scroll-pt-6">
                                                                                                    {slide.bullets.map((bullet, bIdx) => (
                                                                                                        <li key={bIdx} className="flex flex-col items-center">
                                                                                                            <div className="bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm rounded-2xl py-5 px-8 w-full shadow-2xl transition-all hover:bg-slate-800/60 hover:border-blue-500/30">
                                                                                                                <span className="text-base md:text-lg text-blue-50 leading-relaxed font-bold break-keep">
                                                                                                                    {bullet}
                                                                                                                </span>
                                                                                                            </div>
                                                                                                        </li>
                                                                                                    ))}
                                                                                                </ul>
                                                                                            </div>
                                                                                        )}
                                                                                        {/* Bottom Contrast Accent */}
                                                                                        <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-transparent z-30"></div>
                                                                                    </div>
                                                                                )}
                                                                            </motion.div>
                                                                        );
                                                                    })()}
                                                                </div>
                                                            </div>

                                                            <div className="pt-4 border-t border-slate-800">
                                                                <details className="group">
                                                                    <summary className="text-[10px] font-bold text-slate-500 cursor-pointer hover:text-slate-300 list-none flex items-center gap-1">
                                                                        <FileText className="w-3 h-3" />
                                                                        원문 텍스트 보기
                                                                    </summary>
                                                                    <pre className="mt-2 text-[10px] text-slate-500 bg-black/30 p-3 rounded-lg border border-white/5 whitespace-pre-wrap max-h-40 overflow-y-auto">
                                                                        {executionResult}
                                                                    </pre>
                                                                </details>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="group/result relative">
                                                            <div className="absolute top-2 right-2 flex items-center gap-2 opacity-100 transition-opacity z-10">
                                                                <button
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(executionResult);
                                                                        alert('결과물이 클립보드에 복사되었습니다.');
                                                                    }}
                                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 text-[10px] font-bold transition-all shadow-lg"
                                                                >
                                                                    <Copy className="w-3 h-3" />
                                                                    결과물 복사
                                                                </button>
                                                            </div>
                                                            <div className="max-h-[800px] overflow-y-auto custom-scrollbar pr-2 bg-slate-950/50 rounded-xl border border-slate-800/50 p-6">
                                                                <pre className="font-sans text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{executionResult}</pre>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {executionError && (
                                                <div className="text-rose-400 text-sm">{executionError}</div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Architect/Engineer Note (Now below results) */}
                            <div className={cn("mb-6 p-6 rounded-2xl border", isGodTier ? "bg-teal-950/20 border-teal-900/50" : "bg-slate-900/50 border-slate-800")}>
                                <h5 className={cn("text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2", isGodTier ? "text-orange-400" : "text-blue-400")}>
                                    <Beaker className="w-3 h-3" />
                                    {isGodTier ? "아키텍트 노트 (SESS-01)" : "엔지니어 노트"}
                                </h5>
                                <p className={cn("text-xs leading-relaxed", isGodTier ? "text-teal-100/70" : "text-slate-400")}>
                                    {isGodTier ? (
                                        <>이 블루프린트는 시장을 지배하기 위해 <span className="text-teal-300 font-bold">극한의 교차 검증</span>을 사용합니다. AI가 최종 출력 전에 <span className="text-orange-300 font-bold">데스밸리 생존 전략</span>과 <span className="text-orange-300 font-bold">자가 교정 루프</span>를 모두 소화하도록 강제되었습니다. 일반적인 LLM에서는 심각한 부하가 발생할 수 있습니다.</>
                                    ) : (
                                        <>이 블루프린트는 정밀한 LLM 해석을 위해 <span className="text-white font-bold">XML 태그 구조</span>를 사용합니다. AI가 최종 출력 전에 추론을 검증하도록 <span className="text-white font-bold">자가 교정 루프</span>가 포함되었습니다. GPT 5.4, Claude Sonnet 4.6, Gemini 3.1 Pro 이상 모델 사용을 권장합니다.</>
                                    )}
                                </p>
                            </div>

                            {/* Collapsible Master Blueprint (Technical details) */}
                            <details className="group/blueprint border border-slate-800/50 rounded-2xl overflow-hidden transition-all hover:border-slate-700">
                                <summary className="p-4 bg-slate-900/30 cursor-pointer list-none flex items-center justify-between group-open/blueprint:bg-slate-900/60">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 rounded-lg bg-slate-800 text-slate-400 group-hover/blueprint:text-blue-400 transition-colors">
                                            <Terminal className="w-4 h-4" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover/blueprint:text-slate-300">Technical Master Blueprint</span>
                                            <span className="text-[9px] font-mono text-slate-600">{isGodTier ? "sess_01_god_tier_output_stream.xml" : "blueprint_output_stream.xml"}</span>
                                        </div>
                                    </div>
                                    <ChevronDown className="w-4 h-4 text-slate-600 group-open/blueprint:rotate-180 transition-transform" />
                                </summary>

                                <div className="p-6 bg-black/40 border-t border-slate-800/50">
                                    <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar max-h-[400px]">
                                        <pre className={cn("font-mono text-sm leading-relaxed whitespace-pre-wrap", isGodTier ? "text-teal-50/60 selection:bg-teal-500/40" : "text-blue-50/60 selection:bg-blue-500/40")}>
                                            {engineeredPrompt}
                                        </pre>
                                    </div>
                                </div>
                            </details>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
