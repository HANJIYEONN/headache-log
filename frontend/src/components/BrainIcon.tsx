// BrainIcon : 이모지 대신 쓰는 직접 그린 뇌 아이콘
// SVG = 점과 선으로 그린 그림. 색은 currentColor를 써서
// 부모 요소의 text 색을 그대로 물려받아요 (색상 커스터마이징 쉬움)
export default function BrainIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 뇌 바깥 윤곽 (좌우 반구) */}
      <path
        d="M18 8c-3.5 0-6 2.2-6.6 5.2C8.6 14 7 16.6 7 19.5c0 2 .8 3.8 2.1 5.1-.7 1.2-1.1 2.6-1.1 4.1 0 3.9 2.9 7.1 6.7 7.6.9 2.2 3.1 3.7 5.6 3.7 1.6 0 3-.6 4.1-1.6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M30 8c3.5 0 6 2.2 6.6 5.2 2.8.8 4.4 3.4 4.4 6.3 0 2-.8 3.8-2.1 5.1.7 1.2 1.1 2.6 1.1 4.1 0 3.9-2.9 7.1-6.7 7.6-.9 2.2-3.1 3.7-5.6 3.7-1.6 0-3-.6-4.1-1.6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 가운데 세로선 (좌우 반구 경계) */}
      <path
        d="M24 10v28"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* 주름 표현 (짧은 곡선 몇 개) */}
      <path
        d="M14 17c1.5 1 3.3 1 4.6-.2M13 24c1.6.9 3.5.7 4.8-.5M15 31c1.4.7 3 .5 4-.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M34 17c-1.5 1-3.3 1-4.6-.2M35 24c-1.6.9-3.5.7-4.8-.5M33 31c-1.4.7-3 .5-4-.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
