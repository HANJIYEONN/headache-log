"use client";
// ↑ "이 컴포넌트는 브라우저에서 동작해요" 라는 표시.
//   버튼 클릭, 입력 같은 상호작용이 있으면 꼭 필요해요!

// ─────────────────────────────────────────────
// EntryForm : 두통 기록 입력 폼 컴포넌트
// 컴포넌트 = 화면 조각을 만드는 함수 (레고 블록 같은 것 🧱)
// ─────────────────────────────────────────────

import { useState } from "react";
import { createEntry, type NewEntry } from "@/lib/api";

// props = 부모 컴포넌트가 넘겨주는 값
// 여기선 "저장 성공하면 알려줘!" 라는 함수를 받아요
type Props = {
  onSaved: () => void;
};

// 폼의 초기값 (오늘 날짜로 시작)
function emptyForm(): NewEntry {
  return {
    entry_date: new Date().toISOString().slice(0, 10), // "2026-07-14" 형태
    menstruating: false,
    took_painkiller: false,
    effective: null,
    dose_count: null,
    trigger: null,
    bp_systolic: null,
    bp_diastolic: null,
    bp_pulse: null,
  };
}

export default function EntryForm({ onSaved }: Props) {
  // ── state : 컴포넌트가 "기억하는 값" ──
  // form 값이 바뀔 때마다 React가 화면을 자동으로 다시 그려줘요 ✨
  const [form, setForm] = useState<NewEntry>(emptyForm());
  const [saving, setSaving] = useState(false); // 저장 중인지
  const [message, setMessage] = useState("");  // 안내 문구

  // form에서 한 칸만 바꾸는 도우미 함수
  // 예: update("dose_count", 2) → 복용횟수만 2로 변경
  function update<K extends keyof NewEntry>(key: K, value: NewEntry[K]) {
    setForm({ ...form, [key]: value }); // ...form = 기존 값 복사 후 한 칸만 덮어쓰기
  }

  // 저장 버튼을 눌렀을 때 실행되는 함수
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); // 폼 제출 시 페이지가 새로고침되는 기본 동작 막기
    setSaving(true);
    setMessage("");
    try {
      await createEntry(form);   // 백엔드에 저장 요청 📤
      setForm(emptyForm());      // 폼 비우기
      setMessage("저장했어요! 🎉");
      onSaved();                 // 부모에게 "저장했어!" 알리기
    } catch {
      setMessage("앗, 저장에 실패했어요 😢 백엔드가 켜져 있는지 확인해주세요");
    } finally {
      setSaving(false);
    }
  }

  // ── 화면(JSX) : HTML처럼 생겼지만 { } 안에 자바스크립트를 쓸 수 있어요 ──
  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-pink-200 bg-white p-6 text-gray-900 shadow-sm">
      <h2 className="text-lg font-bold text-pink-600">오늘의 두통 기록 ✏️</h2>

      {/* 날짜 */}
      <label className="block">
        <span className="text-sm font-medium">날짜</span>
        <input
          type="date"
          value={form.entry_date}
          onChange={(e) => update("entry_date", e.target.value)}
          className="mt-1 w-full rounded-lg border p-2"
          required
        />
      </label>

      {/* 체크박스 두 개 */}
      <div className="flex gap-6">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.menstruating}
            onChange={(e) => update("menstruating", e.target.checked)}
          />
          <span className="text-sm">생리기간</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.took_painkiller}
            onChange={(e) => update("took_painkiller", e.target.checked)}
          />
          <span className="text-sm">통증약 복용</span>
        </label>
      </div>

      {/* 약을 먹었을 때만 보이는 부분 (조건부 렌더링!) */}
      {form.took_painkiller && (
        <div className="flex gap-4 rounded-lg bg-pink-50 p-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.effective === true}
              onChange={(e) => update("effective", e.target.checked)}
            />
            <span className="text-sm">효과 있었음</span>
          </label>
          <label className="block flex-1">
            <span className="text-sm">복용횟수</span>
            <input
              type="number"
              min={1}
              value={form.dose_count ?? ""}
              onChange={(e) => update("dose_count", e.target.value ? Number(e.target.value) : null)}
              className="mt-1 w-full rounded-lg border p-2"
            />
          </label>
        </div>
      )}

      {/* 촉발요인 */}
      <label className="block">
        <span className="text-sm font-medium">촉발요인</span>
        <input
          type="text"
          placeholder="예: 수면 부족, 스트레스, 카페인..."
          value={form.trigger ?? ""}
          onChange={(e) => update("trigger", e.target.value || null)}
          className="mt-1 w-full rounded-lg border p-2"
        />
      </label>

      {/* 혈압 3종 */}
      <div className="grid grid-cols-3 gap-3">
        <label className="block">
          <span className="text-sm">수축기</span>
          <input
            type="number"
            placeholder="120"
            value={form.bp_systolic ?? ""}
            onChange={(e) => update("bp_systolic", e.target.value ? Number(e.target.value) : null)}
            className="mt-1 w-full rounded-lg border p-2"
          />
        </label>
        <label className="block">
          <span className="text-sm">이완기</span>
          <input
            type="number"
            placeholder="80"
            value={form.bp_diastolic ?? ""}
            onChange={(e) => update("bp_diastolic", e.target.value ? Number(e.target.value) : null)}
            className="mt-1 w-full rounded-lg border p-2"
          />
        </label>
        <label className="block">
          <span className="text-sm">맥박수</span>
          <input
            type="number"
            placeholder="75"
            value={form.bp_pulse ?? ""}
            onChange={(e) => update("bp_pulse", e.target.value ? Number(e.target.value) : null)}
            className="mt-1 w-full rounded-lg border p-2"
          />
        </label>
      </div>

      {/* 저장 버튼 */}
      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-xl bg-pink-500 py-2.5 font-semibold text-white transition hover:bg-pink-600 disabled:opacity-50"
      >
        {saving ? "저장 중..." : "기록 저장하기 💾"}
      </button>

      {/* 안내 메시지 (있을 때만 표시) */}
      {message && <p className="text-center text-sm">{message}</p>}
    </form>
  );
}
