// CatIcon : world-holicat 브랜드 아이콘 — 식빵 고양이 🍞
// currentColor를 써서 부모의 글자색을 그대로 물려받아요
export default function CatIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 웅크린 몸통 + 두 귀 (식빵 자세) */}
      <path
        d="M8 34 Q8 22 16 20 L18 13 L22 18 Q24 17.5 26 18 L30 13 L32 20 Q40 22 40 34 Q40 36 38 36 L10 36 Q8 36 8 34 Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 두 눈 */}
      <circle cx="19" cy="27" r="1.6" fill="currentColor" />
      <circle cx="29" cy="27" r="1.6" fill="currentColor" />
      {/* 코 + 입 */}
      <path
        d="M24 29 v1.5 M24 30.5 q-1.5 1.3 -2.8 0 M24 30.5 q1.5 1.3 2.8 0"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
