from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import HeadacheEntry
from ..schemas import EntryCreate, EntryOut, EntryUpdate

router = APIRouter(prefix="/entries", tags=["entries"])


@router.get("", response_model=list[EntryOut])
def list_entries(db: Session = Depends(get_db)):
    return db.scalars(
        select(HeadacheEntry).order_by(HeadacheEntry.entry_date.desc())
    ).all()


@router.post("", response_model=EntryOut, status_code=201)
def create_entry(payload: EntryCreate, db: Session = Depends(get_db)):
    entry = HeadacheEntry(**payload.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.get("/{entry_id}", response_model=EntryOut)
def get_entry(entry_id: int, db: Session = Depends(get_db)):
    entry = db.get(HeadacheEntry, entry_id)
    if entry is None:
        raise HTTPException(status_code=404, detail="기록을 찾을 수 없어요")
    return entry


@router.put("/{entry_id}", response_model=EntryOut)
def update_entry(entry_id: int, payload: EntryUpdate, db: Session = Depends(get_db)):
    entry = db.get(HeadacheEntry, entry_id)
    if entry is None:
        raise HTTPException(status_code=404, detail="기록을 찾을 수 없어요")
    for key, value in payload.model_dump().items():
        setattr(entry, key, value)
    db.commit()
    db.refresh(entry)
    return entry


@router.delete("/{entry_id}", status_code=204)
def delete_entry(entry_id: int, db: Session = Depends(get_db)):
    entry = db.get(HeadacheEntry, entry_id)
    if entry is None:
        raise HTTPException(status_code=404, detail="기록을 찾을 수 없어요")
    db.delete(entry)
    db.commit()
