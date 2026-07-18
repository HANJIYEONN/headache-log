import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql+psycopg2://localhost:5432/headache_log"
)

# pool_pre_ping: 쿼리 전에 연결이 살아있는지 확인 (끊긴 연결 자동 복구)
# pool_recycle: 5분 지난 연결은 새로 맺기 — TiDB Cloud 같은 클라우드 DB는
#               놀고 있는 연결을 서버 쪽에서 끊어버리기 때문에 꼭 필요해요
engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_recycle=300)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


def get_db():
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
