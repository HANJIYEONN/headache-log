// ─────────────────────────────────────────────
// CatTabBar 테스트 — 다섯 탭이 다 있고, 지금 화면만 켜져 있는지.
//
// 제일 잘 틀리는 곳은 "홈 탭이 늘 켜져 있는" 문제예요.
// 모든 화면 주소가 /cat-note 로 시작하거든요.
// ─────────────────────────────────────────────
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import CatTabBar, { hidesTabBar, isCurrentTab } from "./CatTabBar";
import { dictionaries } from "@/i18n/dictionaries";
import { LanguageProvider } from "@/i18n/LanguageProvider";

// 테스트 환경(jsdom)은 navigator.language 가 "en-US" 라서 영어 사전이 나와요.
// 언어를 콕 집어 쓰는 대신 사전에서 꺼내 비교해요 — 나중에 문구를 바꿔도 안 깨지게요.
const tabs = dictionaries.en.catNote.tabs;

// usePathname 은 진짜 라우터가 있어야 도는데, 테스트엔 없어요.
// 그래서 "지금 이 주소야" 하고 알려주는 가짜로 바꿔요.
const 지금주소 = vi.hoisted(() => ({ value: "/cat-note" }));
vi.mock("next/navigation", () => ({
  usePathname: () => 지금주소.value,
}));

function renderTabBar(pathname: string) {
  지금주소.value = pathname;
  return render(
    <LanguageProvider>
      <CatTabBar />
    </LanguageProvider>,
  );
}

describe("탭이 다 있나", () => {
  it("다섯 개가 순서대로 있다", () => {
    renderTabBar("/cat-note");

    const tabs = screen.getAllByRole("link");
    expect(tabs.map((tab) => tab.getAttribute("href"))).toEqual([
      "/cat-note",
      "/cat-note/write",
      "/cat-note/calendar",
      "/cat-note/friends",
      "/cat-note/profile",
    ]);
  });

  it("글자는 사전에서 가져온다", () => {
    renderTabBar("/cat-note");

    const labels = screen.getAllByRole("link").map((tab) => tab.textContent);
    expect(labels).toEqual([
      tabs.home,
      tabs.write,
      tabs.calendar,
      tabs.friends,
      tabs.profile,
    ]);
  });
});

describe("지금 화면 표시", () => {
  it("쓰기 화면에서는 쓰기 탭만 켜진다", () => {
    renderTabBar("/cat-note/write");

    const current = screen.getAllByRole("link").filter(
      (tab) => tab.getAttribute("aria-current") === "page",
    );
    expect(current).toHaveLength(1);
    expect(current[0].getAttribute("href")).toBe("/cat-note/write");
  });

  it("홈 탭은 홈에서만 켜진다", () => {
    // /cat-note/write 도 /cat-note 로 시작해서, 대충 만들면 홈이 늘 켜져요
    expect(isCurrentTab("/cat-note", "/cat-note")).toBe(true);
    expect(isCurrentTab("/cat-note/", "/cat-note")).toBe(true);
    expect(isCurrentTab("/cat-note/write", "/cat-note")).toBe(false);
    expect(isCurrentTab("/cat-note/friends", "/cat-note")).toBe(false);
  });

  it("더 깊은 화면에서도 그 탭이 켜져 있다", () => {
    // 예: 달력에서 하루를 펼쳐본 화면
    expect(isCurrentTab("/cat-note/calendar/2026-07-20", "/cat-note/calendar")).toBe(true);
  });

  it("이름이 비슷한 다른 주소에는 안 켜진다", () => {
    expect(isCurrentTab("/cat-note/writer", "/cat-note/write")).toBe(false);
  });
});

describe("감춰야 할 때", () => {
  it("수첩 만드는 중(/cat-note/start)엔 탭바가 안 나온다", () => {
    // 아직 수첩이 없어서 탭을 눌러도 갈 곳이 없어요
    const { container } = renderTabBar("/cat-note/start");
    expect(container.innerHTML).toBe("");
  });

  it("hidesTabBar 는 만들기 화면에서만 참", () => {
    expect(hidesTabBar("/cat-note/start")).toBe(true);
    expect(hidesTabBar("/cat-note")).toBe(false);
    expect(hidesTabBar("/cat-note/write")).toBe(false);
  });
});
