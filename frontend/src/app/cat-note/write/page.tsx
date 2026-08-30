"use client";

// ─────────────────────────────────────────────
// cat-note/write/page.tsx : 쓰기 탭 ✏️
//
// 오늘 수첩을 이미 냈으면 채점 결과(6h)를, 아니면 쓰는 화면(6g)을 보여줘요.
// AI 채점은 하루에 "다 썼어요!" 를 누를 때 딱 한 번만 일어나요 (D-12).
// ─────────────────────────────────────────────

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import CatIcon from "@/components/CatIcon";
import CatResult from "@/components/CatResult";
import CatWriting from "@/components/CatWriting";
import { PageTitle, useT } from "@/i18n/LanguageProvider";
import {
  completeToday,
  fetchEntryByDate,
  fetchMe,
  fetchToday,
  fetchTodayPrompt,
  type CatAccount,
  type GradedEntry,
  type PastEntry,
  type TodayEntry,
} from "@/lib/catApi";
import { useLoginUser } from "@/lib/useLoginUser";

/** 채점이 끝난 수첩 — 방금 낸 것이든 예전 것이든 */
type Graded = GradedEntry | PastEntry;

export default function WritePage() {
  const t = useT();
  const router = useRouter();
  const { token, isKnown } = useLoginUser();

  const [account, setAccount] = useState<CatAccount | null>(null);
  const [entry, setEntry] = useState<TodayEntry | null>(null);
  const [graded, setGraded] = useState<Graded | null>(null);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [grading, setGrading] = useState(false);
  const [gradeFailed, setGradeFailed] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!isKnown) return;
    if (token === null) {
      router.replace("/login");
      return;
    }

    let alive = true;
    (async () => {
      try {
        const me = await fetchMe();
        if (!alive) return;
        if (!me.exists) {
          router.replace("/cat-note/start");
          return;
        }
        setAccount(me);

        const today = await fetchToday();
        if (!alive) return;
        setEntry(today);

        if (today.is_complete) {
          // 오늘 수첩을 이미 냈어요. 교정까지 담긴 건 이쪽 API 예요.
          const past = await fetchEntryByDate(today.entry_date);
          if (alive) setGraded(past);
        } else {
          // 글감은 없어도 글은 쓸 수 있으니 따로 실패를 봐줘요
          fetchTodayPrompt()
            .then((it) => alive && setPrompt(it.prompt))
            .catch(() => {});
        }
      } catch {
        if (alive) setFailed(true);
      }
    })();

    return () => {
      alive = false;
    };
  }, [isKnown, token, router]);

  async function finish() {
    setGrading(true);
    setGradeFailed(false);
    try {
      // ⏱️ AI 가 읽는 데 몇 초 걸려요
      setGraded(await completeToday());
    } catch {
      // 글은 이미 저장돼 있어요 (NF-06). 다시 눌러보면 돼요.
      setGradeFailed(true);
    } finally {
      setGrading(false);
    }
  }

  if (failed) {
    return (
      <Waiting>
        <p className="text-sm text-[#7a6a48]">{t.catNote.error.generic}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 rounded-2xl bg-[#f5c64b] px-6 py-2.5 text-sm font-bold text-[#4a3a20] shadow-[0_3px_0_#dca92e] transition hover:bg-[#f0bb38]"
        >
          {t.catNote.error.retry}
        </button>
      </Waiting>
    );
  }

  if (!account || !entry) {
    return (
      <Waiting>
        <p className="text-sm text-[#a08c66]">{t.catNote.gate.checking}</p>
      </Waiting>
    );
  }

  const buddyName = t.catNote.start.partners[account.partner].name;

  // pt-14 는 위쪽 여백 — 언어 버튼이 왼쪽 위에 떠 있어서(fixed) 글이 가려져요
  return (
    <main className="flex flex-1 flex-col items-center px-6 pb-8 pt-14">
      <PageTitle title={`${t.catNote.tabs.write} · ${t.catNote.title}`} />

      <div className="w-full max-w-sm">
        {graded ? (
          <CatResult
            accuracy={graded.accuracy}
            partner={account.partner}
            sentences={graded.sentences}
            newExpressions={graded.new_expressions}
            // 발도장·연속은 방금 낸 결과에만 담겨 와요 ("지금" 값이라서요)
            streakDays={"streak_days" in graded ? graded.streak_days : null}
            totalStamps={"total_stamps" in graded ? graded.total_stamps : null}
          />
        ) : (
          <CatWriting
            entry={entry}
            buddyName={buddyName}
            learningLanguage={account.learning_language}
            prompt={prompt}
            onDone={finish}
            grading={grading}
            gradeFailed={gradeFailed}
          />
        )}
      </div>
    </main>
  );
}

/** 기다리는 중·문제가 생겼을 때 쓰는 가운데 정렬 자리 */
function Waiting({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#efe3c8] bg-[#fffdf5] text-[#dca92e]">
        <CatIcon className="h-8 w-8" />
      </span>
      <div className="mt-4">{children}</div>
    </main>
  );
}
