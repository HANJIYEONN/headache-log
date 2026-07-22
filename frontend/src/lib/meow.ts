// ─────────────────────────────────────────────
// meow.ts : "냐옹" 소리 재생
//
// 왜 오디오 파일(/meow.wav)을 쓰냐면 —
// iOS 사파리에서는 Web Audio로 만든 소리가 아이폰 무음 스위치에 걸려 음소거돼요.
// 반면 오디오 파일 재생은 무음 모드에서도 소리가 나요(유튜브와 같은 원리).
// 음원은 외부에서 받은 게 아니라 직접 생성한 파일이에요.
// ─────────────────────────────────────────────

let audio: HTMLAudioElement | null = null;
let lastPlayed = 0; // 너무 자주 울지 않게 막는 용도

function getAudio(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  if (!audio) {
    audio = new Audio("/meow.wav");
    audio.preload = "auto";
  }
  return audio;
}

export function playMeow() {
  // 0.25초 안에 또 부르면 무시 — 마우스가 왔다갔다해도 시끄럽지 않게
  const now = Date.now();
  if (now - lastPlayed < 250) return;
  lastPlayed = now;

  const el = getAudio();
  if (!el) return;

  el.currentTime = 0; // 재생 중이어도 처음부터 다시
  // 브라우저가 막으면 조용히 넘어가요 (사용자가 한 번 누르면 풀려요)
  void el.play().catch(() => {});
}
