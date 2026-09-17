import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LanguageProvider } from "@/i18n/LanguageProvider";
import { dictionaries } from "@/i18n/dictionaries";
import BlogNicknamePage from "./page";

const fake = vi.hoisted(() => ({
  fetchBlogUser: vi.fn(),
  createBlogUser: vi.fn(),
  replace: vi.fn(),
  router: { replace: (...args: unknown[]) => fake.replace(...args) },
}));

vi.mock("next/navigation", () => ({ useRouter: () => fake.router }));
vi.mock("@/lib/blogUserApi", () => ({
  fetchBlogUser: fake.fetchBlogUser,
  createBlogUser: fake.createBlogUser,
}));

function renderPage() {
  return render(
    <LanguageProvider>
      <BlogNicknamePage />
    </LanguageProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  localStorage.setItem("access_token", "테스트토큰");
  fake.fetchBlogUser.mockResolvedValue({ exists: false });
});

describe("블로그 닉네임 정하기", () => {
  it("블로그에서만 쓰는 이름이라고 안내한다", async () => {
    renderPage();
    expect(await screen.findByText(dictionaries.en.blogNickname.description)).toBeInTheDocument();
    expect(screen.getByText(dictionaries.en.blogNickname.warning)).toBeInTheDocument();
  });

  it("저장한 뒤 블로그로 이동한다", async () => {
    const { default: userEvent } = await import("@testing-library/user-event");
    const user = userEvent.setup();
    fake.createBlogUser.mockResolvedValue({ exists: true, nickname: "홀리캣" });
    renderPage();

    const input = await screen.findByLabelText(dictionaries.en.blogNickname.label);
    await user.type(input, "홀리캣");
    await user.click(screen.getByRole("button", { name: dictionaries.en.blogNickname.submit }));

    await waitFor(() => expect(fake.createBlogUser).toHaveBeenCalledWith("홀리캣"));
    expect(localStorage.getItem("blog_nickname")).toBe("홀리캣");
    expect(fake.replace).toHaveBeenCalledWith("/blog");
  });
});
