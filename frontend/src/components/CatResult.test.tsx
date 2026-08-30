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
import { BUDDY_LINES, moodOf, pickLine } from "@/i18n/buddyLines";
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

function renderResult(sentences = [맞은문장, 틀린문장], streakDays = 3, accuracy = 80) {
  return render(
    <LanguageProvider>
      <CatResult
        accuracy={accuracy}
        entryId={12}
        partner="sikppang"
        sentences={sentences}
        newExpressions={["좋아요"]}
        streakDays={streakDays}
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

// ── 짝꿍의 한마디 ─────────────────────────────────────

describe("짝꿍의 한마디", () => {
  it("고친 게 있으면 격려하는 말이 나온다 (혼내지 않아요)", () => {
    // 연속 기록(3일↑)과 "거의 다 맞음"(80%↑)이 먼저 잡히니 둘 다 낮춰요
    renderResult([맞은문장, 틀린문장], 1, 40);
    const 후보 = BUDDY_LINES.en.sikppang.fixed;
    const 보인_말 = 후보.find((line) => screen.queryByText(line));
    expect(보인_말).toBeDefined();
  });

  it("하나도 안 틀렸으면 다른 묶음에서 나온다", () => {
    renderResult([맞은문장], 1);
    const 칭찬 = BUDDY_LINES.en.sikppang.allClean;
    expect(칭찬.some((line) => screen.queryByText(line))).toBe(true);
    // 격려하는 말이 섞여 나오면 안 돼요
    expect(BUDDY_LINES.en.sikppang.fixed.some((line) => screen.queryByText(line))).toBe(false);
  });

  it("같은 수첩이면 늘 같은 말 — 열어볼 때마다 바뀌면 어지러워요", () => {
    const 먼저 = pickLine("ko", "kongi", "allClean", 12);
    expect(pickLine("ko", "kongi", "allClean", 12)).toBe(먼저);
  });

  it("수첩이 다르면 다른 말도 나온다", () => {
    const 말들 = new Set(
      Array.from({ length: 10 }, (_, i) => pickLine("ko", "kongi", "allClean", i)),
    );
    expect(말들.size).toBeGreaterThan(1);
  });

  it("짝꿍마다 50마디씩, 네 언어 모두", () => {
    for (const locale of ["ko", "en", "ja", "zh"] as const) {
      for (const partner of ["kongi", "cheese", "meokmul", "sikppang"] as const) {
        const 전체 = Object.values(BUDDY_LINES[locale][partner]).flat();
        expect(전체).toHaveLength(50);
        // 같은 말이 두 번 들어가면 그만큼 덜 다양해져요
        expect(new Set(전체).size).toBe(50);
      }
    }
  });
});

// ── 어떤 날이었나 고르기 ──────────────────────────────

describe("상황 고르기", () => {
  it("첫 수첩이 제일 먼저", () => {
    expect(moodOf({ allClean: true, accuracy: 100, totalStamps: 1, streakDays: 1 })).toBe(
      "firstDay",
    );
  });

  it("다 맞은 날은 연속 기록보다 앞", () => {
    // 다 맞은 건 흔치 않으니 그 말을 놓치면 아까워요
    expect(moodOf({ allClean: true, accuracy: 100, totalStamps: 9, streakDays: 5 })).toBe(
      "allClean",
    );
  });

  it("며칠째 이어 쓰는 중", () => {
    expect(moodOf({ allClean: false, accuracy: 60, totalStamps: 9, streakDays: 5 })).toBe(
      "streak",
    );
  });

  it("많이 틀린 날에 '완벽해!' 가 나오면 안 돼요", () => {
    expect(moodOf({ allClean: false, accuracy: 20, totalStamps: 9, streakDays: 1 })).toBe(
      "fixed",
    );
    expect(moodOf({ allClean: false, accuracy: 80, totalStamps: 9, streakDays: 1 })).toBe(
      "almost",
    );
  });

  it("지난 날짜를 열어봐도(발도장·연속 없음) 괜찮다", () => {
    expect(moodOf({ allClean: true, accuracy: 100, totalStamps: null, streakDays: null })).toBe(
      "allClean",
    );
  });
});
