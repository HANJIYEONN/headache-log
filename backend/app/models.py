from datetime import date

from sqlalchemy import Boolean, Date, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


class HeadacheEntry(Base):
    """두통 기록 한 건."""

    __tablename__ = "headache_entries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    entry_date: Mapped[date] = mapped_column(Date, nullable=False)  # 날짜
    menstruating: Mapped[bool] = mapped_column(Boolean, default=False)  # 생리기간 유무
    took_painkiller: Mapped[bool] = mapped_column(Boolean, default=False)  # 통증약 복용여부
    medication: Mapped[str] = mapped_column(String(100), nullable=True)  # 약 종류
    effective: Mapped[bool] = mapped_column(Boolean, nullable=True)  # 효과여부
    dose_count: Mapped[int] = mapped_column(Integer, nullable=True)  # 복용횟수
    trigger: Mapped[str] = mapped_column(Text, nullable=True)  # 촉발요인
    bp_systolic: Mapped[int] = mapped_column(Integer, nullable=True)  # 혈압-수축기
    bp_diastolic: Mapped[int] = mapped_column(Integer, nullable=True)  # 혈압-이완기
    bp_pulse: Mapped[int] = mapped_column(Integer, nullable=True)  # 혈압-맥박수
    # Google 로그인 붙이면 사용자 구분에 사용
    user_email: Mapped[str] = mapped_column(String(255), nullable=True, index=True)


class FavoriteMedication(Base):
    """자주 복용하는 약 (사용자당 최대 3개, 백엔드에서 강제)."""

    __tablename__ = "favorite_medications"
    __table_args__ = (UniqueConstraint("user_email", "name", name="uq_favorite_user_name"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
