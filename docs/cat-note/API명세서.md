# 🔌 고양이 수첩 — API 명세서

| 문서 정보 | 내용 |
|---|---|
| 버전 | v0.1 (초안) |
| 작성일 | 2026-08-02 |
| 기준 | 요구사항 정의서 v0.3, DB설계 v0.1, 결정 D-01~D-12 |
| 서버 | 기존 FastAPI 백엔드 안에 추가 |

---

## 0. 공통 규칙

**주소 앞부분**: 모든 주소는 `/api/v1/cat-note` 로 시작해요. (아래 표에서는 이 부분을 생략)

**로그인 확인**: 모든 요청에 기존 구글 로그인 토큰을 붙여요.
```
Authorization: Bearer <access_token>
```

**HTTP 방식** — 이 4가지만 써요:

| 방식 | 뜻 | 예시 |
|---|---|---|
| `GET` | 가져오기 | 오늘 수첩 보여줘 |
| `POST` | 새로 만들기 | 친구 신청할래 |
| `PUT` | 통째로 바꾸기 | 3번째 문장을 이걸로 |
| `PATCH` | 일부만 바꾸기 | 별명만 바꿀래 |
| `DELETE` | 지우기 | 친구 끊을래 |

**응답 코드**

| 코드 | 뜻 |
|---|---|
| 200 | 잘 됨 |
| 201 | 새로 만들어짐 |
| 400 | 보낸 값이 잘못됨 (예: 아이디가 3글자) |
| 401 | 로그인이 안 됨 / 토큰 만료 |
| 403 | 권한 없음 (예: 친구 아닌 사람의 수첩 보기) |
| 404 | 없는 것을 찾음 |
| 409 | 이미 있음 (예: 중복된 수첩 아이디) |

**오류 응답 모양** — 항상 이 형태로 돌려줘요:
```json
{ "detail": "이미 있는 아이디예요" }
```

---

## 1. 계정 (첫 진입 · 내 정보)

### 1-1. 내 계정 확인 — `GET /me`

고양이 수첩에 들어올 때 **제일 먼저** 부르는 API예요. 계정이 있으면 홈으로, 없으면 모드 선택 화면으로 보내요.

**응답 200** (계정 있음)
```json
{
  "exists": true,
  "note_id": "jiwoo07",
  "partner": "kongi",
  "nickname": "지우",
  "bio": "그림 그리기를 좋아해요",
  "avatar": "cat",
  "learning_language": "ko",
  "feedback_language": "ko",
  "writing_stage": 3,
  "sentences_to_next_stage": 26,
  "daily_reminder": false
}
```

> `partner` 값: `kongi`(콩이·초등 이하) / `cheese`(치즈·중고등) / `meokmul`(먹물이·어른) / `sikppang`(식빵이·누구나)

**응답 200** (계정 없음 → 온보딩으로)
```json
{ "exists": false }
```

### 1-2. 수첩 아이디 쓸 수 있나 확인 — `GET /note-id/check?value=jiwoo07`

입력칸에 타이핑할 때마다 부르는 게 아니라, **잠깐 멈췄을 때** 한 번 부르는 게 좋아요.

**응답 200**
```json
{
  "available": false,
  "reason": "duplicate",
  "suggestions": ["jiwoo7", "happyjiwoo", "jiwoo0720"]
}
```

| `reason` 값 | 뜻 |
|---|---|
| `null` | 쓸 수 있어요 (available: true) |
| `duplicate` | 이미 있는 아이디 |
| `too_short` / `too_long` | 4자 미만 / 15자 초과 |
| `invalid_char` | 영문·숫자 말고 다른 글자가 있음 |

### 1-3. 계정 만들기 — `POST /me`

모드 선택 + 수첩 아이디를 다 정하고 **"수첩 만들기"** 누를 때.

**요청**
```json
{
  "partner": "kongi",
  "note_id": "jiwoo07",
  "nickname": "지우",
  "learning_language": "ko"
}
```

**응답 201** — 1-1과 같은 모양
**응답 409** — `{ "detail": "이미 있는 아이디예요" }`

> `partner`는 여기서 처음 정하지만, **나중에 `PATCH /me`로 바꿀 수 있어요 (D-17).**
> 짝꿍은 말투만 정하기 때문에 바꿔도 데이터·친구 관계에 영향이 없어요.
> (D-09의 "변경 불가"는 화면이 통합되면서 D-17로 수정됐어요)

### 1-4. 내 정보 수정 — `PATCH /me`

**요청** (바꿀 것만 보내면 돼요)
```json
{ "nickname": "지우", "bio": "그림 좋아해요", "avatar": "dino" }
```

**바꿀 수 있는 것**: `nickname`, `bio`, `avatar`, `learning_language`, `feedback_language`, `daily_reminder`, **`partner`**(말투 즉시 변경 — D-17)
**못 바꾸는 것**: `note_id`(친구가 못 찾게 되니까)

---

## 2. 수첩 쓰기 ⭐ (핵심)

### 2-1. 오늘 수첩 가져오기 — `GET /entries/today`

홈 화면과 쓰기 화면에서 써요. 오늘 것이 없으면 빈 수첩을 만들어서 돌려줘요.

**응답 200**
```json
{
  "entry_id": 12,
  "entry_date": "2026-08-02",
  "is_complete": false,
  "accuracy": null,
  "sentences": [
    { "position": 1, "text": "오늘의 하늘은 푸르다" },
    { "position": 2, "text": "고양이가 조아요" },
    { "position": 3, "text": "아침에 우유를 마셨다" }
  ]
}
```

> 💡 아직 완성 전이라 **교정 결과가 없어요.** 쓰는 중엔 교정을 안 보여주기로 했으니까요 (D-12).

### 2-2. 문장 저장 — `PUT /entries/today/sentences/{position}`

`position`은 1~5. 문장을 쓰거나 고칠 때마다 바로 저장해요 (NF-06 — 글이 유실되면 안 됨).

**요청**
```json
{ "text": "학교에서 그림을 그렸다" }
```

**응답 200**
```json
{ "position": 4, "text": "학교에서 그림을 그렸다", "saved_at": "2026-08-06T21:14:00" }
```

**응답 400** — 오늘 수첩을 이미 냈을 때 `{ "detail": "오늘 수첩은 이미 다 냈어요" }`
**응답 422** — `position`이 1~5 밖이거나, 글이 비었거나 200자를 넘을 때 (앞뒤 공백은 저절로 잘려요)

### 2-3. 다 썼어요! (AI 채점) — `POST /entries/today/complete`

**여기서만 AI를 불러요** (D-12). 5문장을 통째로 AI에게 보내서 한 번에 채점받아요.

**요청**: 없음 (저장된 5문장을 서버가 알아서 씀)

**응답 200**
```json
{
  "entry_id": 12,
  "is_complete": true,
  "accuracy": 80,
  "sentences": [
    {
      "position": 1,
      "original_text": "오늘의 하늘은 푸르다",
      "corrected_text": null,
      "translation": "The sky is blue today.",
      "corrections": []
    },
    {
      "position": 2,
      "original_text": "고양이가 조아요",
      "corrected_text": "고양이가 좋아요",
      "translation": "The cat is nice.",
      "corrections": [
        {
          "wrong_text": "조아요",
          "right_text": "좋아요",
          "note": "'좋다'의 어간은 좋-이고 ㅎ 받침을 유지해요.",
          "pronunciation": "[조아요]"
        }
      ]
    }
  ],
  "new_expressions": ["좋아요"],
  "streak_days": 8,
  "total_stamps": 33
}
```

**응답 400** — 5문장을 다 안 썼을 때 `{ "detail": "아직 다 못 썼어요 (3/5)" }`

> 💸 **이미 낸 수첩에 다시 부르면 저장해둔 결과를 그대로 돌려줘요.** 다시 채점하지 않아요 — 같은 글에 AI 요금을 두 번 내게 되니까요.
> 🌐 `translation`은 `cat_sentences.translation`에 저장해둬요. 나중에 다시 볼 때 AI를 또 부르지 않으려고요 (D-20).

> ⏱️ AI 응답이 몇 초 걸릴 수 있어요. 화면에 "콩이가 읽는 중..." 같은 로딩을 꼭 보여주세요.

### 2-4. 오늘의 글감 — `GET /prompts/today`

**응답 200**
```json
{ "prompt": "누구랑 놀았는지 써 볼까?" }
```

---

## 3. 기록 보기 (달력 · 통계)

### 3-1. 월별 기록 — `GET /entries?year=2026&month=7`

달력 화면용. 어느 날에 발도장이 있는지 알려줘요.

**응답 200**
```json
{
  "days": [
    { "date": "2026-07-01", "is_complete": true, "accuracy": 80 },
    { "date": "2026-07-02", "is_complete": true, "accuracy": 100 }
  ],
  "total_stamps_this_month": 15
}
```

**응답 422** — `year`·`month`가 없거나 범위 밖일 때 (year 2000~2100, month 1~12)

> 다 쓰지 못한 날도 `days`에 나와요 (`is_complete: false`, `accuracy: null`).
> 달력에 "쓰다 만 날"을 표시할 수 있게요. `total_stamps_this_month`는 **다 쓴 날만** 셉니다.

### 3-2. 특정 날짜 상세 — `GET /entries/{entry_date}`

예: `/entries/2026-07-20`. 응답은 2-3과 같은 모양(교정·번역 포함)에서
`streak_days`·`total_stamps`를 빼고 `entry_date`를 더한 형태예요.
그 둘은 **"지금" 값**이라 지난 날짜에 붙이면 헷갈리거든요.

**응답 200**
```json
{
  "entry_id": 12,
  "entry_date": "2026-07-20",
  "is_complete": true,
  "accuracy": 80,
  "sentences": [ "...2-3과 같은 모양..." ],
  "new_expressions": ["좋아요"]
}
```

**응답 404** — 그날 쓴 게 없을 때 `{ "detail": "그날은 쓴 수첩이 없어요" }`
**응답 422** — 날짜 모양이 아닐 때 (예: `/entries/어제`)

> ⚠️ **주소 등록 순서가 중요해요.** `/entries/today`가 이 API보다 **먼저** 등록돼야
> 서버가 "today"를 날짜로 읽으려다 실패하지 않아요.

### 3-3. 통계 — `GET /stats`

홈 화면의 숫자 카드들. **저장된 값이 아니라 그때그때 세는 값**이에요.

**응답 200**
```json
{
  "streak_days": 7,
  "total_stamps": 32,
  "praises_received": 12,
  "weekly_accuracy": 86,
  "weekly_accuracy_diff": 6,
  "vocab_count": 124,
  "level": "중급 1",
  "expressions_to_next_level": 26
}
```

> ~~어린이 모드는 `streak_days`·`total_stamps`만, 어른 모드는 정확도·레벨까지~~
> → **D-16으로 화면이 하나로 합쳐져서 모두에게 같은 값을 보여줘요.**

**각 값이 어떻게 나오는지**

| 값 | 세는 방법 |
|---|---|
| `streak_days` | 오늘부터 하루씩 거슬러 세다가 빈 날을 만나면 멈춤 |
| `total_stamps` | 다 쓴 날의 총 개수 |
| `praises_received` | 내 수첩들이 받은 칭찬도장 수 |
| `weekly_accuracy` | 최근 7일 중 **다 쓴 날들의 정확도 평균** (반올림) |
| `weekly_accuracy_diff` | 이번 7일 − 그 앞 7일 |
| `vocab_count` | 단어장에 모은 표현 수 |
| `level` / `expressions_to_next_level` | 표현 50개마다 한 단계 (D-23) — 초급 1·2 → 중급 1·2 → 고급 1·2 |

> 🈳 **쓴 날이 없으면 `weekly_accuracy`는 `0`이 아니라 `null`이에요** (D-24).
> "정확도 0%"는 못했다는 뜻으로 읽히는데 실제로는 아직 안 쓴 것뿐이거든요.
> 지난주 기록이 없으면 `weekly_accuracy_diff`도 `null`이에요.

> 📌 `vocab_count`는 단어장(5장) API를 만들기 전까지는 계속 0이라, 단계도 "초급 1"에 머물러요.

---

## 4. 친구

### 4-1. 수첩 아이디로 찾기 — `GET /users/search?note_id=minjun22`

**정확히 일치할 때만** 찾아져요. 부분 검색은 안 돼요 (NF-04).

**응답 200**
```json
{ "found": true, "note_id": "minjun22", "nickname": "민준", "avatar": "cat" }
```
**응답 200** (없을 때) — `{ "found": false }`

### 4-2. 친구 목록 — `GET /friends`

```json
{
  "friends": [
    { "note_id": "minjun22", "nickname": "민준", "avatar": "cat" }
  ],
  "pending_received": [
    { "friendship_id": 7, "note_id": "hajun9", "nickname": "하준" }
  ]
}
```

### 4-3. 친구 신청 — `POST /friends`
요청: `{ "note_id": "minjun22" }` → 응답 201
**409** — 이미 친구이거나 신청함
**409** — `{ "detail": "친구는 10명까지 사귈 수 있어요" }` (친구 수 상한, D-22)

### 4-4. 수락 — `POST /friends/{friendship_id}/accept`
**409** — 상한 초과 시 거절. 수락 시점엔 **신청한 사람·받은 사람 양쪽 다** 검사해요 (D-22)

### 4-5. 거절·삭제 — `DELETE /friends/{friendship_id}`

> 📌 **친구 수 상한 = 10명** (D-22). 세는 기준은 `status='accepted'`이고,
> 내가 신청한 것(`requester_id`)과 받은 것(`receiver_id`)을 **합쳐서** 세요.

### 4-6. 친구 피드 — `GET /friends/feed`

친구들의 **오늘** 수첩. 어른 모드는 국기·배우는 언어도 같이.

```json
{
  "feed": [
    {
      "entry_id": 88,
      "note_id": "minjun22",
      "nickname": "민준",
      "avatar": "cat",
      "country": "KR",
      "learning_language": "ko",
      "status": "complete",
      "progress": "5/5",
      "written_at": "10분 전",
      "sentences": ["나는 사과를 먹었다", "친구와 축구를 했다"],
      "praise_count": 3,
      "i_praised": false
    }
  ]
}
```

> 🔒 친구가 아닌 사람의 수첩을 부르면 **403**을 돌려줘야 해요.

### 4-7. 칭찬도장 주기 — `POST /entries/{entry_id}/praises`
응답 201 `{ "praise_count": 4 }` · **409** 이미 준 경우

### 4-8. 댓글 목록 — `GET /entries/{entry_id}/comments`
### 4-9. 댓글 쓰기 — `POST /entries/{entry_id}/comments`
요청: `{ "content": "잘 썼다!" }` (200자 이내)

> 비속어 필터는 2차에 이 API 안에 넣으면 돼요 (D-07).

---

## 5. 단어장 (어른 모드)

| 주소 | 방식 | 하는 일 |
|---|---|---|
| `/vocab` | GET | 저장한 표현 목록 |
| `/vocab` | POST | 표현 저장 `{ "correction_id": 5 }` |
| `/vocab/{id}` | DELETE | 지우기 |

---

## 6. 나중에 만들 것

| 주소 | 하는 일 | 언제 |
|---|---|---|
| ~~`POST /translate`~~ | 번역 보기 (LEARN-07) | **별도 API 안 만듦 (D-20)** — 채점 응답(`POST /entries/today/complete`)에 번역을 함께 담아요 |
| `GET /corrections/similar` | 비슷한 실수 3개 (LEARN-04) | 나중에 |

---

## 7. 화면 ↔ API 연결표

| 화면 | 부르는 API |
|---|---|
| 첫 진입 | `GET /me` |
| 모드 선택 → 아이디 만들기 | `GET /note-id/check` → `POST /me` |
| 홈 | `GET /entries/today` + `GET /stats` |
| 쓰기 | `GET /prompts/today` + `PUT .../sentences/{n}` |
| 다 썼어요! | `POST /entries/today/complete` |
| 오늘 모아보기 | 위 응답 그대로 사용 (다시 안 불러도 됨) |
| 달력 | `GET /entries?year=&month=` → 날짜 클릭 시 `GET /entries/{date}` |
| 친구 | `GET /friends/feed` · `GET /friends` |
| 친구 찾기 | `GET /users/search` → `POST /friends` |
| 내 정보 | `GET /me` → `PATCH /me` |

---

## 8. 아직 정할 것

- [x] 하루가 바뀌는 기준 시각 → **밤 12시(자정)** 기준, 서버의 한국 시간대로 판정 (D-15)
- [ ] AI 채점이 실패했을 때 처리 (문장은 저장됐는데 채점만 실패한 경우)
- [x] 친구 수 상한을 둘지 → **최대 10명** (D-22)
- [x] 짝꿍이 화면 모드를 정하는지 → **아니요. 화면은 하나, 말투만 다름** (D-16)
- [ ] 짝꿍 말투를 **어디서 처리할지** — 프론트에 4종 문구를 넣을지, 서버가 말투에 맞춰 내려줄지
      (AI 교정 설명은 서버, 버튼·인사말 같은 고정 문구는 프론트가 자연스러워요)
