'use client';

import { useEffect, useState } from 'react';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import CatIcon from '@/components/CatIcon';
import CatSittingIcon from '@/components/CatSittingIcon';
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

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    const idToken = credentialResponse.credential; // 구글이 준 ID 토큰

    if (!idToken) {
      setError(t.login.errGoogle);
      return;
    }

    try {
      // 백엔드 FastAPI로 ID 토큰 전송 (배포 시 NEXT_PUBLIC_API_URL로 실제 주소 사용)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/v1/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: idToken }),
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

        {/* 구글 로그인 버튼
            ⚠️ 예전엔 예쁜 커스텀 버튼을 그리고 "진짜 구글 버튼"을 투명하게(opacity-0)
            그 위에 겹쳐뒀어요. 그런데 구글이 클릭재킹(속임수 클릭) 방지를 강화하면서
            가려지거나 투명한 버튼은 눌러도 반응하지 않게 됐어요.
            버튼은 보이는데 눌러도 아무 일이 없고 에러조차 안 남는 상태가 됐죠.

            그래서 구글이 주는 버튼을 그대로 써요. 글자는
            "Google 계정으로 로그인" 처럼 브라우저 언어에 맞게 나와요. */}
        <div className="mx-auto flex justify-center" style={{ width: BUTTON_WIDTH }}>
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => setError(t.login.errGoogle)}
            width={BUTTON_WIDTH}
            theme="outline"
            size="large"
            shape="rectangular"
            text="signin_with"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    </main>
  );
}
