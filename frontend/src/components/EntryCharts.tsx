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

  // ── 1. 월별 두통 횟수: { "2026-07": 3, ... } ──
  const byMonth: Record<string, number> = {};
  for (const e of entries) {
    const month = e.entry_date.slice(0, 7); // "2026-07-15" → "2026-07"
    byMonth[month] = (byMonth[month] ?? 0) + 1;
  }
  const months = Object.keys(byMonth).sort(); // 오래된 달부터
  const maxMonthly = Math.max(...months.map((m) => byMonth[m]));

  // 세로축 눈금 만들기: 0부터 최댓값까지 (값이 크면 4~5칸으로 나눠요)
  const step = Math.max(1, Math.ceil(maxMonthly / 4)); // 눈금 간격
  const axisMax = step * Math.ceil(maxMonthly / step);  // 눈금의 꼭대기 값
  const ticks: number[] = [];
  for (let t = 0; t <= axisMax; t += step) ticks.push(t); // [0, 1, 2, ...]

  // ── 2. 촉발요인 분포: 많이 나온 순으로 위에서부터 ──
  const byTrigger: Record<string, number> = {};
  for (const e of entries) {
    if (!e.trigger) continue;
    byTrigger[e.trigger] = (byTrigger[e.trigger] ?? 0) + 1;
  }
  const triggers = Object.entries(byTrigger).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxTrigger = triggers.length > 0 ? triggers[0][1] : 1;

  return (
    <div className="space-y-6">
      {/* 월별 두통 횟수 — 세로 막대 + 세로축 눈금 */}
      <div className="rounded-xl border border-[#d4efe8] bg-white p-4">
        <h3 className="mb-3 text-sm font-bold text-[#1f4d44]">월별 두통 횟수</h3>
        <div className="flex gap-2">
          {/* 세로축(y축) 숫자 — bottom %로 눈금 위치에 딱 맞춰요 */}
          <div className="relative h-32 w-5">
            {ticks.map((t) => (
              <span
                key={t}
                className="absolute right-0 translate-y-1/2 text-[10px] text-gray-500"
                style={{ bottom: `${(t / axisMax) * 100}%` }}
              >
                {t}
              </span>
            ))}
          </div>
          {/* 그래프 영역 */}
          <div className="relative h-32 flex-1">
            {/* 가로 눈금선 — 눈금 숫자와 같은 높이에 옅은 선 */}
            {ticks.map((t) => (
              <div
                key={t}
                className="absolute w-full border-t border-gray-200"
                style={{ bottom: `${(t / axisMax) * 100}%` }}
              />
            ))}
            {/* 막대들 — 눈금선 위에 겹쳐 그려요 */}
            <div className="absolute inset-0 flex items-end gap-2">
              {months.map((m) => (
                <div key={m} className="flex h-full flex-1 items-end justify-center" title={`${m}: ${byMonth[m]}회`}>
                  <div
                    className="w-full max-w-10 rounded-t"
                    style={{ height: `${(byMonth[m] / axisMax) * 100}%`, backgroundColor: BAR }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* 월 라벨 줄 (그래프 영역과 같은 배치로 아래에) */}
        <div className="ml-7 flex gap-2">
          {months.map((m) => (
            <span key={m} className="flex-1 text-center text-xs text-gray-500">
              {m.slice(2).replace("-", ".")}
            </span>
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
