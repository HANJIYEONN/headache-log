'use client';

import { useEffect, useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import CatIcon from '@/components/CatIcon';
import CatSittingIcon from '@/components/CatSittingIcon';
import GoogleGIcon from '@/components/GoogleGIcon';
import { playMeow } from '@/lib/meow';
import { PageTitle, useT } from '@/i18n/LanguageProvider';

const BUTTON_WIDTH = 280; // 커스텀 버튼과 실제 구글 버튼의 폭을 똑같이 맞춰요

export default function LoginPage() {
  const t = useT();
  const [error, setError] = useState('');
  // 고양이 아이콘: 기본은 식빵 자세 🍞, 클릭하면 앉은 자세로 고정
  // (마우스 올렸을 때 바뀌는 건 아래 CSS group-hover가 처리해요)
  const [catSitting, setCatSitting] = useState(false);

  // 이미 로그인한 상태면 메인으로 보내요
  useEffect(() => {
    if (localStorage.getItem('access_token')) {
      window.location.href = '/';
    }
  }, []);

  // 구글 로그인 시작 — 우리 버튼을 누르면 이게 실행돼요.
  // useGoogleLogin 은 구글 창을 직접 띄워주기 때문에, 버튼 모양을
  // 우리 마음대로 만들 수 있어요 (구글이 그려주는 버튼을 안 써도 됨).
  const startGoogleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => sendToBackend(tokenResponse.access_token),
    onError: () => setError(t.login.errGoogle),
  });

  const sendToBackend = async (googleAccessToken: string) => {
    if (!googleAccessToken) {
      setError(t.login.errGoogle);
      return;
    }

    try {
      // 백엔드 FastAPI로 구글 액세스 토큰 전송 (배포 시 NEXT_PUBLIC_API_URL 사용)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/v1/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ access_token: googleAccessToken }),
      });

      if (response.ok) {
        const data = await response.json();
        // 백엔드에서 발급해 준 자체 JWT 토큰 저장
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/'; // 로그인 성공 → 메인 페이지로 이동
      } else {
        setError(t.login.errVerify);
      }
    } catch {
      setError(t.login.errServer);
    }
  };

  return (
    <main className="flex min-h-screen w-full items-center justify-center p-6">
      {/* 브라우저 탭 제목 (언어에 따라 바뀌어요) */}
      <PageTitle title={t.meta.site} />

      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-[#f8ccdd] bg-white p-8 text-center shadow-sm">
        <div className="space-y-2">
          {/* 고양이 아이콘 배지 — 마우스를 올리거나 누르면 식빵→앉은 고양이로 바뀌어요 */}
          {/* group : 이 버튼에 마우스를 올리면 안쪽 요소들이 group-hover 로 반응해요 */}
          <button
            type="button"
            onMouseEnter={playMeow}
            onClick={() => {
              playMeow(); // 폰에는 마우스가 없으니 탭할 때도 울어요
              setCatSitting((prev) => !prev);
            }}
            title={catSitting ? t.login.catSitTitle : t.login.catBreadTitle}
            aria-label={t.login.catAria}
            className="group mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#ffe4ee] text-[#e05a86] transition hover:bg-[#ffd0e0]"
          >
            {/* 식빵 고양이: 평소엔 보이고, 마우스 올리면 숨어요 */}
            <CatIcon
              className={`h-8 w-8 ${catSitting ? 'hidden' : 'block group-hover:hidden'}`}
            />
            {/* 앉은 고양이: 평소엔 숨어있고, 마우스 올리거나 클릭하면 나와요 */}
            <CatSittingIcon
              className={`h-8 w-8 ${catSitting ? 'block' : 'hidden group-hover:block'}`}
            />
          </button>
          <h1 className="text-xl font-bold text-[#e05a86]">world-holicat</h1>
          <p className="text-sm text-gray-500">{t.login.subtitle}</p>
        </div>

        {/* 구글 로그인 버튼 — 우리가 직접 그린 버튼이에요.
            누르면 useGoogleLogin 이 구글 창을 띄워줘요.

            ⚠️ 예전엔 "진짜 구글 버튼"을 투명하게(opacity-0) 이 버튼 위에
            겹쳐두는 방식이었는데, 구글이 클릭재킹(속임수 클릭) 방지를
            강화하면서 가려진 버튼은 눌러도 반응하지 않게 됐어요.
            지금은 겹치지 않고 우리 버튼이 직접 로그인을 시작해요. */}
        <button
          type="button"
          onClick={() => startGoogleLogin()}
          className="mx-auto flex items-center justify-center gap-3 rounded-xl border border-[#f8ccdd] bg-white py-3 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-[#ffe4ee]"
          style={{ width: BUTTON_WIDTH }}
        >
          <GoogleGIcon />
          {t.login.googleButton}
        </button>

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    </main>
  );
}
