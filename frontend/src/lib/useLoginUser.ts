// ─────────────────────────────────────────────
// useLoginUser : 로그인 상태를 읽어오는 훅
//
// localStorage는 리액트 바깥에 있는 "외부 저장소"예요.
// 이런 건 useEffect + setState 대신 useSyncExternalStore로 읽는 게
// 리액트가 권하는 방식이에요. 화면이 두 번 그려지는 것도 막아줘요.
//
// 값이 세 가지라는 게 포인트예요:
//   undefined → 아직 모름 (서버에서 그릴 땐 localStorage를 볼 수 없어요)
//   null      → 로그인 안 됨
//   문자열     → 로그인됨
// "아직 모름"과 "로그인 안 됨"을 구분해야 엉뚱하게 로그인 페이지로
// 튕기는 일이 없어요.
// ─────────────────────────────────────────────
import { useSyncExternalStore } from "react";

/** 다른 탭에서 로그아웃하면 이 탭도 같이 반응하게 구독해요 */
function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

const readToken = () => localStorage.getItem("access_token");
const readUser = () => localStorage.getItem("user");
const notKnownYet = () => undefined; // 서버에서 그릴 때

export function useLoginUser() {
  const token = useSyncExternalStore(subscribe, readToken, notKnownYet);
  const rawUser = useSyncExternalStore(subscribe, readUser, notKnownYet);

  return {
    /** undefined = 아직 모름, null = 로그인 안 됨 */
    token,
    /** 로그인 확인이 끝났는지 */
    isKnown: token !== undefined,
    /** 로그인한 사람 이름 (없으면 fallback) */
    name: rawUser ? (JSON.parse(rawUser).name as string) : null,
  };
}
