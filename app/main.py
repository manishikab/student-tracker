from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from app.routes import todo_routes, sleep_routes, wellness_routes, exercise_routes, goals

load_dotenv()

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

app = FastAPI()

@app.get("/")
def root():
    return {"status": "ok", "service": "student-coach-fastapi"}


origins = [
    "http://localhost:5173",
    "https://ai-student-coach-frontend.onrender.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(todo_routes.router)
app.include_router(sleep_routes.router)
app.include_router(wellness_routes.router)
app.include_router(exercise_routes.router)
app.include_router(goals.router)