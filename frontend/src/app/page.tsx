"use client";
// ↑ 버튼 클릭·입력 같은 상호작용이 있는 화면이라 클라이언트 컴포넌트로 선언!

// ─────────────────────────────────────────────
// page.tsx : 메인 페이지
// Next.js에서는 app/page.tsx 파일이 곧 "첫 화면(/)"이 돼요
// ─────────────────────────────────────────────

import { useCallback, useEffect, useState } from "react";
import EntryForm from "@/components/EntryForm";
import EntryTable from "@/components/EntryTable";
import EntryCalendar from "@/components/EntryCalendar";
import EntryCharts from "@/components/EntryCharts";
import { fetchEntries, deleteEntry, type Entry } from "@/lib/api";

// 탭 이름은 이 세 가지 중 하나만 가능하다고 타입으로 못박아요
type Tab = "list" | "calendar" | "chart";

const TABS: { key: Tab; label: string }[] = [
  { key: "list", label: "목록" },
  { key: "calendar", label: "달력" },
  { key: "chart", label: "차트" },
];

export default function Home() {
  // 기록 목록을 기억하는 state
  const [entries, setEntries] = useState<Entry[]>([]);
  // 지금 열려 있는 탭
  const [tab, setTab] = useState<Tab>("list");
  // 수정 중인 기록 (null이면 새 기록 모드)
  const [editing, setEditing] = useState<Entry | null>(null);
  // 로그인한 사용자 이름 (로그인 확인이 끝나야 화면을 보여줘요)
  const [userName, setUserName] = useState<string | null>(null);

  // 페이지 열리자마자 로그인했는지 검사 — 안 했으면 로그인 페이지로!
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    const user = localStorage.getItem("user");
    setUserName(user ? JSON.parse(user).name : "사용자");
  }, []);

  // 로그아웃: 저장한 토큰을 지우고 로그인 페이지로
  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }

  // 백엔드에서 목록을 불러오는 함수
  const load = useCallback(async () => {
    try {
      setEntries(await fetchEntries());
    } catch {
      // 백엔드가 꺼져 있으면 일단 빈 목록으로 둬요
    }
  }, []);

  // useEffect : "페이지가 처음 열렸을 때 한 번 실행해줘"
  useEffect(() => {
    load();
  }, [load]);

  // 삭제 버튼 처리
  async function handleDelete(id: number) {
    await deleteEntry(id);
    load(); // 삭제 후 목록 다시 불러오기
  }

  // 수정 버튼 처리: 그 기록을 폼에 싣고 맨 위로 스크롤
  function handleEdit(entry: Entry) {
    setEditing(entry);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // 저장(새 기록/수정)이 끝나면: 수정 모드 해제 + 목록 새로고침
  function handleSaved() {
    setEditing(null);
    load();
  }

  // 지금까지 쓴 약 이름들 (중복 제거) — 자동완성 목록으로 폼에 넘겨요
  // Set은 "같은 값은 한 번만 담는 주머니"예요
  const medications = Array.from(
    new Set(entries.map((e) => e.medication).filter((m): m is string => m !== null))
  );

  // 로그인 확인이 끝나기 전엔 아무것도 안 보여줘요 (화면 깜빡임 방지)
  if (userName === null) return null;

  return (
    // w-full : flex 부모 안에서 내용 크기에 따라 줄어들지 않고 항상 최대 폭 유지
    <main className="mx-auto w-full max-w-2xl space-y-8 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#48a08e]">두통 기록 차트</h1>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-gray-600">{userName}님</span>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-[#d4efe8] bg-white px-3 py-1 text-gray-500 hover:bg-[#eef8f5]"
          >
            로그아웃
          </button>
        </div>
      </div>

      {/* 입력 폼 — 저장이 끝나면 목록 새로고침, editing이 있으면 수정 모드 */}
      <EntryForm onSaved={handleSaved} editing={editing} onCancelEdit={() => setEditing(null)} medications={medications} />

      {/* 3탭: 목록 / 달력 / 차트 */}
      <section className="space-y-4">
        {/* 탭 버튼 줄 — 지금 탭이면 진하게, 아니면 연하게 */}
        <div className="flex gap-2">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                tab === key
                  ? "bg-[#a7e3d5] text-[#1f4d44]"
                  : "bg-white text-gray-500 hover:bg-[#eef8f5]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 선택된 탭에 맞는 컴포넌트만 렌더링 (조건부 렌더링 또 등장!) */}
        {tab === "list" && <EntryTable entries={entries} onDelete={handleDelete} onEdit={handleEdit} />}
        {tab === "calendar" && <EntryCalendar entries={entries} />}
        {tab === "chart" && <EntryCharts entries={entries} />}
      </section>
    </main>
  );
}
