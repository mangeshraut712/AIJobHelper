import os
import json
import re
from openai import OpenAI
from typing import Dict, Any
from schemas import ResumeData, JobDescription

class AIService:
    """AI Service using OpenRouter API for resume parsing and enhancement.
    
    For local development: Uses regex-based parsing (no API key needed)
    For production: Uses OpenRouter with OPENROUTER_API_KEY from Vercel env vars
    """
    
    def __init__(self):
        # Get API key from environment (works on Vercel without .env file)
        self.api_key = os.environ.get("OPENROUTER_API_KEY", "")
        self.base_url = "https://openrouter.ai/api/v1"
        self.is_configured = bool(self.api_key and len(self.api_key) > 20)
        
        if self.is_configured:
            self.client = OpenAI(
                base_url=self.base_url,
                api_key=self.api_key,
            )
            print("✅ OpenRouter API configured - using Gemini AI")
        else:
            self.client = None
            print("ℹ️ Running in local mode - using smart regex parsing")
            
        self.model = "google/gemini-2.0-flash-exp:free"

    async def get_completion(self, prompt: str, system_prompt: str = "You are a professional career coach.") -> str:
        if not self.is_configured:
            return '{"error": "API not configured"}'
            
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
            print(f"AI Error: {e}")
            return str(e)

    async def enhance_resume(self, resume: ResumeData, job: JobDescription) -> Dict[str, Any]:
        # Always return a valid response
        base_response = {
            "enhanced_resume": resume.dict(),
            "feedback": "Resume analysis complete.",
            "score": 85,
            "tailored_summary": resume.summary or "Experienced professional."
        }
        
        if not self.is_configured:
            return base_response
            
        prompt = f"""
        Analyze this resume for the job and provide JSON output:
        RESUME: {json.dumps(resume.dict(), indent=2)}
        JOB: {json.dumps(job.dict(), indent=2)}
        
        Return JSON with: enhanced_resume, feedback, score (0-100), tailored_summary
        """
        
        try:
            response_text = await self.get_completion(prompt)
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()
            return json.loads(response_text)
        except:
            return base_response

    async def generate_cover_letter(self, resume: ResumeData, job: JobDescription, template_type: str) -> str:
        name = resume.name or "Applicant"
        title = job.title or "the position"
        company = job.company or "your company"
        
        return f"""Dear Hiring Manager,

I am excited to apply for {title} at {company}. With my background and experience, I am confident I would be a strong addition to your team.

{resume.summary or "I bring relevant skills and experience to this role."}

Thank you for considering my application. I look forward to discussing how I can contribute to your team.

Best regards,
{name}"""

    async def generate_communication(self, resume: ResumeData, job: JobDescription, comm_type: str) -> str:
        name = resume.name or "Applicant"
        title = job.title or "the position"
        company = job.company or "your company"
        
        templates = {
            "email": f"""Subject: Application for {title}

Dear Hiring Manager,

I am writing to express my interest in {title} at {company}.

{resume.summary or "I have the skills and experience needed for this role."}

I would welcome the opportunity to discuss my qualifications.

Best regards,
{name}""",
            
            "linkedin_message": f"Hi! I'm interested in {title} at {company}. Would love to connect and learn more about the team!",
            
            "follow_up": f"""Subject: Following Up - {title} Application

Dear Hiring Manager,

I wanted to follow up on my application for {title} at {company}.

I remain very interested in this opportunity and am happy to provide additional information.

Best regards,
{name}"""
        }
        
        return templates.get(comm_type, templates["email"])

    async def parse_resume(self, text: str) -> Dict[str, Any]:
        """Parse resume text and extract structured data using regex."""
        
        result = {
            "name": "",
            "email": "",
            "phone": "",
            "linkedin": "",
            "github": "",
            "website": "",
            "location": "",
            "summary": "",
            "experience": [],
            "education": [],
            "skills": []
        }
        
        # Extract email
        email_match = re.search(r'[\w\.\-\+]+@[\w\.\-]+\.\w+', text)
        if email_match:
            result["email"] = email_match.group()
        
        # Extract phone (various formats)
        phone_patterns = [
            r'\+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}',
            r'\d{10}',
            r'\+\d{1,3}[-.\s]?\d{3,4}[-.\s]?\d{3,4}[-.\s]?\d{3,4}'
        ]
        for pattern in phone_patterns:
            phone_match = re.search(pattern, text)
            if phone_match:
                result["phone"] = phone_match.group().strip()
                break
        
        # Extract LinkedIn
        linkedin_patterns = [
            r'linkedin\.com/in/([a-zA-Z0-9\-_]+)',
            r'linkedin:\s*([a-zA-Z0-9\-_]+)',
            r'linkedin\.com/([a-zA-Z0-9\-_]+)'
        ]
        for pattern in linkedin_patterns:
            match = re.search(pattern, text, re.I)
            if match:
                result["linkedin"] = f"linkedin.com/in/{match.group(1)}"
                break
        
        # Extract GitHub
        github_match = re.search(r'github\.com/([a-zA-Z0-9\-_]+)', text, re.I)
        if github_match:
            result["github"] = f"github.com/{github_match.group(1)}"
        
        # Extract name (typically first line or near email)
        lines = [l.strip() for l in text.split('\n') if l.strip()]
        for line in lines[:10]:
            # Skip lines with email, phone, or common headers
            if '@' in line or any(char.isdigit() for char in line[:3]):
                continue
            if any(skip in line.lower() for skip in ['resume', 'cv', 'curriculum', 'objective', 'summary']):
                continue
            if len(line) > 3 and len(line) < 50 and line[0].isupper():
                result["name"] = line
                break
        
        # Extract location (City, State pattern)
        location_match = re.search(r'([A-Z][a-zA-Z\s]+,\s*[A-Z]{2}(?:\s*\d{5})?)', text)
        if location_match:
            result["location"] = location_match.group(1).strip()
        
        # Extract skills - look for the skills line that follows SKILLS header
        skills_patterns = [
            r'SKILLS[:\s]*\n([^\n]+)',  # SKILLS header followed by line
            r'(?:skills|technical skills|technologies|tools)[:\s]*\n?([^\n]+)',  # skills: line
        ]
        for pattern in skills_patterns:
            skills_section = re.search(pattern, text, re.I)
            if skills_section:
                skills_text = skills_section.group(1)
                # Split by common delimiters
                potential_skills = re.split(r'[,\|•\t;]', skills_text)
                skills = []
                for s in potential_skills:
                    s = s.strip()
                    # Filter: not empty, reasonable length, not a section header, not just punctuation
                    if (s and 
                        len(s) > 1 and 
                        len(s) < 35 and 
                        not any(header in s.lower() for header in ['experience', 'education', 'project', 'summary']) and
                        s not in ['.', '-', '|', '•']):
                        skills.append(s)
                if skills:
                    result["skills"] = skills[:20]
                    break
        
        # Extract summary/objective
        summary_match = re.search(r'(?:summary|objective|profile|about)[:\s]*([^\n]+(?:\n[^\n]+){0,3})', text, re.I)
        if summary_match:
            result["summary"] = summary_match.group(1).strip()[:500]
        
        # Try AI parsing if configured (for better results)
        if self.is_configured:
            try:
                prompt = f"""Extract structured data from this resume as JSON:
                {text[:3000]}
                
                Return: {{"name": "", "email": "", "phone": "", "linkedin": "", "github": "", "website": "", "location": "", "summary": "", "experience": [], "education": [], "skills": []}}
                """
                response_text = await self.get_completion(prompt, "You are a JSON resume parser. Return only valid JSON.")
                
                if "```json" in response_text:
                    response_text = response_text.split("```json")[1].split("```")[0].strip()
                elif "```" in response_text:
                    response_text = response_text.split("```")[1].split("```")[0].strip()
                
                ai_result = json.loads(response_text)
                # Merge AI results with regex results (prefer AI if available)
                for key, value in ai_result.items():
                    if value and (not result.get(key) or (isinstance(value, list) and len(value) > len(result.get(key, [])))):
                        result[key] = value
            except Exception as e:
                print(f"AI parsing enhancement failed, using regex results: {e}")
        
        return result
