"use client";
// ↑ "이 컴포넌트는 브라우저에서 동작해요" 라는 표시.
//   버튼 클릭, 입력 같은 상호작용이 있으면 꼭 필요해요!

// ─────────────────────────────────────────────
// EntryForm : 두통 기록 입력 폼 컴포넌트
// 컴포넌트 = 화면 조각을 만드는 함수 (레고 블록 같은 것 🧱)
// ─────────────────────────────────────────────

import { useEffect, useState } from "react";
import {
  createEntry,
  updateEntry,
  addFavorite,
  updateFavorite,
  type Entry,
  type FavoriteMedication,
  type NewEntry,
  type NewFavorite,
} from "@/lib/api";

const MAX_FAVORITES = 3;

// props = 부모 컴포넌트가 넘겨주는 값
// editing이 있으면 "새 기록"이 아니라 "그 기록을 고치는 중"이에요
type Props = {
  onSaved: () => void;
  editing: Entry | null;      // 수정 중인 기록 (없으면 null)
  onCancelEdit: () => void;   // 수정 취소할 때 부모에게 알리기
  medications: string[];      // 지금까지 입력한 약 이름들 (자동완성 목록용)
  favorites: FavoriteMedication[];  // 즐겨찾기(자주 복용하는 약) 목록
  onFavoritesChanged: () => void;   // 즐겨찾기가 바뀐 뒤 부모에게 새로고침 요청
  editingFavorite: FavoriteMedication | null; // 수정 중인 즐겨찾기 (없으면 null)
  onCancelFavoriteEdit: () => void;           // 즐겨찾기 수정 취소
};

// 폼의 초기값 (오늘 날짜로 시작)
function emptyForm(): NewEntry {
  return {
    entry_date: new Date().toISOString().slice(0, 10), // "2026-07-14" 형태
    menstruating: false,
    took_painkiller: true, // 통증약은 항상 복용하니까 늘 true!
    medication: null,
    effective: false,
    dose_count: 1, // 보통 1회니까 기본값으로!
    trigger: null,
    bp_systolic: null,
    bp_diastolic: null,
    bp_pulse: null,
  };
}

export default function EntryForm({
  onSaved,
  editing,
  onCancelEdit,
  medications,
  favorites,
  onFavoritesChanged,
  editingFavorite,
  onCancelFavoriteEdit,
}: Props) {
  // ── state : 컴포넌트가 "기억하는 값" ──
  // form 값이 바뀔 때마다 React가 화면을 자동으로 다시 그려줘요 ✨
  const [form, setForm] = useState<NewEntry>(emptyForm());
  const [saving, setSaving] = useState(false); // 저장 중인지
  const [message, setMessage] = useState("");  // 안내 문구
  const [recordBp, setRecordBp] = useState(false); // 혈압도 기록할지 여부

  // 수정할 기록이 정해지면 그 값들을 폼에 채워넣어요
  useEffect(() => {
    if (editing) {
      const { id: _id, ...rest } = editing; // id는 폼에 필요 없으니 빼고
      setForm(rest);
      setRecordBp(editing.bp_systolic !== null); // 혈압 있던 기록이면 혈압칸 열기
      setMessage("");
    } else {
      setForm(emptyForm());
      setRecordBp(false);
    }
  }, [editing]);

  // 수정할 즐겨찾기가 정해지면 그 내용을 폼에 채워넣어요
  useEffect(() => {
    if (editingFavorite) {
      setForm({
        ...emptyForm(), // 날짜는 오늘로
        medication: editingFavorite.name,
        menstruating: editingFavorite.menstruating,
        effective: editingFavorite.effective,
        dose_count: editingFavorite.dose_count,
        trigger: editingFavorite.trigger,
        bp_systolic: editingFavorite.bp_systolic,
        bp_diastolic: editingFavorite.bp_diastolic,
        bp_pulse: editingFavorite.bp_pulse,
      });
      setRecordBp(editingFavorite.bp_systolic !== null);
      setMessage("");
    }
  }, [editingFavorite]);

  // form에서 한 칸만 바꾸는 도우미 함수
  // 예: update("dose_count", 2) → 복용횟수만 2로 변경
  function update<K extends keyof NewEntry>(key: K, value: NewEntry[K]) {
    setForm({ ...form, [key]: value }); // ...form = 기존 값 복사 후 한 칸만 덮어쓰기
  }

  // "자주 복용하는 약 저장하기/수정하기" 버튼: 지금 폼 내용 전체를 즐겨찾기로 저장
  async function handleSaveFavorite() {
    const name = form.medication?.trim();
    if (!name) {
      setMessage("약 종류를 먼저 입력해주세요");
      return;
    }
    // 새로 추가하는 경우에만 3개 제한 검사 (수정은 개수가 안 늘어나니까!)
    if (!editingFavorite && favorites.length >= MAX_FAVORITES) {
      setMessage(`자주 복용하는 약은 최대 ${MAX_FAVORITES}개까지예요`);
      return;
    }
    // 저장 버튼과 같은 규칙: 혈압 체크가 꺼져 있으면 혈압 값은 비워서 저장
    const favorite: NewFavorite = {
      name,
      menstruating: form.menstruating,
      effective: form.effective,
      dose_count: form.dose_count,
      trigger: form.trigger,
      bp_systolic: recordBp ? form.bp_systolic : null,
      bp_diastolic: recordBp ? form.bp_diastolic : null,
      bp_pulse: recordBp ? form.bp_pulse : null,
    };
    try {
      if (editingFavorite) {
        await updateFavorite(editingFavorite.id, favorite);
        setMessage(`자주 복용하는 약 "${name}"을(를) 수정했어요!`);
        onCancelFavoriteEdit(); // 수정 모드 끝내기
      } else {
        await addFavorite(favorite);
        setMessage(`자주 복용하는 약에 "${name}"을(를) 추가했어요!`);
      }
      setForm(emptyForm());
      setRecordBp(false);
      onFavoritesChanged(); // 부모에게 "즐겨찾기 목록 새로고침해줘" 알리기
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "즐겨찾기 저장에 실패했어요");
    }
  }

  // 저장 버튼을 눌렀을 때 실행되는 함수
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); // 폼 제출 시 페이지가 새로고침되는 기본 동작 막기
    setSaving(true);
    setMessage("");
    try {
      // 혈압 기록을 껐으면 혈압 값은 비워서(null) 보내요
      const payload = recordBp
        ? form
        : { ...form, bp_systolic: null, bp_diastolic: null, bp_pulse: null };
      if (editing) {
        await updateEntry(editing.id, payload); // 수정 모드면 PUT
      } else {
        await createEntry(payload);             // 아니면 새로 저장 (POST)
      }
      setForm(emptyForm());       // 폼 비우기
      setRecordBp(false);
      setMessage(editing ? "수정했어요!" : "저장했어요!");
      onSaved();                 // 부모에게 "저장했어!" 알리기
    } catch {
      setMessage("저장에 실패했어요. 백엔드가 켜져 있는지 확인해주세요.");
    } finally {
      setSaving(false);
    }
  }

  // ── 화면(JSX) : HTML처럼 생겼지만 { } 안에 자바스크립트를 쓸 수 있어요 ──
  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-[#d4efe8] bg-white p-6 text-gray-900 shadow-sm">
      <h2 className="text-lg font-bold text-[#48a08e]">
        {editing
          ? `기록 수정 (${editing.entry_date})`
          : editingFavorite
          ? `자주 복용하는 약 수정 (${editingFavorite.name})`
          : "오늘의 두통 기록"}
      </h2>

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

      {/* 약 종류 */}
      <label className="block">
        <span className="text-sm font-medium">
          약 종류 <span className="text-[#6cbfae]">*</span>
        </span>
        <input
          type="text"
          required
          list="medication-options"
          value={form.medication ?? ""}
          onChange={(e) => update("medication", e.target.value || null)}
          className="mt-1 w-full rounded-lg border p-2"
        />
        {/* datalist : 입력칸을 클릭하면 이전에 쓴 약들이 선택지로 떠요.
            새 약 이름도 그냥 타이핑하면 되고, 저장되면 다음부터 목록에 나와요! */}
        <datalist id="medication-options">
          {medications.map((med) => (
            <option key={med} value={med} />
          ))}
        </datalist>
      </label>

      {/* 투약 정보 — 통증약은 항상 복용하니까 늘 보여주고, 복용횟수는 필수! */}
      <div className="flex gap-4">
        <label className="block flex-1">
          <span className="text-sm">
            복용횟수 <span className="text-[#6cbfae]">*</span>
          </span>
          <input
            type="number"
            min={1}
            required
            value={form.dose_count ?? ""}
            onChange={(e) => update("dose_count", e.target.value ? Number(e.target.value) : null)}
            className="mt-1 w-full rounded-lg border p-2"
          />
        </label>
        <label className="flex items-center gap-2 pt-5">
          <input
            type="checkbox"
            checked={form.effective === true}
            onChange={(e) => update("effective", e.target.checked)}
          />
          <span className="text-sm">효과 있었음</span>
        </label>
      </div>

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

      {/* 혈압 — 잰 날만 체크해서 기록! (조건부 렌더링) */}
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={recordBp}
          onChange={(e) => setRecordBp(e.target.checked)}
        />
        <span className="text-sm">혈압도 기록하기</span>
      </label>

      {recordBp && (
      <div className="grid grid-cols-3 gap-3 rounded-lg bg-[#eef8f5] p-3">
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
      )}

      {/* 생리기간 체크 */}
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={form.menstruating}
          onChange={(e) => update("menstruating", e.target.checked)}
        />
        <span className="text-sm">생리기간</span>
      </label>

      {/* 저장/취소 버튼 — 모드에 따라 다르게 보여요
          · 기록 수정 중: 수정 저장하기 + 취소
          · 즐겨찾기 수정 중: 자주 복용하는 약 수정하기 + 취소
          · 평소: 기록 저장하기 + 자주 복용하는 약 저장하기 */}
      <div className="flex gap-2">
        {!editingFavorite && (
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-xl bg-[#a7e3d5] py-2.5 font-semibold text-[#1f4d44] transition hover:bg-[#8fd9c8] disabled:opacity-50"
          >
            {saving ? "저장 중..." : editing ? "수정 저장하기" : "기록 저장하기"}
          </button>
        )}
        {!editing && (
          <button
            type="button"
            onClick={handleSaveFavorite}
            className="flex-1 rounded-xl border border-[#a7e3d5] bg-white py-2.5 text-sm font-semibold text-[#1f4d44] transition hover:bg-[#eef8f5]"
          >
            {editingFavorite ? "자주 복용하는 약 수정하기" : "자주 복용하는 약 저장하기"}
          </button>
        )}
        {editing && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="rounded-xl border border-[#d4efe8] bg-white px-4 py-2.5 text-sm text-gray-500 hover:bg-[#eef8f5]"
          >
            취소
          </button>
        )}
        {editingFavorite && (
          <button
            type="button"
            onClick={onCancelFavoriteEdit}
            className="rounded-xl border border-[#d4efe8] bg-white px-4 py-2.5 text-sm text-gray-500 hover:bg-[#eef8f5]"
          >
            취소
          </button>
        )}
      </div>

      {/* 안내 메시지 (있을 때만 표시) */}
      {message && <p className="text-center text-sm">{message}</p>}
    </form>
  );
}
