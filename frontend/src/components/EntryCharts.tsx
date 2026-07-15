"use client";

// ─────────────────────────────────────────────
// EntryCharts : 기록을 통계로 보여주는 컴포넌트
// 차트 라이브러리 없이 div의 너비/높이로 막대를 그려봐요!
// 막대 색 #178f76 은 배경과의 대비 검사를 통과한 민트예요
// ─────────────────────────────────────────────

import type { Entry } from "@/lib/api";

type Props = {
  entries: Entry[];
};

const BAR = "#178f76"; // 차트 막대 전용 민트 (연한 배경에서도 잘 보이는 진하기)

export default function EntryCharts({ entries }: Props) {
  if (entries.length === 0) {
    return <p className="text-sm text-gray-500">기록이 쌓이면 통계를 보여드릴게요!</p>;
  }

  // ── 1. 약 효과율: 효과 있음 / 전체 ──
  const effectiveCount = entries.filter((e) => e.effective).length;
  const effectiveRate = Math.round((effectiveCount / entries.length) * 100);

  // ── 2. 월별 두통 횟수: { "2026-07": 3, ... } ──
  const byMonth: Record<string, number> = {};
  for (const e of entries) {
    const month = e.entry_date.slice(0, 7); // "2026-07-15" → "2026-07"
    byMonth[month] = (byMonth[month] ?? 0) + 1;
  }
  const months = Object.keys(byMonth).sort(); // 오래된 달부터
  const maxMonthly = Math.max(...months.map((m) => byMonth[m]));

  // ── 3. 촉발요인 분포: 많이 나온 순으로 위에서부터 ──
  const byTrigger: Record<string, number> = {};
  for (const e of entries) {
    if (!e.trigger) continue;
    byTrigger[e.trigger] = (byTrigger[e.trigger] ?? 0) + 1;
  }
  const triggers = Object.entries(byTrigger).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxTrigger = triggers.length > 0 ? triggers[0][1] : 1;

  return (
    <div className="space-y-6">
      {/* 통계 카드 3장: 헤드라인 숫자는 차트보다 숫자가 더 잘 전달돼요 */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl border border-[#d4efe8] bg-white p-4">
          <p className="text-2xl font-bold text-[#1f4d44]">{entries.length}</p>
          <p className="text-xs text-gray-500">전체 기록</p>
        </div>
        <div className="rounded-xl border border-[#d4efe8] bg-white p-4">
          <p className="text-2xl font-bold text-[#1f4d44]">{effectiveRate}%</p>
          <p className="text-xs text-gray-500">약 효과율</p>
        </div>
        <div className="rounded-xl border border-[#d4efe8] bg-white p-4">
          <p className="text-2xl font-bold text-[#1f4d44]">
            {byMonth[months[months.length - 1]]}
          </p>
          <p className="text-xs text-gray-500">이번 달 두통</p>
        </div>
      </div>

      {/* 월별 두통 횟수 — 세로 막대 */}
      <div className="rounded-xl border border-[#d4efe8] bg-white p-4">
        <h3 className="mb-3 text-sm font-bold text-[#1f4d44]">월별 두통 횟수</h3>
        <div className="flex h-32 items-end gap-2">
          {months.map((m) => (
            // h-full + justify-end : 기둥이 컨테이너 높이를 갖고, 내용을 바닥에 붙여요
            // (% 높이는 부모 높이가 정해져 있어야 계산돼요 — 없으면 0이 됨!)
            <div key={m} className="flex h-full flex-1 flex-col items-center justify-end gap-1" title={`${m}: ${byMonth[m]}회`}>
              <span className="text-xs text-gray-600">{byMonth[m]}</span>
              {/* 높이 = 값/최댓값 비율 → 제일 큰 달이 75%(라벨 공간 확보) */}
              <div
                className="w-full max-w-10 rounded-t"
                style={{ height: `${(byMonth[m] / maxMonthly) * 75}%`, backgroundColor: BAR }}
              />
              <span className="text-xs text-gray-500">{m.slice(2).replace("-", ".")}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 촉발요인 분포 — 가로 막대 */}
      {triggers.length > 0 && (
        <div className="rounded-xl border border-[#d4efe8] bg-white p-4">
          <h3 className="mb-3 text-sm font-bold text-[#1f4d44]">촉발요인 TOP {triggers.length}</h3>
          <div className="space-y-2">
            {triggers.map(([name, count]) => (
              <div key={name} className="flex items-center gap-2 text-xs" title={`${name}: ${count}회`}>
                <span className="w-24 shrink-0 truncate text-gray-600">{name}</span>
                <div className="h-4 flex-1 rounded bg-[#eef8f5]">
                  <div
                    className="h-4 rounded"
                    style={{ width: `${(count / maxTrigger) * 100}%`, backgroundColor: BAR }}
                  />
                </div>
                <span className="w-8 text-right text-gray-600">{count}회</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
