import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LanguageProvider } from "@/i18n/LanguageProvider";
import BlogPostList from "./BlogPostList";

const fake = vi.hoisted(() => ({ fetchBlogPosts: vi.fn() }));

vi.mock("@/lib/blogApi", () => ({ fetchBlogPosts: fake.fetchBlogPosts }));

const posts = [1, 2, 3, 4].map((id) => ({
  id,
  title: `이야기 ${id}`,
  content: `본문 ${id}`,
  author_nickname: "고양이",
  is_author: false,
  created_at: "2026-09-17T12:00:00Z",
  updated_at: "2026-09-17T12:00:00Z",
}));

function renderList(limit?: number, layout: "list" | "grid" = "list") {
  return render(
    <LanguageProvider>
      <BlogPostList limit={limit} layout={layout} />
    </LanguageProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  fake.fetchBlogPosts.mockResolvedValue(posts);
});

describe("블로그 글 목록", () => {
  it("메인에서는 최근 글 세 개만 보여준다", async () => {
    renderList(3);

    expect(await screen.findByText("이야기 1")).toBeInTheDocument();
    expect(screen.getByText("이야기 3")).toBeInTheDocument();
    expect(screen.queryByText("이야기 4")).not.toBeInTheDocument();
  });

  it("전체 글 화면에서는 모든 글을 보여준다", async () => {
    renderList(undefined, "grid");

    expect(await screen.findByText("이야기 1")).toBeInTheDocument();
    expect(screen.getByText("이야기 4")).toBeInTheDocument();
    expect(screen.getByTestId("blog-post-list")).toHaveAttribute("data-layout", "grid");
  });
});
