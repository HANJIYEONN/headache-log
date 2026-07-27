"use client";
// ↑ 언어 사전(useT)을 쓰려면 클라이언트 컴포넌트여야 해요

// ─────────────────────────────────────────────
// cat-note/page.tsx : 고양이 수첩 — 준비 중 안내 화면
// 아직 앱을 안 만들어서, 404 대신 이 화면을 보여줘요.
//
// 탭 제목은 <PageTitle> 이 언어에 맞게 정해줘요.
// (metadata 로 제목을 정해두면 서버가 정한 한국어 제목이 이겨버려서,
//  다국어 화면에서는 metadata 대신 PageTitle 을 써요)
// ─────────────────────────────────────────────

import Link from "next/link";
import CatIcon from "@/components/CatIcon";
import { PageTitle, useT } from "@/i18n/LanguageProvider";

export default function CatNotePage() {
  const t = useT();

  return (
    // 수첩 시안의 크림색 배경 (#ede7d8) 을 이 페이지에서만 써요
    <main className="flex flex-1 flex-col items-center justify-center bg-[#ede7d8] px-6 py-16 text-center">
      <PageTitle title={t.meta.catNote} />

      {/* 시안의 종이색 카드 (#fffdf5) */}
      <div className="w-full max-w-sm rounded-3xl border border-[#efe3c8] bg-[#fffdf5] px-8 py-10 shadow-sm">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#f5c64b] bg-[#fbefc9] text-[#b98a1f]">
          <CatIcon className="h-9 w-9" />
        </span>

        <h1 className="mt-5 text-2xl font-bold text-[#4a3a20]">{t.catNote.title}</h1>
        <p className="mt-1 text-sm text-[#a08c66]">{t.catNote.subtitle}</p>

        <p className="mt-6 text-sm leading-relaxed text-[#7a6a48]">
          {t.catNote.building1}
          <br />
          {t.catNote.building2}
        </p>

        <Link
          href="/"
          className="mt-8 inline-block rounded-2xl bg-[#f5c64b] px-7 py-3 text-sm font-bold text-[#4a3a20] shadow-[0_3px_0_#dca92e] transition hover:bg-[#f0bb38]"
        >
          {t.catNote.backHome}
        </Link>
      </div>
    </main>
  );
}
