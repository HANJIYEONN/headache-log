"use client";
// ↑ 지금 어느 화면인지 알아야 해서(usePathname) 클라이언트 컴포넌트예요

// ─────────────────────────────────────────────
// CatTabBar : 고양이 수첩 화면 아래에 늘 붙어 있는 탭바 🐾
//
// 다섯 화면(홈·쓰기·달력·친구·내 정보) 어디서나 같은 자리에 있어요.
// 아이는 "뒤로 가기"를 잘 못 찾으니까, 언제든 여기로 돌아올 수 있게요.
// ─────────────────────────────────────────────

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useT } from "@/i18n/LanguageProvider";

// 수첩 시안 색 (cat-note 화면들이 같이 쓰는 값)
const PAPER = "#fffdf5"; // 종이색 바탕
const LINE = "#efe3c8"; // 옅은 테두리
const PICKED = "#b98a1f"; // 고른 탭 — 진한 노랑
const PICKED_BG = "#fbefc9"; // 고른 탭 뒤 연한 노랑
const RESTING = "#a08c66"; // 안 고른 탭 — 차분한 갈색

type IconProps = { className?: string };

// 아이콘은 전부 currentColor 를 써요 — 부모의 글자색을 그대로 물려받아요.
// 그래서 고른 탭/안 고른 탭 색을 한 곳에서만 정하면 돼요.
function HomeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 11 L12 4 L20 11 V19 A1 1 0 0 1 19 20 H5 A1 1 0 0 1 4 19 Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WriteIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      {/* 연필 */}
      <path
        d="M4 20 L4.8 16.4 L15.6 5.6 A2 2 0 0 1 18.4 8.4 L7.6 19.2 Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M14 7 L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CalendarIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect
        x="3.5"
        y="5"
        width="17"
        height="15"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M3.5 9.5 H20.5 M8 3.5 V6.5 M16 3.5 V6.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* 발도장 자리 */}
      <circle cx="8.5" cy="14" r="1.3" fill="currentColor" />
      <circle cx="12" cy="14" r="1.3" fill="currentColor" />
    </svg>
  );
}

function FriendsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="9" cy="8.5" r="3.2" stroke="currentColor" strokeWidth="2" />
      <path
        d="M3.5 19.5 C3.5 16.2 6 14.2 9 14.2 C12 14.2 14.5 16.2 14.5 19.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* 뒤에 선 친구 */}
      <path
        d="M16 6.2 A3.2 3.2 0 0 1 16 11.3 M17 14.6 C19.3 15.2 20.5 17.2 20.5 19.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ProfileIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      {/* 고양이 얼굴 — 내 수첩의 주인 */}
      <path
        d="M5 12.5 L5 6 L9 9 Q12 8 15 9 L19 6 L19 12.5 Q19 19 12 19 Q5 19 5 12.5 Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9.5" cy="13" r="1.2" fill="currentColor" />
      <circle cx="14.5" cy="13" r="1.2" fill="currentColor" />
    </svg>
  );
}

const BASE = "/cat-note";

/** 탭 다섯 개. 순서는 시안의 하단 탭바 그대로예요 */
const TABS = [
  { href: BASE, key: "home", Icon: HomeIcon },
  { href: `${BASE}/write`, key: "write", Icon: WriteIcon },
  { href: `${BASE}/calendar`, key: "calendar", Icon: CalendarIcon },
  { href: `${BASE}/friends`, key: "friends", Icon: FriendsIcon },
  { href: `${BASE}/profile`, key: "profile", Icon: ProfileIcon },
] as const;

/**
 * 지금 보고 있는 화면이 이 탭인가?
 *
 * 홈(`/cat-note`)만 딱 맞을 때로 봐요. 안 그러면 모든 화면이
 * `/cat-note` 로 시작하니까 홈 탭이 늘 켜져 있게 되거든요.
 */
export function isCurrentTab(pathname: string, href: string): boolean {
  if (href === BASE) return pathname === BASE || pathname === `${BASE}/`;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function CatTabBar() {
  const t = useT();
  const pathname = usePathname() ?? "";

  return (
    <nav
      aria-label={t.catNote.title}
      // 아래에 딱 붙이고, 아이폰 홈 막대에 가리지 않게 여백을 더해요
      className="sticky bottom-0 z-10 border-t pb-[env(safe-area-inset-bottom)]"
      style={{ backgroundColor: PAPER, borderColor: LINE }}
    >
      <ul className="mx-auto flex max-w-md items-stretch">
        {TABS.map(({ href, key, Icon }) => {
          const current = isCurrentTab(pathname, href);
          return (
            <li key={key} className="flex-1">
              <Link
                href={href}
                // aria-current 를 넣으면 화면 읽어주는 프로그램이
                // "지금 여기 있어요" 라고 알려줘요
                aria-current={current ? "page" : undefined}
                // 손가락이 작아도 잘 눌리게 세로 56px 이상 잡아요
                className="flex min-h-[56px] flex-col items-center justify-center gap-1 px-1 py-2 text-[11px] font-medium transition"
                style={{ color: current ? PICKED : RESTING }}
              >
                <span
                  className="flex h-7 w-10 items-center justify-center rounded-full transition"
                  style={{ backgroundColor: current ? PICKED_BG : "transparent" }}
                >
                  <Icon className="h-5 w-5" />
                </span>
                {t.catNote.tabs[key]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
