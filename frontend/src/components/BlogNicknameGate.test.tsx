import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";

import { LanguageProvider } from "@/i18n/LanguageProvider";
import BlogNicknameGate from "./BlogNicknameGate";

const fake = vi.hoisted(() => ({
  fetchBlogUser: vi.fn(),
  replace: vi.fn(),
  router: { replace: (...args: unknown[]) => fake.replace(...args) },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/blog",
  useRouter: () => fake.router,
}));

vi.mock("@/lib/blogUserApi", () => ({ fetchBlogUser: fake.fetchBlogUser }));

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  localStorage.setItem("access_token", "테스트토큰");
});

it("블로그 닉네임이 없을 때만 설정 화면으로 보낸다", async () => {
  fake.fetchBlogUser.mockResolvedValue({ exists: false });

  render(
    <LanguageProvider>
      <BlogNicknameGate>
        <p>블로그 화면</p>
      </BlogNicknameGate>
    </LanguageProvider>,
  );

  await waitFor(() => expect(fake.replace).toHaveBeenCalledWith("/blog/nickname"));
  expect(screen.queryByText("블로그 화면")).not.toBeInTheDocument();
});

it("블로그 닉네임이 있으면 블로그를 보여준다", async () => {
  fake.fetchBlogUser.mockResolvedValue({ exists: true, nickname: "홀리캣" });

  render(
    <LanguageProvider>
      <BlogNicknameGate>
        <p>블로그 화면</p>
      </BlogNicknameGate>
    </LanguageProvider>,
  );

  expect(await screen.findByText("블로그 화면")).toBeInTheDocument();
  expect(localStorage.getItem("blog_nickname")).toBe("홀리캣");
});
