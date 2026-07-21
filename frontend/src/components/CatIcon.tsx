// CatIcon : world-holicat 브랜드용 고양이 얼굴 아이콘
// BrainIcon과 같은 방식: currentColor로 부모의 글자색을 물려받아요
export default function CatIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 얼굴 윤곽 + 두 귀 (한 붓으로 이어 그린 모양) */}
      <path
        d="M14 16 L11 7 L20 13 A16 13 0 0 1 28 13 L37 7 L34 16 A15 14 0 1 1 14 16 Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* 두 눈 */}
      <path d="M18 24 v2 M30 24 v2" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      {/* 코 */}
      <path d="M22.5 29 L24 30.5 L25.5 29" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      {/* 입 */}
      <path d="M24 30.5 v2.2 M24 32.7 q-2.5 2 -4.5 0 M24 32.7 q2.5 2 4.5 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      {/* 수염 */}
      <path d="M8 26 l6 1 M8 30 l6 -0.5 M40 26 l-6 1 M40 30 l-6 -0.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
