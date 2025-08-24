from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas, database
from app.dependencies import verify_token  # our Firebase auth dependency

router = APIRouter(prefix="/wellness", tags=["wellness"])

# Log wellness entry
@router.post("/", response_model=schemas.WellnessEntry)
def log_wellness(
    entry: schemas.WellnessEntryCreate,
    db: Session = Depends(database.get_db),
    user: dict = Depends(verify_token),  # Firebase user info
):
    db_entry = models.WellnessEntry(**entry.model_dump(), user_id=user["uid"])
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

# Get all wellness entries for current user
@router.get("/", response_model=list[schemas.WellnessEntry])
def get_wellness_entries(
    db: Session = Depends(database.get_db),
    user: dict = Depends(verify_token),
):
    return (
        db.query(models.WellnessEntry)
        .filter(models.WellnessEntry.user_id == user["uid"])
        .order_by(models.WellnessEntry.date.desc())
        .all()
    )

# Delete wellness entry (user can only delete their own)
@router.delete("/{wellness_id}")
def delete_wellness_entry(
    wellness_id: int,
    db: Session = Depends(database.get_db),
    user: dict = Depends(verify_token),
):
    entry = (
        db.query(models.WellnessEntry)
        .filter(models.WellnessEntry.id == wellness_id, models.WellnessEntry.user_id == user["uid"])
        .first()
    )
    if not entry:
        raise HTTPException(status_code=404, detail="Wellness entry not found")
    db.delete(entry)
    db.commit()
    return {"message": "Wellness entry deleted"}
