from app.database import Base, engine
from app import models  # import your models.py file

# Create all tables
Base.metadata.create_all(bind=engine)

print("Tables created!")
