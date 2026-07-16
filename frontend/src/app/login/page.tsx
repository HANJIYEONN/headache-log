'use client';

import { useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
  // 이미 로그인한 상태면 메인으로 보내요
  useEffect(() => {
    if (localStorage.getItem('access_token')) {
      window.location.href = '/';
    }
  }, []);

  const handleSuccess = async (credentialResponse: any) => {
    const idToken = credentialResponse.credential; // 구글이 준 ID 토큰

    if (!idToken) {
      console.error("구글 토큰이 없습니다.");
      return;
    }

    try {
      // 🚀 백엔드 FastAPI로 ID 토큰 전송
      const response = await fetch('http://localhost:8000/api/v1/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: idToken }),
      });

      if (response.ok) {
        const data = await response.json();
        // 백엔드에서 발급해 준 자체 JWT 토큰 저장 (예: localStorage 또는 쿠키)
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/'; // 로그인 성공 → 메인 페이지로 이동
      } else {
        alert('백엔드 검증 실패');
      }
    } catch (error) {
      console.error('로그인 에러:', error);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '20px' }}>
      <h2>구글 로그인 테스트</h2>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => {
          console.log('Login Failed');
        }}
      />
    </div>
  );
}