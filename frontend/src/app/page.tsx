"use client";
// ↑ 버튼 클릭·입력 같은 상호작용이 있는 화면이라 클라이언트 컴포넌트로 선언!

// ─────────────────────────────────────────────
// page.tsx : 메인 페이지
// Next.js에서는 app/page.tsx 파일이 곧 "첫 화면(/)"이 돼요
// ─────────────────────────────────────────────

import { useCallback, useEffect, useState } from "react";
import EntryForm from "@/components/EntryForm";
import EntryTable from "@/components/EntryTable";
import EntryCalendar from "@/components/EntryCalendar";
import EntryCharts from "@/components/EntryCharts";
import { fetchEntries, deleteEntry, type Entry } from "@/lib/api";

// 탭 이름은 이 세 가지 중 하나만 가능하다고 타입으로 못박아요
type Tab = "list" | "calendar" | "chart";

const TABS: { key: Tab; label: string }[] = [
  { key: "list", label: "목록" },
  { key: "calendar", label: "달력" },
  { key: "chart", label: "차트" },
];

export default function Home() {
  // 기록 목록을 기억하는 state
  const [entries, setEntries] = useState<Entry[]>([]);
  // 지금 열려 있는 탭
  const [tab, setTab] = useState<Tab>("list");

  // 백엔드에서 목록을 불러오는 함수
  const load = useCallback(async () => {
    try {
      setEntries(await fetchEntries());
    } catch {
      // 백엔드가 꺼져 있으면 일단 빈 목록으로 둬요
    }
  }, []);

  // useEffect : "페이지가 처음 열렸을 때 한 번 실행해줘"
  useEffect(() => {
    load();
  }, [load]);

  // 삭제 버튼 처리
  async function handleDelete(id: number) {
    await deleteEntry(id);
    load(); // 삭제 후 목록 다시 불러오기
  }

  return (
    <main className="mx-auto max-w-2xl space-y-8 p-6">
      <h1 className="text-2xl font-bold text-[#48a08e]">두통 기록 차트</h1>

      {/* 입력 폼 — 저장이 끝나면 onSaved로 load()가 실행돼서 목록이 새로고침돼요 */}
      <EntryForm onSaved={load} />

      {/* 3탭: 목록 / 달력 / 차트 */}
      <section className="space-y-4">
        {/* 탭 버튼 줄 — 지금 탭이면 진하게, 아니면 연하게 */}
        <div className="flex gap-2">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                tab === key
                  ? "bg-[#a7e3d5] text-[#1f4d44]"
                  : "bg-white text-gray-500 hover:bg-[#eef8f5]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 선택된 탭에 맞는 컴포넌트만 렌더링 (조건부 렌더링 또 등장!) */}
        {tab === "list" && <EntryTable entries={entries} onDelete={handleDelete} />}
        {tab === "calendar" && <EntryCalendar entries={entries} />}
        {tab === "chart" && <EntryCharts entries={entries} />}
      </section>
    </main>
  );
}
