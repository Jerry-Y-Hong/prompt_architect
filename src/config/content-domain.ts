export interface ContentTemplate {
    id: string;
    title: string;
    description: string;
    icon: string;
    basePrompt: string;
    specializedLogic: string;
}

export const contentTemplates: ContentTemplate[] = [
    {
        id: "trend-surfer",
        title: "🏄‍♂️ Trend Surfer (트렌드 서퍼)",
        description: "현재 알고리즘에서 가장 뜨거운 내 분야의 유행 포맷 자동 스캔 및 적용",
        icon: "🌊",
        basePrompt: "You are a real-time viral trend analyst. The user wants to surf the current algorithmic wave in their specific niche. Provide the 3 most viral content formats/trends currently working right now in this niche, and engineer a prompt utilizing one of them.",
        specializedLogic: `
    - Identify the current meta in the selected niche (e.g., specific audio trends, transitions, or storytelling structures).
    - Map the chosen trend exactly to the psychological hooks and target audience.
    - Output an actionable blueprint for the creator to immediately replicate the trend with their own unique twist.
    `
    },
    {
        id: "short-form-viral",
        title: "Viral Short-Form Script",
        description: "TikTok, Reels, Shorts 용 60초 바이럴 스크립트 작성",
        icon: "📱",
        basePrompt: "You are a top-tier viral content producer and social media strategist specialized in short-form video algorithms (TikTok, IG Reels, YouTube Shorts). Your goal is to generate highly engaging script skeletons and hook variations based on the user's topic, target audience, and emotional triggers.",
        specializedLogic: `
    - Optimize the hook to capture attention within the first 3 seconds using the Curiosity Gap or Pain-point.
    - Structure the body to follow a high-retention dopamine curve (fast pacing, constant visual changes indicated in the script).
    - Provide a clear, compelling Call-to-Action (CTA) designed to maximize algorithmic engagement (saves, shares, loops).
    `
    },
    {
        id: "youtube-long-form",
        title: "YouTube Deep-Dive Video",
        description: "정보 전달 및 스토리텔링 중심의 유튜브 롱폼 기획",
        icon: "▶️",
        basePrompt: "You are a master YouTube storyteller and content strategist specializing in mid-to-long form informational and entertaining videos. Your goal is to structure a compelling narrative arc, suggest A/B testable titles, and design thumbnail concepts.",
        specializedLogic: `
    - Design 5 distinct click-worthy YouTube titles leveraging emotional triggers, curiosity, and high CTR formulas without being pure clickbait.
    - Suggest 3 distinct visual concepts for the video thumbnail that perfectly complement the titles.
    - Provide a robust story structure (Introduction/Hook, Context phase, Escalation/Core Value, Climax, Resolution/CTA).
    `
    },
    {
        id: "copywriting-ad",
        title: "Conversion Ad Copy",
        description: "구매 전환율을 극대화하는 페이스북/인스타 광고 카피",
        icon: "💰",
        basePrompt: "You are a direct-response copywriting expert and performance marketer. Your goal is to generate ad copy variations that drive immediate action (clicks and conversions) based on human psychology and pain points.",
        specializedLogic: `
    - Generate variations based on different psychological angles: 1) FOMO (Fear Of Missing Out), 2) Pain/Agitate/Solve (PAS), 3) Aspirational/Transformation.
    - Keep sentences punchy, scannable, and optimized for mobile reading.
    - Include primary text, headline, and concise description optimized for Meta (Facebook/Instagram) ad placements.
    `
    }
];

export const contentNiches = [
    "Tech & Gadgets (IT/테크)",
    "Beauty & Fashion (뷰티/패션)",
    "Finance & Web3 (재테크/경제)",
    "Comedy & Skits (코미디/상황극)",
    "Vlog & Lifestyle (일상/브이로그)",
    "Knowledge & Edutainment (지식/정보)",
    "Travel & Tourism (국내외 여행)",
    "Real Estate & Housing (주거/부동산)"
];

export const contentTargetAudiences = [
    "Male / 20-30s (2030 남성)",
    "Female / 20-30s (2030 여성)",
    "Gen Z / Students (1020 학생/Z세대)",
    "Young Professionals (사회초년생/직장인)",
    "Entrepreneurs (1인 기업가/사업가)",
    "Parents / Family (육아/학부모)",
    "Tech & IT Enthusiasts (테크/IT 관심층)",
    "Financial Investors (재테크/투자자)",
    "Global Audience (글로벌 타겟)",
    "Mass Appeal (남녀노소 누구나)"
];

export const contentEmotionalHooks = [
    "Curiosity (궁금증 유발)",
    "FOMO (소외에 대한 두려움)",
    "Pain-point Relief (고통/불만 해결)",
    "Dopamine Hit (쾌감/만족감 부여)",
    "Inspirational (영감/동기 부여)",
    "Shock & Awe (충격/반전)"
];
