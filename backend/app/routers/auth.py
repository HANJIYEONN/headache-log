import os
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from google.oauth2 import id_token
from google.auth.transport import requests
import jwt
import datetime

router = APIRouter(
    prefix="/api/v1/auth",
    tags=["auth"]
)

# ⚠️ 실제 서비스 시에는 .env 같은 환경 변수 파일로 관리하시는 것이 안전합니다!
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
JWT_SECRET = os.getenv("JWT_SECRET", "default-fallback-secret-key") # 없을 때를 대비한 기본값 설정 가능
JWT_ALGORITHM = "HS256"

if not GOOGLE_CLIENT_ID:
    raise RuntimeError("환경 변수에 GOOGLE_CLIENT_ID가 설정되지 않았습니다. .env 파일을 확인해주세요, 누나!")

class TokenRequest(BaseModel):
    token: str

def create_access_token(data: dict, expires_delta: datetime.timedelta = None):
    """우리 서비스 전용 JWT 토큰 생성"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.utcnow() + expires_delta
    else:
        expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=60) # 1시간 유효
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

@router.post("/google")
async def google_login(payload: TokenRequest):
    try:
        # 🛡️ 1. 프론트엔드에서 보낸 구글 ID 토큰 검증
        id_info = id_token.verify_oauth2_token(
            payload.token,
            requests.Request(),
            GOOGLE_CLIENT_ID
        )

        # 2. 토큰 안에서 구글 유저 정보 추출
        email = id_info.get("email")
        name = id_info.get("name")
        picture = id_info.get("picture")

        # 3. DB 확인 및 가입 로직 (추후 연동 필요 시 여기에 작성)
        # (예: email을 사용해 DB에 유저가 있는지 체크하고, 없으면 새로 저장)

        # 4. 우리 서비스 전용 자체 JWT 발급
        access_token = create_access_token(data={"sub": email, "name": name})

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "email": email,
                "name": name,
                "picture": picture
            }
        }

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"유효하지 않은 구글 토큰입니다: {str(e)}"
        )