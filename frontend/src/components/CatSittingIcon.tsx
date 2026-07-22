// CatSittingIcon : 앉은 고양이 (식빵 고양이에 마우스를 올리거나 누르면 일어나요!)
export default function CatSittingIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 앉은 몸통 + 머리 + 두 귀 (한 덩어리 실루엣) */}
      <path
        fill="currentColor"
        d="M15 11 L18 4 L23 9 Q24 8.7 25 9 L30 4 L33 11 A9 9 0 0 1 33.5 19.5 C35.5 22 36.5 26 36.5 31 L36.5 39 Q36.5 41.5 34 41.5 L14 41.5 Q11.5 41.5 11.5 39 L11.5 31 C11.5 26 12.5 22 14.5 19.5 A9 9 0 0 1 15 11 Z"
      />
      {/* 말린 꼬리 */}
      <path
        d="M35 40 q7 -1 6 -9 q-0.5 -4 -4 -4"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* 눈 (몸통 색 위에 흰색으로 뚫어요) */}
      <circle cx="20.5" cy="16" r="1.5" fill="#fff" />
      <circle cx="27.5" cy="16" r="1.5" fill="#fff" />
    </svg>
  );
}
