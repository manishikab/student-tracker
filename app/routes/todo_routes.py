from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas, database

router = APIRouter(prefix="/todos", tags=["todos"])

# Add Todo Item
@router.post("/", response_model=schemas.Todo)
def create_todo(todo: schemas.TodoCreate, db: Session = Depends(database.get_db)):
    db_item = models.TodoItem(**todo.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

# See Todo List
@router.get("/", response_model=list[schemas.Todo])
def get_todos(db: Session = Depends(database.get_db)):
    return db.query(models.TodoItem).all()

# Mark completed or update text
@router.put("/{todo_id}", response_model=schemas.Todo)
def update_todo(todo_id: int, todo: schemas.TodoUpdate, db: Session = Depends(database.get_db)):
    db_todo = db.query(models.TodoItem).filter(models.TodoItem.id == todo_id).first()
    if todo.completed is not None:
        db_todo.completed = todo.completed

    db.commit()
    db.refresh(db_todo)
    return db_todo

# Delete Todo Task
@router.delete("/{todo_id}")
def delete_todo(todo_id: int, db: Session = Depends(database.get_db)):
    db_todo = db.query(models.TodoItem).filter(models.TodoItem.id == todo_id).first()
    db.delete(db_todo)
    db.commit()
    return