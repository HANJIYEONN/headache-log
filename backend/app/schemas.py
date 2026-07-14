from datetime import date
from typing import Optional

from pydantic import BaseModel, ConfigDict


class EntryBase(BaseModel):
    entry_date: date
    menstruating: bool = False
    took_painkiller: bool = True  # 통증약은 항상 복용
    effective: Optional[bool] = None
    dose_count: Optional[int] = None
    trigger: Optional[str] = None
    bp_systolic: Optional[int] = None
    bp_diastolic: Optional[int] = None
    bp_pulse: Optional[int] = None


class EntryCreate(EntryBase):
    pass


class EntryUpdate(EntryBase):
    pass


class EntryOut(EntryBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
