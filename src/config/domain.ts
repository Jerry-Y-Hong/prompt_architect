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
        title: '만능 도우미 (일반)',
        description: '요약, 번역, 간단한 질문 등 무엇이든 물어보세요. 내용을 깔끔하게 정리해주는 가장 기본적이고 똑똑한 친구입니다.',
        icon: '✨',
        tags: ['어디에나', '깔끔정리', '믿음직함']
    },
    {
        id: 'ui-design',
        title: '화면 꾸미기 전문가',
        description: '멋진 웹사이트나 앱의 디자인을 도와드려요. 화면 구성을 어떻게 하면 예쁠지 고민될 때 찾아주세요.',
        icon: '🎨',
        tags: ['예쁜화면', '사용사편의', '아이디어']
    },
    {
        id: 'python-expert',
        title: '컴퓨터 언어 선생님',
        description: '복잡한 계산이나 파이썬 코드가 필요할 때 차근차근 알려드립니다. 어려운 논리도 쉽게 풀어서 설명해 드려요.',
        icon: '🐍',
        tags: ['코딩도움', '논리수업', '똑똑함']
    },
    {
        id: 'ecommerce-strategist',
        title: '쇼핑몰 사장님',
        description: '물건을 어떻게 하면 더 잘 팔 수 있을까요? 매출을 올리기 위한 비즈니스 아이디어와 마케팅 문구를 대신 고민해 드립니다.',
        icon: '💼',
        tags: ['매출상승', '마케팅', '비즈니스']
    },
    {
        id: 'strategic-architect',
        title: '천재 아키텍트 (최고 전문가)',
        description: '가장 복잡하고 어려운 문제도 스스로 생각하고 해결책을 찾아냅니다. 여러분의 아이디어를 완벽한 전략으로 완성해 주는 최고의 엔진이에요.',
        icon: '🌌',
        tags: ['스스로생각', '완벽추구', '최고도움']
    }
];
