# world holicat — Frontend (Next.js)

한 사이트에 앱 두 개가 들어 있어요.
- **두통 기록 차트** (`/headache`) — 두통이 올 때마다 투약 사항과 상태를 기록
- **고양이 수첩** (`/cat-note`) — 하루 다섯 문장을 쓰면 짝꿍 고양이가 봐주는 어린이 글쓰기 앱
(백엔드: [headache-log-backend](https://github.com/HANJIYEONN/headache-log-backend) / 원본 모노레포: [headache-log](https://github.com/HANJIYEONN/headache-log))

## 스택

- **Next.js** (React + TypeScript) + **Tailwind CSS**
- 연한 민트 파스텔 테마
- Google 로그인 (@react-oauth/google) — **커스텀 버튼 + `useGoogleLogin`**
  (커스텀 버튼 위에 구글 버튼을 투명하게 겹치는 방식은 구글의 클릭재킹 방지에
   막혀 눌러도 아무 일이 안 일어나요. 겹치지 말고 `useGoogleLogin` 훅을 쓰면
   원래 디자인을 지키면서 제대로 동작해요)
- 4개 언어 (한국어·English·日本語·中文) — `src/i18n/dictionaries.ts` 한 곳에 모아둠

## 화면 구성

- **로그인 페이지** — 뇌 아이콘(직접 그린 SVG) + 구글 로그인 버튼
- **입력 폼** — 날짜 · 약 종류(자동완성) · 복용횟수 · 효과여부 · 촉발요인 · 혈압(선택) · 생리기간
- **자주 복용하는 약** (최대 3개) — 버튼 한 번으로 저장해둔 내용 그대로 오늘 기록, 수정/삭제 지원
- **3탭 뷰**
  - 목록: 전체 항목 테이블 + 수정/삭제
  - 달력: 두통 있던 날 표시, 날짜 클릭 시 상세
  - 차트: 월별 두통 횟수(세로축 눈금), 촉발요인 TOP 5

## 고양이 수첩 화면 (`/cat-note`)

| 화면 | 내용 |
|---|---|
| 홈 | 인사말 · 오늘의 다섯 문장 카드 · 짝꿍 한마디 · 통계 3개(연속·정확도·발도장) |
| 수첩 만들기 | 짝꿍 고르기(콩이·치즈·먹물이·식빵이) → 별명 + 수첩 아이디(중복 검사·추천) |
| 쓰기 | 5칸 진행바 · 오늘의 글감 · 타이핑 멈추면 자동 저장 |
| 채점 결과 | 틀린 곳 물결 밑줄 → 고친 문장 → 문법 노트 → 번역 → 단어장에 담기 |
| 달력 · 친구 · 내 정보 | 아직 만드는 중 |

> 쓰는 동안엔 교정을 안 보여줘요. 다 쓰고 "다 썼어요!" 를 눌렀을 때 한 번에 채점해요.

## 지금까지 만든 기능 (2026-07-14 ~ 07-18)

| 날짜 | 내용 |
|---|---|
| 07-14 | 기록 입력 폼 + 목록, 백엔드 연동 |
| 07-15 | 3탭(목록/달력/차트), 기록 수정, 파스텔 민트 테마, 약 종류 자동완성 |
| 07-16 | Google 로그인, 미로그인 접근 차단, 로그아웃, 로그인 페이지 디자인 |
| 07-17 | 자주 복용하는 약(즐겨찾기) 전체 기능 |
| 07-18 | 모노레포에서 프론트 분리 (Vercel 배포 준비) |

## 로컬 실행

```bash
npm install
npm run dev   # http://localhost:3000
```

**환경변수** (`.env.local` — git에 안 올라가요):

```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=구글_OAuth_클라이언트_ID
NEXT_PUBLIC_API_URL=백엔드_주소   # 없으면 http://localhost:8000
```

## 배포 (Vercel)

> 이 폴더는 **원본**이에요. 배포는 [world-holicat-frontend](https://github.com/HANJIYEONN/world-holicat-frontend)
> 저장소로 이 폴더 내용을 복사해서 올려요 (Vercel 이 그 저장소를 보고 있어요).
> 복사할 때 `.env.local`·`node_modules`·`.next` 는 빼고, 새로 클론했으면
> **`git config user.email` 부터 맞춰야** 커밋 작성자가 안 어긋나요.

1. Vercel에서 배포 저장소 import (루트가 곧 앱이라 추가 설정 불필요)
2. 환경변수 2개 등록: `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, `NEXT_PUBLIC_API_URL`(오라클 서버 주소)
3. 배포 후 Google Cloud Console → OAuth 승인된 자바스크립트 원본에 Vercel 주소 추가
