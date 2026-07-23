"use client";
// ↑ 로그인 확인·로그아웃 같은 상호작용이 있어서 클라이언트 컴포넌트예요

// ─────────────────────────────────────────────
// page.tsx : 프로필 + 프로젝트 선택 허브 (첫 화면 "/")
// 링크트리처럼 위에서 아래로 내려가는 구조예요.
//   아바타 → 이름 → 소개 → 가로로 긴 프로젝트 칸들
// 새 프로젝트가 생기면 아래 PROJECTS 배열에 한 줄만 추가하면 돼요!
// ─────────────────────────────────────────────

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import BrainIcon from "@/components/BrainIcon";
import LogoutIcon from "@/components/LogoutIcon";

// 프로필 정보 — 여기 글자만 고치면 화면이 바로 바뀌어요
const PROFILE = {
  name: "Han Jiyeon",
  handle: "@HANJIYEONN",
  role: "Full-stack Developer",
  bio: "만들면서 배우는 중이에요. Next.js로 화면을, FastAPI로 서버를 만들어요.",
  stack: ["Next.js", "TypeScript", "FastAPI", "MySQL"],
};

// 프로젝트 목록 — href가 있으면 들어갈 수 있고, ready:false면 "준비 중"
const PROJECTS = [
  {
    key: "headache",
    title: "두통 기록 차트",
    description: "투약 기록을 남기고 통계로 확인해요",
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
    <main className="relative mx-auto w-full max-w-md px-5 py-10">
      {/* 로그아웃 — 링크트리의 공유 버튼처럼 오른쪽 위 구석에 */}
      <button
        onClick={handleLogout}
        title="로그아웃"
        aria-label="로그아웃"
        className="absolute right-5 top-10 rounded-full border border-[#f8ccdd] bg-white p-2.5 text-[#c9698f] shadow-sm transition hover:bg-[#ffe4ee]"
      >
        <LogoutIcon />
      </button>

      {/* ── 프로필 영역 ───────────────────────────── */}
      <section className="flex flex-col items-center text-center">
        {/* 깃허브 프로필 사진(너구리 🦝) — public/avatar.png 를 바꾸면 사진도 바뀌어요.
            next/image 는 사진 크기를 알아야 자리를 미리 잡아둘 수 있어서 width/height가 필요해요 */}
        <Image
          src="/avatar.png"
          alt="프로필 사진"
          width={112}
          height={112}
          priority
          className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-md"
        />

        <h1 className="mt-4 text-2xl font-bold text-[#7d4457]">{PROFILE.name}</h1>
        <p className="mt-0.5 text-sm text-[#e05a86]">{PROFILE.handle}</p>

        <p className="mt-3 text-sm font-semibold text-[#7d4457]">{PROFILE.role}</p>
        <p className="mt-1 text-sm leading-relaxed text-[#a07185]">{PROFILE.bio}</p>

        {/* 사용하는 기술들 — 작은 알약 모양 태그 */}
        <ul className="mt-4 flex flex-wrap justify-center gap-2">
          {PROFILE.stack.map((tech) => (
            <li
              key={tech}
              className="rounded-full bg-[#ffe4ee] px-3 py-1 text-xs font-medium text-[#c9457a]"
            >
              {tech}
            </li>
          ))}
        </ul>
      </section>

      {/* ── 프로젝트 칸들 ─────────────────────────── */}
      <section className="mt-10 space-y-3">
        <h2 className="px-1 text-xs font-semibold uppercase tracking-wider text-[#c9698f]">
          Projects
        </h2>

        {PROJECTS.map((project) => {
          // 가로로 길쭉한 한 칸의 속 내용 (링크든 아니든 똑같이 생겼어요)
          const inner = (
            <div className="flex w-full items-center gap-4 rounded-2xl border border-[#f8ccdd] bg-white px-5 py-4 shadow-sm">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#ffe4ee] text-[#e05a86]">
                <BrainIcon className="h-6 w-6" />
              </span>

              {/* min-w-0 : 글이 길어져도 칸을 밀어내지 않고 말줄임(...) 되게 해줘요 */}
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate font-bold text-[#7d4457]">{project.title}</p>
                <p className="truncate text-xs text-[#a07185]">{project.description}</p>
              </div>

              {project.ready ? (
                // 오른쪽 화살표 (들어갈 수 있다는 표시)
                <svg
                  className="h-5 w-5 shrink-0 text-[#e5a3bd]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M9 6l6 6-6 6" />
                </svg>
              ) : (
                <span className="shrink-0 rounded-full bg-[#ffe4ee] px-2.5 py-1 text-[11px] font-medium text-[#c9698f]">
                  준비 중
                </span>
              )}
            </div>
          );

          // 준비된 프로젝트는 링크로 감싸서 누르면 이동, 아니면 흐리게
          return project.ready ? (
            <Link
              key={project.key}
              href={project.href}
              className="block rounded-2xl transition hover:-translate-y-0.5 hover:shadow-md"
            >
              {inner}
            </Link>
          ) : (
            <div key={project.key} className="opacity-50">
              {inner}
            </div>
          );
        })}
      </section>

      <p className="mt-10 text-center text-xs text-[#d6a3b6]">world holicat 🐱</p>
    </main>
  );
}
