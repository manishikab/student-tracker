from sqlalchemy import Column, Integer, String, Boolean, Float, Date, DateTime, func
from app.database import Base

# Todo model
class TodoItem(Base):
    __tablename__ = "todo_list"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, nullable=True)
    category = Column(String, default="today")
    completed = Column(Boolean, default=False)

# Sleep model
class SleepEntry(Base):
    __tablename__ = "sleep_entries"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, index=True)
    hours = Column(Float)
    notes = Column(String, nullable=True)

# Wellness model
class WellnessEntry(Base):
    __tablename__ = "wellness_entries"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date)
    mood = Column(Integer)
    energy = Column(Integer)
    notes = Column(String, nullable=True)

# Excercise Model
class ExerciseEntry(Base):
    __tablename__ = "exercise_entries"  
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, index=True)
    title = Column(String, index=True)
    duration = Column(Integer, nullable=False) 
    intensity = Column(String, nullable=True)  
    notes = Column(String, nullable=True)

# Homepage
class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(String, nullable=False)
    done = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())