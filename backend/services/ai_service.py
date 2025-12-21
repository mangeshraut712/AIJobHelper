import os
import json
from openai import OpenAI
from typing import Dict, Any
from schemas import ResumeData, JobDescription

class AIService:
    def __init__(self):
        self.api_key = os.getenv("OPENROUTER_API_KEY") or "sk-or-v1-dummy-key-for-demo"
        self.base_url = "https://openrouter.ai/api/v1"
        self.client = OpenAI(
            base_url=self.base_url,
            api_key=self.api_key,
        )
        self.model = "google/gemini-2.0-flash-exp:free" # Use highest capability free model

    async def get_completion(self, prompt: str, system_prompt: str = "You are a professional career coach and resume expert.") -> str:
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
        # Attempt to parse JSON from response
        try:
            # Clean response if it contains markdown code blocks
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()
            
            return json.loads(response_text)
        except Exception as e:
            return {"error": "Failed to parse AI response", "raw": response_text}

    async def generate_cover_letter(self, resume: ResumeData, job: JobDescription, template_type: str) -> str:
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
            print(f"Parsing error: {e}")
            return {"error": "Failed to parse resume", "raw": response_text}
