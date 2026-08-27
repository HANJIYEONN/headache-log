// ─────────────────────────────────────────────
// apiBase.ts : 백엔드에 말 걸 때 두 앱이 **같이** 쓰는 부분
//   - 두통 기록  → api.ts
//   - 고양이 수첩 → catApi.ts
//
// 서버 주소·로그인 명찰·401 처리를 두 곳에 따로 적어두면
// 한쪽만 고치고 다른 쪽을 잊는 일이 생겨요. 그래서 여기 하나로 모았어요.
// ─────────────────────────────────────────────

// 백엔드 서버 주소
// 배포 시 Vercel에 NEXT_PUBLIC_API_URL 환경변수로 실제 서버 주소를 넣어줘요.
// 로컬 개발 중엔 값이 없으니 localhost로 자동 대체돼요.
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ── 로그인 토큰을 요청에 붙여주는 도우미 ──
// 로그인하면 localStorage에 access_token이 저장돼 있어요.
// 모든 요청에 "Authorization: Bearer 토큰" 명찰을 달아서 보내요.
export function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// JSON을 보낼 때 쓰는 머리말 (명찰도 같이 붙여요)
export function jsonHeaders(): Record<string, string> {
  return { "Content-Type": "application/json", ...authHeaders() };
}

// 401(로그인 안 됨/만료) 응답이면 로그인 페이지로 보내요
export function checkAuth(res: Response) {
  if (res.status === 401) {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }
}

/**
 * 실패한 응답을 에러로 바꿔요.
 *
 * 그냥 "실패했어요" 하나만 던지면 화면이 이유를 모르니까,
 * 상태 코드(status)를 같이 담아둬요. 예를 들어 아이디 만들기 화면은
 * 409(이미 있음)와 422(글자 규칙 위반)에 **다른 말**을 보여줘야 하거든요.
 */
export class ApiError extends Error {
  status: number;
  detail: string | null;

  constructor(status: number, detail: string | null, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

/**
 * 응답 본문에서 서버가 보낸 이유(detail)를 꺼내 에러로 던져요.
 *
 * ⚠️ `detail`은 **한국어로만** 와요. 이 앱은 4개 언어라서,
 * 화면에 그대로 뿌리지 말고 `status`로 우리 사전 문구를 고르세요.
 * `detail`은 사전에 없는 상황을 만났을 때 쓰는 마지막 수단이에요.
 */
export async function fail(res: Response, fallback: string): Promise<never> {
  let detail: string | null = null;
  try {
    const body = await res.json();
    // 422일 때 detail은 목록(배열)으로 와요. 문자열일 때만 씁니다.
    if (typeof body?.detail === "string") detail = body.detail;
  } catch {
    // 본문이 JSON이 아닐 수도 있어요 (502 같은 것)
  }
  throw new ApiError(res.status, detail, detail ?? fallback);
}
