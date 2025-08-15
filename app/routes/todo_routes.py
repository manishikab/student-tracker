from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/todos", tags=["todos"])

# Add Todo Item
@router.post("/", response_model=schemas.Todo)
def create_todo(todo: schemas.TodoCreate, db: Session = Depends(get_db)):
    db_item = models.TodoItem(**todo.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

# See Todo List
@router.get("/", response_model=list[schemas.Todo])
def get_todos(db: Session = Depends(get_db)):
    return db.query(models.TodoItem).all()

# Mark completed
@router.patch("/{todo_id}/complete", response_model=schemas.Todo)
def mark_todo_completed(todo_id: int, completed: bool, db: Session = Depends(get_db)):
    todo = db.query(models.TodoItem).filter(models.TodoItem.id == todo_id).first()
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    todo.completed = completed
    db.commit()
    db.refresh(todo)
    return todo