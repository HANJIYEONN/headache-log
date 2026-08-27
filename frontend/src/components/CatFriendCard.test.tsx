// ─────────────────────────────────────────────
// CatFriendCard 테스트 — 친구의 오늘 수첩 카드
//
// 친구에게는 **쓴 그대로** 보여줘야 해요. 교정본을 보여주면
// "너 여기 틀렸대" 가 돼버려요.
// ─────────────────────────────────────────────
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CatFriendCard from "./CatFriendCard";
import { dictionaries } from "@/i18n/dictionaries";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import type { FeedCard } from "@/lib/catApi";

const friends = dictionaries.en.catNote.friends;

const 가짜 = vi.hoisted(() => ({
  givePraise: vi.fn(),
  fetchComments: vi.fn(),
  writeComment: vi.fn(),
}));

vi.mock("@/lib/catApi", () => ({
  givePraise: 가짜.givePraise,
  fetchComments: 가짜.fetchComments,
  writeComment: 가짜.writeComment,
}));

const 카드: FeedCard = {
  entry_id: 12,
  note_id: "hajun9",
  nickname: "하준",
  avatar: "cat",
  learning_language: "ko",
  status: "complete",
  progress: "5/5",
  written_at: "2026-08-27T22:00:00+09:00",
  sentences: ["오늘 운동장에서 뛰었다", "친구가 조아요"],
  praise_count: 0,
  i_praised: false,
};

function renderCard(card: FeedCard = 카드) {
  render(
    <LanguageProvider>
      <ul>
        <CatFriendCard card={card} />
      </ul>
    </LanguageProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  가짜.givePraise.mockResolvedValue({ praise_count: 1 });
  가짜.fetchComments.mockResolvedValue({ comments: [] });
  가짜.writeComment.mockResolvedValue({
    comment_id: 3,
    note_id: "jiwoo07",
    nickname: "지우",
    avatar: "cat",
    content: "잘 썼다!",
    created_at: null,
  });
});

describe("친구가 쓴 글", () => {
  it("고친 글이 아니라 쓴 그대로 보여준다", () => {
    renderCard();
    expect(screen.getByText("친구가 조아요")).toBeTruthy();
    expect(screen.queryByText(/좋아요/)).toBeNull();
  });

  it("완성했는지 쓰는 중인지 알려준다", () => {
    renderCard();
    expect(screen.getByText(/5\/5/)).toBeTruthy();

    render(
      <LanguageProvider>
        <ul>
          <CatFriendCard card={{ ...카드, status: "writing", progress: "2/5" }} />
        </ul>
      </LanguageProvider>,
    );
    expect(screen.getByText(/2\/5/)).toBeTruthy();
  });
});

describe("칭찬도장", () => {
  it("한 번 주면 잠긴다", async () => {
    const user = userEvent.setup();
    renderCard();

    await user.click(screen.getByRole("button", { name: `하준 ${friends.praise}` }));

    expect(가짜.givePraise).toHaveBeenCalledWith(12);
    // 두 번 누르면 서버에서 409 가 나요
    const done = await screen.findByRole("button", { name: `하준 ${friends.praise}` });
    expect(done).toHaveProperty("disabled", true);
  });

  it("이미 준 수첩은 처음부터 잠겨 있다", () => {
    renderCard({ ...카드, i_praised: true, praise_count: 3 });
    expect(
      screen.getByRole("button", { name: `하준 ${friends.praise}` }),
    ).toHaveProperty("disabled", true);
  });

  it("실패하면 되돌린다", async () => {
    가짜.givePraise.mockRejectedValue(new Error("서버가 안 받아요"));
    const user = userEvent.setup();
    renderCard();

    await user.click(screen.getByRole("button", { name: `하준 ${friends.praise}` }));

    // 준 것처럼 보이면 안 돼요
    const button = await screen.findByRole("button", { name: `하준 ${friends.praise}` });
    expect(button).toHaveProperty("disabled", false);
  });
});

describe("댓글", () => {
  it("눌러야 불러온다 (열지도 않았는데 부르면 낭비예요)", async () => {
    const user = userEvent.setup();
    renderCard();

    expect(가짜.fetchComments).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: `💬 ${friends.comments}` }));
    expect(가짜.fetchComments).toHaveBeenCalledWith(12);
  });

  it("남기면 목록에 바로 붙는다", async () => {
    const user = userEvent.setup();
    renderCard();

    await user.click(screen.getByRole("button", { name: `💬 ${friends.comments}` }));
    const box = await screen.findByRole("textbox", { name: friends.comments });
    await user.type(box, "잘 썼다!");
    await user.click(screen.getByRole("button", { name: friends.send }));

    expect(가짜.writeComment).toHaveBeenCalledWith(12, "잘 썼다!");
    expect(await screen.findByText("잘 썼다!")).toBeTruthy();
    expect(box).toHaveProperty("value", "");
  });
});
