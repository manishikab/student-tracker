from fastapi import FastAPI
from app.database import Base, engine
from app.routes import todo_routes, sleep_routes, wellness_routes, exercise_routes

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Student Tracker API")

# Include routers
app.include_router(todo_routes.router)
app.include_router(sleep_routes.router)
app.include_router(wellness_routes.router)
app.include_router(exercise_routes.router)