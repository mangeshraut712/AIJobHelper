from pydantic import BaseModel, Field
from typing import List, Optional

class JobDescription(BaseModel):
    title: str
    company: str
    location: Optional[str] = None
    salary_range: Optional[str] = None
    description: str
    requirements: List[str]
    responsibilities: List[str]
    url: Optional[str] = None

class ResumeData(BaseModel):
    # Personal Info
    name: str
    email: str
    phone: Optional[str] = None
    linkedin: Optional[str] = None
    website: Optional[str] = None
    location: Optional[str] = None
    
    # Career Details
    summary: str
    experience: List[dict]  # List of {company, role, duration, description}
    education: List[dict]   # List of {institution, degree, graduation_year}
    skills: List[str]
    projects: Optional[List[dict]] = None
    
    # Targeted Info (New)
    targeted_job_title: Optional[str] = None
    last_modified: Optional[str] = None
    
    # Work Authorization & EEO (New)
    is_authorized_us: bool = True
    requires_sponsorship: bool = True
    gender: Optional[str] = "Male"
    disability: Optional[str] = "No"
    is_lgbtq: Optional[str] = "No"
    is_veteran: Optional[str] = "No"
    race: Optional[str] = "Asian"
    is_hispanic: Optional[str] = "No"
    sexual_orientation: Optional[str] = "Heterosexual"
    
    # Dynamic Learning (New)
    custom_questions: Optional[dict] = Field(default_factory=dict) # Key: question text, Value: answer

class EnhancementRequest(BaseModel):
    resume_data: ResumeData
    job_description: JobDescription

class EnhancementResponse(BaseModel):
    enhanced_resume: ResumeData
    feedback: str
    score: int
    tailored_summary: str

class CoverLetterRequest(BaseModel):
    resume_data: ResumeData
    job_description: JobDescription
    template_type: str = "modern"

class CoverLetterResponse(BaseModel):
    content: str

class CommunicationRequest(BaseModel):
    resume_data: ResumeData
    job_description: JobDescription
    type: str  # "email", "linkedin_message", "follow_up"
