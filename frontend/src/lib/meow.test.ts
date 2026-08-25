// ─────────────────────────────────────────────
// meow.ts 테스트 — 냐옹 소리가 너무 자주 안 울리는지 확인.
//
// 마우스가 고양이 위를 왔다갔다 하면 소리가 연달아 나서 시끄러워요.
// 그래서 0.25초 안에 또 부르면 무시하게 돼 있는데, 그게 진짜 되는지 봐요.
// ─────────────────────────────────────────────
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let play: ReturnType<typeof vi.fn>;

/** meow.ts를 새로 불러와요 (모듈이 소리를 기억해두기 때문에 매번 초기화 필요) */
async function freshMeow() {
  vi.resetModules();
  play = vi.fn().mockResolvedValue(undefined);
  // ⚠️ 화살표 함수(() => {})는 new 로 못 써요. 일반 함수여야 해요.
  vi.stubGlobal(
    "Audio",
    vi.fn(function FakeAudio() {
      return { play, preload: "", currentTime: 0 };
    }),
  );
  return (await import("./meow")).playMeow;
}

beforeEach(() => {
  vi.useFakeTimers(); // 시간을 우리가 조종해요
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("playMeow — 냐옹 소리", () => {
  it("부르면 소리가 난다", async () => {
    const playMeow = await freshMeow();

    playMeow();

    expect(play).toHaveBeenCalledTimes(1);
  });

  it("0.25초 안에 또 부르면 무시한다 (시끄럽지 않게)", async () => {
    const playMeow = await freshMeow();

    playMeow();
    vi.advanceTimersByTime(100); // 0.1초 뒤
    playMeow();

    expect(play).toHaveBeenCalledTimes(1); // 두 번째는 씹힘
  });

  it("0.25초가 지나면 다시 울 수 있다", async () => {
    const playMeow = await freshMeow();

    playMeow();
    vi.advanceTimersByTime(300); // 0.3초 뒤
    playMeow();

    expect(play).toHaveBeenCalledTimes(2);
  });

  it("브라우저가 재생을 막아도 앱이 안 죽는다", async () => {
    const playMeow = await freshMeow();
    play.mockRejectedValue(new Error("자동재생 차단됨"));

    expect(() => playMeow()).not.toThrow();
  });
});
