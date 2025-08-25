from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from app.routes import todo_routes, sleep_routes, wellness_routes, exercise_routes, goals

from app import models, database

load_dotenv()
models.Base.metadata.create_all(bind=database.engine)

# Frontend origins
FRONTEND_URLS = [
    "http://localhost:5173",
    "https://ai-student-coach-frontend.onrender.com",
]

app = FastAPI()

# Simple health check
@app.get("/")
def root():
    return {"status": "ok", "service": "student-coach-fastapi"}

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_URLS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(todo_routes.router)
app.include_router(exercise_routes.router)
app.include_router(sleep_routes.router)
app.include_router(wellness_routes.router)
app.include_router(goals.router)

@app.get("/test-cors")
def test_cors():
    return {"message": "CORS is working!"}
