// ─────────────────────────────────────────────
// CatAvatar : 내 동반 동물 네 마리 🐱🐶🐰🦖
//
// 친구 목록·피드·내 정보에서 "누구인지" 알려주는 얼굴이에요.
// 짝꿍(CatBuddy)과는 다른 것 — 짝꿍은 말투를 정하고,
// 이건 내가 고르는 내 프로필 그림이에요.
//
// 작게(20~28px) 쓰이는 자리가 많아서 일부러 단순하게 그렸어요.
// 수염이나 잔선을 넣으면 작을 때 뭉개져요.
// ─────────────────────────────────────────────

import type { Avatar } from "@/lib/catApi";

type Props = { className?: string };

/** 네 마리가 같이 쓰는 눈·볼 — 작아도 표정이 보이게 크게 */
function Eyes({ dark, cx = 24 }: { dark: string; cx?: number }) {
  return (
    <>
      <circle cx={cx - 6} cy="27" r="2.6" fill={dark} />
      <circle cx={cx + 6} cy="27" r="2.6" fill={dark} />
      <circle cx={cx - 5} cy="26" r="0.9" fill="#fffdf5" />
      <circle cx={cx + 7} cy="26" r="0.9" fill="#fffdf5" />
    </>
  );
}

function Cheeks({ y = 31 }: { y?: number }) {
  return (
    <>
      <ellipse cx="14" cy={y} rx="2.8" ry="1.7" fill="#f2a3a3" opacity="0.5" />
      <ellipse cx="34" cy={y} rx="2.8" ry="1.7" fill="#f2a3a3" opacity="0.5" />
    </>
  );
}

function CatAv({ className = "h-6 w-6" }: Props) {
  const body = "#f3d9ae";
  const dark = "#5f4826";
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path d="M12 19 L14.5 7 L24 14 Z" fill={body} />
      <path d="M36 19 L33.5 7 L24 14 Z" fill={body} />
      <circle cx="24" cy="27" r="14" fill={body} />
      <Eyes dark={dark} />
      <Cheeks />
      <path d="M22.6 31 L25.4 31 L24 32.7 Z" fill={dark} />
    </svg>
  );
}

function DogAv({ className = "h-6 w-6" }: Props) {
  const body = "#e2b07c";
  const ear = "#c08c56";
  const dark = "#553a1e";
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      {/* 축 늘어진 귀 */}
      <ellipse cx="10.5" cy="26" rx="5" ry="9" fill={ear} />
      <ellipse cx="37.5" cy="26" rx="5" ry="9" fill={ear} />
      <circle cx="24" cy="27" r="14" fill={body} />
      <Eyes dark={dark} />
      <Cheeks />
      <ellipse cx="24" cy="32" rx="2.4" ry="1.8" fill={dark} />
    </svg>
  );
}

function RabbitAv({ className = "h-6 w-6" }: Props) {
  const body = "#f0e6e0";
  const inner = "#f2b8bd";
  const dark = "#6b5550";
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      {/* 긴 귀 */}
      <ellipse cx="17" cy="12" rx="3.6" ry="9" fill={body} />
      <ellipse cx="31" cy="12" rx="3.6" ry="9" fill={body} />
      <ellipse cx="17" cy="12.5" rx="1.8" ry="6" fill={inner} />
      <ellipse cx="31" cy="12.5" rx="1.8" ry="6" fill={inner} />
      <circle cx="24" cy="29" r="13" fill={body} />
      <Eyes dark={dark} />
      <Cheeks y={33} />
      <path d="M22.6 32.5 L25.4 32.5 L24 34.2 Z" fill={inner} />
    </svg>
  );
}

function DinoAv({ className = "h-6 w-6" }: Props) {
  const body = "#8fc98a";
  const spike = "#6aa965";
  const dark = "#33562f";
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      {/* 등 돌기 */}
      <path d="M15 14 L19 8 L22 14 Z" fill={spike} />
      <path d="M23 12.5 L27 6.5 L30 12.5 Z" fill={spike} />
      <path d="M31 14 L35 9 L37 15 Z" fill={spike} />
      <circle cx="24" cy="27" r="14" fill={body} />
      {/* 살짝 튀어나온 주둥이 */}
      <ellipse cx="24" cy="32.5" rx="7" ry="5" fill="#a8d8a2" />
      <Eyes dark={dark} />
      <ellipse cx="21.5" cy="31" rx="0.9" ry="0.7" fill={dark} />
      <ellipse cx="26.5" cy="31" rx="0.9" ry="0.7" fill={dark} />
      <path
        d="M20.5 34.5 Q24 36.5 27.5 34.5"
        stroke={dark}
        strokeWidth="1.3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

const AVATARS: Record<Avatar, (props: Props) => React.ReactElement> = {
  cat: CatAv,
  dog: DogAv,
  rabbit: RabbitAv,
  dino: DinoAv,
};

/** 동반 동물 하나 — 친구 목록·피드·내 정보에서 써요 */
export default function CatAvatar({
  avatar,
  className = "h-6 w-6",
}: {
  avatar: Avatar;
  className?: string;
}) {
  const Face = AVATARS[avatar];
  return <Face className={className} />;
}
