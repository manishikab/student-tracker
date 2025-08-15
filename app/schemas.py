from pydantic import BaseModel
from datetime import date

# Todo schemas
class TodoBase(BaseModel):
    title: str
    description: str | None = None

class TodoCreate(TodoBase):
    pass

class Todo(TodoBase):
    id: int
    completed: bool

    class Config:
        orm_mode = True

# Sleep schemas
class SleepEntryBase(BaseModel):
    date: date
    hours: float
    notes: str | None = None

class SleepEntryCreate(SleepEntryBase):
    pass

class SleepEntry(SleepEntryBase):
    id: int

    class Config:
        orm_mode = True

# Wellness schemas
class WellnessEntryBase(BaseModel):
    date: date
    mood: int
    energy: int
    notes: str | None = None

class WellnessEntryCreate(WellnessEntryBase):
    pass

class WellnessEntry(WellnessEntryBase):
    id: int

    class Config:
        orm_mode = True


# Exercise schemas
class ExerciseEntryBase(BaseModel):
     date: date
     title: str
     notes: str | None = None

class ExerciseEntryCreate(ExerciseEntryBase):
    pass

class ExerciseEntry(ExerciseEntryBase):
    id: int

    class Config:
        orm_mode = True
