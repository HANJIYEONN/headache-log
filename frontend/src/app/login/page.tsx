'use client';

import { useEffect, useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import BrainIcon from '@/components/BrainIcon';

export default function LoginPage() {
  const [error, setError] = useState('');

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
      // 백엔드 FastAPI로 ID 토큰 전송
      const response = await fetch('http://localhost:8000/api/v1/auth/google', {
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
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-[#d4efe8] bg-white p-8 text-center shadow-sm">
        <div className="space-y-2">
          {/* 뇌 아이콘을 동그란 민트 배지 안에 가운데 정렬 */}
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#eef8f5] text-[#178f76]">
            <BrainIcon className="h-8 w-8" />
          </div>
          <h1 className="text-xl font-bold text-[#48a08e]">두통 기록 차트</h1>
          <p className="text-sm text-gray-500">구글 계정으로 로그인해주세요</p>
        </div>

        {/* 구글 버튼을 가운데 두기 위한 감싸개 */}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => setError('구글 로그인에 실패했어요. 다시 시도해주세요.')}
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    </main>
  );
}
