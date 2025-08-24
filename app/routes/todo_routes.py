from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas, database
from app.dependencies import verify_token  # our Firebase token checker

router = APIRouter(prefix="/todos", tags=["todos"])

# Add Todo Item
@router.post("/", response_model=schemas.Todo)
def create_todo(
    todo: schemas.TodoCreate,
    db: Session = Depends(database.get_db),
    user=Depends(verify_token)  # Firebase user info
):
    user_id = user["uid"]  # use Firebase UID as user_id
    db_item = models.TodoItem(**todo.model_dump(), user_id=user_id)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

# See Todo List
@router.get("/", response_model=list[schemas.Todo])
def get_todos(
    db: Session = Depends(database.get_db),
    user=Depends(verify_token)
):
    user_id = user["uid"]
    return db.query(models.TodoItem).filter(models.TodoItem.user_id == user_id).all()

# Mark completed or update text
@router.put("/{todo_id}", response_model=schemas.Todo)
def update_todo(
    todo_id: int,
    todo: schemas.TodoUpdate,
    db: Session = Depends(database.get_db),
    user=Depends(verify_token)
):
    user_id = user["uid"]
    db_todo = db.query(models.TodoItem).filter(
        models.TodoItem.id == todo_id,
        models.TodoItem.user_id == user_id
    ).first()
    if not db_todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    if todo.completed is not None:
        db_todo.completed = todo.completed
    if todo.text is not None:
        db_todo.text = todo.text

    db.commit()
    db.refresh(db_todo)
    return db_todo

# Delete Todo Task
@router.delete("/{todo_id}")
def delete_todo(
    todo_id: int,
    db: Session = Depends(database.get_db),
    user=Depends(verify_token)
):
    user_id = user["uid"]
    db_todo = db.query(models.TodoItem).filter(
        models.TodoItem.id == todo_id,
        models.TodoItem.user_id == user_id
    ).first()
    if not db_todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    db.delete(db_todo)
    db.commit()
    return {"message": "Todo deleted"}
