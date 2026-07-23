import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleOAuthProvider } from '@react-oauth/google';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 사이트 전체의 기본 탭 제목이에요.
// 여기서 정한 제목이 로그인·프로젝트 선택 등 모든 페이지에 쓰이고,
// 하위 폴더의 layout/page 에서 title 을 정하면 그 페이지만 덮어써져요.
export const metadata: Metadata = {
  title: "world holicat",
  description: "고양이가 지키는 나만의 기록 공간",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
          {children}
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
