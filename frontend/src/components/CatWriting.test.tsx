// ─────────────────────────────────────────────
// CatWriting 테스트 — 다섯 문장 쓰는 화면
//
// 지켜야 할 두 가지를 여기서 묶어둬요.
//   D-12  쓰는 동안엔 교정이 보이면 안 돼요
//   NF-06 타이핑이 멈추면 저장돼야 해요 (글이 유실되면 안 됨)
// ─────────────────────────────────────────────
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CatWriting from "./CatWriting";
import { dictionaries } from "@/i18n/dictionaries";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import type { TodayEntry } from "@/lib/catApi";

const write = dictionaries.en.catNote.write;

const 가짜 = vi.hoisted(() => ({ saveSentence: vi.fn(), onDone: vi.fn() }));
vi.mock("@/lib/catApi", () => ({ saveSentence: 가짜.saveSentence }));

function 수첩(texts: string[]): TodayEntry {
  return {
    entry_id: 1,
    entry_date: "2026-08-27",
    is_complete: false,
    accuracy: null,
    sentences: texts.map((text, index) => ({ position: index + 1, text })),
  };
}

function renderWriting(entry: TodayEntry) {
  return render(
    <LanguageProvider>
      <CatWriting
        entry={entry}
        buddyName="Kong-i"
        prompt="What did you do today?"
        onDone={가짜.onDone}
        grading={false}
        gradeFailed={false}
      />
    </LanguageProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  가짜.saveSentence.mockImplementation((position: number, text: string) =>
    Promise.resolve({ position, text, saved_at: "2026-08-27T10:00:00" }),
  );
});

// ── 진행 상황 ─────────────────────────────────────────

describe("진행 상황", () => {
  it("쓴 개수를 보여준다", () => {
    renderWriting(수첩(["첫 문장", "둘째 문장"]));
    expect(screen.getByText(write.progress(2, 5))).toBeTruthy();
  });

  it("다 안 쓰면 완료 버튼이 잠겨 있다", () => {
    renderWriting(수첩(["하나", "둘", "셋", "넷"]));
    expect(screen.getByRole("button", { name: write.done })).toHaveProperty("disabled", true);
  });

  it("다섯 개를 다 쓰면 완료 버튼이 열린다", () => {
    renderWriting(수첩(["하나", "둘", "셋", "넷", "다섯"]));
    expect(screen.getByRole("button", { name: write.done })).toHaveProperty("disabled", false);
  });
});

// ── 지금 쓰는 문장 ────────────────────────────────────

describe("지금 쓰는 문장", () => {
  it("입력칸에 있는 문장은 목록에 또 안 나온다", () => {
    // 같은 글이 두 번 보이면 헷갈려요
    renderWriting(수첩(["하나", "둘", "셋", "넷", "다섯"]));

    const 목록 = screen.queryAllByRole("button", { name: /다섯/ });
    expect(목록).toHaveLength(0);
  });

  it("쓴 문장을 누르면 그 문장을 고칠 수 있다", async () => {
    const user = userEvent.setup();
    renderWriting(수첩(["하나", "둘"]));

    await user.click(screen.getByRole("button", { name: /하나/ }));

    expect(screen.getByRole("textbox", { name: write.nth(1) })).toHaveProperty("value", "하나");
  });
});

// ── D-12 쓰는 동안엔 교정 없음 ────────────────────────

describe("쓰는 동안", () => {
  it("틀린 글도 그대로 보여준다 (교정 없음)", () => {
    // 채점은 다 쓰고 나서 한 번에 해요. 여기서 빨간 줄이 뜨면 안 돼요
    renderWriting(수첩(["고양이가 조아요", "둘"]));

    expect(screen.getByRole("button", { name: /고양이가 조아요/ })).toBeTruthy();
    expect(screen.queryByText(/좋아요/)).toBeNull();
  });

  it("교정이 안 보인다고 알려준다", () => {
    renderWriting(수첩([]));
    expect(screen.getByText(write.hidden)).toBeTruthy();
  });
});

// ── NF-06 글이 유실되면 안 돼요 ───────────────────────

describe("자동 저장", () => {
  it("타이핑이 멈춘 뒤에 한 번만 저장한다", async () => {
    renderWriting(수첩([]));

    fireEvent.change(screen.getByRole("textbox", { name: write.nth(1) }), {
      target: { value: "안녕하세요" },
    });

    // 글자마다 부르면 서버에 요청이 쏟아져요 — 잠깐 멈췄을 때만 보내요
    expect(가짜.saveSentence).not.toHaveBeenCalled();

    await waitFor(() => expect(가짜.saveSentence).toHaveBeenCalledTimes(1), { timeout: 3000 });
    expect(가짜.saveSentence).toHaveBeenCalledWith(1, "안녕하세요");
  });

  it("저장이 끝나면 알려준다", async () => {
    renderWriting(수첩([]));

    fireEvent.change(screen.getByRole("textbox", { name: write.nth(1) }), {
      target: { value: "안녕하세요" },
    });

    expect(screen.getByText(write.saving)).toBeTruthy();
    expect(await screen.findByText(write.saved, {}, { timeout: 3000 })).toBeTruthy();
  });

  it("저장이 실패하면 알려준다", async () => {
    // 글이 유실되면 안 되니까 (NF-06) 조용히 넘어가면 안 돼요
    가짜.saveSentence.mockRejectedValue(new Error("서버가 안 받아요"));
    renderWriting(수첩([]));

    fireEvent.change(screen.getByRole("textbox", { name: write.nth(1) }), {
      target: { value: "안녕하세요" },
    });

    expect(await screen.findByText(write.saveFailed, {}, { timeout: 3000 })).toBeTruthy();
  });
});
