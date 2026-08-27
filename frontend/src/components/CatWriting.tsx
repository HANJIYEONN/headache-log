"use client";

// ─────────────────────────────────────────────
// CatWriting : 다섯 문장 쓰는 화면 ✏️
//
// 규칙 두 가지가 이 화면을 지배해요.
//   D-12  쓰는 동안엔 교정을 절대 안 보여줘요. 다 쓰고 나서 한꺼번에.
//   NF-06 글이 유실되면 안 돼요. 타이핑이 멈추면 바로 저장해요.
// ─────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";

import { useT } from "@/i18n/LanguageProvider";
import { saveSentence, type TodayEntry } from "@/lib/catApi";

const TOTAL = 5;
const SENTENCE_MAX = 200;

/** 타이핑이 멈추고 이만큼 지나면 저장해요 */
const PAUSE_MS = 800;

/** 아직 안 쓴 첫 번째 자리. 다 썼으면 null */
function firstEmpty(saved: Record<number, string>): number | null {
  for (let position = 1; position <= TOTAL; position += 1) {
    if (!saved[position]) return position;
  }
  return null;
}

export default function CatWriting({
  entry,
  buddyName,
  learningLanguage,
  prompt,
  onDone,
  grading,
  gradeFailed,
}: {
  entry: TodayEntry;
  buddyName: string;
  /** 배우는 언어 — 키보드·사전에 힌트를 줘요 */
  learningLanguage: string;
  prompt: string | null;
  onDone: () => void;
  grading: boolean;
  gradeFailed: boolean;
}) {
  const t = useT();
  const write = t.catNote.write;

  // 서버에 저장된 글 (이게 진짜예요)
  const [saved, setSaved] = useState<Record<number, string>>(() =>
    Object.fromEntries(entry.sentences.map((s) => [s.position, s.text])),
  );
  const [active, setActive] = useState<number>(() => firstEmpty(
    Object.fromEntries(entry.sentences.map((s) => [s.position, s.text])),
  ) ?? TOTAL);
  const [draft, setDraft] = useState<string>(() => {
    const start = firstEmpty(
      Object.fromEntries(entry.sentences.map((s) => [s.position, s.text])),
    );
    return start === null ? (entry.sentences.at(-1)?.text ?? "") : "";
  });
  const [saveFailed, setSaveFailed] = useState(false);
  const box = useRef<HTMLTextAreaElement>(null);

  const typed = draft.trim();
  // "저장됐나?"는 따로 기억하지 않고 계산해요.
  // 서버에 있는 글과 지금 글이 같으면 저장이 끝난 거예요.
  const waiting = typed.length > 0 && typed !== (saved[active] ?? "");
  const writtenCount = Object.values(saved).filter(Boolean).length;
  const allWritten = writtenCount === TOTAL;
  const others = Array.from({ length: TOTAL }, (_, index) => index + 1).filter(
    (position) => saved[position] && position !== active,
  );

  // 바로 쓸 수 있게 커서를 문장 칸에 놔둬요.
  // 문장을 옮길 때(다음 문장·고치기)도 따라가요.
  useEffect(() => {
    const field = box.current;
    if (!field || grading) return;
    field.focus();
    // 커서는 글 **끝**에 — 고치러 들어왔는데 맨 앞에 놓이면 다시 눌러야 해요
    const end = field.value.length;
    field.setSelectionRange(end, end);
  }, [active, grading]);

  // 타이핑이 멈추면 저장해요 (NF-06)
  useEffect(() => {
    const text = draft.trim();
    if (!text || text === (saved[active] ?? "")) return;

    let alive = true;
    const timer = setTimeout(() => {
      saveSentence(active, text)
        .then((result) => {
          if (!alive) return;
          setSaved((before) => ({ ...before, [result.position]: result.text }));
          setSaveFailed(false);
        })
        .catch(() => alive && setSaveFailed(true));
    }, PAUSE_MS);

    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [draft, active, saved]);

  function goTo(position: number) {
    setActive(position);
    setDraft(saved[position] ?? "");
  }

  function goNext() {
    const next = firstEmpty(saved);
    if (next !== null) goTo(next);
  }

  return (
    <>
      {/* 진행 상황 — 몇 칸 남았는지 한눈에 */}
      <p className="text-center text-xs font-bold text-[#b98a1f]">
        {write.progress(writtenCount, TOTAL)}
      </p>
      <ol className="mx-auto mt-2 flex max-w-xs gap-1.5" aria-hidden="true">
        {Array.from({ length: TOTAL }, (_, index) => index + 1).map((position) => (
          <li
            key={position}
            className="h-2 flex-1 rounded-full transition"
            style={{ backgroundColor: saved[position] ? "#f5c64b" : "#efe3c8" }}
          />
        ))}
      </ol>

      <h1 className="mt-4 text-center text-2xl font-bold text-[#4a3a20]">{write.title}</h1>
      <p className="mt-1 text-center text-xs text-[#a08c66]">{write.subtitle(buddyName)}</p>

      {/* 오늘의 글감 — "뭐 쓰지?" 하고 막힐 때 (WRITE-02) */}
      {prompt && (
        <div className="mt-5 rounded-2xl border border-[#efe3c8] bg-[#fffdf5] px-4 py-3">
          <p className="text-[10px] font-bold tracking-wide text-[#b98a1f]">
            {write.promptTitle}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-[#4a3a20]">{prompt}</p>
        </div>
      )}

      {/* 이미 쓴 문장 — 눌러서 고칠 수 있어요.
          지금 고치는 중인 문장은 아래 입력칸에 있으니 여기선 빼요 */}
      {others.length > 0 && (
        <ul className="mt-6 space-y-2">
          {others.map((position) => (
              <li key={position}>
                <button
                  type="button"
                  onClick={() => goTo(position)}
                  // 조각난 글씨가 띄어쓰기 없이 붙어 읽히지 않게 이름표를 달아요
                  aria-label={`${write.nth(position)}: ${saved[position]} — ${write.edit}`}
                  className="flex w-full items-start gap-2 rounded-2xl border-2 border-[#efe3c8] bg-[#fffdf5] px-4 py-3 text-left transition hover:border-[#f5c64b]"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#fbefc9] text-[10px] font-bold text-[#b98a1f]">
                    {position}
                  </span>
                  {/* 틀렸어도 그대로 보여줘요 — 교정은 다 쓴 뒤에 (D-12) */}
                  <span className="flex-1 text-sm leading-relaxed text-[#4a3a20]">
                    {saved[position]}
                  </span>
                  <span className="text-[10px] font-medium text-[#a08c66]">{write.edit}</span>
                </button>
              </li>
          ))}
        </ul>
      )}

      {/* 지금 쓰는 문장 */}
      <div className="mt-4">
        <label className="block">
          <span className="text-xs font-bold text-[#7a6a48]">{write.nth(active)}</span>
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            maxLength={SENTENCE_MAX}
            rows={3}
            placeholder={write.placeholder}
            disabled={grading}
            aria-label={write.nth(active)}
            ref={box}
            // 배우는 언어를 알려줘요. 키보드 언어를 **강제할 수는 없지만**
            // (표준 API 가 없어요) iOS 는 사전·자동수정을 여기에 맞춰요
            lang={learningLanguage}
            // 🔒 브라우저가 긋는 빨간 줄도 교정이에요 (D-12).
            //    채점은 다 쓰고 나서 한 번에 하기로 했어요
            spellCheck={false}
            // 자동수정·자동대문자를 끄는 이유:
            // 키보드가 몰래 고쳐버리면 아이가 틀린 걸 짚어볼 기회가 사라져요
            autoCorrect="off"
            autoCapitalize="off"
            enterKeyHint="enter"
            className="mt-1.5 w-full resize-none rounded-2xl border-2 border-[#efe3c8] bg-[#fffdf5] px-4 py-3 text-sm leading-relaxed text-[#4a3a20] outline-none focus:border-[#f5c64b] disabled:opacity-60"
          />
        </label>

        {/* 저장 상태 — 자리를 늘 잡아둬서 화면이 안 흔들려요 */}
        <p className="mt-1.5 min-h-[16px] text-xs" aria-live="polite">
          {saveFailed ? (
            <span className="text-[#c07777]">{write.saveFailed}</span>
          ) : waiting ? (
            <span className="text-[#a08c66]">{write.saving}</span>
          ) : typed ? (
            <span className="text-[#6f9a5f]">{write.saved}</span>
          ) : null}
        </p>
      </div>

      {/* 🔒 쓰는 동안엔 교정이 안 보여요 (D-12) */}
      <p className="mt-2 flex items-start gap-1.5 rounded-2xl bg-[#efe7d6] px-3 py-2 text-xs leading-relaxed text-[#7a6a48]">
        <span aria-hidden="true">🔒</span>
        {write.hidden}
      </p>

      {gradeFailed && <p className="mt-3 text-xs text-[#c07777]">{write.gradeFailed}</p>}

      <div className="mt-5 flex gap-2">
        {!allWritten && (
          <button
            type="button"
            onClick={goNext}
            disabled={waiting || !typed}
            className="rounded-2xl border-2 border-[#efe3c8] bg-[#fffdf5] px-5 py-3 text-sm font-bold text-[#7a6a48] transition disabled:opacity-50"
          >
            {write.next}
          </button>
        )}
        <button
          type="button"
          onClick={onDone}
          disabled={!allWritten || waiting || grading}
          className="flex-1 rounded-2xl px-6 py-3 text-sm font-bold transition disabled:cursor-not-allowed"
          style={
            allWritten && !waiting && !grading
              ? { backgroundColor: "#f5c64b", color: "#4a3a20", boxShadow: "0 3px 0 #dca92e" }
              : { backgroundColor: "#efe3c8", color: "#a08c66" }
          }
        >
          {grading ? write.grading(buddyName) : write.done}
        </button>
      </div>
    </>
  );
}
