from sqlalchemy import Column, Integer, String, Text, JSON
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    
class Resume(Base):
    __tablename__ = "resumes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    title = Column(String)
    data = Column(JSON) # Stores ResumeData JSON
    
class Application(Base):
    __tablename__ = "applications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    job_title = Column(String)
    company = Column(String)
    status = Column(String, default="applied")
    date_applied = Column(String)
    resume_id = Column(Integer)
    job_url = Column(String)
