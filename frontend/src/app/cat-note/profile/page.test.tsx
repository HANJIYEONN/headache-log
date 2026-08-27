// ─────────────────────────────────────────────
// 내 정보 화면 테스트
//
// 저장 버튼이 없는 화면이라 "고치면 진짜 저장되나" 가 제일 중요해요.
// 그리고 수첩 아이디는 절대 바뀌면 안 돼요 (D-10).
// ─────────────────────────────────────────────
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ProfilePage from "./page";
import { dictionaries } from "@/i18n/dictionaries";
import { LanguageProvider } from "@/i18n/LanguageProvider";

const profile = dictionaries.en.catNote.profile;

const 가짜 = vi.hoisted(() => ({
  fetchMe: vi.fn(),
  fetchStats: vi.fn(),
  fetchVocab: vi.fn(),
  removeVocab: vi.fn(),
  updateAccount: vi.fn(),
  replace: vi.fn(),
  router: { replace: (...args: unknown[]) => 가짜.replace(...args) },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/cat-note/profile",
  // 진짜 useRouter 는 늘 같은 객체를 줘요. 매번 새로 만들면
  //  effect 가 계속 다시 돌아서 화면이 방금 고친 값을 되돌려버려요
  useRouter: () => 가짜.router,
}));

vi.mock("@/lib/catApi", () => ({
  fetchMe: 가짜.fetchMe,
  fetchStats: 가짜.fetchStats,
  fetchVocab: 가짜.fetchVocab,
  removeVocab: 가짜.removeVocab,
  updateAccount: 가짜.updateAccount,
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
  streak_days: 0,
  total_stamps: 0,
  praises_received: 0,
  weekly_accuracy: null,
  weekly_accuracy_diff: null,
  vocab_count: 1,
  level: "초급 1",
  expressions_to_next_level: 49,
};

function renderProfile() {
  return render(
    <LanguageProvider>
      <ProfilePage />
    </LanguageProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.setItem("access_token", "테스트토큰");
  가짜.fetchMe.mockResolvedValue(계정);
  가짜.fetchStats.mockResolvedValue(통계);
  가짜.fetchVocab.mockResolvedValue({ vocab: [] });
  가짜.updateAccount.mockImplementation((changes) =>
    Promise.resolve({ ...계정, ...changes }),
  );
  가짜.removeVocab.mockResolvedValue(undefined);
});

// ── 갈림길 ────────────────────────────────────────────

describe("갈림길", () => {
  it("로그인 안 했으면 로그인으로", async () => {
    localStorage.removeItem("access_token");
    renderProfile();
    await waitFor(() => expect(가짜.replace).toHaveBeenCalledWith("/login"));
  });

  it("수첩이 없으면 만들기로", async () => {
    가짜.fetchMe.mockResolvedValue({ exists: false });
    renderProfile();
    await waitFor(() => expect(가짜.replace).toHaveBeenCalledWith("/cat-note/start"));
  });
});

// ── 수첩 아이디 ───────────────────────────────────────

describe("수첩 아이디", () => {
  it("보여주기만 하고 고칠 수 없다 (D-10)", async () => {
    renderProfile();

    expect(await screen.findByText("@jiwoo07")).toBeTruthy();
    // 입력칸이면 아이가 바꿔버릴 수 있어요. 친구가 못 찾게 돼요
    expect(screen.queryByDisplayValue("jiwoo07")).toBeNull();
    expect(screen.getByText(profile.noteIdFixed)).toBeTruthy();
  });
});

// ── 고르면 바로 저장 ──────────────────────────────────

describe("고르면 바로 저장", () => {
  it("동반 동물을 바꾼다", async () => {
    const user = userEvent.setup();
    renderProfile();

    await user.click(await screen.findByRole("button", { name: profile.avatars.dino }));

    expect(가짜.updateAccount).toHaveBeenCalledWith({ avatar: "dino" });
    expect(await screen.findByText(profile.saved)).toBeTruthy();
  });

  it("짝꿍을 바꾼다 (D-17 — 나중에 바꿔도 돼요)", async () => {
    const user = userEvent.setup();
    renderProfile();

    const cheese = dictionaries.en.catNote.start.partners.cheese.name;
    await user.click(await screen.findByRole("button", { name: cheese }));

    expect(가짜.updateAccount).toHaveBeenCalledWith({ partner: "cheese" });
  });

  it("설명받을 언어를 '배우는 언어로' 되돌리면 null 을 보낸다", async () => {
    가짜.fetchMe.mockResolvedValue({ ...계정, feedback_language: "en" });
    const user = userEvent.setup();
    renderProfile();

    await user.click(await screen.findByRole("button", { name: profile.sameAsLearning }));

    // 빈 문자열이 아니라 null 이어야 서버가 "안 정함" 으로 알아들어요
    expect(가짜.updateAccount).toHaveBeenCalledWith({ feedback_language: null });
  });

  it("매일 알림을 켠다", async () => {
    const user = userEvent.setup();
    renderProfile();

    await user.click(await screen.findByRole("switch", { name: profile.reminder }));

    expect(가짜.updateAccount).toHaveBeenCalledWith({ daily_reminder: true });
  });

  it("저장이 실패하면 알려준다", async () => {
    가짜.updateAccount.mockRejectedValue(new Error("서버가 안 받아요"));
    const user = userEvent.setup();
    renderProfile();

    await user.click(await screen.findByRole("switch", { name: profile.reminder }));

    expect(await screen.findByText(profile.saveFailed)).toBeTruthy();
  });
});

// ── 별명은 타이핑 멈춘 뒤 ─────────────────────────────

describe("별명", () => {
  it("타이핑이 멈춘 뒤에 저장한다", async () => {
    renderProfile();

    const input = await screen.findByRole("textbox", { name: profile.nickname });
    fireEvent.change(input, { target: { value: "지우야" } });

    expect(가짜.updateAccount).not.toHaveBeenCalled();
    await waitFor(
      () => expect(가짜.updateAccount).toHaveBeenCalledWith({ nickname: "지우야" }),
      { timeout: 3000 },
    );
  });
});

// ── 단어장 ────────────────────────────────────────────

describe("단어장", () => {
  it("비어 있으면 어디서 담는지 알려준다", async () => {
    renderProfile();
    expect(await screen.findByText(profile.vocabEmpty)).toBeTruthy();
  });

  it("빼면 목록에서 사라지고 단계를 다시 센다", async () => {
    가짜.fetchVocab.mockResolvedValue({
      vocab: [{ vocab_id: 7, expression: "좋아요", meaning: "설명", correction_id: 5, created_at: null }],
    });
    const user = userEvent.setup();
    renderProfile();

    await user.click(await screen.findByRole("button", { name: `좋아요 ${profile.vocabRemove}` }));

    expect(가짜.removeVocab).toHaveBeenCalledWith(7);
    expect(await screen.findByText(profile.vocabEmpty)).toBeTruthy();
    // 단어장 개수가 단계를 정하니까 (D-23) 통계를 다시 받아와야 해요
    expect(가짜.fetchStats).toHaveBeenCalledTimes(2);
  });
});
