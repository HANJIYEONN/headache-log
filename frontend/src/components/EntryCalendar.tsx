"use client";

// ─────────────────────────────────────────────
// EntryCalendar : 달력에서 두통 있던 날을 한눈에 보는 컴포넌트
// 날짜 계산은 자바스크립트 내장 Date 객체로 직접 해봐요 (라이브러리 없이!)
// ─────────────────────────────────────────────

import { useState } from "react";
import type { Entry } from "@/lib/api";

type Props = {
  entries: Entry[];
};

// "2026-07" 처럼 연-월 문자열 만들기 (월은 0부터 세니까 +1)
function ym(year: number, month: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

export default function EntryCalendar({ entries }: Props) {
  const today = new Date();
  // 지금 보고 있는 연/월을 state로 기억 (◀ ▶ 버튼으로 바뀜)
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0 = 1월
  // 클릭해서 선택한 날짜 ("2026-07-15" 형태)
  const [selected, setSelected] = useState<string | null>(null);

  // 이번 달 1일이 무슨 요일인지(0=일요일), 이번 달이 며칠까지 있는지
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate(); // 다음 달 0일 = 이번 달 마지막 날

  // 날짜별 기록 개수를 미리 세어두기 { "2026-07-15": 2, ... }
  const countByDate: Record<string, number> = {};
  for (const e of entries) {
    countByDate[e.entry_date] = (countByDate[e.entry_date] ?? 0) + 1;
  }

  // 선택한 날의 기록들
  const selectedEntries = entries.filter((e) => e.entry_date === selected);

  // 이전/다음 달로 이동
  function moveMonth(delta: number) {
    const d = new Date(year, month + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
    setSelected(null);
  }

  // 달력 칸 만들기: 앞쪽 빈 칸(null) + 1일~말일
  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="space-y-4">
      {/* 월 이동 헤더 */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => moveMonth(-1)}
          className="rounded-lg border border-[#d4efe8] bg-white px-3 py-1 hover:bg-[#eef8f5]"
        >
          이전 달
        </button>
        <p className="font-bold text-[#1f4d44]">{ym(year, month)}</p>
        <button
          onClick={() => moveMonth(1)}
          className="rounded-lg border border-[#d4efe8] bg-white px-3 py-1 hover:bg-[#eef8f5]"
        >
          다음 달
        </button>
      </div>

      {/* 요일 줄 + 날짜 격자 (grid-cols-7 = 7칸씩) */}
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
          <div key={day} className="py-1 font-semibold text-gray-500">
            {day}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />;
          const dateStr = `${ym(year, month)}-${String(day).padStart(2, "0")}`;
          const count = countByDate[dateStr] ?? 0;
          const isSelected = selected === dateStr;
          return (
            <button
              key={dateStr}
              onClick={() => setSelected(isSelected ? null : dateStr)}
              className={`rounded-lg py-2 transition ${
                count > 0
                  ? "bg-[#a7e3d5] font-semibold text-[#1f4d44] hover:bg-[#8fd9c8]"
                  : "bg-white hover:bg-[#eef8f5]"
              } ${isSelected ? "ring-2 ring-[#178f76]" : ""}`}
            >
              {day}
              {/* 기록 있는 날은 개수 표시 */}
              {count > 0 && <span className="block text-[10px]">{count}건</span>}
            </button>
          );
        })}
      </div>

      {/* 선택한 날의 상세 기록 */}
      {selected && (
        <div className="rounded-xl border border-[#d4efe8] bg-white p-4 text-sm">
          <p className="mb-2 font-bold text-[#1f4d44]">{selected}</p>
          {selectedEntries.length === 0 ? (
            <p className="text-gray-500">이 날은 기록이 없어요.</p>
          ) : (
            selectedEntries.map((e) => (
              <p key={e.id} className="text-gray-700">
                {e.medication ?? "약"} {e.dose_count ?? "-"}회 · 효과 {e.effective ? "있음" : "없음"}
                {e.trigger && ` · ${e.trigger}`}
                {e.menstruating && " · 생리기간"}
                {e.bp_systolic && ` · 혈압 ${e.bp_systolic}/${e.bp_diastolic}`}
              </p>
            ))
          )}
        </div>
      )}
    </div>
  );
}
