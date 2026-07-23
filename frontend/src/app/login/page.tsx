'use client';

import { useEffect, useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import CatIcon from '@/components/CatIcon';
import CatSittingIcon from '@/components/CatSittingIcon';
import GoogleGIcon from '@/components/GoogleGIcon';
import { playMeow } from '@/lib/meow';

const BUTTON_WIDTH = 280; // 커스텀 버튼과 실제 구글 버튼의 폭을 똑같이 맞춰요

export default function LoginPage() {
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

  const handleSuccess = async (credentialResponse: any) => {
    const idToken = credentialResponse.credential; // 구글이 준 ID 토큰

    if (!idToken) {
      setError('구글 로그인에 실패했어요. 다시 시도해주세요.');
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
        setError('로그인 확인에 실패했어요. 잠시 후 다시 시도해주세요.');
      }
    } catch (error) {
      setError('서버에 연결하지 못했어요. 백엔드가 켜져 있는지 확인해주세요.');
    }
  };

  return (
    <main className="flex min-h-screen w-full items-center justify-center p-6">
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
            title={catSitting ? '앉은 고양이 (다시 누르면 식빵)' : '식빵 고양이 (눌러보세요)'}
            aria-label="고양이 아이콘"
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
          <p className="text-sm text-gray-500">구글 계정으로 로그인해주세요</p>
        </div>

        {/* 구글 로그인 버튼 — 기본 버튼이 못생겨서, 예쁜 버튼을 위에 그리고
            "진짜 구글 버튼"은 투명하게 만들어 그 위에 그대로 겹쳐놨어요.
            눈에는 우리 버튼이 보이지만, 클릭은 진짜 구글 버튼이 받아서 처리해요. */}
        <div className="relative mx-auto" style={{ width: BUTTON_WIDTH }}>
          <button
            type="button"
            tabIndex={-1}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#f8ccdd] bg-white py-3 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-[#ffe4ee]"
          >
            <GoogleGIcon />
            Google 계정으로 로그인
          </button>
          <div className="absolute inset-0 overflow-hidden rounded-xl opacity-0">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={() => setError('구글 로그인에 실패했어요. 다시 시도해주세요.')}
              width={BUTTON_WIDTH}
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    </main>
  );
}
