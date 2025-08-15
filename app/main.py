from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import todo_routes, sleep_routes, wellness_routes, exercise_routes

app = FastAPI()

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(todo_routes.router)
app.include_router(sleep_routes.router)
app.include_router(wellness_routes.router)
app.include_router(exercise_routes.router)