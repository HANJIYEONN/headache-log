// "냐옹" 소리 WAV 파일을 직접 생성하는 스크립트 (외부 음원 다운로드 없음)
const fs = require("fs");

const FS = 22050;        // 샘플레이트
const DUR = 0.45;        // 길이(초)
const N = Math.floor(FS * DUR);

// 시간에 따라 값이 변하는 곡선 (구간 선형 보간)
function envelope(t, points) {
  for (let i = 0; i < points.length - 1; i++) {
    const [t0, v0] = points[i];
    const [t1, v1] = points[i + 1];
    if (t <= t1) {
      const r = (t - t0) / (t1 - t0);
      return v0 + (v1 - v0) * Math.max(0, Math.min(1, r));
    }
  }
  return points[points.length - 1][1];
}

// 피치: 냐↗옹↘
const pitchEnv = [[0, 520], [0.11, 780], [DUR, 420]];
// 입 모양(포먼트) 흉내용 밴드패스 중심 주파수
const filtEnv = [[0, 1000], [0.11, 1950], [DUR, 700]];
// 볼륨: 부드럽게 커졌다 사라지게
const gainEnv = [[0, 0], [0.05, 1], [0.20, 0.95], [DUR, 0]];

const Q = 5;
let phase = 0;
// 바이쿼드 필터 상태
let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
const raw = new Float64Array(N);

for (let i = 0; i < N; i++) {
  const t = i / FS;

  // 톱니파 생성 (-1 ~ 1)
  const f = envelope(t, pitchEnv);
  phase += f / FS;
  if (phase >= 1) phase -= 1;
  let s = 2 * phase - 1;

  // 살짝 비브라토를 섞어 생동감 추가
  s *= 1 + 0.06 * Math.sin(2 * Math.PI * 22 * t);

  // 밴드패스 바이쿼드 (RBJ cookbook)
  const f0 = envelope(t, filtEnv);
  const w0 = (2 * Math.PI * f0) / FS;
  const alpha = Math.sin(w0) / (2 * Q);
  const b0 = alpha, b1 = 0, b2 = -alpha;
  const a0 = 1 + alpha, a1 = -2 * Math.cos(w0), a2 = 1 - alpha;
  const y = (b0 / a0) * s + (b1 / a0) * x1 + (b2 / a0) * x2
          - (a1 / a0) * y1 - (a2 / a0) * y2;
  x2 = x1; x1 = s; y2 = y1; y1 = y;

  raw[i] = y * envelope(t, gainEnv);
}

// 최대 진폭을 0.72로 정규화 (너무 작지도 크지도 않게)
let peak = 0;
for (const v of raw) peak = Math.max(peak, Math.abs(v));
const scale = peak > 0 ? 0.72 / peak : 1;

// 16bit PCM 모노 WAV로 저장
const data = Buffer.alloc(N * 2);
for (let i = 0; i < N; i++) {
  const v = Math.max(-1, Math.min(1, raw[i] * scale));
  data.writeInt16LE(Math.round(v * 32767), i * 2);
}

const header = Buffer.alloc(44);
header.write("RIFF", 0);
header.writeUInt32LE(36 + data.length, 4);
header.write("WAVE", 8);
header.write("fmt ", 12);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20);        // PCM
header.writeUInt16LE(1, 22);        // 모노
header.writeUInt32LE(FS, 24);
header.writeUInt32LE(FS * 2, 28);   // byte rate
header.writeUInt16LE(2, 32);        // block align
header.writeUInt16LE(16, 34);       // bit depth
header.write("data", 36);
header.writeUInt32LE(data.length, 40);

fs.writeFileSync(process.argv[2], Buffer.concat([header, data]));
console.log(`생성 완료: ${process.argv[2]} (${((44 + data.length) / 1024).toFixed(1)} KB, ${DUR}초)`);
