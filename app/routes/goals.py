from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/goals", tags=["Goals"])

@router.get("/", response_model=list[schemas.Goal])
def get_goals(db: Session = Depends(get_db)):
    return db.query(models.Goal).order_by(models.Goal.created_at.desc()).all()

@router.post("/", response_model=schemas.Goal)
def create_goal(goal: schemas.GoalCreate, db: Session = Depends(get_db)):
    new_goal = models.Goal(**goal.dict())
    db.add(new_goal)
    db.commit()
    db.refresh(new_goal)
    return new_goal

@router.put("/{goal_id}", response_model=schemas.Goal)
def update_goal(goal_id: int, goal: schemas.GoalBase, db: Session = Depends(get_db)):
    db_goal = db.query(models.Goal).filter(models.Goal.id == goal_id).first()
    if not db_goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    for key, value in goal.dict().items():
        setattr(db_goal, key, value)
    db.commit()
    db.refresh(db_goal)
    return db_goal

@router.delete("/{goal_id}")
def delete_goal(goal_id: int, db: Session = Depends(get_db)):
    db_goal = db.query(models.Goal).filter(models.Goal.id == goal_id).first()
    if not db_goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    db.delete(db_goal)
    db.commit()
    return {"message": "Goal deleted"}