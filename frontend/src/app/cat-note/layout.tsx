// ─────────────────────────────────────────────
// cat-note/layout.tsx : 고양이 수첩 화면들의 공통 틀
//
// 여기 넣어둔 것은 /cat-note 아래 **모든 화면**에 자동으로 붙어요.
//   - 크림색 배경 (수첩 시안 색)
//   - 아래쪽 탭바
// 화면을 새로 만들 때 탭바를 매번 붙이지 않아도 돼요.
// ─────────────────────────────────────────────

import CatTabBar from "@/components/CatTabBar";

export default function CatNoteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col bg-[#ede7d8]">
      {children}
      <CatTabBar />
    </div>
  );
}
