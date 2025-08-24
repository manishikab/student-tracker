from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas, database
from app.dependencies import verify_token  # Firebase auth dependency

router = APIRouter(prefix="/exercise", tags=["exercise"])

# Log exercise
@router.post("/", response_model=schemas.ExerciseEntry)
def log_exercise(
    entry: schemas.ExerciseEntryCreate,
    db: Session = Depends(database.get_db),
    user: dict = Depends(verify_token),
):
    db_entry = models.ExerciseEntry(**entry.model_dump(), user_id=user["uid"])
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

# Get all entries for the current user
@router.get("/", response_model=list[schemas.ExerciseEntry])
def get_exercise_entries(
    db: Session = Depends(database.get_db),
    user: dict = Depends(verify_token),
):
    return (
        db.query(models.ExerciseEntry)
        .filter(models.ExerciseEntry.user_id == user["uid"])
        .order_by(models.ExerciseEntry.date.desc())
        .all()
    )

# Delete an entry for the current user
@router.delete("/{exercise_id}")
def delete_exercise_entry(
    exercise_id: int,
    db: Session = Depends(database.get_db),
    user: dict = Depends(verify_token),
):
    entry = (
        db.query(models.ExerciseEntry)
        .filter(models.ExerciseEntry.id == exercise_id, models.ExerciseEntry.user_id == user["uid"])
        .first()
    )
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    db.delete(entry)
    db.commit()
    return {"detail": "Deleted successfully"}
