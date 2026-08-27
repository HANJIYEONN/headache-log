import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 개발 중에만 보이는 Next.js 표시를 오른쪽 위로 옮겨요.
  // 기본값(왼쪽 아래)이면 고양이 수첩 탭바의 "홈" 탭을 가려서 눌러볼 수가 없어요.
  devIndicators: { position: "top-right" },

  // 프록시(rewrites): 브라우저가 우리 프론트 주소의 /backend-api/... 로 요청하면
  // Vercel 서버가 대신 오라클 백엔드로 전달해줘요.
  // 왜 필요하냐면: HTTPS 페이지(Vercel)에서 HTTP 서버(오라클)를 직접 부르면
  // 브라우저가 보안상 차단(mixed content)하기 때문이에요.
  //
  // Vercel 환경변수:
  //   API_PROXY_TARGET      = http://오라클서버IP:8000  (서버만 아는 값)
  //   NEXT_PUBLIC_API_URL   = /backend-api             (브라우저가 부르는 경로)
  async rewrites() {
    const target = process.env.API_PROXY_TARGET;
    if (!target) return []; // 로컬 개발 등 프록시가 필요 없으면 아무것도 안 함
    return [
      {
        source: "/backend-api/:path*",
        destination: `${target}/:path*`,
      },
    ];
  },
};

export default nextConfig;
