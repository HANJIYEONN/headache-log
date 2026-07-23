// ─────────────────────────────────────────────
// cat-note/page.tsx : 고양이 수첩 — 준비 중 안내 화면
// 아직 앱을 안 만들어서, 404 대신 이 화면을 보여줘요.
// 'use client' 가 없으면 서버 컴포넌트예요 —
// 버튼 클릭 같은 상호작용이 없는 화면은 이게 더 가볍고,
// metadata(탭 제목)도 여기서 바로 내보낼 수 있어요.
// ─────────────────────────────────────────────

import type { Metadata } from "next";
import Link from "next/link";
import CatIcon from "@/components/CatIcon";

export const metadata: Metadata = {
  title: "고양이 수첩",
};

export default function CatNotePage() {
  return (
    // 수첩 시안의 크림색 배경 (#ede7d8) 을 이 페이지에서만 써요
    <main className="flex flex-1 flex-col items-center justify-center bg-[#ede7d8] px-6 py-16 text-center">
      {/* 시안의 종이색 카드 (#fffdf5) */}
      <div className="w-full max-w-sm rounded-3xl border border-[#efe3c8] bg-[#fffdf5] px-8 py-10 shadow-sm">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#f5c64b] bg-[#fbefc9] text-[#b98a1f]">
          <CatIcon className="h-9 w-9" />
        </span>

        <h1 className="mt-5 text-2xl font-bold text-[#4a3a20]">고양이 수첩</h1>
        <p className="mt-1 text-sm text-[#a08c66]">하루 다섯 문장 쓰는 글쓰기 수첩</p>

        <p className="mt-6 text-sm leading-relaxed text-[#7a6a48]">
          지금 열심히 만들고 있어요.
          <br />
          곧 콩이와 함께 만나요 🐾
        </p>

        <Link
          href="/"
          className="mt-8 inline-block rounded-2xl bg-[#f5c64b] px-7 py-3 text-sm font-bold text-[#4a3a20] shadow-[0_3px_0_#dca92e] transition hover:bg-[#f0bb38]"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </main>
  );
}
