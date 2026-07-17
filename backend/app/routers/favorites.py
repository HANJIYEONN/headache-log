from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import FavoriteMedication
from ..schemas import FavoriteMedicationCreate, FavoriteMedicationOut
from .auth import get_current_user_email

router = APIRouter(prefix="/favorites", tags=["favorites"])

MAX_FAVORITES = 3


@router.get("", response_model=list[FavoriteMedicationOut])
def list_favorites(
    db: Session = Depends(get_db),
    user_email: str = Depends(get_current_user_email),
):
    return db.scalars(
        select(FavoriteMedication).where(FavoriteMedication.user_email == user_email)
    ).all()


@router.post("", response_model=FavoriteMedicationOut, status_code=201)
def add_favorite(
    payload: FavoriteMedicationCreate,
    db: Session = Depends(get_db),
    user_email: str = Depends(get_current_user_email),
):
    count = db.scalar(
        select(func.count())
        .select_from(FavoriteMedication)
        .where(FavoriteMedication.user_email == user_email)
    )
    if count >= MAX_FAVORITES:
        raise HTTPException(status_code=400, detail="즐겨찾기는 최대 3개까지예요")

    exists = db.scalar(
        select(FavoriteMedication).where(
            FavoriteMedication.user_email == user_email,
            FavoriteMedication.name == payload.name,
        )
    )
    if exists:
        raise HTTPException(status_code=400, detail="이미 즐겨찾기에 있는 약이에요")

    favorite = FavoriteMedication(user_email=user_email, name=payload.name)
    db.add(favorite)
    db.commit()
    db.refresh(favorite)
    return favorite


@router.delete("/{favorite_id}", status_code=204)
def delete_favorite(
    favorite_id: int,
    db: Session = Depends(get_db),
    user_email: str = Depends(get_current_user_email),
):
    favorite = db.get(FavoriteMedication, favorite_id)
    if favorite is None or favorite.user_email != user_email:
        raise HTTPException(status_code=404, detail="찾을 수 없어요")
    db.delete(favorite)
    db.commit()
