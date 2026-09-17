import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createBlogPost,
  deleteBlogPost,
  fetchBlogPost,
  fetchBlogPosts,
  updateBlogPost,
} from "./blogApi";

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

describe("블로그 글 API", () => {
  it("작성자 필터 없이 전체 글 목록을 요청한다", async () => {
    const fetchSpy = mockFetch([]);

    await fetchBlogPosts();

    expect(fetchSpy.mock.calls[0][0]).toMatch(/\/api\/v1\/blog\/posts$/);
  });

  it("제목과 본문을 POST로 보낸다", async () => {
    const fetchSpy = mockFetch({ id: 1 });

    await createBlogPost("제목", "본문");

    const [, options] = fetchSpy.mock.calls[0];
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body)).toEqual({ title: "제목", content: "본문" });
  });

  it("글 하나를 번호로 불러온다", async () => {
    const fetchSpy = mockFetch({ id: 7 });
    await fetchBlogPost(7);
    expect(fetchSpy.mock.calls[0][0]).toMatch(/\/posts\/7$/);
  });

  it("수정할 제목과 본문을 PUT으로 보낸다", async () => {
    const fetchSpy = mockFetch({ id: 7 });
    await updateBlogPost(7, "새 제목", "새 본문");
    const [, options] = fetchSpy.mock.calls[0];
    expect(options.method).toBe("PUT");
    expect(JSON.parse(options.body)).toEqual({ title: "새 제목", content: "새 본문" });
  });

  it("DELETE로 글을 지운다", async () => {
    const fetchSpy = mockFetch(undefined);
    await deleteBlogPost(7);
    expect(fetchSpy.mock.calls[0][1].method).toBe("DELETE");
  });
});
