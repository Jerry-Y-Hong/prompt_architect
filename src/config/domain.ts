export interface ArchitectureTemplate {
    id: string;
    title: string;
    description: string;
    icon: string;
    tags: string[];
}

export const ARCHITECTURE_TEMPLATES: ArchitectureTemplate[] = [
    {
        id: 'general',
        title: '범용 프로세서(General)',
        description: 'XML 태그 구조를 가진 모든 작업용 다목적 프롬프트.',
        icon: '✨',
        tags: ['표준', 'XML', '견고함']
    },
    {
        id: 'ui-design',
        title: 'UI 디자인 프롬프트',
        description: '자가 교정 루프가 포함된 전문가 수준의 디자인 요구사항.',
        icon: '🎨',
        tags: ['디자인', '엔지니어링', 'UX']
    },
    {
        id: 'python-expert',
        title: '파이썬 전문가',
        description: '로직 우선 체이닝을 통한 알고리즘 중심 설계.',
        icon: '🐍',
        tags: ['코드', '논리적', '기술적']
    },
    {
        id: 'ecommerce-strategist',
        title: '이커머스 전략가',
        description: '전환 및 스케일업을 위한 비즈니스 중심 프롬프트.',
        icon: '💼',
        tags: ['비즈니스', 'ROI', '복합']
    },
    {
        id: 'strategic-architect',
        title: '메타 아키텍트 (God-Tier Strategy)',
        description: '제1원칙 원리와 자가 교정 알고리즘을 결합한 궁극의 프롬프트 코어 엔진.',
        icon: '🌌',
        tags: ['제네시스 로직', '시스템 파괴', '메타인지']
    }
];
