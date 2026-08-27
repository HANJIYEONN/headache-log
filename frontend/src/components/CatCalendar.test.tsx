// ─────────────────────────────────────────────
// CatCalendar 테스트 — 발도장이 쌓이는 달력
//
// 날짜 계산은 눈으로 보면 맞는 것 같아도 달이 바뀔 때 잘 틀려요.
// 그래서 표를 만드는 부분을 따로 떼어 시험해요.
// ─────────────────────────────────────────────
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import CatCalendar, { isoDay, monthGrid } from "./CatCalendar";
import { dictionaries } from "@/i18n/dictionaries";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import type { CalendarDay } from "@/lib/catApi";

// 테스트 환경(jsdom)은 영어라 사전에서 꺼내 비교해요
const calendar = dictionaries.en.catNote.calendar;

// ── 표 만들기 ─────────────────────────────────────────

describe("한 달을 표로", () => {
  it("2026년 8월 1일은 토요일이라 앞이 여섯 칸 빈다", () => {
    const cells = monthGrid(2026, 8);
    expect(cells.slice(0, 6)).toEqual([null, null, null, null, null, null]);
    expect(cells[6]).toBe(1);
  });

  it("칸 수는 늘 7의 배수 (줄이 안 깨지게)", () => {
    for (const month of [1, 2, 6, 8, 12]) {
      expect(monthGrid(2026, month).length % 7).toBe(0);
    }
  });

  it("2월은 28일까지, 윤년에는 29일까지", () => {
    expect(monthGrid(2026, 2).filter(Boolean)).toHaveLength(28);
    expect(monthGrid(2028, 2).filter(Boolean)).toHaveLength(29);
  });

  it("12월도 31일까지 나온다 (다음 달로 넘어가는 계산)", () => {
    const days = monthGrid(2026, 12).filter(Boolean);
    expect(days).toHaveLength(31);
    expect(days.at(-1)).toBe(31);
  });
});

describe("날짜 문자열", () => {
  it("한 자리 수는 0을 채운다", () => {
    // "2026-8-5" 로 보내면 서버가 못 알아들어요
    expect(isoDay(2026, 8, 5)).toBe("2026-08-05");
    expect(isoDay(2026, 12, 31)).toBe("2026-12-31");
  });
});

// ── 화면 ──────────────────────────────────────────────

const 기록: CalendarDay[] = [
  { date: "2026-08-15", is_complete: true, accuracy: 80 },
  { date: "2026-08-14", is_complete: false, accuracy: null },
];

function renderCalendar(onPick = vi.fn()) {
  render(
    <LanguageProvider>
      <CatCalendar
        year={2026}
        month={8}
        days={기록}
        todayIso="2026-08-27"
        selected={null}
        locale="ko"
        canGoNext={false}
        onPick={onPick}
        onPrev={vi.fn()}
        onNext={vi.fn()}
      />
    </LanguageProvider>,
  );
  return onPick;
}

describe("달력 화면", () => {
  it("다 쓴 날에만 발도장이 찍힌다", () => {
    renderCalendar();
    // 15일은 다 썼고, 14일은 쓰다 말았어요
    expect(screen.getByRole("button", { name: "15 🐾" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "14 🐾" })).toBeNull();
  });

  it("날짜를 누르면 그날을 알려준다", async () => {
    const onPick = renderCalendar();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "15 🐾" }));

    expect(onPick).toHaveBeenCalledWith("2026-08-15");
  });

  it("아직 오지 않은 달로는 못 넘어간다", () => {
    renderCalendar();
    // 볼 게 없는 달로 넘어가면 아이가 길을 잃어요
    const next = screen.getByRole("button", { name: calendar.nextMonth });
    expect(next).toHaveProperty("disabled", true);
  });
});
