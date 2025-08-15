from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from datetime import datetime, timedelta
from sqlalchemy import func

router = APIRouter(prefix="/sleep", tags=["sleep"])

# Add Entry
@router.post("/", response_model=schemas.SleepEntry)
def log_sleep(entry: schemas.SleepEntryCreate, db: Session = Depends(get_db)):
    db_entry = models.SleepEntry(**entry.model_dump())
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

# View Entries
@router.get("/", response_model=list[schemas.SleepEntry])
def get_sleep_entries(db: Session = Depends(get_db)):
    return db.query(models.SleepEntry).order_by(models.SleepEntry.date.desc()).all()

# View Average
@router.get("/weekly_average")
def weekly_average(db: Session = Depends(get_db)):
    today = datetime.now(datetime.timezone.utc).date()
    one_week_ago = today - timedelta(days=7)

    avg_sleep = (
        db.query(func.avg(models.SleepEntry.hours))
        .filter(models.SleepEntry.date >= one_week_ago)
        .scalar()
    )

    return {"week_start": one_week_ago, "week_end:": today, "average_hours": round(avg_sleep or 0, 2)}
    