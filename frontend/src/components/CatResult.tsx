"use client";

// ─────────────────────────────────────────────
// CatResult : 다 쓰고 나서 보는 채점 결과 🎉 (시안 6h)
//
// 쓰는 동안 숨겨뒀던 교정이 **여기서 처음** 한꺼번에 나와요 (D-12).
// 번역도 따로 버튼 없이 카드 안에 같이 담겨요 (D-20).
// ─────────────────────────────────────────────

import Link from "next/link";
import { useState } from "react";

import { moodOf, pickLine } from "@/i18n/buddyLines";
import { useLanguage, useT } from "@/i18n/LanguageProvider";
import { saveVocab, type Correction, type GradedSentence, type Partner } from "@/lib/catApi";

const BUDDY_FACE: Record<Partner, string> = {
  kongi: "🐱",
  cheese: "🐈",
  meokmul: "🐈‍⬛",
  sikppang: "🍞",
};

/**
 * 틀린 부분에 물결 밑줄을 그어요.
 *
 * 앞에서부터 한 번씩만 찾아요 — 같은 글자가 여러 번 나와도
 * 교정 개수만큼만 표시해야 겹치지 않거든요.
 */
export function markWrong(text: string, corrections: Correction[]) {
  const pieces: React.ReactNode[] = [];
  let rest = text;

  corrections.forEach((correction, index) => {
    const at = rest.indexOf(correction.wrong_text);
    if (at === -1) return;
    if (at > 0) pieces.push(rest.slice(0, at));
    pieces.push(
      <mark
        key={index}
        className="bg-transparent text-[#c07777] [text-decoration-line:underline] [text-decoration-style:wavy] [text-underline-offset:3px]"
      >
        {correction.wrong_text}
      </mark>,
    );
    rest = rest.slice(at + correction.wrong_text.length);
  });

  if (rest) pieces.push(rest);
  return pieces;
}

export default function CatResult({
  accuracy,
  entryId,
  partner,
  sentences,
  newExpressions,
  streakDays,
  totalStamps,
}: {
  accuracy: number | null;
  /** 어떤 말을 고를지 정하는 씨앗 — 같은 날엔 늘 같은 말이 나와요 */
  entryId: number;
  partner: Partner;
  sentences: GradedSentence[];
  newExpressions: string[];
  streakDays: number | null;
  totalStamps: number | null;
}) {
  const t = useT();
  const { locale } = useLanguage();
  const result = t.catNote.result;

  // 단어장에 담은 교정 번호 (버튼을 두 번 못 누르게)
  // 오늘이 어떤 날이었나 — 짝꿍이 할 말이 달라져요
  const allClean = sentences.every((sentence) => sentence.corrections.length === 0);
  const mood = moodOf({ allClean, accuracy, totalStamps, streakDays });
  const buddyLine = pickLine(locale, partner, mood, entryId);

  const [saving, setSaving] = useState<number | null>(null);
  const [savedIds, setSavedIds] = useState<number[]>([]);

  async function putInVocab(correctionId: number) {
    setSaving(correctionId);
    try {
      await saveVocab(correctionId);
      setSavedIds((before) => [...before, correctionId]);
    } catch {
      // 이미 담겨 있으면(409) 담긴 걸로 봐요 — 결과가 같으니까요
      setSavedIds((before) => [...before, correctionId]);
    } finally {
      setSaving(null);
    }
  }

  return (
    <>
      <h1 className="text-center text-2xl font-bold text-[#4a3a20]">{result.title}</h1>

      {/* 오늘의 숫자들 */}
      <ul className="mt-4 flex justify-center gap-2 text-center">
        {accuracy !== null && (
          <li className="flex-1 rounded-2xl border border-[#efe3c8] bg-[#fffdf5] px-2 py-3">
            <span className="block text-lg font-bold text-[#b98a1f]">{accuracy}%</span>
            <span className="block text-[11px] text-[#a08c66]">{result.accuracy}</span>
          </li>
        )}
        {totalStamps !== null && (
          <li className="flex-1 rounded-2xl border border-[#efe3c8] bg-[#fffdf5] px-2 py-3">
            <span className="block text-lg font-bold text-[#b98a1f]">🐾 {totalStamps}</span>
            <span className="block text-[11px] text-[#a08c66]">{result.stampsLabel}</span>
          </li>
        )}
        {streakDays !== null && (
          <li className="flex-1 rounded-2xl border border-[#efe3c8] bg-[#fffdf5] px-2 py-3">
            <span className="block text-lg font-bold text-[#b98a1f]">🔥 {result.streak(streakDays)}</span>
            <span className="block text-[11px] text-[#a08c66]">{result.streakLabel}</span>
          </li>
        )}
      </ul>

      {/* 문장 카드 다섯 개 */}
      <ul className="mt-5 space-y-3">
        {sentences.map((sentence) => {
          const fixed = sentence.corrections.length > 0;
          return (
            <li
              key={sentence.position}
              className="rounded-2xl border-2 bg-[#fffdf5] px-4 py-3"
              style={{ borderColor: fixed ? "#f0d8a8" : "#dcebd4" }}
            >
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#fbefc9] text-[10px] font-bold text-[#b98a1f]">
                  {sentence.position}
                </span>
                <span
                  className="text-[10px] font-bold"
                  style={{ color: fixed ? "#b98a1f" : "#6f9a5f" }}
                >
                  {fixed ? `! ${result.fixed}` : `✓ ${result.clean}`}
                </span>
              </div>

              {/* 아이가 쓴 그대로 — 틀린 곳에 물결 */}
              <p className="mt-2 text-sm leading-relaxed text-[#4a3a20]">
                {markWrong(sentence.original_text, sentence.corrections)}
              </p>

              {sentence.corrected_text && (
                <p className="mt-1 text-sm font-medium leading-relaxed text-[#4a3a20]">
                  → {sentence.corrected_text}
                </p>
              )}

              {/* 짝꿍의 고치기 안내 + 단어장에 담기 */}
              {sentence.corrections.map((correction) => {
                const inVocab = savedIds.includes(correction.correction_id);
                return (
                  <div key={correction.correction_id} className="mt-2 rounded-xl bg-[#faf4e4] px-3 py-2">
                    <p className="text-xs leading-relaxed text-[#7a6a48]">
                      <span aria-hidden="true">💬 </span>
                      {correction.note}
                      {correction.pronunciation && (
                        <span className="ml-1 text-[#a08c66]">{correction.pronunciation}</span>
                      )}
                    </p>
                    <button
                      type="button"
                      onClick={() => putInVocab(correction.correction_id)}
                      disabled={inVocab || saving === correction.correction_id}
                      className="mt-1.5 rounded-full border border-[#efe3c8] bg-[#fffdf5] px-2.5 py-1 text-[11px] font-medium text-[#7a6a48] transition disabled:opacity-60"
                    >
                      {inVocab ? `✓ ${result.savedVocab}` : `+ ${result.saveVocab}`}
                    </button>
                  </div>
                );
              })}

              {/* 🌐 번역 — 채점 결과에 같이 담겨 와요 (D-20) */}
              {sentence.translation && (
                <p className="mt-2 text-xs leading-relaxed text-[#a08c66]">
                  <span aria-hidden="true">🌐 </span>
                  {sentence.translation}
                </p>
              )}
            </li>
          );
        })}
      </ul>

      {/* 오늘 새로 배운 말 */}
      {newExpressions.length > 0 && (
        <div className="mt-5">
          <p className="text-xs font-bold text-[#7a6a48]">{result.newExpressions}</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {newExpressions.map((expression) => (
              <li
                key={expression}
                className="rounded-full bg-[#fbefc9] px-3 py-1.5 text-xs font-medium text-[#b98a1f]"
              >
                {expression}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 짝꿍의 한마디 — 다 맞았을 때와 고친 게 있을 때 말이 달라요.
          틀렸다고 혼내지 않아요. 끝까지 쓴 걸 먼저 칭찬해요 */}
      <div className="mt-6 flex items-start gap-2.5 rounded-2xl bg-[#fbefc9] px-4 py-3">
        <span className="text-2xl" aria-hidden="true">
          {BUDDY_FACE[partner]}
        </span>
        <p className="flex-1 text-sm leading-relaxed text-[#7a6a48]">
          {buddyLine}
        </p>
      </div>

      <Link
        href="/cat-note"
        className="mt-4 block rounded-2xl bg-[#f5c64b] px-6 py-3 text-center text-sm font-bold text-[#4a3a20] shadow-[0_3px_0_#dca92e] transition hover:bg-[#f0bb38]"
      >
        {result.goHome}
      </Link>
    </>
  );
}
