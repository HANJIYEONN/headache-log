// ─────────────────────────────────────────────
// catApi.ts 테스트 — 고양이 수첩 백엔드에 "제대로 말을 거는지" 확인해요.
//
// 진짜 서버는 안 켜요. fetch를 가짜로 바꿔치기해서
// 주소·방식(GET/POST/…)·명찰·본문만 들여다봅니다.
// ─────────────────────────────────────────────
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  ApiError,
  acceptFriend,
  checkNoteId,
  completeToday,
  createAccount,
  fetchMe,
  fetchMonth,
  removeFriend,
  saveSentence,
  saveVocab,
  searchUser,
} from "./catApi";

const CAT = "/api/v1/cat-note";

/** fetch가 이런 응답을 준 척하게 만들어요 */
function mockFetch(body: unknown, { ok = true, status = 200 } = {}) {
  const fake = vi.fn().mockResolvedValue({
    ok,
    status,
    json: async () => body,
  } as Response);
  vi.stubGlobal("fetch", fake);
  return fake;
}

beforeEach(() => {
  localStorage.clear();
  Object.defineProperty(window, "location", { value: { href: "" }, writable: true });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// ── 주소를 제대로 만드나 ───────────────────────────────

describe("주소 만들기", () => {
  it("고양이 수첩 주소 앞에 /api/v1/cat-note 를 붙인다", async () => {
    const fetchSpy = mockFetch({ exists: false });

    await fetchMe();

    expect(fetchSpy.mock.calls[0][0]).toContain(`${CAT}/me`);
  });

  it("문장 번호를 주소에 넣는다", async () => {
    const fetchSpy = mockFetch({ position: 3, text: "안녕", saved_at: "" });

    await saveSentence(3, "안녕");

    const [url, options] = fetchSpy.mock.calls[0];
    expect(url).toContain(`${CAT}/entries/today/sentences/3`);
    expect(options.method).toBe("PUT");
    expect(JSON.parse(options.body)).toEqual({ text: "안녕" });
  });

  it("년·월을 물음표 뒤에 붙인다", async () => {
    const fetchSpy = mockFetch({ days: [], total_stamps_this_month: 0 });

    await fetchMonth(2026, 7);

    expect(fetchSpy.mock.calls[0][0]).toContain(`${CAT}/entries?year=2026&month=7`);
  });

  it("아이디에 특수문자가 있어도 주소가 깨지지 않는다", async () => {
    const fetchSpy = mockFetch({ found: false });

    await searchUser("a&b=c");

    // & 나 = 를 그대로 넣으면 서버가 다른 값으로 읽어요
    expect(fetchSpy.mock.calls[0][0]).toContain("note_id=a%26b%3Dc");
  });
});

// ── 명찰과 방식 ────────────────────────────────────────

describe("로그인 명찰", () => {
  it("토큰이 있으면 Authorization 을 붙인다", async () => {
    localStorage.setItem("access_token", "내토큰");
    const fetchSpy = mockFetch({ exists: false });

    await fetchMe();

    expect(fetchSpy.mock.calls[0][1].headers).toEqual({ Authorization: "Bearer 내토큰" });
  });

  it("보낼 게 있으면 Content-Type 도 같이 붙인다", async () => {
    localStorage.setItem("access_token", "내토큰");
    const fetchSpy = mockFetch({ exists: true });

    await createAccount({ partner: "kongi", note_id: "jiwoo07", nickname: "지우" });

    expect(fetchSpy.mock.calls[0][1].headers).toEqual({
      "Content-Type": "application/json",
      Authorization: "Bearer 내토큰",
    });
  });

  it("본문이 없는 API 는 body 를 안 보낸다", async () => {
    const fetchSpy = mockFetch({ friendship_id: 1, status: "accepted" });

    await acceptFriend(1);

    expect(fetchSpy.mock.calls[0][1].body).toBeUndefined();
  });

  it("담기는 correction_id 를 본문에 넣는다", async () => {
    const fetchSpy = mockFetch({ vocab_id: 1, expression: "좋아요" });

    await saveVocab(5);

    expect(JSON.parse(fetchSpy.mock.calls[0][1].body)).toEqual({ correction_id: 5 });
  });
});

// ── 실패했을 때 ────────────────────────────────────────

describe("실패했을 때", () => {
  it("401이면 토큰을 지우고 로그인 화면으로 보낸다", async () => {
    localStorage.setItem("access_token", "낡은토큰");
    mockFetch({ detail: "로그인이 필요해요" }, { ok: false, status: 401 });

    await expect(fetchMe()).rejects.toThrow();

    expect(localStorage.getItem("access_token")).toBeNull();
    expect(window.location.href).toBe("/login");
  });

  it("상태 코드를 에러에 담아준다", async () => {
    // 화면이 409(이미 있음)와 422(글자 규칙)에 다른 말을 보여줘야 하거든요
    mockFetch({ detail: "이미 쓰고 있는 아이디예요" }, { ok: false, status: 409 });

    const failure = await createAccount({
      partner: "kongi",
      note_id: "jiwoo07",
      nickname: "지우",
    }).catch((err) => err);

    expect(failure).toBeInstanceOf(ApiError);
    expect(failure.status).toBe(409);
    expect(failure.detail).toBe("이미 쓰고 있는 아이디예요");
  });

  it("detail 이 목록으로 오면(422) 문구로 쓰지 않는다", async () => {
    // FastAPI 는 422일 때 detail 을 배열로 보내요. 그대로 뿌리면 [object Object] 가 떠요
    mockFetch({ detail: [{ msg: "too short" }] }, { ok: false, status: 422 });

    const failure = await checkNoteId("ab").catch((err) => err);

    expect(failure.detail).toBeNull();
    expect(failure.message).toBe("확인하지 못했어요");
  });

  it("본문이 JSON 이 아니어도 터지지 않는다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 502,
        json: async () => {
          throw new Error("JSON 아님");
        },
      } as unknown as Response),
    );

    const failure = await fetchMe().catch((err) => err);

    expect(failure).toBeInstanceOf(ApiError);
    expect(failure.status).toBe(502);
  });
});

// ── 지우기는 본문이 없어요 ─────────────────────────────

describe("지우기", () => {
  it("204(본문 없음)를 JSON 으로 읽으려 하지 않는다", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      json: async () => {
        throw new Error("본문이 없어요");
      },
    } as unknown as Response);
    vi.stubGlobal("fetch", fetchSpy);

    await expect(removeFriend(7)).resolves.toBeUndefined();
    expect(fetchSpy.mock.calls[0][1].method).toBe("DELETE");
  });
});

// ── 채점은 오래 걸려요 ─────────────────────────────────

describe("다 썼어요! (채점)", () => {
  it("POST 로 부르고 결과를 그대로 돌려준다", async () => {
    const graded = {
      entry_id: 1,
      is_complete: true,
      accuracy: 80,
      sentences: [],
      new_expressions: ["좋아요"],
      streak_days: 1,
      total_stamps: 1,
    };
    const fetchSpy = mockFetch(graded);

    await expect(completeToday()).resolves.toEqual(graded);
    expect(fetchSpy.mock.calls[0][0]).toContain(`${CAT}/entries/today/complete`);
    expect(fetchSpy.mock.calls[0][1].method).toBe("POST");
  });
});
