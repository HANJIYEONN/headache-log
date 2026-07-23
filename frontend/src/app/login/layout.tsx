// ─────────────────────────────────────────────
// login/layout.tsx : 로그인 페이지 전용 껍데기
// page.tsx 는 'use client' 라서 metadata 를 못 내보내요.
// (metadata 는 서버에서만 만들 수 있거든요!)
// 그래서 같은 폴더에 layout 을 두고 여기서 탭 제목을 정해줘요.
// 이 metadata 가 루트 layout.tsx 의 title 을 덮어씁니다.
// ─────────────────────────────────────────────
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'world holicat',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
