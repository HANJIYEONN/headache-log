// ─────────────────────────────────────────────
// 친구 화면 테스트
//
// 어린이 앱이라 "아무나 못 찾는다" 와 "10명 상한" 이 제일 중요해요.
// ─────────────────────────────────────────────
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import FriendsPage from "./page";
import { dictionaries } from "@/i18n/dictionaries";
import { LanguageProvider } from "@/i18n/LanguageProvider";

const friends = dictionaries.en.catNote.friends;

const 가짜 = vi.hoisted(() => ({
  fetchMe: vi.fn(),
  fetchFriends: vi.fn(),
  fetchFriendFeed: vi.fn(),
  searchUser: vi.fn(),
  requestFriend: vi.fn(),
  acceptFriend: vi.fn(),
  removeFriend: vi.fn(),
  replace: vi.fn(),
  router: { replace: (...args: unknown[]) => 가짜.replace(...args) },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/cat-note/friends",
  useRouter: () => 가짜.router,
}));

vi.mock("@/lib/catApi", () => ({
  fetchMe: 가짜.fetchMe,
  fetchFriends: 가짜.fetchFriends,
  fetchFriendFeed: 가짜.fetchFriendFeed,
  searchUser: 가짜.searchUser,
  requestFriend: 가짜.requestFriend,
  acceptFriend: 가짜.acceptFriend,
  removeFriend: 가짜.removeFriend,
  givePraise: vi.fn(),
  fetchComments: vi.fn(),
  writeComment: vi.fn(),
}));

const 카드 = { note_id: "hajun9", nickname: "하준", avatar: "cat" as const };

function 목록(count = 0) {
  return {
    friends: Array.from({ length: count }, (_, i) => ({
      note_id: `friend${i}`,
      nickname: `친구${i}`,
      avatar: "cat" as const,
    })),
    pending_received: [],
    max_friends: 10,
  };
}

function renderFriends() {
  return render(
    <LanguageProvider>
      <FriendsPage />
    </LanguageProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.setItem("access_token", "테스트토큰");
  가짜.fetchMe.mockResolvedValue({ exists: true, nickname: "지우" });
  가짜.fetchFriends.mockResolvedValue(목록());
  가짜.fetchFriendFeed.mockResolvedValue({ feed: [] });
  가짜.searchUser.mockResolvedValue({ found: true, ...카드 });
  가짜.requestFriend.mockResolvedValue({ friendship_id: 1, status: "pending", ...카드 });
  가짜.acceptFriend.mockResolvedValue({ friendship_id: 1, status: "accepted", ...카드 });
});

// ── 찾기 ──────────────────────────────────────────────

describe("친구 찾기", () => {
  it("아이디를 정확히 알아야 한다고 알려준다 (NF-04)", async () => {
    renderFriends();
    expect(await screen.findByText(friends.findHint)).toBeTruthy();
  });

  it("없는 아이디면 그렇게 알려준다", async () => {
    가짜.searchUser.mockResolvedValue({ found: false });
    const user = userEvent.setup();
    renderFriends();

    fireEvent.change(await screen.findByRole("textbox", { name: friends.findPlaceholder }), {
      target: { value: "nobody99" },
    });
    await user.click(screen.getByRole("button", { name: friends.find }));

    expect(await screen.findByText(friends.notFound)).toBeTruthy();
  });

  it("찾으면 신청할 수 있다", async () => {
    const user = userEvent.setup();
    renderFriends();

    fireEvent.change(await screen.findByRole("textbox", { name: friends.findPlaceholder }), {
      target: { value: "hajun9" },
    });
    await user.click(screen.getByRole("button", { name: friends.find }));
    await user.click(await screen.findByRole("button", { name: friends.request }));

    expect(가짜.requestFriend).toHaveBeenCalledWith("hajun9");
    expect(await screen.findByText(friends.requested)).toBeTruthy();
  });

  it("이미 친구면 그렇게 알려준다", async () => {
    가짜.requestFriend.mockRejectedValue({ status: 409 });
    const user = userEvent.setup();
    renderFriends();

    fireEvent.change(await screen.findByRole("textbox", { name: friends.findPlaceholder }), {
      target: { value: "hajun9" },
    });
    await user.click(screen.getByRole("button", { name: friends.find }));
    await user.click(await screen.findByRole("button", { name: friends.request }));

    expect(await screen.findByText(friends.already)).toBeTruthy();
  });
});

// ── 10명 상한 (D-22) ──────────────────────────────────

describe("친구 10명 상한", () => {
  it("꽉 차면 찾기 자체를 막는다", async () => {
    가짜.fetchFriends.mockResolvedValue(목록(10));
    renderFriends();

    expect(await screen.findByText(friends.full(10))).toBeTruthy();
    // 찾아놓고 "안 된다" 고 하면 아이가 헛수고해요
    expect(
      screen.getByRole("textbox", { name: friends.findPlaceholder }),
    ).toHaveProperty("disabled", true);
  });

  it("개수를 늘 보여준다", async () => {
    가짜.fetchFriends.mockResolvedValue(목록(4));
    renderFriends();
    expect(await screen.findByText(friends.count(4, 10))).toBeTruthy();
  });
});

// ── 받은 신청 ─────────────────────────────────────────

describe("받은 신청", () => {
  it("수락하면 목록을 새로 받아온다", async () => {
    가짜.fetchFriends.mockResolvedValue({
      ...목록(),
      pending_received: [{ friendship_id: 7, ...카드 }],
    });
    const user = userEvent.setup();
    renderFriends();

    await user.click(await screen.findByRole("button", { name: friends.accept }));

    expect(가짜.acceptFriend).toHaveBeenCalledWith(7);
    await waitFor(() => expect(가짜.fetchFriends).toHaveBeenCalledTimes(2));
  });

  it("거절하면 지운다", async () => {
    가짜.fetchFriends.mockResolvedValue({
      ...목록(),
      pending_received: [{ friendship_id: 7, ...카드 }],
    });
    const user = userEvent.setup();
    renderFriends();

    await user.click(await screen.findByRole("button", { name: friends.reject }));

    expect(가짜.removeFriend).toHaveBeenCalledWith(7);
  });
});
