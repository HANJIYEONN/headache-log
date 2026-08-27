// ─────────────────────────────────────────────
// CatResult 테스트 — 다 쓰고 나서 보는 채점 결과
//
// 여기서 중요한 건 "쓴 그대로 + 고친 것 + 번역"이 다 보이는 거예요.
// ─────────────────────────────────────────────
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CatResult, { markWrong } from "./CatResult";
import { dictionaries } from "@/i18n/dictionaries";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import type { GradedSentence } from "@/lib/catApi";

const result = dictionaries.en.catNote.result;

const 가짜 = vi.hoisted(() => ({ saveVocab: vi.fn() }));
vi.mock("@/lib/catApi", () => ({ saveVocab: 가짜.saveVocab }));

const 맞은문장: GradedSentence = {
  position: 1,
  original_text: "오늘의 하늘은 푸르다",
  corrected_text: null,
  translation: "The sky is blue today.",
  corrections: [],
};

const 틀린문장: GradedSentence = {
  position: 2,
  original_text: "고양이가 조아요",
  corrected_text: "고양이가 좋아요",
  translation: "The cat is nice.",
  corrections: [
    {
      correction_id: 5,
      wrong_text: "조아요",
      right_text: "좋아요",
      note: "'좋다'의 어간은 좋-이에요.",
      pronunciation: "[조아요]",
    },
  ],
};

function renderResult(sentences = [맞은문장, 틀린문장]) {
  return render(
    <LanguageProvider>
      <CatResult
        accuracy={80}
        sentences={sentences}
        newExpressions={["좋아요"]}
        streakDays={3}
        totalStamps={12}
      />
    </LanguageProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  가짜.saveVocab.mockResolvedValue({ vocab_id: 1 });
});

// ── 틀린 곳에 물결 ────────────────────────────────────

describe("틀린 곳 표시", () => {
  it("틀린 부분만 따로 감싼다", () => {
    const pieces = markWrong("고양이가 조아요", 틀린문장.corrections);
    // ["고양이가 ", <mark>조아요</mark>]
    expect(pieces[0]).toBe("고양이가 ");
    expect(pieces).toHaveLength(2);
  });

  it("틀린 게 없으면 글을 그대로 둔다", () => {
    expect(markWrong("오늘의 하늘은 푸르다", [])).toEqual(["오늘의 하늘은 푸르다"]);
  });

  it("찾을 수 없는 교정은 건너뛴다", () => {
    // AI 가 원문에 없는 글자를 짚어줄 수도 있어요. 그때 글이 사라지면 안 돼요
    const 엉뚱한교정 = [{ ...틀린문장.corrections[0], wrong_text: "없는말" }];
    expect(markWrong("고양이가 조아요", 엉뚱한교정)).toEqual(["고양이가 조아요"]);
  });
});

// ── 화면에 다 나오나 ──────────────────────────────────

describe("결과 화면", () => {
  it("맞은 문장과 고친 문장을 다르게 표시한다", () => {
    renderResult();
    expect(screen.getByText(`✓ ${result.clean}`)).toBeTruthy();
    expect(screen.getByText(`! ${result.fixed}`)).toBeTruthy();
  });

  it("고친 문장을 보여준다", () => {
    renderResult();
    expect(screen.getByText(/고양이가 좋아요/)).toBeTruthy();
  });

  it("번역이 문장마다 나온다 (D-20)", () => {
    renderResult();
    // 별도 "번역 보기" 버튼 없이 카드 안에 같이 담겨요
    expect(screen.getByText(/The sky is blue today/)).toBeTruthy();
    expect(screen.getByText(/The cat is nice/)).toBeTruthy();
  });

  it("숫자 카드에 숫자가 두 번 안 나온다", () => {
    renderResult();
    // "🐾 12" 옆에 "발도장 12개" 라고 또 쓰면 지저분해요
    expect(screen.getByText(result.stampsLabel)).toBeTruthy();
    expect(screen.getByText(result.streakLabel)).toBeTruthy();
    expect(screen.getByText("🐾 12")).toBeTruthy();
  });

  it("문법 노트와 발음을 보여준다", () => {
    renderResult();
    expect(screen.getByText(/좋다.*어간/)).toBeTruthy();
    expect(screen.getByText("[조아요]")).toBeTruthy();
  });
});

// ── 단어장에 담기 ─────────────────────────────────────

describe("단어장에 담기", () => {
  it("누르면 담기고 버튼이 잠긴다", async () => {
    const user = userEvent.setup();
    renderResult();

    await user.click(screen.getByRole("button", { name: `+ ${result.saveVocab}` }));

    expect(가짜.saveVocab).toHaveBeenCalledWith(5);
    const done = await screen.findByRole("button", { name: `✓ ${result.savedVocab}` });
    // 빠르게 두 번 누르면 단어장에 중복으로 들어가요
    expect(done).toHaveProperty("disabled", true);
  });

  it("이미 담겨 있어도(409) 담긴 걸로 보여준다", async () => {
    가짜.saveVocab.mockRejectedValue(new Error("409"));
    const user = userEvent.setup();
    renderResult();

    await user.click(screen.getByRole("button", { name: `+ ${result.saveVocab}` }));

    expect(await screen.findByRole("button", { name: `✓ ${result.savedVocab}` })).toBeTruthy();
  });
});
