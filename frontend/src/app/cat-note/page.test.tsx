// ─────────────────────────────────────────────
// 홈 화면 테스트
//
// 홈은 갈림길이기도 해서, 엉뚱한 데로 보내지 않는지가 제일 중요해요.
// 그리고 여기서도 교정이 보이면 안 돼요 (D-12).
// ─────────────────────────────────────────────
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CatNoteHome, { prettyDate } from "./page";
import { dictionaries } from "@/i18n/dictionaries";
import { LanguageProvider } from "@/i18n/LanguageProvider";

const home = dictionaries.en.catNote.home;

const 가짜 = vi.hoisted(() => ({
  fetchMe: vi.fn(),
  fetchToday: vi.fn(),
  fetchStats: vi.fn(),
  fetchFriendFeed: vi.fn(),
  replace: vi.fn(),
  router: { replace: (...args: unknown[]) => 가짜.replace(...args) },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/cat-note",
  // 진짜 useRouter 는 늘 같은 객체를 줘요. 매번 새로 만들면
  //  effect 가 계속 다시 돌아서 화면이 방금 고친 값을 되돌려버려요
  useRouter: () => 가짜.router,
}));

vi.mock("@/lib/catApi", () => ({
  fetchMe: 가짜.fetchMe,
  fetchToday: 가짜.fetchToday,
  fetchStats: 가짜.fetchStats,
  fetchFriendFeed: 가짜.fetchFriendFeed,
}));

const 계정 = {
  exists: true as const,
  note_id: "jiwoo07",
  partner: "kongi" as const,
  nickname: "지우",
  bio: null,
  avatar: "cat" as const,
  learning_language: "ko",
  feedback_language: null,
  writing_stage: 1,
  daily_reminder: false,
};

const 통계 = {
  streak_days: 3,
  total_stamps: 12,
  praises_received: 0,
  weekly_accuracy: 80,
  weekly_accuracy_diff: null,
  vocab_count: 0,
  level: "초급 1",
  expressions_to_next_level: 50,
};

function 오늘(texts: string[], complete = false) {
  return {
    entry_id: 1,
    entry_date: "2026-08-27",
    is_complete: complete,
    accuracy: complete ? 80 : null,
    sentences: texts.map((text, index) => ({ position: index + 1, text })),
  };
}

function renderHome() {
  return render(
    <LanguageProvider>
      <CatNoteHome />
    </LanguageProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.setItem("access_token", "테스트토큰");
  가짜.fetchMe.mockResolvedValue(계정);
  가짜.fetchToday.mockResolvedValue(오늘([]));
  가짜.fetchStats.mockResolvedValue(통계);
  가짜.fetchFriendFeed.mockResolvedValue({ feed: [] });
});

// ── 날짜 ──────────────────────────────────────────────

describe("날짜 보여주기", () => {
  it("시간대 때문에 하루 밀리지 않는다", () => {
    // new Date("2026-08-27") 로 읽으면 세계시 자정이라
    // 시간대에 따라 26일로 보일 수 있어요
    expect(prettyDate("2026-08-27", "en")).toContain("27");
    expect(prettyDate("2026-01-01", "en")).toContain("1");
    expect(prettyDate("2026-01-01", "en")).toContain("January");
  });
});

// ── 갈림길 ────────────────────────────────────────────

describe("갈림길", () => {
  it("로그인 안 했으면 로그인으로 보낸다", async () => {
    localStorage.removeItem("access_token");
    renderHome();

    await waitFor(() => expect(가짜.replace).toHaveBeenCalledWith("/login"));
    expect(가짜.fetchMe).not.toHaveBeenCalled();
  });

  it("수첩이 없으면 만들기로 보낸다", async () => {
    가짜.fetchMe.mockResolvedValue({ exists: false });
    renderHome();

    await waitFor(() => expect(가짜.replace).toHaveBeenCalledWith("/cat-note/start"));
  });
});

// ── 오늘의 다섯 문장 ──────────────────────────────────

describe("오늘의 수첩 카드", () => {
  it("쓴 문장은 그대로, 안 쓴 자리는 안내가 나온다", async () => {
    가짜.fetchToday.mockResolvedValue(오늘(["고양이가 조아요"]));
    renderHome();

    // 틀린 글도 그대로 — 채점은 다 쓰고 나서예요 (D-12)
    expect(await screen.findByText("고양이가 조아요")).toBeTruthy();
    expect(screen.queryByText(/좋아요/)).toBeNull();
    expect(screen.getByText(home.emptySlot(2))).toBeTruthy();
  });

  it("처음이면 쓰러 가기, 쓰다 말았으면 이어서 쓰기", async () => {
    renderHome();
    expect(await screen.findByRole("link", { name: home.goWrite })).toBeTruthy();
  });

  it("쓰다 말았으면 이어서 쓰기", async () => {
    가짜.fetchToday.mockResolvedValue(오늘(["하나", "둘"]));
    renderHome();

    expect(await screen.findByRole("link", { name: home.keepWriting })).toBeTruthy();
  });

  it("다 냈으면 결과 보기", async () => {
    가짜.fetchToday.mockResolvedValue(오늘(["1", "2", "3", "4", "5"], true));
    renderHome();

    expect(await screen.findByRole("link", { name: home.seeResult })).toBeTruthy();
  });
});

// ── 통계 · 친구 소식 ──────────────────────────────────

describe("통계", () => {
  it("연속·정확도·발도장을 모두에게 보여준다 (D-16)", async () => {
    renderHome();

    expect(await screen.findByText("🔥 3")).toBeTruthy();
    expect(screen.getByText("80%")).toBeTruthy();
    expect(screen.getByText("🐾 12")).toBeTruthy();
  });

  it("쓴 날이 없으면 정확도를 0%가 아니라 '아직'으로 (D-24)", async () => {
    가짜.fetchStats.mockResolvedValue({ ...통계, weekly_accuracy: null });
    renderHome();

    expect(await screen.findByText(home.notYet)).toBeTruthy();
  });
});

describe("친구 소식", () => {
  it("친구가 없으면 아예 안 나온다", async () => {
    renderHome();

    await screen.findByText(home.todayCard);
    expect(screen.queryByText(home.friendNews)).toBeNull();
  });

  it("친구 소식이 있으면 보여준다", async () => {
    가짜.fetchFriendFeed.mockResolvedValue({
      feed: [{ entry_id: 9, nickname: "민준", status: "complete" }],
    });
    renderHome();

    expect(await screen.findByText(home.friendDone("민준"))).toBeTruthy();
  });

  it("친구 소식을 못 불러와도 홈은 멀쩡하다", async () => {
    가짜.fetchFriendFeed.mockRejectedValue(new Error("서버가 안 받아요"));
    renderHome();

    expect(await screen.findByText(home.todayCard)).toBeTruthy();
  });
});
