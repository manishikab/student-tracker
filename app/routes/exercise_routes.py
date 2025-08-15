from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/exercise", tags=["exercise"])

# Log exercise
@router.post("/", response_model=schemas.ExerciseEntry)
def log_exercise(entry: schemas.ExerciseEntryCreate, db: Session = Depends(get_db)):
    db_entry = models.ExerciseEntry(**entry.model_dump())
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

# Get all entries
@router.get("/", response_model=list[schemas.ExerciseEntry])
def get_exercise_entries(db: Session = Depends(get_db)):
    return db.query(models.ExerciseEntry).order_by(models.ExerciseEntry.date.desc()).all()