"use client";

// ─────────────────────────────────────────────
// CatSoon : 아직 안 만든 수첩 화면 자리 🚧
//
// 탭바에서 눌렀는데 404가 뜨면 길을 잃어요.
// 화면을 하나씩 만들면서 이 자리를 진짜 내용으로 바꿔갑니다.
// ─────────────────────────────────────────────

import CatIcon from "@/components/CatIcon";
import { PageTitle, useT } from "@/i18n/LanguageProvider";

export default function CatSoon({ title }: { title: string }) {
  const t = useT();

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <PageTitle title={`${title} · ${t.catNote.title}`} />

      <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#efe3c8] bg-[#fffdf5] text-[#dca92e]">
        <CatIcon className="h-8 w-8" />
      </span>

      <h1 className="mt-4 text-lg font-bold text-[#4a3a20]">{title}</h1>
      <p className="mt-1 text-sm text-[#a08c66]">{t.catNote.building1}</p>
    </main>
  );
}
