// ─────────────────────────────────────────────
// catApi.ts : 고양이 수첩 백엔드와 대화하는 함수들 🐱
//
// 서버 주소·로그인 명찰·401 처리는 apiBase.ts 에 모아뒀어요.
// 여기는 "고양이 수첩 API 20개를 어떻게 부르나"만 담습니다.
//
// ⚠️ 에러 문구에 대하여
//   서버가 보내는 detail("이미 쓰고 있는 아이디예요")은 **한국어뿐**이에요.
//   이 앱은 4개 언어라서, 화면에서는 err.status 로 우리 사전 문구를 고르세요.
//   자세한 건 apiBase.ts 의 fail() 설명에 적어뒀어요.
// ─────────────────────────────────────────────

import { API_URL, ApiError, authHeaders, checkAuth, fail, jsonHeaders } from "./apiBase";

const BASE = `${API_URL}/api/v1/cat-note`;

export { ApiError };

// ══════════════════════════════════════════
//  타입 — "이 데이터는 이렇게 생겼다"
// ══════════════════════════════════════════

/** 짝꿍 4종 — 말투를 정해요. 화면은 모두 같아요 (D-16) */
export type Partner = "kongi" | "cheese" | "meokmul" | "sikppang";
/** 프로필 그림 4종 */
export type Avatar = "cat" | "dog" | "rabbit" | "dino";

export type CatAccount = {
  exists: true;
  note_id: string;
  partner: Partner;
  nickname: string;
  bio: string | null;
  avatar: Avatar;
  learning_language: string;
  feedback_language: string | null;
  /** 내 단계 (1~6). 단어장 개수로 계산돼요 (D-23) */
  writing_stage: number;
  daily_reminder: boolean;
};

/** 아직 수첩을 안 만든 사람 */
export type NoAccount = { exists: false };

export type MeResponse = CatAccount | NoAccount;

export type NoteIdReason = "duplicate" | "too_short" | "too_long" | "invalid_char";

export type NoteIdCheck = {
  available: boolean;
  reason: NoteIdReason | null;
  suggestions: string[];
};

export type CreateAccount = {
  partner: Partner;
  note_id: string;
  nickname: string;
  learning_language?: string;
};

/** 수정은 보낸 항목만 바뀌어요. note_id 는 못 바꿔요 (친구가 못 찾게 되니까, D-10) */
export type UpdateAccount = Partial<{
  partner: Partner;
  nickname: string;
  bio: string;
  avatar: Avatar;
  learning_language: string;
  feedback_language: string;
  daily_reminder: boolean;
}>;

// ── 쓰기 ──

export type DraftSentence = { position: number; text: string };

export type TodayEntry = {
  entry_id: number;
  entry_date: string;
  is_complete: boolean;
  accuracy: number | null;
  /** 쓰는 중엔 교정이 안 담겨요 (D-12) */
  sentences: DraftSentence[];
};

export type SavedSentence = { position: number; text: string; saved_at: string };

export type Correction = {
  /** 단어장에 담을 때 필요해요 */
  correction_id: number;
  wrong_text: string;
  right_text: string;
  note: string;
  pronunciation: string | null;
};

export type GradedSentence = {
  position: number;
  original_text: string;
  /** 틀린 게 없으면 null */
  corrected_text: string | null;
  /** 번역은 채점 응답에 함께 와요 (D-20) */
  translation: string | null;
  corrections: Correction[];
};

/** "다 썼어요!" 를 눌렀을 때 오는 결과 */
export type GradedEntry = {
  entry_id: number;
  is_complete: boolean;
  accuracy: number | null;
  sentences: GradedSentence[];
  new_expressions: string[];
  streak_days: number;
  total_stamps: number;
};

/** 지난 날짜를 펼쳤을 때 (오늘 것과 달리 발도장·연속 기록은 안 와요) */
export type PastEntry = {
  entry_id: number;
  entry_date: string;
  is_complete: boolean;
  accuracy: number | null;
  sentences: GradedSentence[];
  new_expressions: string[];
};

// ── 기록 보기 ──

export type CalendarDay = {
  date: string;
  is_complete: boolean;
  accuracy: number | null;
};

export type MonthEntries = {
  days: CalendarDay[];
  total_stamps_this_month: number;
};

export type Stats = {
  streak_days: number;
  total_stamps: number;
  praises_received: number;
  /** 쓴 날이 없으면 null 이에요. 0%가 아니라요 (D-24) */
  weekly_accuracy: number | null;
  weekly_accuracy_diff: number | null;
  vocab_count: number;
  /** 예: "초급 1" */
  level: string;
  expressions_to_next_level: number;
};

// ── 친구 ──

export type FriendCard = { note_id: string; nickname: string; avatar: Avatar };

export type PendingRequest = FriendCard & { friendship_id: number };

export type FriendList = {
  friends: FriendCard[];
  pending_received: PendingRequest[];
  /** 상한을 화면에 또 적어두지 않게 서버가 알려줘요 (D-22) */
  max_friends: number;
};

export type SearchResult = { found: false } | ({ found: true } & FriendCard);

export type Friendship = FriendCard & {
  friendship_id: number;
  status: "pending" | "accepted";
};

export type FeedCard = FriendCard & {
  entry_id: number;
  learning_language: string;
  status: "complete" | "writing";
  /** 예: "3/5" */
  progress: string;
  /** ISO 시각. "10분 전" 같은 문구는 화면에서 만들어요 (D-25) */
  written_at: string | null;
  /** 친구가 **쓴 그대로**예요. 교정본이 아니에요 */
  sentences: string[];
  praise_count: number;
  i_praised: boolean;
};

export type Comment = FriendCard & {
  comment_id: number;
  content: string;
  created_at: string | null;
};

// ── 단어장 ──

export type VocabItem = {
  vocab_id: number;
  expression: string;
  meaning: string | null;
  correction_id: number | null;
  created_at: string | null;
};

// ══════════════════════════════════════════
//  요청 도우미
// ══════════════════════════════════════════

async function get<T>(path: string, whenFailed: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: authHeaders() });
  checkAuth(res);
  if (!res.ok) await fail(res, whenFailed);
  return res.json();
}

async function send<T>(
  method: "POST" | "PUT" | "PATCH",
  path: string,
  body: unknown,
  whenFailed: string,
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: jsonHeaders(),
    // 본문이 없는 API(예: 다 썼어요!)도 있어요
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  checkAuth(res);
  if (!res.ok) await fail(res, whenFailed);
  return res.json();
}

async function remove(path: string, whenFailed: string): Promise<void> {
  const res = await fetch(`${BASE}${path}`, { method: "DELETE", headers: authHeaders() });
  checkAuth(res);
  // 지우기는 204(본문 없음)로 와요 — res.json() 을 부르면 안 돼요
  if (!res.ok) await fail(res, whenFailed);
}

// ══════════════════════════════════════════
//  1장 — 계정
// ══════════════════════════════════════════

/** 고양이 수첩에 들어올 때 **제일 먼저** 부르는 API */
export function fetchMe(): Promise<MeResponse> {
  return get("/me", "내 수첩을 불러오지 못했어요");
}

/**
 * 수첩 아이디를 쓸 수 있는지 확인해요.
 * 타이핑할 때마다가 아니라 **잠깐 멈췄을 때** 한 번 부르세요.
 */
export function checkNoteId(value: string): Promise<NoteIdCheck> {
  return get(`/note-id/check?value=${encodeURIComponent(value)}`, "확인하지 못했어요");
}

export function createAccount(account: CreateAccount): Promise<CatAccount> {
  return send("POST", "/me", account, "수첩을 만들지 못했어요");
}

/** 보낸 항목만 바뀌어요 */
export function updateAccount(changes: UpdateAccount): Promise<CatAccount> {
  return send("PATCH", "/me", changes, "수정하지 못했어요");
}

// ══════════════════════════════════════════
//  2장 — 쓰기
// ══════════════════════════════════════════

/** 오늘 수첩. 아직 없으면 서버가 빈 수첩을 만들어줘요 */
export function fetchToday(): Promise<TodayEntry> {
  return get("/entries/today", "오늘 수첩을 불러오지 못했어요");
}

/** 글이 유실되면 안 되니까 한 칸 쓸 때마다 불러요 (NF-06) */
export function saveSentence(position: number, text: string): Promise<SavedSentence> {
  return send("PUT", `/entries/today/sentences/${position}`, { text }, "저장하지 못했어요");
}

/** 다 썼어요! — AI 채점은 하루에 여기서 딱 한 번 (D-12). 몇 초 걸려요 */
export function completeToday(): Promise<GradedEntry> {
  return send("POST", "/entries/today/complete", undefined, "채점하지 못했어요");
}

/** 오늘의 글감 — "오늘 뭐 쓰지?" 하고 막힐 때 */
export function fetchTodayPrompt(): Promise<{ prompt: string }> {
  return get("/prompts/today", "글감을 불러오지 못했어요");
}

// ══════════════════════════════════════════
//  3장 — 기록 보기
// ══════════════════════════════════════════

/** 달력 화면용. month 는 1~12 */
export function fetchMonth(year: number, month: number): Promise<MonthEntries> {
  return get(`/entries?year=${year}&month=${month}`, "달력을 불러오지 못했어요");
}

/** date 는 "2026-07-20" 모양 */
export function fetchEntryByDate(date: string): Promise<PastEntry> {
  return get(`/entries/${date}`, "그날 수첩을 불러오지 못했어요");
}

/** 홈 화면 숫자 카드들 */
export function fetchStats(): Promise<Stats> {
  return get("/stats", "통계를 불러오지 못했어요");
}

// ══════════════════════════════════════════
//  4장 — 친구
// ══════════════════════════════════════════

/** **정확히 일치할 때만** 찾아져요. 부분 검색은 없어요 (NF-04) */
export function searchUser(noteId: string): Promise<SearchResult> {
  return get(`/users/search?note_id=${encodeURIComponent(noteId)}`, "찾지 못했어요");
}

export function fetchFriends(): Promise<FriendList> {
  return get("/friends", "친구 목록을 불러오지 못했어요");
}

export function requestFriend(noteId: string): Promise<Friendship> {
  return send("POST", "/friends", { note_id: noteId }, "친구 신청을 못 했어요");
}

/** 신청을 **받은 사람만** 수락할 수 있어요 */
export function acceptFriend(friendshipId: number): Promise<Friendship> {
  return send("POST", `/friends/${friendshipId}/accept`, undefined, "수락하지 못했어요");
}

/** 거절·취소·친구 끊기가 전부 이 하나예요 */
export function removeFriend(friendshipId: number): Promise<void> {
  return remove(`/friends/${friendshipId}`, "지우지 못했어요");
}

/** 친구들의 **오늘** 수첩. 오늘 아직 시작 안 한 친구는 안 나와요 */
export function fetchFriendFeed(): Promise<{ feed: FeedCard[] }> {
  return get("/friends/feed", "친구 소식을 불러오지 못했어요");
}

/** 칭찬도장 💛 — 한 수첩에 한 번만 */
export function givePraise(entryId: number): Promise<{ praise_count: number }> {
  return send("POST", `/entries/${entryId}/praises`, undefined, "칭찬도장을 주지 못했어요");
}

/** 친구 수첩과 **내 수첩** 둘 다 볼 수 있어요 */
export function fetchComments(entryId: number): Promise<{ comments: Comment[] }> {
  return get(`/entries/${entryId}/comments`, "댓글을 불러오지 못했어요");
}

export function writeComment(entryId: number, content: string): Promise<Comment> {
  return send("POST", `/entries/${entryId}/comments`, { content }, "댓글을 쓰지 못했어요");
}

// ══════════════════════════════════════════
//  5장 — 단어장
// ══════════════════════════════════════════

export function fetchVocab(): Promise<{ vocab: VocabItem[] }> {
  return get("/vocab", "단어장을 불러오지 못했어요");
}

/** 교정에서만 담을 수 있어요. correction_id 는 채점 결과 안에 있어요 */
export function saveVocab(correctionId: number): Promise<VocabItem> {
  return send("POST", "/vocab", { correction_id: correctionId }, "담지 못했어요");
}

export function removeVocab(vocabId: number): Promise<void> {
  return remove(`/vocab/${vocabId}`, "빼지 못했어요");
}
