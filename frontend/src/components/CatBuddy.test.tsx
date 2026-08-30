// ─────────────────────────────────────────────
// 캐릭터 그림 테스트
//
// 이모지를 쓰다가 직접 그린 그림으로 바꿨어요.
// 이모지는 폰마다 그림이 달라서, 안드로이드에서는 우리가 만든
// 콩이가 아니라 딴 고양이가 나왔거든요.
// ─────────────────────────────────────────────
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import CatAvatar from "./CatAvatar";
import CatBuddy from "./CatBuddy";
import type { Avatar, Partner } from "@/lib/catApi";

const PARTNERS: Partner[] = ["kongi", "cheese", "meokmul", "sikppang"];
const AVATARS: Avatar[] = ["cat", "dog", "rabbit", "dino"];

describe("짝꿍 얼굴", () => {
  it("넷 다 그림이 나온다", () => {
    for (const partner of PARTNERS) {
      const { container } = render(<CatBuddy partner={partner} />);
      expect(container.querySelector("svg")).toBeTruthy();
    }
  });

  it("넷이 서로 다르게 생겼다", () => {
    // 같은 그림을 돌려쓰면 짝꿍을 고르는 의미가 없어요
    const 그림들 = PARTNERS.map((partner) => {
      const { container } = render(<CatBuddy partner={partner} />);
      return container.innerHTML;
    });
    expect(new Set(그림들).size).toBe(4);
  });

  it("크기를 밖에서 정할 수 있다", () => {
    const { container } = render(<CatBuddy partner="kongi" className="h-12 w-12" />);
    expect(container.querySelector("svg")?.getAttribute("class")).toBe("h-12 w-12");
  });

  it("화면 읽어주는 프로그램은 건너뛴다", () => {
    // 이름은 옆 글씨가 알려주니까, 그림까지 읽으면 두 번 말해요
    const { container } = render(<CatBuddy partner="kongi" />);
    expect(container.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
  });
});

describe("동반 동물", () => {
  it("넷 다 그림이 나오고 서로 다르다", () => {
    const 그림들 = AVATARS.map((avatar) => {
      const { container } = render(<CatAvatar avatar={avatar} />);
      expect(container.querySelector("svg")).toBeTruthy();
      return container.innerHTML;
    });
    expect(new Set(그림들).size).toBe(4);
  });
});
