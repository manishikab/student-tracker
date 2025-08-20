from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas, database
from datetime import datetime, timedelta, timezone
from sqlalchemy import func


router = APIRouter(prefix="/sleep", tags=["sleep"])

# Add Entry
@router.post("/", response_model=schemas.SleepEntry)
def log_sleep(entry: schemas.SleepEntryCreate, db: Session = Depends(database.get_db)):
    db_entry = models.SleepEntry(**entry.model_dump())
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

# View Entries
@router.get("/", response_model=list[schemas.SleepEntry])
def get_sleep_entries(db: Session = Depends(database.get_db)):
    return db.query(models.SleepEntry).order_by(models.SleepEntry.date.desc()).all()

# View Average
@router.get("/weekly_average")
def weekly_average(db: Session = Depends(database.get_db)):
    today = datetime.now(timezone.utc).date()
    one_week_ago = today - timedelta(days=7)

    avg_sleep = (
        db.query(func.avg(models.SleepEntry.hours))
        .filter(models.SleepEntry.date >= one_week_ago)
        .scalar()
    )

    return {"week_start": one_week_ago, "week_end": today, "average_hours": round(avg_sleep or 0, 2)}

@router.delete("/{sleep_id}")
def delete_sleep(sleep_id: int, db: Session = Depends(database.get_db)):
    entry = db.query(models.SleepEntry).filter(models.SleepEntry.id == sleep_id).first()
    db.delete(entry)
    db.commit()