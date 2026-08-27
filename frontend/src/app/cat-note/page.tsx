"use client";

// ─────────────────────────────────────────────
// cat-note/page.tsx : 홈 탭 🏠
//
// 들어오면 제일 먼저 거치는 곳이라 갈림길 노릇도 해요.
//   로그인 안 함     → /login
//   수첩이 아직 없음 → /cat-note/start
//   수첩이 있음      → 오늘 얼마나 썼는지 보여주고 쓰기로 이어줘요
//
// ⚠️ 여기서도 교정은 안 보여줘요 (D-12). 다 쓰기 전엔 틀린 그대로 둡니다.
// ─────────────────────────────────────────────

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import CatIcon from "@/components/CatIcon";
import { PageTitle, useLanguage, useT } from "@/i18n/LanguageProvider";
import {
  fetchFriendFeed,
  fetchMe,
  fetchStats,
  fetchToday,
  type CatAccount,
  type FeedCard,
  type Stats,
  type TodayEntry,
} from "@/lib/catApi";
import { useLoginUser } from "@/lib/useLoginUser";

const TOTAL = 5;

const BUDDY_FACE: Record<CatAccount["partner"], string> = {
  kongi: "🐱",
  cheese: "🐈",
  meokmul: "🐈‍⬛",
  sikppang: "🍞",
};

/**
 * "2026-08-27" 을 그 나라 말로 바꿔요.
 *
 * new Date("2026-08-27") 로 읽으면 세계시 자정으로 잡혀서,
 * 시간대에 따라 하루 앞 날짜가 나올 수 있어요. 그래서 숫자로 쪼개 만듭니다.
 */
export function prettyDate(isoDay: string, locale: string): string {
  const [year, month, day] = isoDay.split("-").map(Number);
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(new Date(year, month - 1, day));
}

export default function CatNoteHome() {
  const t = useT();
  const { locale } = useLanguage();
  const router = useRouter();
  const { token, isKnown } = useLoginUser();

  const [account, setAccount] = useState<CatAccount | null>(null);
  const [entry, setEntry] = useState<TodayEntry | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [feed, setFeed] = useState<FeedCard[]>([]);
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

        // 오늘 수첩과 통계는 같이 불러요 — 하나씩 기다리면 화면이 늦게 떠요
        const [today, numbers] = await Promise.all([fetchToday(), fetchStats()]);
        if (!alive) return;
        setEntry(today);
        setStats(numbers);

        // 친구 소식은 없어도 홈은 멀쩡해야 해서 따로 봐줘요
        fetchFriendFeed()
          .then((it) => alive && setFeed(it.feed))
          .catch(() => {});
      } catch {
        if (alive) setFailed(true);
      }
    })();

    return () => {
      alive = false;
    };
  }, [isKnown, token, router]);

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

  const home = t.catNote.home;
  const buddy = t.catNote.start.partners[account.partner];
  const written = entry.sentences.length;
  const slots = Array.from({ length: TOTAL }, (_, index) => index + 1);

  // pt-14 는 위쪽 여백 — 언어 버튼이 왼쪽 위에 떠 있어서(fixed) 글이 가려져요
  return (
    <main className="flex flex-1 flex-col items-center px-6 pb-8 pt-14">
      <PageTitle title={t.catNote.title} />

      <div className="w-full max-w-sm">
        {/* 인사말 */}
        <h1 className="text-center text-2xl font-bold text-[#4a3a20]">
          {home.greeting(account.nickname)}
        </h1>
        <p className="mt-1 text-center text-xs text-[#a08c66]">
          {home.withBuddy(prettyDate(entry.entry_date, locale), buddy.name)}
        </p>

        {/* 오늘의 다섯 문장 */}
        <section className="mt-6 rounded-3xl border border-[#efe3c8] bg-[#fffdf5] px-5 py-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-bold text-[#4a3a20]">{home.todayCard}</h2>
            <span className="text-xs font-bold text-[#b98a1f]">
              {written} / {TOTAL}
            </span>
          </div>

          <ul className="mt-3 space-y-1.5">
            {slots.map((position) => {
              const sentence = entry.sentences.find((s) => s.position === position);
              return (
                <li key={position} className="flex items-start gap-2 text-sm">
                  <span
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                    style={
                      sentence
                        ? { backgroundColor: "#fbefc9", color: "#b98a1f" }
                        : { backgroundColor: "#f3ece0", color: "#c3b49a" }
                    }
                  >
                    {position}
                  </span>
                  {/* 틀렸어도 그대로 — 채점은 다 쓰고 나서예요 (D-12) */}
                  <span
                    className="leading-relaxed"
                    style={{ color: sentence ? "#4a3a20" : "#c3b49a" }}
                  >
                    {sentence ? sentence.text : home.emptySlot(position)}
                  </span>
                </li>
              );
            })}
          </ul>

          <Link
            href="/cat-note/write"
            className="mt-4 block rounded-2xl bg-[#f5c64b] px-6 py-3 text-center text-sm font-bold text-[#4a3a20] shadow-[0_3px_0_#dca92e] transition hover:bg-[#f0bb38]"
          >
            {entry.is_complete
              ? home.seeResult
              : written > 0
                ? home.keepWriting
                : home.goWrite}
          </Link>
        </section>

        {/* 짝꿍 한마디 — 말투가 짝꿍마다 달라요 (D-16) */}
        <div className="mt-4 flex items-start gap-2 rounded-2xl bg-[#f5eee0] px-4 py-3">
          <span className="text-xl" aria-hidden="true">
            {BUDDY_FACE[account.partner]}
          </span>
          <p className="flex-1 text-xs leading-relaxed text-[#7a6a48]">
            {home.buddySays[account.partner]}
          </p>
        </div>

        {/* 통계 3개 — 모든 사용자 공통 (D-16) */}
        {stats && (
          <ul className="mt-4 flex gap-2 text-center">
            <Stat value={`🔥 ${stats.streak_days}`} label={home.statStreak} />
            <Stat
              value={
                stats.weekly_accuracy === null ? home.notYet : `${stats.weekly_accuracy}%`
              }
              label={home.statAccuracy}
            />
            <Stat value={`🐾 ${stats.total_stamps}`} label={home.statStamps} />
          </ul>
        )}

        {/* 친구 소식 — 친구가 없으면 아예 안 나와요 */}
        {feed.length > 0 && (
          <section className="mt-5">
            <h2 className="text-xs font-bold text-[#7a6a48]">{home.friendNews}</h2>
            <ul className="mt-2 space-y-1.5">
              {feed.map((friend) => (
                <li key={friend.entry_id} className="text-xs text-[#a08c66]">
                  {friend.status === "complete"
                    ? home.friendDone(friend.nickname)
                    : home.friendWriting(friend.nickname)}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <li className="flex-1 rounded-2xl border border-[#efe3c8] bg-[#fffdf5] px-2 py-3">
      <span className="block text-base font-bold text-[#b98a1f]">{value}</span>
      <span className="block text-[11px] text-[#a08c66]">{label}</span>
    </li>
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
