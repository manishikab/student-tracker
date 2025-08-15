from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/wellness", tags=["wellness"])

# Log wellness
@router.post("/", response_model=schemas.WellnessEntry)
def log_wellness(entry: schemas.WellnessEntryCreate, db: Session = Depends(get_db)):
    db_entry = models.WellnessEntry(**entry.model_dump())
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

# Get all entries
@router.get("/", response_model=list[schemas.WellnessEntry])
def get_wellness_entries(db: Session = Depends(get_db)):
    return db.query(models.WellnessEntry).order_by(models.WellnessEntry.date.desc()).all()
