# world holicat 🐱

고양이가 지키는 나만의 기록 공간. 프로필 화면에서 프로젝트를 골라 들어가는 구조예요.

**라이브**: https://www.world-holicat.com

## 프로젝트

| 프로젝트 | 주소 | 설명 | 상태 |
|---|---|---|---|
| 두통 기록 차트 | `/headache` | 두통이 올 때마다 투약 사항과 상태를 기록 | 사용 중 |
| 고양이 수첩 | `/cat-note` | 하루 다섯 문장 쓰는 어린이 글쓰기 수첩 | 설계 중 |

## 스택
- **Frontend**: Next.js 16 (React 19, TypeScript, Tailwind) — `frontend/`
- **Backend**: FastAPI (Python) — 별도 저장소 [world-holicat-backend](https://github.com/HANJIYEONN/world-holicat-backend)
- **DB**: MySQL (로컬) / TiDB Cloud (배포)
- **Auth**: Google 로그인 전용

## 다국어 (4개국어)

한국어 · English · 日本語 · 中文 을 지원해요. 화면 왼쪽 위 `한 EN 日 中` 버튼으로 바꾸고, 고른 언어는 브라우저에 저장돼서 다음에 와도 그대로예요.

```
frontend/src/i18n/
├── dictionaries.ts       # 모든 문구를 언어별로 모아둔 사전
└── LanguageProvider.tsx  # 지금 언어를 앱 전체에 알려주는 곳
```

화면에 새 글자를 넣을 때는 직접 쓰지 말고 **사전에 추가**해요:

1. `dictionaries.ts` 의 `ko` 에 열쇠(key)와 한국어 문구를 추가
2. `en` / `ja` / `zh` 에도 같은 열쇠로 번역 추가 (빠뜨리면 TypeScript가 알려줘요)
3. 화면에서는 `const t = useT();` 후 `{t.home.role}` 처럼 사용

탭 제목은 `<PageTitle title={t.meta.site} />` 로 넣으면 언어에 맞게 바뀌어요.

## 두통 기록 차트

- **기록 항목**: 날짜 · 생리기간 유무 · 약 종류 · 효과여부 · 복용횟수 · 촉발요인 · 혈압(수축기/이완기/맥박수)
- **화면**: 목록(테이블) / 달력 / 차트 — 3탭 구성
- **자주 복용하는 약**: 최대 3개까지 저장해두고 한 번에 오늘 기록으로 추가

## 개발

```bash
# frontend
cd frontend && npm run dev        # http://localhost:3000

# backend (별도 저장소에서, 도커로 실행)
cd ../world-holicat-backend
docker compose -f docker-compose.dev.yml up -d   # http://localhost:8000
```

## 저장소 구성

프론트엔드와 문서는 이 저장소(모노레포)에 있고, **백엔드는 별도 저장소가 원본**이에요.
2026-08-23에 백엔드를 이 저장소에서 빼내 `world-holicat-backend` 하나로 합쳤어요
(두 곳에 흩어져 있다가 한 달 넘게 서로 어긋났던 문제를 정리한 거예요).

- [world-holicat-frontend](https://github.com/HANJIYEONN/world-holicat-frontend) — Vercel이 여기서 배포
- [world-holicat-backend](https://github.com/HANJIYEONN/world-holicat-backend) — **백엔드 원본**. 여기서 작업하고, GitHub Actions로 서버 배포

## 문서

- [TODO.md](TODO.md) — 두통 기록 차트 진행 상황
- [DESIGN.md](DESIGN.md) — 디자인 규칙
- [DEPLOY.md](DEPLOY.md) — 배포 방법
- [docs/cat-note/](docs/cat-note/) — 고양이 수첩 요구사항 정의서 · TODO
