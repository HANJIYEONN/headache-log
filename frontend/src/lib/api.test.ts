// ─────────────────────────────────────────────
// api.ts 테스트 — 백엔드에 요청을 "제대로 보내는지" 확인해요.
//
// 진짜 서버를 켜지 않아요. fetch를 가짜(mock)로 바꿔치기해서
// "어떤 주소로, 어떤 명찰을 달고 보냈는지"만 들여다봐요.
// ─────────────────────────────────────────────
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createEntry, fetchEntries } from "./api";

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
  // jsdom에서 페이지 이동을 흉내내려면 location을 바꿔치기해야 해요
  Object.defineProperty(window, "location", {
    value: { href: "" },
    writable: true,
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchEntries — 기록 목록 가져오기", () => {
  it("로그인 토큰을 Authorization 명찰로 붙여 보낸다", async () => {
    localStorage.setItem("access_token", "내토큰");
    const fetchSpy = mockFetch([]);

    await fetchEntries();

    const [url, options] = fetchSpy.mock.calls[0];
    expect(url).toContain("/entries");
    expect(options.headers).toEqual({ Authorization: "Bearer 내토큰" });
  });

  it("토큰이 없으면 명찰을 안 붙인다", async () => {
    const fetchSpy = mockFetch([]);

    await fetchEntries();

    expect(fetchSpy.mock.calls[0][1].headers).toEqual({});
  });

  it("받아온 목록을 그대로 돌려준다", async () => {
    mockFetch([{ id: 1, entry_date: "2026-07-14" }]);

    const entries = await fetchEntries();

    expect(entries).toHaveLength(1);
    expect(entries[0].id).toBe(1);
  });

  it("401이면 토큰을 지우고 로그인 화면으로 보낸다", async () => {
    localStorage.setItem("access_token", "만료된토큰");
    localStorage.setItem("user", "{}");
    mockFetch(null, { ok: false, status: 401 });

    await expect(fetchEntries()).rejects.toThrow();

    expect(localStorage.getItem("access_token")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
    expect(window.location.href).toBe("/login");
  });

  it("실패하면 에러를 던진다 (화면이 조용히 비지 않게)", async () => {
    mockFetch(null, { ok: false, status: 500 });

    await expect(fetchEntries()).rejects.toThrow("기록을 불러오지 못했어요");
  });
});

describe("createEntry — 새 기록 저장", () => {
  it("POST로 보내고 본문을 JSON 문자열로 만든다", async () => {
    localStorage.setItem("access_token", "내토큰");
    const fetchSpy = mockFetch({ id: 9 });
    const newEntry = {
      entry_date: "2026-07-14",
      menstruating: false,
      took_painkiller: true,
      medication: "타이레놀",
      effective: true,
      dose_count: 1,
      trigger: null,
      bp_systolic: null,
      bp_diastolic: null,
      bp_pulse: null,
    };

    const saved = await createEntry(newEntry);

    const [, options] = fetchSpy.mock.calls[0];
    expect(options.method).toBe("POST");
    expect(options.headers["Content-Type"]).toBe("application/json");
    expect(options.headers.Authorization).toBe("Bearer 내토큰");
    expect(JSON.parse(options.body).medication).toBe("타이레놀");
    expect(saved.id).toBe(9);
  });
});
