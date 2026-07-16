# 파이썬 실행 환경을 담은 상자(이미지)를 하나 만들어요
FROM python:3.11-slim

WORKDIR /app

# 의존성 목록만 먼저 복사해서 설치 — 코드만 바뀌었을 땐 이 단계가 캐시돼서 빨라져요
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
