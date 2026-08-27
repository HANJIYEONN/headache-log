"use client";

// ─────────────────────────────────────────────
// cat-note/friends/page.tsx : 친구 탭 👥 (시안 2e)
//
//   친구 찾기 → 신청 → (상대가 수락) → 친구 목록 · 오늘 소식
//
// 아이디를 **정확히** 알아야 찾을 수 있어요 (NF-04).
// "민" 만 넣어도 찾아지면 모르는 어른이 아이들을 훑을 수 있거든요.
// ─────────────────────────────────────────────

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import CatFriendCard from "@/components/CatFriendCard";
import CatIcon from "@/components/CatIcon";
import { PageTitle, useT } from "@/i18n/LanguageProvider";
import {
  acceptFriend,
  fetchFriendFeed,
  fetchFriends,
  fetchMe,
  removeFriend,
  requestFriend,
  searchUser,
  type ApiError,
  type FeedCard,
  type FriendList,
  type SearchResult,
} from "@/lib/catApi";
import { useLoginUser } from "@/lib/useLoginUser";

const AVATAR_FACE: Record<string, string> = {
  cat: "🐱",
  dog: "🐶",
  rabbit: "🐰",
  dino: "🦖",
};

export default function FriendsPage() {
  const t = useT();
  const router = useRouter();
  const { token, isKnown } = useLoginUser();

  const [list, setList] = useState<FriendList | null>(null);
  const [feed, setFeed] = useState<FeedCard[]>([]);
  const [failed, setFailed] = useState(false);

  const [query, setQuery] = useState("");
  // undefined = 아직 안 찾아봄
  const [found, setFound] = useState<SearchResult | undefined>(undefined);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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
        const [friends, today] = await Promise.all([fetchFriends(), fetchFriendFeed()]);
        if (!alive) return;
        setList(friends);
        setFeed(today.feed);
      } catch {
        if (alive) setFailed(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [isKnown, token, router]);

  async function refresh() {
    const [friends, today] = await Promise.all([fetchFriends(), fetchFriendFeed()]);
    setList(friends);
    setFeed(today.feed);
  }

  async function look() {
    const noteId = query.trim();
    if (!noteId || busy) return;
    setBusy(true);
    setNotice(null);
    try {
      setFound(await searchUser(noteId));
    } catch {
      setFound({ found: false });
    } finally {
      setBusy(false);
    }
  }

  async function ask(noteId: string) {
    if (!list || busy) return;

    // 내 자리가 꽉 찼는지는 물어보기 전에 알 수 있어요 (D-22)
    if (list.friends.length >= list.max_friends) {
      setNotice(t.catNote.friends.full(list.max_friends));
      return;
    }

    setBusy(true);
    try {
      await requestFriend(noteId);
      setNotice(t.catNote.friends.requested);
      setFound(undefined);
      setQuery("");
      await refresh();
    } catch (error) {
      const status = (error as ApiError).status;
      // 409 는 "이미 친구/신청함" 이거나 "상대가 가득 참" 인데,
      // 앞쪽이 훨씬 흔해서 그 문구를 보여줘요
      setNotice(
        status === 404
          ? t.catNote.friends.notFound
          : status === 400
            ? t.catNote.friends.cannotSelf
            : t.catNote.friends.already,
      );
    } finally {
      setBusy(false);
    }
  }

  async function accept(friendshipId: number) {
    setBusy(true);
    setNotice(null);
    try {
      await acceptFriend(friendshipId);
      await refresh();
    } catch {
      setNotice(t.catNote.friends.full(list?.max_friends ?? 10));
    } finally {
      setBusy(false);
    }
  }

  async function drop(friendshipId: number) {
    setBusy(true);
    try {
      await removeFriend(friendshipId);
      await refresh();
    } catch {
      /* 다시 눌러보면 돼요 */
    } finally {
      setBusy(false);
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

  if (!list) {
    return (
      <Waiting>
        <p className="text-sm text-[#a08c66]">{t.catNote.gate.checking}</p>
      </Waiting>
    );
  }

  const friends = t.catNote.friends;
  const isFull = list.friends.length >= list.max_friends;

  // pt-14 는 위쪽 여백 — 언어 버튼이 왼쪽 위에 떠 있어서(fixed) 글이 가려져요
  return (
    <main className="flex flex-1 flex-col items-center px-6 pb-8 pt-14">
      <PageTitle title={`${friends.title} · ${t.catNote.title}`} />

      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-center text-2xl font-bold text-[#4a3a20]">{friends.title}</h1>
        <p className="text-center text-xs text-[#a08c66]">
          {friends.count(list.friends.length, list.max_friends)}
        </p>

        {/* 친구 찾기 */}
        <section className="rounded-2xl border border-[#efe3c8] bg-[#fffdf5] px-4 py-3">
          <h2 className="text-xs font-bold text-[#7a6a48]">{friends.find}</h2>
          <div className="mt-2 flex gap-1.5">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && look()}
              placeholder={friends.findPlaceholder}
              aria-label={friends.findPlaceholder}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              disabled={isFull}
              className="min-w-0 flex-1 rounded-xl border-2 border-[#efe3c8] bg-[#fdf9ef] px-3 py-2 text-sm text-[#4a3a20] outline-none focus:border-[#f5c64b] disabled:opacity-50"
            />
            <button
              type="button"
              onClick={look}
              disabled={!query.trim() || busy || isFull}
              className="shrink-0 rounded-xl bg-[#f5c64b] px-4 py-2 text-sm font-bold text-[#4a3a20] transition disabled:opacity-50"
            >
              {friends.find}
            </button>
          </div>
          <p className="mt-1.5 text-[10px] text-[#a08c66]">
            {isFull ? friends.full(list.max_friends) : friends.findHint}
          </p>

          {found !== undefined && (
            <div className="mt-2">
              {found.found ? (
                <div className="flex items-center gap-2 rounded-xl bg-[#faf4e4] px-3 py-2">
                  <span className="text-lg" aria-hidden="true">
                    {AVATAR_FACE[found.avatar]}
                  </span>
                  <span className="flex-1 text-sm text-[#4a3a20]">
                    {found.nickname}
                    <span className="ml-1 text-[10px] text-[#a08c66]">@{found.note_id}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => ask(found.note_id)}
                    disabled={busy}
                    className="rounded-full bg-[#f5c64b] px-3 py-1.5 text-xs font-bold text-[#4a3a20] disabled:opacity-50"
                  >
                    {friends.request}
                  </button>
                </div>
              ) : (
                <p className="text-xs text-[#c07777]">{friends.notFound}</p>
              )}
            </div>
          )}

          {notice && <p className="mt-2 text-xs text-[#7a6a48]">{notice}</p>}
        </section>

        {/* 받은 신청 */}
        {list.pending_received.length > 0 && (
          <section className="rounded-2xl border-2 border-[#f5c64b] bg-[#fffdf5] px-4 py-3">
            <h2 className="text-xs font-bold text-[#b98a1f]">{friends.pending}</h2>
            <ul className="mt-2 space-y-2">
              {list.pending_received.map((asker) => (
                <li key={asker.friendship_id} className="flex items-center gap-2">
                  <span className="text-lg" aria-hidden="true">
                    {AVATAR_FACE[asker.avatar]}
                  </span>
                  <span className="flex-1 text-sm text-[#4a3a20]">
                    {asker.nickname}
                    <span className="ml-1 text-[10px] text-[#a08c66]">@{asker.note_id}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => accept(asker.friendship_id)}
                    disabled={busy}
                    className="rounded-full bg-[#f5c64b] px-3 py-1 text-xs font-bold text-[#4a3a20] disabled:opacity-50"
                  >
                    {friends.accept}
                  </button>
                  <button
                    type="button"
                    onClick={() => drop(asker.friendship_id)}
                    disabled={busy}
                    className="rounded-full border border-[#efe3c8] px-3 py-1 text-xs text-[#a08c66] disabled:opacity-50"
                  >
                    {friends.reject}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 내 친구 */}
        <section className="rounded-2xl border border-[#efe3c8] bg-[#fffdf5] px-4 py-3">
          <h2 className="text-xs font-bold text-[#7a6a48]">{friends.myFriends}</h2>
          {list.friends.length === 0 ? (
            <p className="mt-2 text-xs leading-relaxed text-[#a08c66]">{friends.noFriends}</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {list.friends.map((friend) => (
                <li key={friend.note_id} className="flex items-center gap-2">
                  <span className="text-lg" aria-hidden="true">
                    {AVATAR_FACE[friend.avatar]}
                  </span>
                  <span className="flex-1 text-sm text-[#4a3a20]">
                    {friend.nickname}
                    <span className="ml-1 text-[10px] text-[#a08c66]">@{friend.note_id}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* 오늘의 친구 소식 */}
        <section>
          <h2 className="text-xs font-bold text-[#7a6a48]">{friends.feed}</h2>
          {feed.length === 0 ? (
            <p className="mt-2 text-xs text-[#a08c66]">{friends.noFeed}</p>
          ) : (
            <ul className="mt-2 space-y-3">
              {feed.map((card) => (
                <CatFriendCard key={card.entry_id} card={card} />
              ))}
            </ul>
          )}
        </section>
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
