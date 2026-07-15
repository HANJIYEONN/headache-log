// ─────────────────────────────────────────────
// api.ts : 백엔드(FastAPI)와 대화하는 함수들을 모아둔 파일
// "프론트가 백엔드에 말 거는 전화기" 라고 생각하면 돼요 📞
// ─────────────────────────────────────────────

// 백엔드 서버 주소
const API_URL = "http://localhost:8000";

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

// ── 기록 목록 가져오기 (GET) ──
export async function fetchEntries(): Promise<Entry[]> {
  const res = await fetch(`${API_URL}/entries`);
  if (!res.ok) throw new Error("기록을 불러오지 못했어요");
  return res.json(); // 응답을 JSON(자바스크립트 객체)으로 변환
}

// ── 새 기록 저장하기 (POST) ──
export async function createEntry(entry: NewEntry): Promise<Entry> {
  const res = await fetch(`${API_URL}/entries`, {
    method: "POST",                                  // "새로 만들어줘"
    headers: { "Content-Type": "application/json" }, // "JSON으로 보낼게"
    body: JSON.stringify(entry),                     // 객체 → JSON 문자열
  });
  if (!res.ok) throw new Error("저장에 실패했어요");
  return res.json();
}

// ── 기록 수정하기 (PUT) ──
export async function updateEntry(id: number, entry: NewEntry): Promise<Entry> {
  const res = await fetch(`${API_URL}/entries/${id}`, {
    method: "PUT", // "이 기록을 이 내용으로 바꿔줘"
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
  });
  if (!res.ok) throw new Error("수정에 실패했어요");
  return res.json();
}

// ── 기록 삭제하기 (DELETE) ──
export async function deleteEntry(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/entries/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("삭제에 실패했어요");
}
