// ─────────────────────────────────────────────
// 수첩 만들기 화면 테스트
//
// 여기서 제일 중요한 건 "아무거나 만들어지지 않는 것"이에요.
// 아이디는 나중에 못 바꾸거든요 (D-10).
// ─────────────────────────────────────────────
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import StartPage, { reasonText } from "./page";
import { dictionaries } from "@/i18n/dictionaries";
import { LanguageProvider } from "@/i18n/LanguageProvider";

const start = dictionaries.en.catNote.start;

const 가짜 = vi.hoisted(() => ({
  checkNoteId: vi.fn(),
  createAccount: vi.fn(),
  fetchMe: vi.fn(),
  replace: vi.fn(),
  router: { replace: (...args: unknown[]) => 가짜.replace(...args) },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/cat-note/start",
  // 진짜 useRouter 는 늘 같은 객체를 줘요. 매번 새로 만들면
  //  effect 가 계속 다시 돌아서 화면이 방금 고친 값을 되돌려버려요
  useRouter: () => 가짜.router,
}));

vi.mock("@/lib/catApi", () => ({
  checkNoteId: 가짜.checkNoteId,
  createAccount: 가짜.createAccount,
  fetchMe: 가짜.fetchMe,
}));

function renderStart() {
  return render(
    <LanguageProvider>
      <StartPage />
    </LanguageProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.setItem("access_token", "테스트토큰");
  가짜.fetchMe.mockResolvedValue({ exists: false });
  가짜.checkNoteId.mockResolvedValue({ available: true, reason: null, suggestions: [] });
});

// ── 서버 이유 → 화면 문구 (D-19: 세 가지만) ──────────

describe("아이디를 못 쓰는 이유", () => {
  it("너무 짧을 때와 너무 길 때는 같은 말을 한다", () => {
    // 아이에게 "3자라 짧아요"와 "16자라 길어요"를 따로 알려줄 필요는 없어요
    expect(reasonText("too_short", start.errors)).toBe(start.errors.length);
    expect(reasonText("too_long", start.errors)).toBe(start.errors.length);
  });

  it("이미 있는 아이디와 못 쓰는 글자는 다른 말을 한다", () => {
    expect(reasonText("duplicate", start.errors)).toBe(start.errors.duplicate);
    expect(reasonText("invalid_char", start.errors)).toBe(start.errors.invalidChar);
  });

  it("쓸 수 있으면 아무 말도 안 한다", () => {
    expect(reasonText(null, start.errors)).toBeNull();
  });
});

// ── 짝꿍을 골라야 다음으로 ─────────────────────────────

describe("1/2 짝꿍 고르기", () => {
  it("아무도 안 골랐으면 다음으로 못 간다", () => {
    renderStart();
    expect(screen.getByRole("button", { name: start.next })).toHaveProperty("disabled", true);
  });

  it("고르면 다음 버튼이 열린다", async () => {
    const { default: userEvent } = await import("@testing-library/user-event");
    const user = userEvent.setup();
    renderStart();

    const kongi = start.partners.kongi;
    await user.click(
      screen.getByRole("button", { name: `${kongi.name}, ${kongi.who}. ${kongi.says}` }),
    );

    expect(screen.getByRole("button", { name: start.next })).toHaveProperty("disabled", false);
  });
});

// ── 이미 수첩이 있으면 여기 있을 이유가 없어요 ─────────

describe("이미 수첩이 있을 때", () => {
  it("홈으로 돌려보낸다", async () => {
    가짜.fetchMe.mockResolvedValue({ exists: true, nickname: "지우" });
    renderStart();

    await waitFor(() => expect(가짜.replace).toHaveBeenCalledWith("/cat-note"));
  });
});

describe("로그인이 안 됐을 때", () => {
  it("로그인 화면으로 보낸다", async () => {
    localStorage.removeItem("access_token");
    renderStart();

    await waitFor(() => expect(가짜.replace).toHaveBeenCalledWith("/login"));
    // 로그인도 안 했는데 수첩부터 찾아보면 안 돼요
    expect(가짜.fetchMe).not.toHaveBeenCalled();
  });
});
