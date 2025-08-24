from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas, database
from datetime import datetime, timedelta, timezone
from sqlalchemy import func
from app.dependencies import verify_token  # Firebase auth dependency

router = APIRouter(prefix="/sleep", tags=["sleep"])

# Add Sleep Entry
@router.post("/", response_model=schemas.SleepEntry)
def log_sleep(
    entry: schemas.SleepEntryCreate,
    db: Session = Depends(database.get_db),
    user: dict = Depends(verify_token),
):
    db_entry = models.SleepEntry(**entry.model_dump(), user_id=user["uid"])
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

# Get all sleep entries for current user
@router.get("/", response_model=list[schemas.SleepEntry])
def get_sleep_entries(
    db: Session = Depends(database.get_db),
    user: dict = Depends(verify_token),
):
    return (
        db.query(models.SleepEntry)
        .filter(models.SleepEntry.user_id == user["uid"])
        .order_by(models.SleepEntry.date.desc())
        .all()
    )

# Weekly average sleep for current user
@router.get("/weekly_average")
def weekly_average(
    db: Session = Depends(database.get_db),
    user: dict = Depends(verify_token),
):
    today = datetime.now(timezone.utc).date()
    one_week_ago = today - timedelta(days=7)

    avg_sleep = (
        db.query(func.avg(models.SleepEntry.hours))
        .filter(
            models.SleepEntry.date >= one_week_ago,
            models.SleepEntry.user_id == user["uid"]
        )
        .scalar()
    )

    return {"week_start": one_week_ago, "week_end": today, "average_hours": round(avg_sleep or 0, 2)}

# Delete a sleep entry (only if it belongs to the user)
@router.delete("/{sleep_id}")
def delete_sleep(
    sleep_id: int,
    db: Session = Depends(database.get_db),
    user: dict = Depends(verify_token),
):
    entry = (
        db.query(models.SleepEntry)
        .filter(models.SleepEntry.id == sleep_id, models.SleepEntry.user_id == user["uid"])
        .first()
    )
    if not entry:
        raise HTTPException(status_code=404, detail="Sleep entry not found")
    db.delete(entry)
    db.commit()
    return {"message": "Sleep entry deleted"}
