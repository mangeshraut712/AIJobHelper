from pydantic import BaseModel, Field
from typing import List, Optional, Dict

class JobDescription(BaseModel):
    # Basic Info
    title: str
    company: str
    location: Optional[str] = None
    salary_range: Optional[str] = None
    job_type: Optional[str] = None  # Full-time, Part-time, Contract, etc.
    work_arrangement: Optional[str] = None  # Remote, Hybrid, On-site
    experience_level: Optional[str] = None  # Entry, Mid, Senior, Lead
    posted_date: Optional[str] = None
    
    # Structured Content Sections
    about_job: Optional[str] = None  # Full job description / About the role
    responsibilities: List[str] = []  # Key responsibilities
    minimum_qualifications: List[str] = []  # Required qualifications
    preferred_qualifications: List[str] = []  # Nice to have
    about_company: Optional[str] = None  # Company description
    why_join: Optional[str] = None  # Why join us section
    
    # Legacy fields for compatibility
    description: str = ""  # Combined description (fallback)
    requirements: List[str] = []  # Combined requirements (legacy)
    
    # Skills and Benefits
    skills: List[str] = []  # Required skills
    benefits: List[str] = []  # Company benefits
    
    # Job Info Dict (for additional structured data)
    job_info: Dict[str, str] = {}  # e.g., {"Team": "Engineering", "Reports To": "VP"}
    
    # Source
    url: Optional[str] = None
    source: Optional[str] = None  # linkedin, indeed, glassdoor, etc.


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
