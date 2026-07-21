"use client";
// ↑ 로그인 확인·로그아웃 같은 상호작용이 있어서 클라이언트 컴포넌트예요

// ─────────────────────────────────────────────
// page.tsx : 프로젝트 선택 허브 (첫 화면 "/")
// 로그인 후 여기로 오고, 카드를 누르면 각 프로젝트로 들어가요.
// 새 프로젝트가 생기면 아래 PROJECTS 배열에 한 줄만 추가하면 돼요!
// ─────────────────────────────────────────────

import { useEffect, useState } from "react";
import Link from "next/link";
import BrainIcon from "@/components/BrainIcon";
import LogoutIcon from "@/components/LogoutIcon";

// 프로젝트 목록 — href가 있으면 들어갈 수 있고, ready:false면 "준비 중"
const PROJECTS = [
  {
    key: "headache",
    title: "두통 기록 차트",
    description: "두통과 투약 내용을 기록하고 통계로 확인해요",
    href: "/headache",
    ready: true,
  },
  // 예시: 다음 프로젝트가 생기면 이런 식으로 추가
  // { key: "diet", title: "식단 기록", description: "매 끼니를 기록해요", href: "/diet", ready: false },
];

export default function Home() {
  // 로그인한 사용자 이름 (확인 끝나야 화면을 보여줘요)
  const [userName, setUserName] = useState<string | null>(null);

  // 페이지 열리자마자 로그인 확인 — 안 했으면 로그인 페이지로!
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    const user = localStorage.getItem("user");
    setUserName(user ? JSON.parse(user).name : "사용자");
  }, []);

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }

  // 로그인 확인 전엔 아무것도 안 보여줘요 (화면 깜빡임 방지)
  if (userName === null) return null;

  return (
    <main className="mx-auto w-full max-w-2xl space-y-8 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#d17a3f]">프로젝트 선택</h1>
          <p className="mt-1 text-sm text-gray-600">{userName}님, 어떤 걸 열까요?</p>
        </div>
        <button
          onClick={handleLogout}
          title="로그아웃"
          aria-label="로그아웃"
          className="rounded-lg border border-[#f0d9c2] bg-white p-2 text-gray-500 hover:bg-[#fbefe2] hover:text-[#c05f22]"
        >
          <LogoutIcon />
        </button>
      </div>

      {/* 프로젝트 카드들 */}
      <div className="grid gap-4 sm:grid-cols-2">
        {PROJECTS.map((project) => {
          const inner = (
            <div className="flex h-full flex-col gap-3 rounded-2xl border border-[#f0d9c2] bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fbefe2] text-[#c05f22]">
                <BrainIcon className="h-7 w-7" />
              </div>
              <div>
                <h2 className="font-bold text-[#5c3a20]">{project.title}</h2>
                <p className="mt-1 text-sm text-gray-500">{project.description}</p>
              </div>
              {!project.ready && (
                <span className="mt-auto text-xs text-gray-400">준비 중</span>
              )}
            </div>
          );

          // 준비된 프로젝트는 링크로 감싸서 누르면 이동, 아니면 흐리게
          return project.ready ? (
            <Link key={project.key} href={project.href} className="transition hover:opacity-80">
              {inner}
            </Link>
          ) : (
            <div key={project.key} className="opacity-50">
              {inner}
            </div>
          );
        })}
      </div>
    </main>
  );
}
