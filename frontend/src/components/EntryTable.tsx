"use client";

// ─────────────────────────────────────────────
// EntryTable : 기록을 표(테이블)로 보여주는 컴포넌트
// props로 기록 목록(entries)과 삭제 함수(onDelete)를 받아요
// ─────────────────────────────────────────────

import type { Entry } from "@/lib/api";

type Props = {
  entries: Entry[];
  onDelete: (id: number) => void;
  onEdit: (entry: Entry) => void; // 수정 버튼을 누르면 부모에게 알려줘요
};

export default function EntryTable({ entries, onDelete, onEdit }: Props) {
  if (entries.length === 0) {
    return <p className="text-sm text-gray-500">아직 기록이 없어요. 첫 기록을 남겨보세요!</p>;
  }

  return (
    // 표가 화면보다 넓으면 표 안에서만 가로 스크롤되게 감싸요
    <div className="overflow-x-auto rounded-xl border border-[#d4efe8] bg-white">
      <table className="w-full text-sm">
        {/* thead = 표의 머리(제목 줄) */}
        <thead>
          <tr className="border-b border-[#d4efe8] bg-[#eef8f5] text-left text-[#1f4d44]">
            <th className="p-3 font-semibold">날짜</th>
            <th className="p-3 font-semibold">약 종류</th>
            <th className="p-3 font-semibold">복용횟수</th>
            <th className="p-3 font-semibold">효과</th>
            <th className="p-3 font-semibold">촉발요인</th>
            <th className="p-3 font-semibold">생리기간</th>
            <th className="p-3 font-semibold">혈압(맥박)</th>
            <th className="p-3"></th>
          </tr>
        </thead>
        {/* tbody = 표의 몸통(데이터 줄들) */}
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} className="border-b border-[#eef8f5] last:border-0">
              <td className="p-3 font-medium">{entry.entry_date}</td>
              <td className="p-3">{entry.medication ?? "-"}</td>
              <td className="p-3">{entry.dose_count ?? "-"}회</td>
              <td className="p-3">{entry.effective ? "있음" : "없음"}</td>
              <td className="p-3">{entry.trigger ?? "-"}</td>
              <td className="p-3">{entry.menstruating ? "O" : "-"}</td>
              <td className="p-3">
                {entry.bp_systolic
                  ? `${entry.bp_systolic}/${entry.bp_diastolic} (${entry.bp_pulse})`
                  : "-"}
              </td>
              <td className="p-3 text-right">
                <button
                  onClick={() => onEdit(entry)}
                  className="mr-2 text-xs text-gray-400 hover:text-[#178f76]"
                >
                  수정
                </button>
                <button
                  onClick={() => onDelete(entry.id)}
                  className="text-xs text-gray-400 hover:text-red-500"
                >
                  삭제
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
