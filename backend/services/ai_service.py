import os
import json
import re
from openai import OpenAI
from typing import Dict, Any
from schemas import ResumeData, JobDescription

class AIService:
    def __init__(self):
        self.api_key = os.getenv("OPENROUTER_API_KEY", "")
        self.base_url = "https://openrouter.ai/api/v1"
        self.is_configured = bool(self.api_key and not self.api_key.startswith("sk-or-v1-dummy"))
        
        if self.is_configured:
            self.client = OpenAI(
                base_url=self.base_url,
                api_key=self.api_key,
            )
        else:
            self.client = None
            print("⚠️ OPENROUTER_API_KEY not configured. AI features will use mock data.")
            
        self.model = "google/gemini-2.0-flash-exp:free"

    async def get_completion(self, prompt: str, system_prompt: str = "You are a professional career coach and resume expert.") -> str:
        if not self.is_configured:
            return '{"error": "API key not configured"}'
            
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt},
                ],
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Error in AI Service: {e}")
            return str(e)

    async def enhance_resume(self, resume: ResumeData, job: JobDescription) -> Dict[str, Any]:
        if not self.is_configured:
            # Return mock enhancement
            return {
                "enhanced_resume": resume.dict(),
                "feedback": "AI enhancement requires API key. Your resume looks good!",
                "score": 85,
                "tailored_summary": resume.summary if resume.summary else "Experienced professional seeking new opportunities."
            }
            
        prompt = f"""
        Tailor the following resume to the job description below.
        
        RESUME:
        {json.dumps(resume.dict(), indent=2)}
        
        JOB DESCRIPTION:
        {json.dumps(job.dict(), indent=2)}
        
        Provide the output in JSON format with the following keys:
        - "enhanced_resume": (the updated resume data following the same structure)
        - "feedback": (detailed feedback on the changes made)
        - "score": (a score from 0-100 reflecting how well the resume matches the job)
        - "tailored_summary": (a new summary section specifically for this job)
        """
        
        response_text = await self.get_completion(prompt)
        try:
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()
            
            return json.loads(response_text)
        except Exception as e:
            return {"error": "Failed to parse AI response", "raw": response_text}

    async def generate_cover_letter(self, resume: ResumeData, job: JobDescription, template_type: str) -> str:
        if not self.is_configured:
            return f"""Dear Hiring Manager,

I am writing to express my interest in the {job.title} position at {job.company}. With my background and skills, I am confident I would be a valuable addition to your team.

{resume.summary if resume.summary else "I bring a strong set of skills and experience to this role."}

I look forward to the opportunity to discuss how I can contribute to your team.

Best regards,
{resume.name if resume.name else "Your Name"}"""
            
        prompt = f"""
        Write a professional cover letter for the following person applying for the following job.
        Template style: {template_type}
        
        RESUME:
        {json.dumps(resume.dict(), indent=2)}
        
        JOB DESCRIPTION:
        {json.dumps(job.dict(), indent=2)}
        
        The letter should be compelling, highlight relevant skills, and reflect the company culture if possible.
        """
        return await self.get_completion(prompt)

    async def generate_communication(self, resume: ResumeData, job: JobDescription, comm_type: str) -> str:
        # Mock responses for when API is not configured
        mock_responses = {
            "email": f"""Subject: Application for {job.title} Position

Dear Hiring Manager,

I am writing to express my strong interest in the {job.title} position at {job.company}. With my experience and skills, I believe I would be a great fit for your team.

I have attached my resume for your review and would welcome the opportunity to discuss how I can contribute to your organization.

Thank you for considering my application.

Best regards,
{resume.name if resume.name else "Your Name"}
{resume.email if resume.email else ""}""",
            
            "linkedin_message": f"Hi! I'm interested in the {job.title} role at {job.company}. I'd love to connect and learn more about the opportunity.",
            
            "follow_up": f"""Subject: Following Up - {job.title} Application

Dear Hiring Manager,

I wanted to follow up on my application for the {job.title} position at {job.company}. I remain very interested in this opportunity and would welcome the chance to discuss my qualifications.

Thank you for your consideration.

Best regards,
{resume.name if resume.name else "Your Name"}"""
        }
        
        if not self.is_configured:
            return mock_responses.get(comm_type, mock_responses["email"])
            
        prompts = {
            "email": "Write a professional email to the recruiter for this job.",
            "linkedin_message": "Write a concise LinkedIn connection request message (max 300 chars) for the hiring manager.",
            "follow_up": "Write a follow-up email to be sent 1 week after applying."
        }
        
        prompt = f"""
        {prompts.get(comm_type, "Write a professional message.")}
        
        RESUME:
        {json.dumps(resume.dict(), indent=2)}
        
        JOB DESCRIPTION:
        {json.dumps(job.dict(), indent=2)}
        """
        return await self.get_completion(prompt)

    async def parse_resume(self, text: str) -> Dict[str, Any]:
        """Parse resume text and extract structured data."""
        
        # Basic extraction using regex patterns (works without API)
        def extract_with_regex(text: str) -> Dict[str, Any]:
            result = {
                "name": "",
                "email": "",
                "phone": "",
                "linkedin": "",
                "website": "",
                "location": "",
                "summary": "",
                "experience": [],
                "education": [],
                "skills": []
            }
            
            # Extract email
            email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
            if email_match:
                result["email"] = email_match.group()
            
            # Extract phone
            phone_match = re.search(r'[\+\(]?[\d\s\-\(\)]{10,}', text)
            if phone_match:
                result["phone"] = phone_match.group().strip()
            
            # Extract LinkedIn
            linkedin_match = re.search(r'(?:linkedin\.com/in/|linkedin:?\s*)([a-zA-Z0-9\-_]+)', text, re.I)
            if linkedin_match:
                result["linkedin"] = f"linkedin.com/in/{linkedin_match.group(1)}"
            
            # Extract name (usually first line or before email)
            lines = text.split('\n')
            for line in lines[:5]:
                line = line.strip()
                if line and not '@' in line and not any(c.isdigit() for c in line[:3]):
                    if len(line) > 3 and len(line) < 50:
                        result["name"] = line
                        break
            
            # Extract skills (common patterns)
            skills_section = re.search(r'(?:skills|technical skills|technologies)[:\s]*([^\n]+(?:\n[^\n]+)*)', text, re.I)
            if skills_section:
                skills_text = skills_section.group(1)
                # Split by common delimiters
                potential_skills = re.split(r'[,\|•\n]', skills_text)
                result["skills"] = [s.strip() for s in potential_skills if s.strip() and len(s.strip()) < 30][:15]
            
            return result
        
        # First try regex extraction
        basic_data = extract_with_regex(text)
        
        # If API is not configured, return the basic extraction
        if not self.is_configured:
            return basic_data
            
        # Otherwise, use AI for better extraction
        prompt = f"""
        Extract structured data from the following resume text.
        Return the result as a JSON object that matches this structure:
        {{
            "name": "Full Name",
            "email": "email@example.com",
            "phone": "Phone Number",
            "linkedin": "LinkedIn profile link or username",
            "website": "Portfolio/Website link",
            "location": "City, State, Country",
            "summary": "Professional summary statement",
            "experience": [
                {{
                    "company": "Company Name",
                    "role": "Job Title",
                    "duration": "Start Date - End Date",
                    "description": "Key achievements and responsibilities"
                }}
            ],
            "education": [
                {{
                    "institution": "University Name",
                    "degree": "Degree and Major",
                    "graduation_year": YYYY
                }}
            ],
            "skills": ["Skill 1", "Skill 2"]
        }}

        RESUME TEXT:
        {text}
        
        Provide high-quality extraction. If a field is missing, use null or an empty list/string.
        """
        
        response_text = await self.get_completion(prompt, system_prompt="You are a JSON-only resume parser.")
        
        try:
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()
            
            return json.loads(response_text)
        except Exception as e:
            print(f"AI Parsing failed, using regex extraction: {e}")
            return basic_data
