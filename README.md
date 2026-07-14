# 두통 기록 차트 (Headache Log)

두통이 올 때마다 투약 사항과 상태를 자세히 기록하는 개인 기록 앱.

## 스택
- **Frontend**: Next.js (React, TypeScript, Tailwind) — `frontend/`
- **Backend**: FastAPI (Python) — `backend/`
- **DB**: PostgreSQL (로컬)
- **Auth**: Google 로그인 전용

## 기록 항목
날짜 · 생리기간 유무 · 통증약 복용여부 · 효과여부 · 복용횟수 · 촉발요인 · 혈압(수축기/이완기/맥박수)

## 화면
목록(테이블) / 달력 / 차트 — 3탭 구성

## 개발
```bash
# frontend
cd frontend && npm run dev        # http://localhost:3000

# backend
cd backend && source .venv/bin/activate
uvicorn app.main:app --reload     # http://localhost:8000
```

작업 진행 상황은 [TODO.md](TODO.md) 참고.
