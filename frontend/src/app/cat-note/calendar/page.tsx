"use client";

// ─────────────────────────────────────────────
// cat-note/calendar/page.tsx : 달력 탭 📅
//
// 발도장이 쌓인 달을 보고, 날짜를 누르면 그날 쓴 글을 펼쳐봐요.
// 지난 날은 이미 채점이 끝났으니 교정도 같이 보여줘요 (D-12 는 쓰는 중일 때만).
// ─────────────────────────────────────────────

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import CatCalendar from "@/components/CatCalendar";
import CatIcon from "@/components/CatIcon";
import { PageTitle, useLanguage, useT } from "@/i18n/LanguageProvider";
import {
  fetchEntryByDate,
  fetchMe,
  fetchMonth,
  fetchStats,
  type CalendarDay,
  type PastEntry,
  type Stats,
} from "@/lib/catApi";
import { useLoginUser } from "@/lib/useLoginUser";

/** 목표로 삼는 연속 기록 (시안 2d의 "🏆 10일 연속") */
const GOAL_STREAK = 10;

/** 오늘을 한국 날짜 문자열로 — 서버가 하루를 한국 시간으로 세거든요 (D-15) */
function todayInKorea(): { iso: string; year: number; month: number } {
  const seoul = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }),
  );
  const year = seoul.getFullYear();
  const month = seoul.getMonth() + 1;
  const day = seoul.getDate();
  return {
    iso: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    year,
    month,
  };
}

export default function CalendarPage() {
  const t = useT();
  const { locale } = useLanguage();
  const router = useRouter();
  const { token, isKnown } = useLoginUser();

  const [today] = useState(todayInKorea);
  const [year, setYear] = useState(today.year);
  const [month, setMonth] = useState(today.month);

  const [ready, setReady] = useState(false);
  const [days, setDays] = useState<CalendarDay[]>([]);
  const [stamps, setStamps] = useState(0);
  const [stats, setStats] = useState<Stats | null>(null);
  const [failed, setFailed] = useState(false);

  const [picked, setPicked] = useState<string | null>(null);
  // undefined = 불러오는 중 / null = 그날은 쓴 글이 없음
  const [detail, setDetail] = useState<PastEntry | null | undefined>(undefined);

  // 로그인·수첩 확인 + 통계 (한 번만)
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
        setReady(true);
        setStats(await fetchStats());
      } catch {
        if (alive) setFailed(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [isKnown, token, router]);

  // 달을 옮길 때마다 그 달 기록을 다시 불러요
  useEffect(() => {
    if (!ready) return;

    let alive = true;
    fetchMonth(year, month)
      .then((result) => {
        if (!alive) return;
        setDays(result.days);
        setStamps(result.total_stamps_this_month);
      })
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [ready, year, month]);

  // 고른 날의 글
  useEffect(() => {
    if (!picked) return;

    let alive = true;
    fetchEntryByDate(picked)
      .then((entry) => alive && setDetail(entry))
      // 404 = 그날은 쓴 글이 없어요. 잘못된 게 아니에요
      .catch(() => alive && setDetail(null));
    return () => {
      alive = false;
    };
  }, [picked]);

  function goPrev() {
    setPicked(null);
    setDetail(undefined);
    if (month === 1) {
      setYear(year - 1);
      setMonth(12);
    } else {
      setMonth(month - 1);
    }
  }

  function goNext() {
    setPicked(null);
    setDetail(undefined);
    if (month === 12) {
      setYear(year + 1);
      setMonth(1);
    } else {
      setMonth(month + 1);
    }
  }

  function pick(day: string) {
    setPicked(day);
    setDetail(undefined);
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

  if (!ready) {
    return (
      <Waiting>
        <p className="text-sm text-[#a08c66]">{t.catNote.gate.checking}</p>
      </Waiting>
    );
  }

  const calendar = t.catNote.calendar;
  // 이번 달보다 앞으로는 못 가요 — 아직 오지 않은 날이라 볼 게 없어요
  const canGoNext = year < today.year || (year === today.year && month < today.month);
  const streak = stats?.streak_days ?? 0;

  // pt-14 는 위쪽 여백 — 언어 버튼이 왼쪽 위에 떠 있어서(fixed) 글이 가려져요
  return (
    <main className="flex flex-1 flex-col items-center px-6 pb-8 pt-14">
      <PageTitle title={`${calendar.title} · ${t.catNote.title}`} />

      <div className="w-full max-w-sm">
        <h1 className="text-center text-2xl font-bold text-[#4a3a20]">{calendar.title}</h1>
        <p className="mt-1 text-center text-xs text-[#a08c66]">
          {calendar.stampsThisMonth(stamps)}
        </p>

        {/* 목표 배너 */}
        <p className="mt-4 rounded-2xl bg-[#fbefc9] px-4 py-2.5 text-center text-xs font-bold text-[#b98a1f]">
          {streak >= GOAL_STREAK
            ? calendar.goalDone(GOAL_STREAK)
            : `🏆 ${calendar.goal(GOAL_STREAK - streak, GOAL_STREAK)}`}
        </p>

        <div className="mt-4">
          <CatCalendar
            year={year}
            month={month}
            days={days}
            todayIso={today.iso}
            selected={picked}
            locale={locale}
            canGoNext={canGoNext}
            onPick={pick}
            onPrev={goPrev}
            onNext={goNext}
          />
        </div>

        {/* 고른 날의 글 */}
        <div className="mt-4">
          {!picked ? (
            <p className="text-center text-xs text-[#a08c66]">{calendar.pickDay}</p>
          ) : (
            <DayDetail day={picked} entry={detail} locale={locale} />
          )}
        </div>
      </div>
    </main>
  );
}

function DayDetail({
  day,
  entry,
  locale,
}: {
  day: string;
  entry: PastEntry | null | undefined;
  locale: string;
}) {
  const t = useT();
  const calendar = t.catNote.calendar;
  const result = t.catNote.result;

  const [year, month, date] = day.split("-").map(Number);
  const title = new Intl.DateTimeFormat(locale, {
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(new Date(year, month - 1, date));

  if (entry === undefined) {
    return <p className="text-center text-xs text-[#a08c66]">{t.catNote.loading}</p>;
  }

  return (
    <section className="rounded-3xl border border-[#efe3c8] bg-[#fffdf5] px-5 py-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-bold text-[#4a3a20]">{title}</h2>
        {entry?.accuracy !== null && entry?.accuracy !== undefined && (
          <span className="text-xs font-bold text-[#b98a1f]">
            {result.accuracy} {entry.accuracy}%
          </span>
        )}
      </div>

      {entry === null ? (
        <p className="mt-3 text-xs text-[#a08c66]">{calendar.noEntry}</p>
      ) : (
        <>
          {!entry.is_complete && (
            <p className="mt-2 text-xs text-[#a08c66]">{calendar.notFinished}</p>
          )}
          <ul className="mt-3 space-y-2.5">
            {entry.sentences.map((sentence) => (
              <li key={sentence.position} className="text-sm">
                <p className="leading-relaxed text-[#4a3a20]">
                  <span className="mr-1.5 text-[10px] font-bold text-[#b98a1f]">
                    {sentence.position}
                  </span>
                  {sentence.original_text}
                </p>
                {sentence.corrected_text && (
                  <p className="mt-0.5 pl-4 text-xs font-medium text-[#7a6a48]">
                    → {sentence.corrected_text}
                  </p>
                )}
                {sentence.translation && (
                  <p className="mt-0.5 pl-4 text-xs text-[#a08c66]">
                    <span aria-hidden="true">🌐 </span>
                    {sentence.translation}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
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
