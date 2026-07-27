"use client";
// ↑ 언어 선택은 브라우저에서 일어나는 일이라 클라이언트 컴포넌트예요

// ─────────────────────────────────────────────
// LanguageProvider : 지금 언어가 뭔지 온 사이트가 함께 아는 방법
//
// Context(문맥) = "이 값을 앱 전체에 방송해주는 스피커" 라고 생각하면 돼요 📢
// 부모에서 자식으로 props를 계속 넘기지 않아도,
// 어느 컴포넌트에서든 useT() 한 줄로 지금 언어의 글자를 꺼내 쓸 수 있어요.
//
// 고른 언어는 브라우저의 localStorage 에 저장돼요. 그런데 localStorage 는
// React 바깥에 있는 창고라서, React가 그 값을 안전하게 읽는 전용 도구인
// useSyncExternalStore 를 써요. (서버에서 그린 화면과 어긋나지 않게 해줘요)
// ─────────────────────────────────────────────

import { createContext, useContext, useEffect, useSyncExternalStore } from "react";
import { dictionaries, LOCALES, type Dict, type Locale } from "./dictionaries";

// 고른 언어를 브라우저에 저장할 때 쓰는 이름 (다음에 와도 기억나게!)
const STORAGE_KEY = "locale";

// 문자열이 우리가 지원하는 언어인지 확인하는 도우미
function isLocale(value: string | null): value is Locale {
  return value !== null && (LOCALES as readonly string[]).includes(value);
}

// ── React 바깥의 작은 "언어 창고" ──────────────
// 언어가 바뀌면 알려달라고 신청해둔 화면들 (구독자 명단)
const listeners = new Set<() => void>();

// 지금 언어를 담아두는 곳. null이면 "아직 안 읽어봤다"는 뜻이에요.
let currentLocale: Locale | null = null;

// 브라우저가 켜진 뒤 실제 언어를 알아내요:
// 1순위 저장해둔 언어 → 2순위 브라우저 설정 언어 → 3순위 한국어
function readLocale(): Locale {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (isLocale(saved)) return saved;
  const browserLang = navigator.language.slice(0, 2); // "ja-JP" → "ja"
  return isLocale(browserLang) ? browserLang : "ko";
}

// React가 "지금 값이 뭐야?" 하고 물어볼 때 대답하는 함수.
// 매번 새로 계산하지 않고 기억해둔 값을 주는 게 중요해요! (안 그러면 무한 반복)
function getSnapshot(): Locale {
  if (currentLocale === null) currentLocale = readLocale();
  return currentLocale;
}

// 서버에는 localStorage가 없으니 기본값(한국어)으로 그려요
function getServerSnapshot(): Locale {
  return "ko";
}

// React가 "값 바뀌면 알려줘" 하고 신청하는 함수. 돌려주는 함수는 신청 취소용이에요.
function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

// 언어 바꾸기: 창고 값 갱신 → 브라우저에 저장 → 구독한 화면들에게 알림
function changeLocale(next: Locale) {
  currentLocale = next;
  localStorage.setItem(STORAGE_KEY, next);
  listeners.forEach((notify) => notify());
}

// ── Context ─────────────────────────────────
type LanguageValue = {
  locale: Locale; // 지금 언어
  setLocale: (locale: Locale) => void; // 언어 바꾸기
  t: Dict; // 지금 언어의 사전 (t = translation)
};

const LanguageContext = createContext<LanguageValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // 언어 창고를 구독해서, 바뀔 때마다 이 컴포넌트가 다시 그려지게 해요
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // <html lang="..."> 도 같이 바꿔줘요.
  // 화면에 안 보이지만 스크린리더와 검색엔진이 이걸 보고 언어를 판단해요.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale: changeLocale, t: dictionaries[locale] }}>
      {children}
    </LanguageContext.Provider>
  );
}

// ── 화면에서 쓰는 도구들 ──────────────────────

// 언어 자체를 다뤄야 할 때 (언어 전환 버튼 등)
export function useLanguage(): LanguageValue {
  const value = useContext(LanguageContext);
  if (!value) {
    // Provider 밖에서 부르면 알려줘요 — layout.tsx 에 감싸는 걸 잊은 경우예요
    throw new Error("useLanguage 는 LanguageProvider 안에서만 쓸 수 있어요");
  }
  return value;
}

// 글자만 필요할 때 — 화면 코드에서는 거의 이것만 써요
//   const t = useT();  →  t.home.role
export function useT(): Dict {
  return useLanguage().t;
}

// 브라우저 탭 제목을 언어에 맞게 바꿔주는 조각
//
// document.title = "..." 처럼 직접 바꾸면 React가 화면을 다시 그릴 때
// 서버가 정해둔 제목으로 되돌려버려요. 그래서 <title> 을 아예 화면의 일부처럼
// 그려주면, React가 알아서 <head> 로 옮겨 담고 계속 지켜줘요. (React 19 기능)
//
// 쓰는 법: 페이지 JSX 안 아무 데나 <PageTitle title={t.meta.site} /> 넣기
export function PageTitle({ title }: { title: string }) {
  return <title>{title}</title>;
}
