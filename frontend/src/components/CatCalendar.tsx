"use client";

// ─────────────────────────────────────────────
// CatCalendar : 발도장이 쌓이는 달력 📅 (시안 2d)
//
// 글을 쓴 날에 발도장 🐾 이 찍혀요. 오늘은 동그라미로 표시하고요.
// 날짜를 누르면 그날 쓴 글을 볼 수 있어요.
// ─────────────────────────────────────────────

import { useT } from "@/i18n/LanguageProvider";
import type { CalendarDay } from "@/lib/catApi";

/**
 * 한 달을 7칸씩 줄 세운 표로 만들어요.
 * 앞뒤 빈 칸은 null 이에요 (1일이 수요일이면 앞에 세 칸 비어요).
 */
export function monthGrid(year: number, month: number): (number | null)[] {
  const firstWeekday = new Date(year, month - 1, 1).getDay(); // 0 = 일요일
  // 다음 달 0일 = 이번 달 마지막 날
  const lastDay = new Date(year, month, 0).getDate();

  const cells: (number | null)[] = Array(firstWeekday).fill(null);
  for (let day = 1; day <= lastDay; day += 1) cells.push(day);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

/** "2026-08-27" 모양으로 (자릿수 맞춰서) */
export function isoDay(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** 요일 머리글 — 그 나라 말로 (2024-01-07 이 일요일이에요) */
function weekdayNames(locale: string): string[] {
  const format = new Intl.DateTimeFormat(locale, { weekday: "short" });
  return Array.from({ length: 7 }, (_, index) =>
    format.format(new Date(2024, 0, 7 + index)),
  );
}

export default function CatCalendar({
  year,
  month,
  days,
  todayIso,
  selected,
  locale,
  canGoNext,
  onPick,
  onPrev,
  onNext,
}: {
  year: number;
  month: number;
  days: CalendarDay[];
  todayIso: string;
  selected: string | null;
  locale: string;
  canGoNext: boolean;
  onPick: (day: string) => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const t = useT();
  const calendar = t.catNote.calendar;

  const written = new Map(days.map((day) => [day.date, day]));
  const monthName = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
  }).format(new Date(year, month - 1, 1));

  return (
    <section className="rounded-3xl border border-[#efe3c8] bg-[#fffdf5] px-4 py-4">
      {/* 달 이동 */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onPrev}
          aria-label={calendar.prevMonth}
          className="flex h-8 w-8 items-center justify-center rounded-full text-[#b98a1f] transition hover:bg-[#fbefc9]"
        >
          ‹
        </button>
        <h2 className="text-sm font-bold text-[#4a3a20]">{monthName}</h2>
        <button
          type="button"
          onClick={onNext}
          disabled={!canGoNext}
          aria-label={calendar.nextMonth}
          className="flex h-8 w-8 items-center justify-center rounded-full text-[#b98a1f] transition hover:bg-[#fbefc9] disabled:opacity-30"
        >
          ›
        </button>
      </div>

      {/* 요일 */}
      <ol className="mt-3 grid grid-cols-7 gap-1 text-center" aria-hidden="true">
        {weekdayNames(locale).map((name) => (
          <li key={name} className="text-[10px] font-bold text-[#a08c66]">
            {name}
          </li>
        ))}
      </ol>

      {/* 날짜 */}
      <ol className="mt-1 grid grid-cols-7 gap-1">
        {monthGrid(year, month).map((day, index) => {
          if (day === null) return <li key={`빈칸-${index}`} />;

          const iso = isoDay(year, month, day);
          const entry = written.get(iso);
          const isToday = iso === todayIso;
          const isPicked = iso === selected;

          return (
            <li key={iso}>
              <button
                type="button"
                onClick={() => onPick(iso)}
                aria-pressed={isPicked}
                // 발도장이 있는지까지 읽어줘야 달력을 소리로도 알 수 있어요
                aria-label={
                  entry?.is_complete
                    ? `${day} 🐾`
                    : `${day}${isToday ? ` (${calendar.today})` : ""}`
                }
                className="flex aspect-square w-full flex-col items-center justify-center rounded-xl text-xs transition"
                style={{
                  backgroundColor: isPicked
                    ? "#fbefc9"
                    : isToday
                      ? "#f6f0e2"
                      : "transparent",
                  border: isToday ? "2px solid #f5c64b" : "2px solid transparent",
                  color: entry ? "#4a3a20" : "#c3b49a",
                  fontWeight: entry ? 700 : 400,
                }}
              >
                {day}
                {/* 다 쓴 날에만 발도장 — 쓰다 만 날은 점만 */}
                <span className="text-[9px] leading-none" aria-hidden="true">
                  {entry?.is_complete ? "🐾" : entry ? "·" : " "}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
