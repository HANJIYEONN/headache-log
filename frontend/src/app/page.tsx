"use client";
// ↑ 버튼 클릭·입력 같은 상호작용이 있는 화면이라 클라이언트 컴포넌트로 선언!

// ─────────────────────────────────────────────
// page.tsx : 메인 페이지
// Next.js에서는 app/page.tsx 파일이 곧 "첫 화면(/)"이 돼요
// ─────────────────────────────────────────────

import { useCallback, useEffect, useState } from "react";
import EntryForm from "@/components/EntryForm";
import LogoutIcon from "@/components/LogoutIcon";
import EntryTable from "@/components/EntryTable";
import EntryCalendar from "@/components/EntryCalendar";
import EntryCharts from "@/components/EntryCharts";
import {
  fetchEntries,
  deleteEntry,
  fetchFavorites,
  deleteFavorite,
  quickAddEntry,
  type Entry,
  type FavoriteMedication,
} from "@/lib/api";

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
  // 즐겨찾기(자주 복용하는 약, 최대 3개)
  const [favorites, setFavorites] = useState<FavoriteMedication[]>([]);
  const [quickAddMessage, setQuickAddMessage] = useState("");
  // 수정 중인 즐겨찾기 (null이면 아님)
  const [editingFavorite, setEditingFavorite] = useState<FavoriteMedication | null>(null);

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

  // 즐겨찾기 목록을 불러오는 함수
  const loadFavorites = useCallback(async () => {
    try {
      setFavorites(await fetchFavorites());
    } catch {
      // 백엔드가 꺼져 있으면 일단 빈 목록으로 둬요
    }
  }, []);

  // useEffect : "페이지가 처음 열렸을 때 한 번 실행해줘"
  useEffect(() => {
    load();
    loadFavorites();
  }, [load, loadFavorites]);

  // 즐겨찾기 버튼 클릭: 저장해둔 내용 그대로 오늘 기록으로 완성해서 저장
  async function handleQuickAdd(favorite: FavoriteMedication) {
    setQuickAddMessage("");
    try {
      await quickAddEntry(favorite);
      setQuickAddMessage(`${favorite.name} 기록을 오늘 목록에 추가했어요!`);
      load();
    } catch {
      setQuickAddMessage("추가에 실패했어요. 다시 시도해주세요.");
    }
  }

  // 삭제 버튼 처리
  async function handleDelete(id: number) {
    await deleteEntry(id);
    load(); // 삭제 후 목록 다시 불러오기
  }

  // 수정 버튼 처리: 그 기록을 폼에 싣고 맨 위로 스크롤
  function handleEdit(entry: Entry) {
    setEditing(entry);
    setEditingFavorite(null); // 두 가지 수정 모드가 겹치지 않게!
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // 즐겨찾기 수정 버튼: 그 내용을 폼에 싣고 맨 위로 스크롤
  function handleEditFavorite(favorite: FavoriteMedication) {
    setEditingFavorite(favorite);
    setEditing(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // 즐겨찾기 삭제 버튼
  async function handleDeleteFavorite(id: number) {
    try {
      await deleteFavorite(id);
      if (editingFavorite?.id === id) setEditingFavorite(null);
      loadFavorites();
    } catch {
      setQuickAddMessage("삭제에 실패했어요. 다시 시도해주세요.");
    }
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
      <div className="flex items-start justify-between">
        {/* 제목 + 이름을 세로로 쌓아서 좁은 화면에서도 안 겹치게 */}
        <div>
          <h1 className="text-2xl font-bold text-[#48a08e]">두통 기록 차트</h1>
          <p className="mt-1 text-sm text-gray-600">{userName}님</p>
        </div>
        <button
          onClick={handleLogout}
          title="로그아웃"
          aria-label="로그아웃"
          className="rounded-lg border border-[#d4efe8] bg-white p-2 text-gray-500 hover:bg-[#eef8f5] hover:text-[#178f76]"
        >
          <LogoutIcon />
        </button>
      </div>

      {/* 자주 복용하는 약 — 이름 누르면 오늘 기록으로 바로 저장, 수정/삭제 버튼 포함 */}
      {favorites.length > 0 && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {favorites.map((fav) => (
              <div
                key={fav.id}
                className="flex items-center overflow-hidden rounded-full border border-[#d4efe8] bg-white text-sm"
              >
                <button
                  onClick={() => handleQuickAdd(fav)}
                  title="누르면 오늘 복용 기록으로 저장돼요"
                  className="px-4 py-2 font-medium text-[#1f4d44] hover:bg-[#eef8f5]"
                >
                  {fav.name} 복용
                </button>
                <button
                  onClick={() => handleEditFavorite(fav)}
                  className="border-l border-[#eef8f5] px-3 py-2 text-xs text-gray-400 hover:bg-[#eef8f5] hover:text-[#178f76]"
                >
                  수정
                </button>
                <button
                  onClick={() => handleDeleteFavorite(fav.id)}
                  className="border-l border-[#eef8f5] px-3 py-2 text-xs text-gray-400 hover:bg-[#eef8f5] hover:text-red-500"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
          {quickAddMessage && <p className="text-sm text-gray-500">{quickAddMessage}</p>}
        </div>
      )}

      {/* 입력 폼 — 저장이 끝나면 목록 새로고침, editing이 있으면 수정 모드 */}
      <EntryForm
        onSaved={handleSaved}
        editing={editing}
        onCancelEdit={() => setEditing(null)}
        medications={medications}
        favorites={favorites}
        onFavoritesChanged={loadFavorites}
        editingFavorite={editingFavorite}
        onCancelFavoriteEdit={() => setEditingFavorite(null)}
      />

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
