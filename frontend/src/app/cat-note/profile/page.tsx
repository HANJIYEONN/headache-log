"use client";

// ─────────────────────────────────────────────
// cat-note/profile/page.tsx : 내 정보 탭 🐱 (시안 2f)
//
// 어린이·어른 화면이 하나로 합쳐진 자리예요 (D-16).
// 저장 버튼은 따로 없어요 — 고치면 바로 저장되고 "저장했어요" 라고 알려줘요.
// 아이가 "저장했나?" 하고 걱정하지 않게요.
// ─────────────────────────────────────────────

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import CatIcon from "@/components/CatIcon";
import { LOCALES, LOCALE_LABELS } from "@/i18n/dictionaries";
import { PageTitle, useT } from "@/i18n/LanguageProvider";
import {
  fetchMe,
  fetchStats,
  fetchVocab,
  removeVocab,
  updateAccount,
  type Avatar,
  type CatAccount,
  type Partner,
  type Stats,
  type UpdateAccount,
  type VocabItem,
} from "@/lib/catApi";
import { useLoginUser } from "@/lib/useLoginUser";

const NICKNAME_MAX = 10;
const BIO_MAX = 100;
const PAUSE_MS = 800;

const AVATARS: { id: Avatar; face: string }[] = [
  { id: "cat", face: "🐱" },
  { id: "dog", face: "🐶" },
  { id: "rabbit", face: "🐰" },
  { id: "dino", face: "🦖" },
];

const PARTNERS: { id: Partner; face: string }[] = [
  { id: "kongi", face: "🐱" },
  { id: "cheese", face: "🐈" },
  { id: "meokmul", face: "🐈‍⬛" },
  { id: "sikppang", face: "🍞" },
];

type SaveState = "idle" | "saving" | "saved" | "failed";

export default function ProfilePage() {
  const t = useT();
  const router = useRouter();
  const { token, isKnown } = useLoginUser();

  const [account, setAccount] = useState<CatAccount | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [vocab, setVocab] = useState<VocabItem[]>([]);
  const [failed, setFailed] = useState(false);

  const [nickname, setNickname] = useState("");
  const [bio, setBio] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("idle");

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
        setNickname(me.nickname);
        setBio(me.bio ?? "");

        const [numbers, words] = await Promise.all([fetchStats(), fetchVocab()]);
        if (!alive) return;
        setStats(numbers);
        setVocab(words.vocab);
      } catch {
        if (alive) setFailed(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [isKnown, token, router]);

  async function save(changes: UpdateAccount) {
    setSaveState("saving");
    try {
      setAccount(await updateAccount(changes));
      setSaveState("saved");
    } catch {
      setSaveState("failed");
    }
  }

  // 별명·소개는 타이핑이 멈추면 저장해요
  useEffect(() => {
    if (!account) return;

    const changes: UpdateAccount = {};
    if (nickname.trim() && nickname.trim() !== account.nickname) {
      changes.nickname = nickname.trim();
    }
    if (bio.trim() !== (account.bio ?? "")) {
      changes.bio = bio.trim();
    }
    if (Object.keys(changes).length === 0) return;

    let alive = true;
    const timer = setTimeout(() => {
      if (!alive) return;
      updateAccount(changes)
        .then((fresh) => {
          if (!alive) return;
          setAccount(fresh);
          setSaveState("saved");
        })
        .catch(() => alive && setSaveState("failed"));
    }, PAUSE_MS);

    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [nickname, bio, account]);

  async function dropWord(vocabId: number) {
    try {
      await removeVocab(vocabId);
      setVocab((before) => before.filter((word) => word.vocab_id !== vocabId));
      // 단어장 개수가 단계를 정해요 (D-23) — 같이 새로 받아와요
      setStats(await fetchStats());
    } catch {
      setSaveState("failed");
    }
  }

  function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    window.location.href = "/login";
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

  if (!account) {
    return (
      <Waiting>
        <p className="text-sm text-[#a08c66]">{t.catNote.gate.checking}</p>
      </Waiting>
    );
  }

  const profile = t.catNote.profile;

  // pt-14 는 위쪽 여백 — 언어 버튼이 왼쪽 위에 떠 있어서(fixed) 글이 가려져요
  return (
    <main className="flex flex-1 flex-col items-center px-6 pb-8 pt-14">
      <PageTitle title={`${profile.title} · ${t.catNote.title}`} />

      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-center text-2xl font-bold text-[#4a3a20]">{profile.title}</h1>

        {/* 저장 상태 — 자리를 늘 잡아둬서 화면이 안 흔들려요 */}
        <p className="min-h-[16px] text-center text-xs" aria-live="polite">
          {saveState === "failed" ? (
            <span className="text-[#c07777]">{profile.saveFailed}</span>
          ) : saveState === "saved" ? (
            <span className="text-[#6f9a5f]">{profile.saved}</span>
          ) : null}
        </p>

        {/* 수첩 아이디 — 못 바꿔요 (D-10) */}
        <Card title={profile.noteId}>
          <p className="text-lg font-bold text-[#4a3a20]">@{account.note_id}</p>
          <p className="mt-1 text-xs text-[#a08c66]">{profile.noteIdFixed}</p>
        </Card>

        {/* 별명 · 소개 */}
        <Card title={profile.nickname}>
          <input
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            maxLength={NICKNAME_MAX}
            aria-label={profile.nickname}
            className="w-full rounded-xl border-2 border-[#efe3c8] bg-[#fdf9ef] px-3 py-2 text-sm text-[#4a3a20] outline-none focus:border-[#f5c64b]"
          />
          <p className="mt-3 text-xs font-bold text-[#7a6a48]">{profile.bio}</p>
          <textarea
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            maxLength={BIO_MAX}
            rows={2}
            placeholder={profile.bioPlaceholder}
            aria-label={profile.bio}
            className="mt-1 w-full resize-none rounded-xl border-2 border-[#efe3c8] bg-[#fdf9ef] px-3 py-2 text-sm leading-relaxed text-[#4a3a20] outline-none focus:border-[#f5c64b]"
          />
        </Card>

        {/* 내 동반 동물 */}
        <Card title={profile.avatar}>
          <ul className="flex gap-2">
            {AVATARS.map(({ id, face }) => (
              <li key={id} className="flex-1">
                <Pick
                  picked={account.avatar === id}
                  label={profile.avatars[id]}
                  face={face}
                  onPick={() => save({ avatar: id })}
                />
              </li>
            ))}
          </ul>
        </Card>

        {/* 함께 쓰는 짝꿍 — 나중에 바꿔도 돼요 (D-17) */}
        <Card title={profile.partner} hint={profile.partnerHint}>
          <ul className="flex gap-2">
            {PARTNERS.map(({ id, face }) => (
              <li key={id} className="flex-1">
                <Pick
                  picked={account.partner === id}
                  label={t.catNote.start.partners[id].name}
                  face={face}
                  onPick={() => save({ partner: id })}
                />
              </li>
            ))}
          </ul>
        </Card>

        {/* 언어 두 가지 */}
        <Card title={profile.learning}>
          <ul className="flex gap-2">
            {LOCALES.map((code) => (
              <li key={code} className="flex-1">
                <Pick
                  picked={account.learning_language === code}
                  label={LOCALE_LABELS[code].full}
                  onPick={() => save({ learning_language: code })}
                />
              </li>
            ))}
          </ul>
        </Card>

        <Card title={profile.feedback}>
          <ul className="flex flex-wrap gap-2">
            <li className="min-w-[6rem] flex-1">
              <Pick
                picked={account.feedback_language === null}
                label={profile.sameAsLearning}
                // null 을 보내면 "배우는 언어로" 로 돌아가요
                onPick={() => save({ feedback_language: null })}
              />
            </li>
            {LOCALES.map((code) => (
              <li key={code} className="min-w-[4rem] flex-1">
                <Pick
                  picked={account.feedback_language === code}
                  label={LOCALE_LABELS[code].full}
                  onPick={() => save({ feedback_language: code })}
                />
              </li>
            ))}
          </ul>
        </Card>

        {/* 내 단계 — 단어장 개수로 정해져요 (D-23) */}
        {stats && (
          <Card title={profile.stage}>
            <p className="text-lg font-bold text-[#b98a1f]">
              {profile.stageValue(account.writing_stage)} · {stats.level}
            </p>
            <p className="mt-1 text-xs text-[#a08c66]">
              {stats.expressions_to_next_level === 0
                ? profile.stageTop
                : profile.stageLeft(stats.expressions_to_next_level)}
            </p>
          </Card>
        )}

        {/* 단어장 */}
        <Card title={profile.vocab} hint={profile.vocabCount(vocab.length)}>
          {vocab.length === 0 ? (
            <p className="text-xs leading-relaxed text-[#a08c66]">{profile.vocabEmpty}</p>
          ) : (
            <ul className="space-y-2">
              {vocab.map((word) => (
                <li key={word.vocab_id} className="flex items-start gap-2">
                  <span className="flex-1">
                    <span className="block text-sm font-medium text-[#4a3a20]">
                      {word.expression}
                    </span>
                    {word.meaning && (
                      <span className="mt-0.5 block text-xs leading-relaxed text-[#a08c66]">
                        {word.meaning}
                      </span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => dropWord(word.vocab_id)}
                    aria-label={`${word.expression} ${profile.vocabRemove}`}
                    className="shrink-0 rounded-full border border-[#efe3c8] px-2.5 py-1 text-[11px] text-[#a08c66] transition hover:bg-[#fbefc9]"
                  >
                    {profile.vocabRemove}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* 매일 알림 */}
        <Card title={profile.reminder}>
          <button
            type="button"
            role="switch"
            aria-checked={account.daily_reminder}
            aria-label={profile.reminder}
            onClick={() => save({ daily_reminder: !account.daily_reminder })}
            className="flex h-8 w-14 items-center rounded-full px-1 transition"
            style={{ backgroundColor: account.daily_reminder ? "#f5c64b" : "#efe3c8" }}
          >
            <span
              className="h-6 w-6 rounded-full bg-white shadow-sm transition"
              style={{ transform: account.daily_reminder ? "translateX(24px)" : "none" }}
            />
          </button>
        </Card>

        <button
          type="button"
          onClick={logout}
          className="w-full rounded-2xl border-2 border-[#efe3c8] bg-[#fffdf5] px-6 py-3 text-sm font-bold text-[#a08c66] transition hover:bg-[#f5eee0]"
        >
          {t.common.logout}
        </button>
      </div>
    </main>
  );
}

function Card({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#efe3c8] bg-[#fffdf5] px-4 py-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xs font-bold text-[#7a6a48]">{title}</h2>
        {hint && <span className="text-[10px] text-[#a08c66]">{hint}</span>}
      </div>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function Pick({
  picked,
  label,
  face,
  onPick,
}: {
  picked: boolean;
  label: string;
  face?: string;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      aria-pressed={picked}
      className="flex w-full flex-col items-center gap-0.5 rounded-xl border-2 px-1 py-2 text-[11px] font-medium transition"
      style={{
        borderColor: picked ? "#f5c64b" : "#efe3c8",
        backgroundColor: picked ? "#fbefc9" : "transparent",
        color: picked ? "#b98a1f" : "#a08c66",
      }}
    >
      {face && (
        <span className="text-lg" aria-hidden="true">
          {face}
        </span>
      )}
      {label}
    </button>
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
