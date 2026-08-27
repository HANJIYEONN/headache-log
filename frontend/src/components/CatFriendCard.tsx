"use client";

// ─────────────────────────────────────────────
// CatFriendCard : 친구의 오늘 수첩 카드 👥 (시안 2e)
//
// 친구가 쓴 글을 보고 💛 칭찬도장과 💬 댓글을 남길 수 있어요.
// 글은 **친구가 쓴 그대로**예요 — 교정본이 아니에요.
// 친구에게 "너 여기 틀렸대" 를 보여주는 자리가 아니거든요.
// ─────────────────────────────────────────────

import { useState } from "react";

import { useLanguage, useT } from "@/i18n/LanguageProvider";
import {
  fetchComments,
  givePraise,
  writeComment,
  type Comment,
  type FeedCard,
} from "@/lib/catApi";
import { timeAgo } from "@/lib/timeAgo";

const AVATAR_FACE: Record<FeedCard["avatar"], string> = {
  cat: "🐱",
  dog: "🐶",
  rabbit: "🐰",
  dino: "🦖",
};

const COMMENT_MAX = 200;

export default function CatFriendCard({ card }: { card: FeedCard }) {
  const t = useT();
  const { locale } = useLanguage();
  const friends = t.catNote.friends;

  const [praises, setPraises] = useState(card.praise_count);
  const [praised, setPraised] = useState(card.i_praised);
  const [busy, setBusy] = useState(false);

  // undefined = 아직 안 열어봄
  const [comments, setComments] = useState<Comment[] | undefined>(undefined);
  const [draft, setDraft] = useState("");

  async function praise() {
    if (praised || busy) return;
    setBusy(true);
    // 눌렀다는 느낌을 바로 줘요. 실패하면 되돌립니다
    setPraised(true);
    setPraises((before) => before + 1);
    try {
      const result = await givePraise(card.entry_id);
      setPraises(result.praise_count);
    } catch {
      setPraised(false);
      setPraises((before) => before - 1);
    } finally {
      setBusy(false);
    }
  }

  async function openComments() {
    if (comments !== undefined) {
      setComments(undefined);
      return;
    }
    try {
      setComments((await fetchComments(card.entry_id)).comments);
    } catch {
      setComments([]);
    }
  }

  async function send() {
    const text = draft.trim();
    if (!text || busy) return;
    setBusy(true);
    try {
      const written = await writeComment(card.entry_id, text);
      setComments((before) => [...(before ?? []), written]);
      setDraft("");
    } catch {
      /* 다시 눌러보면 돼요 */
    } finally {
      setBusy(false);
    }
  }

  const when = card.written_at ? timeAgo(card.written_at, locale) : null;

  return (
    <li className="rounded-2xl border border-[#efe3c8] bg-[#fffdf5] px-4 py-3">
      {/* 누가 · 언제 · 얼마나 */}
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden="true">
          {AVATAR_FACE[card.avatar]}
        </span>
        <span className="flex-1">
          <span className="block text-sm font-bold text-[#4a3a20]">{card.nickname}</span>
          <span className="block text-[10px] text-[#a08c66]">
            @{card.note_id} · {card.written_at ? (when ?? friends.justNow) : ""}
          </span>
        </span>
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-bold"
          style={
            card.status === "complete"
              ? { backgroundColor: "#fbefc9", color: "#b98a1f" }
              : { backgroundColor: "#f3ece0", color: "#a08c66" }
          }
        >
          {card.status === "complete" ? friends.statusComplete : friends.statusWriting}
          {" · "}
          {card.progress}
        </span>
      </div>

      {/* 친구가 쓴 그대로 */}
      <ul className="mt-2 space-y-1">
        {card.sentences.map((sentence, index) => (
          <li key={index} className="text-sm leading-relaxed text-[#4a3a20]">
            {sentence}
          </li>
        ))}
      </ul>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={praise}
          disabled={praised || busy}
          aria-label={`${card.nickname} ${friends.praise}`}
          className="rounded-full border px-3 py-1.5 text-xs font-medium transition disabled:opacity-70"
          style={
            praised
              ? { borderColor: "#f5c64b", backgroundColor: "#fbefc9", color: "#b98a1f" }
              : { borderColor: "#efe3c8", color: "#7a6a48" }
          }
        >
          💛 {praised ? friends.praised : friends.praise} {praises > 0 && praises}
        </button>
        <button
          type="button"
          onClick={openComments}
          aria-expanded={comments !== undefined}
          className="rounded-full border border-[#efe3c8] px-3 py-1.5 text-xs font-medium text-[#7a6a48] transition hover:bg-[#fbefc9]"
        >
          💬 {friends.comments}
        </button>
      </div>

      {comments !== undefined && (
        <div className="mt-3 rounded-xl bg-[#faf4e4] px-3 py-2">
          <ul className="space-y-1.5">
            {comments.map((comment) => (
              <li key={comment.comment_id} className="text-xs leading-relaxed">
                <span className="font-bold text-[#7a6a48]">{comment.nickname}</span>{" "}
                <span className="text-[#4a3a20]">{comment.content}</span>
              </li>
            ))}
          </ul>

          <div className="mt-2 flex gap-1.5">
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              maxLength={COMMENT_MAX}
              placeholder={friends.commentPlaceholder}
              aria-label={friends.comments}
              className="min-w-0 flex-1 rounded-full border border-[#efe3c8] bg-[#fffdf5] px-3 py-1.5 text-xs text-[#4a3a20] outline-none focus:border-[#f5c64b]"
            />
            <button
              type="button"
              onClick={send}
              disabled={!draft.trim() || busy}
              className="shrink-0 rounded-full bg-[#f5c64b] px-3 py-1.5 text-xs font-bold text-[#4a3a20] transition disabled:opacity-50"
            >
              {friends.send}
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
