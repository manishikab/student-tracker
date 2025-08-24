from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas, database
from app.dependencies import verify_token  # Firebase auth dependency

router = APIRouter(prefix="/goals", tags=["Goals"])

# Get goals for current user
@router.get("/", response_model=list[schemas.Goal])
def get_goals(db: Session = Depends(database.get_db), user: dict = Depends(verify_token)):
    return (
        db.query(models.Goal)
        .filter(models.Goal.user_id == user["uid"])
        .order_by(models.Goal.created_at.desc())
        .all()
    )

# Create a goal for current user
@router.post("/", response_model=schemas.Goal)
def create_goal(goal: schemas.GoalCreate, db: Session = Depends(database.get_db), user: dict = Depends(verify_token)):
    new_goal = models.Goal(**goal.dict(), user_id=user["uid"])
    db.add(new_goal)
    db.commit()
    db.refresh(new_goal)
    return new_goal

# Update a goal (only if it belongs to the current user)
@router.put("/{goal_id}", response_model=schemas.Goal)
def update_goal(goal_id: int, goal: schemas.GoalBase, db: Session = Depends(database.get_db), user: dict = Depends(verify_token)):
    db_goal = (
        db.query(models.Goal)
        .filter(models.Goal.id == goal_id, models.Goal.user_id == user["uid"])
        .first()
    )
    if not db_goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    for key, value in goal.dict().items():
        setattr(db_goal, key, value)
    db.commit()
    db.refresh(db_goal)
    return db_goal

# Delete a goal (only if it belongs to the current user)
@router.delete("/{goal_id}")
def delete_goal(goal_id: int, db: Session = Depends(database.get_db), user: dict = Depends(verify_token)):
    db_goal = (
        db.query(models.Goal)
        .filter(models.Goal.id == goal_id, models.Goal.user_id == user["uid"])
        .first()
    )
    if not db_goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    db.delete(db_goal)
    db.commit()
    return {"message": "Goal deleted"}
