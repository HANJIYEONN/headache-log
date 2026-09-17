import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createBlogUser, fetchBlogUser } from "./blogUserApi";

function mockFetch(body: unknown) {
  const fake = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => body,
  } as Response);
  vi.stubGlobal("fetch", fake);
  return fake;
}

beforeEach(() => {
  localStorage.clear();
  Object.defineProperty(window, "location", { value: { href: "" }, writable: true });
});

afterEach(() => vi.unstubAllGlobals());

describe("블로그 닉네임 API", () => {
  it("블로그 전용 주소에서 내 닉네임을 가져온다", async () => {
    localStorage.setItem("access_token", "내토큰");
    const fetchSpy = mockFetch({ exists: false });

    await fetchBlogUser();

    expect(fetchSpy.mock.calls[0][0]).toContain("/api/v1/blog/users/me");
    expect(fetchSpy.mock.calls[0][1].headers).toEqual({ Authorization: "Bearer 내토큰" });
  });

  it("닉네임을 POST 본문에 넣어 저장한다", async () => {
    const fetchSpy = mockFetch({ exists: true, nickname: "홀리캣" });

    await createBlogUser("홀리캣");

    const [, options] = fetchSpy.mock.calls[0];
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body)).toEqual({ nickname: "홀리캣" });
  });
});
