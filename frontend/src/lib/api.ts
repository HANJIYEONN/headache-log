// ─────────────────────────────────────────────
// api.ts : 백엔드(FastAPI)와 대화하는 함수들을 모아둔 파일
// "프론트가 백엔드에 말 거는 전화기" 라고 생각하면 돼요 📞
// ─────────────────────────────────────────────

// 백엔드 서버 주소
// 배포 시 Vercel에 NEXT_PUBLIC_API_URL 환경변수로 실제 서버 주소를 넣어줘요.
// 로컬 개발 중엔 값이 없으니 localhost로 자동 대체돼요.
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ── 타입(type) : "기록 한 건은 이렇게 생겼다"는 설계도 ──
// TypeScript는 데이터 모양을 미리 정해두면
// 오타나 실수를 코드 실행 전에 잡아줘요!
export type Entry = {
  id: number;
  entry_date: string;        // 날짜 (예: "2026-07-14")
  menstruating: boolean;     // 생리기간 유무 (true/false)
  took_painkiller: boolean;  // 통증약 복용여부
  medication: string | null; // 약 종류
  effective: boolean | null; // 효과여부 (약 안 먹었으면 null = "비어있음")
  dose_count: number | null; // 복용횟수
  trigger: string | null;    // 촉발요인
  bp_systolic: number | null;  // 혈압-수축기
  bp_diastolic: number | null; // 혈압-이완기
  bp_pulse: number | null;     // 혈압-맥박수
};

// 새 기록을 만들 때는 아직 id가 없어요 (id는 DB가 자동으로 붙여줌)
// Omit<Entry, "id"> = "Entry에서 id만 뺀 모양"
export type NewEntry = Omit<Entry, "id">;

// ── 로그인 토큰을 요청에 붙여주는 도우미 ──
// 로그인하면 localStorage에 access_token이 저장돼 있어요.
// 모든 요청에 "Authorization: Bearer 토큰" 명찰을 달아서 보내요.
function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// 401(로그인 안 됨/만료) 응답이면 로그인 페이지로 보내요
function checkAuth(res: Response) {
  if (res.status === 401) {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }
}

// ── 기록 목록 가져오기 (GET) ──
export async function fetchEntries(): Promise<Entry[]> {
  const res = await fetch(`${API_URL}/entries`, { headers: authHeaders() });
  checkAuth(res);
  if (!res.ok) throw new Error("기록을 불러오지 못했어요");
  return res.json(); // 응답을 JSON(자바스크립트 객체)으로 변환
}

// ── 새 기록 저장하기 (POST) ──
export async function createEntry(entry: NewEntry): Promise<Entry> {
  const res = await fetch(`${API_URL}/entries`, {
    method: "POST",                                  // "새로 만들어줘"
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(entry),                     // 객체 → JSON 문자열
  });
  checkAuth(res);
  if (!res.ok) throw new Error("저장에 실패했어요");
  return res.json();
}

// ── 기록 수정하기 (PUT) ──
export async function updateEntry(id: number, entry: NewEntry): Promise<Entry> {
  const res = await fetch(`${API_URL}/entries/${id}`, {
    method: "PUT", // "이 기록을 이 내용으로 바꿔줘"
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(entry),
  });
  checkAuth(res);
  if (!res.ok) throw new Error("수정에 실패했어요");
  return res.json();
}

// ── 기록 삭제하기 (DELETE) ──
export async function deleteEntry(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/entries/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  checkAuth(res);
  if (!res.ok) throw new Error("삭제에 실패했어요");
}
