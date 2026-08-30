"use client";

// ─────────────────────────────────────────────
// cat-note/start/page.tsx : 수첩 만들기 (회원가입 2단계) ✨
//
//   1/2  누구랑 함께 쓸래?  — 짝꿍 4명 중 하나 (말투만 정해요, D-16)
//   2/2  별명 + 수첩 아이디 — 아이디는 쓸 수 있는지 바로 확인해줘요
//
// 아이디는 나중에 못 바꿔요 (친구가 나를 못 찾게 되니까, D-10).
// 그래서 만들기 전에 확인을 꼼꼼히 해요.
// ─────────────────────────────────────────────

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import CatBuddy from "@/components/CatBuddy";
import CatIcon from "@/components/CatIcon";
import { PageTitle, useT } from "@/i18n/LanguageProvider";
import {
  checkNoteId,
  createAccount,
  fetchMe,
  type NoteIdCheck,
  type NoteIdReason,
  type Partner,
} from "@/lib/catApi";
import { useLoginUser } from "@/lib/useLoginUser";

// 서버가 정한 규칙과 같은 값이어야 해요 (app/cat_schemas.py)
const NOTE_ID_MIN = 4;
const NOTE_ID_MAX = 15;
const NICKNAME_MAX = 10;

/** 아이디를 확인하러 가기 전에 기다리는 시간 — 타이핑이 멈췄을 때만 물어봐요 */
const PAUSE_MS = 400;

// 이모지 대신 직접 그린 얼굴을 써요 — 폰마다 그림이 달라지지 않게
const PARTNERS: Partner[] = ["kongi", "cheese", "meokmul", "sikppang"];

export default function StartPage() {
  const t = useT();
  const router = useRouter();
  const { token, isKnown } = useLoginUser();

  const [step, setStep] = useState<1 | 2>(1);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [nickname, setNickname] = useState("");
  const [noteId, setNoteId] = useState("");

  // 확인 결과는 "어떤 글자에 대한 결과인지"까지 같이 기억해요.
  // 그러면 글자가 바뀌는 순간 낡은 결과가 저절로 무효가 돼서,
  // 효과 안에서 결과를 지우는 뒤처리를 할 필요가 없어요.
  const [checked, setChecked] = useState<{
    value: string;
    result: NoteIdCheck | "failed";
  } | null>(null);
  const [creating, setCreating] = useState(false);
  const [failed, setFailed] = useState(false);

  const typed = noteId.trim();
  const outcome = checked?.value === typed ? checked.result : null;
  const checking = typed.length > 0 && outcome === null;
  const check = outcome === "failed" ? null : outcome;
  const checkFailed = outcome === "failed";

  // 로그인 안 했으면 로그인으로, 이미 수첩이 있으면 홈으로
  useEffect(() => {
    if (!isKnown) return;
    if (token === null) {
      router.replace("/login");
      return;
    }
    let alive = true;
    fetchMe()
      .then((me) => alive && me.exists && router.replace("/cat-note"))
      .catch(() => {
        /* 여기서 실패해도 수첩 만들기는 계속할 수 있어요 */
      });
    return () => {
      alive = false;
    };
  }, [isKnown, token, router]);

  // 아이디를 칠 때마다가 아니라, 잠깐 멈췄을 때 한 번만 물어봐요.
  // 한 글자마다 부르면 서버에 요청이 쏟아져요.
  useEffect(() => {
    const value = noteId.trim();
    if (!value) return;

    let alive = true;
    const timer = setTimeout(() => {
      checkNoteId(value)
        .then((result) => alive && setChecked({ value, result }))
        // 실패도 결과로 남겨둬요. 안 그러면 "확인하는 중…"에서 영영 안 벗어나요
        .catch(() => alive && setChecked({ value, result: "failed" }));
    }, PAUSE_MS);

    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [noteId]);

  const ready =
    partner !== null && nickname.trim().length > 0 && check?.available === true && !creating;

  async function makeNotebook() {
    if (!ready || partner === null) return;
    setCreating(true);
    setFailed(false);
    try {
      await createAccount({
        partner,
        note_id: noteId.trim(),
        nickname: nickname.trim(),
      });
      router.replace("/cat-note");
    } catch {
      setFailed(true);
      setCreating(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-10">
      <PageTitle title={`${t.catNote.title} · ${t.catNote.start.step(step, 2)}`} />

      <div className="w-full max-w-sm">
        <p className="text-center text-xs font-bold tracking-wide text-[#b98a1f]">
          {t.catNote.start.step(step, 2)}
        </p>

        {step === 1 ? (
          <PickPartner
            picked={partner}
            onPick={setPartner}
            onNext={() => setStep(2)}
          />
        ) : (
          <MakeId
            nickname={nickname}
            onNickname={setNickname}
            noteId={noteId}
            onNoteId={setNoteId}
            check={check}
            checking={checking}
            checkFailed={checkFailed}
            creating={creating}
            failed={failed}
            ready={ready}
            onBack={() => setStep(1)}
            onCreate={makeNotebook}
          />
        )}
      </div>
    </main>
  );
}

// ── 1/2 짝꿍 고르기 ────────────────────────────────────

function PickPartner({
  picked,
  onPick,
  onNext,
}: {
  picked: Partner | null;
  onPick: (partner: Partner) => void;
  onNext: () => void;
}) {
  const t = useT();

  return (
    <>
      <h1 className="mt-2 text-center text-2xl font-bold text-[#4a3a20]">
        {t.catNote.start.pickPartner}
      </h1>
      <p className="mt-2 text-center text-xs leading-relaxed text-[#a08c66]">
        {t.catNote.start.pickPartnerHint}
      </p>

      <ul className="mt-6 space-y-3">
        {PARTNERS.map((id) => {
          const buddy = t.catNote.start.partners[id];
          const chosen = picked === id;
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onPick(id)}
                // 화면 읽어주는 프로그램에도 "골랐음"이 전해지게
                aria-pressed={chosen}
                // 이름표를 따로 달아요. 안 그러면 조각난 글씨가 띄어쓰기 없이
                // "콩이초등 이하" 처럼 붙어서 읽혀요
                aria-label={`${buddy.name}, ${buddy.who}. ${buddy.says}`}
                className="flex w-full items-center gap-3 rounded-2xl border-2 bg-[#fffdf5] px-4 py-3 text-left transition"
                style={{
                  borderColor: chosen ? "#f5c64b" : "#efe3c8",
                  backgroundColor: chosen ? "#fbefc9" : "#fffdf5",
                }}
              >
                <CatBuddy partner={id} className="h-11 w-11 shrink-0" />
                <span className="flex-1">
                  <span className="block text-sm font-bold text-[#4a3a20]">
                    {buddy.name}
                    <span className="ml-2 text-xs font-medium text-[#a08c66]">{buddy.who}</span>
                  </span>
                  <span className="mt-0.5 block text-xs text-[#7a6a48]">“{buddy.says}”</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={onNext}
        disabled={picked === null}
        className="mt-6 w-full rounded-2xl px-6 py-3 text-sm font-bold transition disabled:cursor-not-allowed"
        style={
          picked === null
            ? { backgroundColor: "#efe3c8", color: "#a08c66" }
            : {
                backgroundColor: "#f5c64b",
                color: "#4a3a20",
                boxShadow: "0 3px 0 #dca92e",
              }
        }
      >
        {t.catNote.start.next}
      </button>
    </>
  );
}

// ── 2/2 별명 + 수첩 아이디 ─────────────────────────────

/** 서버가 알려준 이유를 화면 문구로 바꿔요 (D-19 — 세 가지만) */
export function reasonText(
  reason: NoteIdReason | null,
  errors: { duplicate: string; length: string; invalidChar: string },
): string | null {
  if (reason === "duplicate") return errors.duplicate;
  if (reason === "too_short" || reason === "too_long") return errors.length;
  if (reason === "invalid_char") return errors.invalidChar;
  return null;
}

function MakeId({
  nickname,
  onNickname,
  noteId,
  onNoteId,
  check,
  checking,
  checkFailed,
  creating,
  failed,
  ready,
  onBack,
  onCreate,
}: {
  nickname: string;
  onNickname: (value: string) => void;
  noteId: string;
  onNoteId: (value: string) => void;
  check: NoteIdCheck | null;
  checking: boolean;
  checkFailed: boolean;
  creating: boolean;
  failed: boolean;
  ready: boolean;
  onBack: () => void;
  onCreate: () => void;
}) {
  const t = useT();
  const start = t.catNote.start;
  const problem = checking ? null : reasonText(check?.reason ?? null, start.errors);
  const good = !checking && check?.available === true;

  return (
    <>
      <h1 className="mt-2 text-center text-2xl font-bold text-[#4a3a20]">{start.noteIdLabel}</h1>
      <p className="mt-2 text-center text-xs text-[#a08c66]">{start.noteIdWhy}</p>

      {/* 별명 */}
      <label className="mt-6 block">
        <span className="text-xs font-bold text-[#7a6a48]">{start.nicknameLabel}</span>
        <input
          value={nickname}
          onChange={(event) => onNickname(event.target.value)}
          aria-label={start.nicknameLabel}
          maxLength={NICKNAME_MAX}
          placeholder={start.nicknamePlaceholder}
          className="mt-1.5 w-full rounded-2xl border-2 border-[#efe3c8] bg-[#fffdf5] px-4 py-3 text-sm text-[#4a3a20] outline-none focus:border-[#f5c64b]"
        />
      </label>

      {/* 수첩 아이디 */}
      <label className="mt-4 block">
        <span className="text-xs font-bold text-[#7a6a48]">{start.noteIdField}</span>
        <span className="mt-1.5 flex items-center rounded-2xl border-2 bg-[#fffdf5] px-4 focus-within:border-[#f5c64b]"
          style={{ borderColor: problem ? "#e0a0a0" : good ? "#a8cf9a" : "#efe3c8" }}
        >
          <span className="text-sm text-[#a08c66]" aria-hidden="true">
            @
          </span>
          <input
            value={noteId}
            onChange={(event) => onNoteId(event.target.value)}
            // 입력칸이 <span> 안에 들어가 있어서 이름이 안 잡혀요.
            // 화면 읽어주는 프로그램이 "편집" 이라고만 말하면 뭘 쓸지 알 수 없어요
            aria-label={start.noteIdField}
            maxLength={NOTE_ID_MAX}
            minLength={NOTE_ID_MIN}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            inputMode="text"
            aria-invalid={problem !== null}
            className="w-full bg-transparent py-3 pl-1 text-sm text-[#4a3a20] outline-none"
          />
        </span>
      </label>

      {/* 확인 결과 — 자리를 늘 잡아둬서 글씨가 나타날 때 화면이 안 흔들려요 */}
      <p className="mt-2 min-h-[18px] text-xs">
        {checking && <span className="text-[#a08c66]">{start.checking}</span>}
        {checkFailed && <span className="text-[#c07777]">{t.catNote.error.generic}</span>}
        {problem && <span className="text-[#c07777]">{problem}</span>}
        {good && <span className="text-[#6f9a5f]">{start.available}</span>}
      </p>

      <p className="mt-1 text-xs text-[#a08c66]">{start.noteIdHint}</p>

      {/* 추천 아이디 칩 */}
      {check && check.suggestions.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-bold text-[#7a6a48]">{start.suggestions}</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {check.suggestions.map((suggestion) => (
              <li key={suggestion}>
                <button
                  type="button"
                  onClick={() => onNoteId(suggestion)}
                  className="rounded-full border border-[#efe3c8] bg-[#fffdf5] px-3 py-1.5 text-xs font-medium text-[#7a6a48] transition hover:bg-[#fbefc9]"
                >
                  @{suggestion}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {failed && <p className="mt-4 text-xs text-[#c07777]">{start.failed}</p>}

      <div className="mt-6 flex gap-2">
        <button
          type="button"
          onClick={onBack}
          className="rounded-2xl border-2 border-[#efe3c8] bg-[#fffdf5] px-5 py-3 text-sm font-bold text-[#7a6a48] transition hover:bg-[#fbefc9]"
        >
          {start.back}
        </button>
        <button
          type="button"
          onClick={onCreate}
          disabled={!ready}
          className="flex-1 rounded-2xl px-6 py-3 text-sm font-bold transition disabled:cursor-not-allowed"
          style={
            ready
              ? { backgroundColor: "#f5c64b", color: "#4a3a20", boxShadow: "0 3px 0 #dca92e" }
              : { backgroundColor: "#efe3c8", color: "#a08c66" }
          }
        >
          {creating ? start.creating : start.create}
        </button>
      </div>

      <p className="mt-6 flex items-center justify-center gap-1.5 text-[#dca92e]">
        <CatIcon className="h-5 w-5" />
      </p>
    </>
  );
}
