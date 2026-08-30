// ─────────────────────────────────────────────
// CatBuddy : 짝꿍 넷의 얼굴 🐱🐈🐈‍⬛🍞
//
// 원래는 시스템 이모지를 썼는데, 폰마다 그림이 달라서
// 안드로이드에서는 우리가 그린 콩이가 아니라 딴 고양이가 나왔어요.
// 직접 그려두면 어디서 봐도 같은 얼굴이에요.
//
// 넷을 구분하는 건 색보다 **표정**이에요 (D-16 — 말투가 다르니까요)
//   콩이   동그란 눈 반짝 · 발그레   해맑은 응원
//   치즈   반쯤 뜬 눈 · 이마 줄무늬   쿨한 친구
//   먹물이 차분한 눈 · 긴 수염        어른스러운 존댓말
//   식빵이 감은 눈 · 식빵 자세        느긋한 토닥토닥
// ─────────────────────────────────────────────

import type { Partner } from "@/lib/catApi";

type Props = { className?: string };

/** 넷이 공통으로 쓰는 발그레한 볼 */
function Blush({ fill = "#f2a3a3" }: { fill?: string }) {
  return (
    <>
      <ellipse cx="13.5" cy="31" rx="3.4" ry="2.1" fill={fill} opacity="0.55" />
      <ellipse cx="34.5" cy="31" rx="3.4" ry="2.1" fill={fill} opacity="0.55" />
    </>
  );
}

/** 코와 입 — 살짝 웃는 ω 모양 */
function NoseMouth({ stroke }: { stroke: string }) {
  return (
    <>
      <path d="M22.4 30.2 L25.6 30.2 L24 32.1 Z" fill={stroke} />
      <path
        d="M24 32.1 Q21.6 34.8 19.6 32.6 M24 32.1 Q26.4 34.8 28.4 32.6"
        stroke={stroke}
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />
    </>
  );
}

function Whiskers({ stroke, long = false }: { stroke: string; long?: boolean }) {
  const reach = long ? 8 : 5.5;
  return (
    <g stroke={stroke} strokeWidth="1.1" strokeLinecap="round" opacity="0.75">
      <path d={`M10 28.5 L${10 - reach} 27.2`} />
      <path d={`M10 31.5 L${10 - reach} 32.4`} />
      <path d={`M38 28.5 L${38 + reach} 27.2`} />
      <path d={`M38 31.5 L${38 + reach} 32.4`} />
    </g>
  );
}

/** 콩이 — 크림색, 눈이 크고 반짝여요 */
export function KongiFace({ className = "h-8 w-8" }: Props) {
  const body = "#f6dfb4";
  const inner = "#eec489";
  const line = "#6b5230";
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path d="M11 18 L14 4 L25 13 Z" fill={body} />
      <path d="M37 18 L34 4 L23 13 Z" fill={body} />
      <path d="M15 16.5 L16.6 8.5 L22 13.8 Z" fill={inner} />
      <path d="M33 16.5 L31.4 8.5 L26 13.8 Z" fill={inner} />
      <circle cx="24" cy="26" r="15" fill={body} />
      {/* 큰 눈 + 반짝임 */}
      <ellipse cx="18" cy="26.5" rx="3.4" ry="3.8" fill={line} />
      <ellipse cx="30" cy="26.5" rx="3.4" ry="3.8" fill={line} />
      <circle cx="19.2" cy="25" r="1.3" fill="#fffdf5" />
      <circle cx="31.2" cy="25" r="1.3" fill="#fffdf5" />
      <Blush />
      <NoseMouth stroke={line} />
      <Whiskers stroke={line} />
    </svg>
  );
}

/** 치즈 — 주황 줄무늬, 반쯤 뜬 눈이 쿨해요 */
export function CheeseFace({ className = "h-8 w-8" }: Props) {
  const body = "#f2ab63";
  const inner = "#e08a3c";
  const line = "#7a4419";
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path d="M11 18 L14 4 L25 13 Z" fill={body} />
      <path d="M37 18 L34 4 L23 13 Z" fill={body} />
      <path d="M15 16.5 L16.6 8.5 L22 13.8 Z" fill={inner} />
      <path d="M33 16.5 L31.4 8.5 L26 13.8 Z" fill={inner} />
      <circle cx="24" cy="26" r="15" fill={body} />
      {/* 이마 줄무늬 */}
      <g stroke={inner} strokeWidth="1.8" strokeLinecap="round">
        <path d="M20 15.5 L18.5 19" />
        <path d="M24 14.6 L24 18.4" />
        <path d="M28 15.5 L29.5 19" />
      </g>
      {/* 반쯤 뜬 눈 */}
      <path
        d="M14.8 26.6 Q18 23.4 21.2 26.6 M26.8 26.6 Q30 23.4 33.2 26.6"
        stroke={line}
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <Blush />
      <NoseMouth stroke={line} />
      <Whiskers stroke={line} />
    </svg>
  );
}

/** 먹물이 — 짙은 회색, 차분히 뜬 눈과 긴 수염 */
export function MeokmulFace({ className = "h-8 w-8" }: Props) {
  const body = "#5d5765";
  const inner = "#847c8f";
  const line = "#f4ece0";
  const eye = "#f2c14e";
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path d="M11 18 L14 4 L25 13 Z" fill={body} />
      <path d="M37 18 L34 4 L23 13 Z" fill={body} />
      <path d="M15 16.5 L16.6 8.5 L22 13.8 Z" fill={inner} />
      <path d="M33 16.5 L31.4 8.5 L26 13.8 Z" fill={inner} />
      <circle cx="24" cy="26" r="15" fill={body} />
      {/* 크고 노란 눈에 세로 동공 — 검은 고양이답게 또렷하게.
          동그란 흰 눈은 인형 같아서, 이쪽이 훨씬 먹물이다워요 */}
      <ellipse cx="17.6" cy="26.6" rx="4.4" ry="4.9" fill={eye} />
      <ellipse cx="30.4" cy="26.6" rx="4.4" ry="4.9" fill={eye} />
      <ellipse cx="17.6" cy="26.6" rx="1.3" ry="4" fill="#241f2b" />
      <ellipse cx="30.4" cy="26.6" rx="1.3" ry="4" fill="#241f2b" />
      <circle cx="19.4" cy="24.4" r="1" fill="#fffdf5" opacity="0.9" />
      <circle cx="32.2" cy="24.4" r="1" fill="#fffdf5" opacity="0.9" />
      <ellipse cx="12.8" cy="32" rx="3" ry="1.8" fill="#c58e93" opacity="0.3" />
      <ellipse cx="35.2" cy="32" rx="3" ry="1.8" fill="#c58e93" opacity="0.3" />
      <NoseMouth stroke={line} />
      <Whiskers stroke={line} long />
    </svg>
  );
}

/** 식빵이 — 식빵처럼 웅크린 고양이. 눈은 감고 있어요 */
export function SikppangFace({ className = "h-8 w-8" }: Props) {
  const crust = "#dfa964";
  // 말풍선 배경(#fbefc9 / #f5eee0)과 색이 겹치면 얼굴이 묻혀요.
  // 종이색에 가깝게 밝혀서 어느 배경에서도 떠 보이게 했어요.
  const crumb = "#fffaf0";
  const line = "#87602c";
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      {/* 귀와 몸통을 같은 색으로 겹쳐 그려서 한 덩어리로 보이게 해요 */}
      <path d="M11 20 L13.5 6 L23 15 Z" fill={crust} />
      <path d="M37 20 L34.5 6 L25 15 Z" fill={crust} />
      <path
        d="M8 24 Q8 13 24 13 Q40 13 40 24 L40 37 Q40 40 37 40 L11 40 Q8 40 8 37 Z"
        fill={crust}
      />
      {/* 속살 — 테두리를 남겨서 식빵처럼 */}
      <path
        d="M11.5 24.5 Q11.5 16 24 16 Q36.5 16 36.5 24.5 L36.5 35.5 Q36.5 37 35 37 L13 37 Q11.5 37 11.5 35.5 Z"
        fill={crumb}
      />
      {/* 감은 눈 */}
      <path
        d="M15.5 26 Q18.5 29.2 21.5 26 M26.5 26 Q29.5 29.2 32.5 26"
        stroke={line}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <ellipse cx="13.8" cy="30" rx="2.9" ry="1.8" fill="#f2a3a3" opacity="0.55" />
      <ellipse cx="34.2" cy="30" rx="2.9" ry="1.8" fill="#f2a3a3" opacity="0.55" />
      <path d="M22.6 30.4 L25.4 30.4 L24 32.1 Z" fill={line} />
      <path
        d="M24 32.1 Q21.9 34.4 20.1 32.5 M24 32.1 Q26.1 34.4 27.9 32.5"
        stroke={line}
        strokeWidth="1.3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

const FACES: Record<Partner, (props: Props) => React.ReactElement> = {
  kongi: KongiFace,
  cheese: CheeseFace,
  meokmul: MeokmulFace,
  sikppang: SikppangFace,
};

/** 짝꿍 얼굴 하나 — 어느 화면에서든 이걸 써요 */
export default function CatBuddy({
  partner,
  className = "h-8 w-8",
}: {
  partner: Partner;
  className?: string;
}) {
  const Face = FACES[partner];
  return <Face className={className} />;
}
