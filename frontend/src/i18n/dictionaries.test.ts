// ─────────────────────────────────────────────
// 다국어 사전 테스트
//
// 제일 흔한 실수: 한국어에만 글자를 추가하고 영어·일본어·중국어에
// 넣는 걸 깜빡하는 것. 그러면 그 언어로 보는 사람에겐 글자가 안 나와요.
// 이 테스트가 그걸 잡아줘요.
// ─────────────────────────────────────────────
import { describe, expect, it } from "vitest";

import { dictionaries, LOCALES, LOCALE_LABELS } from "./dictionaries";

/** 중첩된 객체에서 열쇠(key) 경로를 전부 뽑아요. 예: "home.title" */
function collectKeys(obj: unknown, prefix = ""): string[] {
  if (typeof obj !== "object" || obj === null) return [prefix];
  return Object.entries(obj).flatMap(([k, v]) =>
    collectKeys(v, prefix ? `${prefix}.${k}` : k),
  );
}

describe("다국어 사전", () => {
  it("네 언어를 모두 갖고 있다", () => {
    expect(LOCALES).toEqual(["ko", "en", "ja", "zh"]);
    for (const locale of LOCALES) {
      expect(dictionaries[locale]).toBeDefined();
    }
  });

  it("네 언어가 똑같은 열쇠를 갖고 있다 (번역 누락 없음)", () => {
    const korean = collectKeys(dictionaries.ko).sort();

    for (const locale of LOCALES) {
      const keys = collectKeys(dictionaries[locale]).sort();
      const missing = korean.filter((k) => !keys.includes(k));
      const extra = keys.filter((k) => !korean.includes(k));

      expect(missing, `${locale}에 빠진 번역: ${missing.join(", ")}`).toEqual([]);
      expect(extra, `${locale}에만 있는 열쇠: ${extra.join(", ")}`).toEqual([]);
    }
  });

  it("비어있는 번역이 없다", () => {
    for (const locale of LOCALES) {
      const empty = collectKeys(dictionaries[locale]).filter((path) => {
        const value = path
          .split(".")
          .reduce<unknown>((o, k) => (o as Record<string, unknown>)?.[k], dictionaries[locale]);
        return typeof value === "string" && value.trim() === "";
      });
      expect(empty, `${locale}에 빈 번역: ${empty.join(", ")}`).toEqual([]);
    }
  });

  it("언어 버튼 이름이 네 개 다 있다", () => {
    for (const locale of LOCALES) {
      expect(LOCALE_LABELS[locale].short).toBeTruthy();
      expect(LOCALE_LABELS[locale].full).toBeTruthy();
    }
  });
});
