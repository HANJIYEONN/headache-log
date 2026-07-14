"use client";
// ↑ 버튼 클릭·입력 같은 상호작용이 있는 화면이라 클라이언트 컴포넌트로 선언!

// ─────────────────────────────────────────────
// page.tsx : 메인 페이지
// Next.js에서는 app/page.tsx 파일이 곧 "첫 화면(/)"이 돼요
// ─────────────────────────────────────────────

import { useCallback, useEffect, useState } from "react";
import EntryForm from "@/components/EntryForm";
import { fetchEntries, deleteEntry, type Entry } from "@/lib/api";

export default function Home() {
  // 기록 목록을 기억하는 state
  const [entries, setEntries] = useState<Entry[]>([]);

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

      {/* 기록 목록 (임시 간단 버전 — 나중에 목록/달력/차트 3탭으로 업그레이드 예정!) */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold">최근 기록</h2>
        {entries.length === 0 && (
          <p className="text-sm text-gray-500">
            아직 기록이 없어요. 첫 기록을 남겨보세요!
          </p>
        )}
        {/* map : 배열의 각 항목을 화면 조각으로 하나씩 바꿔주는 반복 */}
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center justify-between rounded-xl border bg-white p-4 text-sm text-gray-900 shadow-sm"
          >
            <div>
              <p className="font-semibold">{entry.entry_date}</p>
              <p className="text-gray-600">
                {entry.took_painkiller
                  ? `약 ${entry.dose_count ?? "?"}회 복용 · ${entry.effective ? "효과 있음" : "효과 없음"}`
                  : "약 안 먹음"}
                {entry.trigger && ` · 촉발요인: ${entry.trigger}`}
                {entry.menstruating && " · 생리기간"}
              </p>
              {entry.bp_systolic && (
                <p className="text-gray-500">
                  혈압 {entry.bp_systolic}/{entry.bp_diastolic} · 맥박 {entry.bp_pulse}
                </p>
              )}
            </div>
            <button
              onClick={() => handleDelete(entry.id)}
              className="text-xs text-gray-400 hover:text-red-500"
            >
              삭제
            </button>
          </div>
        ))}
      </section>
    </main>
  );
}
