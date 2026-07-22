// ─────────────────────────────────────────────
// meow.ts : "냐옹" 소리를 브라우저가 직접 만들어내요 (음원 파일 없이!)
//
// Web Audio API = 브라우저에 내장된 신디사이저.
// 오실레이터(소리의 원재료) → 필터(입 모양 흉내) → 볼륨 조절 순으로 연결해요.
// ─────────────────────────────────────────────

let ctx: AudioContext | null = null;
let lastPlayed = 0; // 너무 자주 울지 않게 막는 용도

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null; // 아주 옛날 브라우저면 그냥 소리 없이 넘어가요
  if (!ctx) ctx = new Ctor();
  // 브라우저 정책상 처음엔 잠겨 있을 수 있어요 (클릭 한 번이면 풀려요)
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function playMeow() {
  // 0.25초 안에 또 부르면 무시 — 마우스가 왔다갔다해도 시끄럽지 않게
  const now = Date.now();
  if (now - lastPlayed < 250) return;
  lastPlayed = now;

  const audio = getCtx();
  if (!audio) return;

  const t = audio.currentTime;
  const dur = 0.42;

  // 소리의 원재료 — 피치가 "냐↗옹↘" 처럼 올라갔다 내려와요
  const osc = audio.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(520, t);
  osc.frequency.linearRampToValueAtTime(760, t + 0.11);
  osc.frequency.linearRampToValueAtTime(420, t + dur);

  // 밴드패스 필터로 입 모양(포먼트) 흉내 — 이게 있어야 "야옹"처럼 들려요
  const filter = audio.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = 6;
  filter.frequency.setValueAtTime(1100, t);
  filter.frequency.linearRampToValueAtTime(1900, t + 0.11);
  filter.frequency.linearRampToValueAtTime(700, t + dur);

  // 볼륨 곡선 — 부드럽게 커졌다가 사라지게 (뚝 끊기면 딱 소리가 나요)
  const gain = audio.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(0.16, t + 0.05);
  gain.gain.setValueAtTime(0.16, t + 0.18);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(audio.destination);

  osc.start(t);
  osc.stop(t + dur + 0.02);
}
