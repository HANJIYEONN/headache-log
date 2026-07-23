// ─────────────────────────────────────────────
// headache/layout.tsx : 두통 기록 차트 전용 테마 껍데기
// 사이트 전체(world-holicat)는 고양이 진저/크림 톤이지만,
// 이 프로젝트 안에서만 예전 민트 톤을 유지해요.
// layout.tsx = 이 폴더 아래 모든 페이지를 감싸는 공통 틀이에요.
// ─────────────────────────────────────────────
import type { Metadata } from 'next';

// 이 프로젝트 안에서만 탭 제목을 바꿔요.
// (루트 layout 의 "world holicat" 을 덮어씁니다)
export const metadata: Metadata = {
  title: '두통 기록 차트',
};

export default function HeadacheLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // flex-1 w-full : 부모(body)의 flex 안에서 화면을 가득 채우게
    <div className="flex-1 w-full bg-[#f2faf8] text-[#1f3d37]">{children}</div>
  );
}
