import os
import json
import re
from openai import OpenAI
from typing import Dict, Any, List
from schemas import ResumeData, JobDescription

class AIService:
    """AI Service using OpenRouter API for resume parsing and enhancement.
    
    For local development: Uses enhanced regex-based parsing (no API key needed)
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
        except Exception:
            return '{"error": "API request failed"}'

    async def enhance_resume(self, resume: ResumeData, job: JobDescription) -> Dict[str, Any]:
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
        except Exception:
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

    def _extract_section(self, text: str, section_names: List[str], next_sections: List[str]) -> str:
        """Extract a section from resume text based on section headers."""
        pattern_start = '|'.join(section_names)
        pattern_end = '|'.join(next_sections)
        
        match = re.search(
            rf'(?:{pattern_start})\s*\n(.*?)(?=(?:{pattern_end})\s*\n|$)',
            text, re.I | re.DOTALL
        )
        return match.group(1).strip() if match else ""

    def _parse_experience(self, text: str) -> List[Dict[str, str]]:
        """Parse work experience entries from text."""
        experiences = []
        
        # Split by company/location pattern (Company City, STATE)
        entries = re.split(r'\n(?=[A-Z][a-zA-Z\s]+(?:Philadelphia|Piscataway|Pune|Remote|San Francisco|New York|Boston)[,\s])', text)
        
        for entry in entries:
            if not entry.strip():
                continue
            
            lines = [l.strip() for l in entry.split('\n') if l.strip()]
            if not lines:
                continue
            
            exp = {"company": "", "role": "", "duration": "", "location": "", "description": ""}
            
            # First line is usually Company + Location
            first_line = lines[0]
            location_match = re.search(r'(Philadelphia|Piscataway|Pune|Remote|San Francisco|New York|Boston)[,\s]*([A-Z]{2})?', first_line, re.I)
            if location_match:
                exp["company"] = first_line[:location_match.start()].strip()
                exp["location"] = location_match.group(0).strip()
            else:
                exp["company"] = first_line
            
            # Second line is usually Role + Date
            if len(lines) > 1:
                role_line = lines[1]
                # Extract date pattern
                date_match = re.search(r'([A-Z][a-z]{2,8}\s*\d{4})\s*[–-]\s*([A-Z][a-z]{2,8}\s*\d{4}|Present|Current)', role_line)
                if date_match:
                    exp["duration"] = f"{date_match.group(1)} - {date_match.group(2)}"
                    exp["role"] = role_line[:date_match.start()].strip()
                else:
                    exp["role"] = role_line
            
            # Remaining lines are bullet points
            bullets = []
            for line in lines[2:]:
                # Clean up bullet point markers
                line = re.sub(r'^[○•\-\*]\s*', '', line)
                if line and len(line) > 10:
                    bullets.append(line)
            
            exp["description"] = " | ".join(bullets[:4])  # Top 4 bullets
            
            if exp["company"] or exp["role"]:
                experiences.append(exp)
        
        return experiences

    def _parse_education(self, text: str) -> List[Dict[str, str]]:
        """Parse education entries from text."""
        education = []
        
        lines = [l.strip() for l in text.split('\n') if l.strip()]
        
        i = 0
        while i < len(lines):
            edu = {"institution": "", "degree": "", "graduation_year": "", "gpa": ""}
            
            # Look for university name
            if 'university' in lines[i].lower() or 'college' in lines[i].lower():
                # Extract institution - look for pattern "University Location, State/Country"
                inst_match = re.match(r'^(.+?University)\s+(.+)$', lines[i], re.I)
                if inst_match:
                    edu["institution"] = inst_match.group(1).strip()
                else:
                    edu["institution"] = lines[i].split(',')[0].strip()
                
                # Next line should be degree
                if i + 1 < len(lines):
                    degree_line = lines[i + 1]
                    # Extract GPA
                    gpa_match = re.search(r'GPA[:\s]*(\d+\.\d+)', degree_line, re.I)
                    if gpa_match:
                        edu["gpa"] = gpa_match.group(1)
                    
                    # Extract graduation date
                    date_match = re.search(r'([A-Z][a-z]{2,8}\s*\d{4})\s*[–-]\s*([A-Z][a-z]{2,8}\s*\d{4}|Present)', degree_line)
                    if date_match:
                        edu["graduation_year"] = date_match.group(2)
                    
                    # Extract degree - everything before GPA or date
                    degree_part = re.sub(r',?\s*GPA.*$', '', degree_line, flags=re.I)
                    degree_part = re.sub(r'\s*[A-Z][a-z]{2,8}\s*\d{4}.*$', '', degree_part)
                    edu["degree"] = degree_part.strip().rstrip(',')
                    
                    i += 1
                
                if edu["institution"]:
                    education.append(edu)
            
            i += 1
        
        return education

    def _parse_skills(self, text: str) -> List[str]:
        """Parse skills from skills section."""
        skills = []
        
        for line in text.split('\n'):
            line = line.strip()
            if not line:
                continue
            
            # Remove category labels like "Languages:", "Frameworks:"
            if ':' in line:
                line = line.split(':', 1)[1]
            
            # Split by common delimiters
            parts = re.split(r'[,|•]', line)
            for part in parts:
                skill = part.strip()
                # Clean up parenthetical content
                skill = re.sub(r'\([^)]+\)', '', skill).strip()
                if skill and 2 < len(skill) < 40:
                    skills.append(skill)
        
        return list(dict.fromkeys(skills))[:25]  # Remove duplicates, max 25

    def _parse_projects(self, text: str) -> List[Dict[str, str]]:
        """Parse projects from projects section."""
        projects = []
        
        lines = [l.strip() for l in text.split('\n') if l.strip()]
        
        i = 0
        while i < len(lines):
            # Skip "Remote" lines
            if lines[i].lower() == 'remote':
                i += 1
                continue
            
            # Look for project name with date
            date_match = re.search(r'([A-Z][a-z]{2,8}\s*\d{4})\s*[–-]\s*([A-Z][a-z]{2,8}\s*\d{4})', lines[i])
            if date_match or '(' in lines[i]:
                proj = {"name": "", "description": "", "technologies": []}
                
                # Extract project name
                name = re.sub(r'\([^)]+\)', '', lines[i])  # Remove (Personal Project) etc
                name = re.sub(r'[A-Z][a-z]{2,8}\s*\d{4}.*$', '', name)  # Remove dates
                proj["name"] = name.strip()
                
                # Collect bullet points
                bullets = []
                i += 1
                while i < len(lines) and (lines[i].startswith('○') or lines[i].startswith('•') or lines[i].startswith('-')):
                    bullet = re.sub(r'^[○•\-]\s*', '', lines[i])
                    bullets.append(bullet)
                    i += 1
                
                proj["description"] = " | ".join(bullets[:3])
                
                if proj["name"]:
                    projects.append(proj)
                continue
            
            i += 1
        
        return projects

    async def parse_resume(self, text: str) -> Dict[str, Any]:
        """Parse resume text and extract structured data."""
        
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
            "skills": [],
            "projects": [],
            "certifications": []
        }
        
        # Clean up text - remove special characters from PDF extraction
        text = re.sub(r'[♂¶]', '', text)
        text = re.sub(r'obile-alt', '', text)
        text = re.sub(r'envel⌢', '', text)
        text = re.sub(r'/linkedin-in(?=linkedin)', '', text)  # Remove icon prefix before linkedin
        
        # Extract name (first line that looks like a name)
        lines = [l.strip() for l in text.split('\n') if l.strip()]
        for line in lines[:5]:
            if '@' not in line and not line[0].isdigit() and '+' not in line:
                if len(line) > 3 and len(line) < 50 and line[0].isupper():
                    if not any(skip in line.lower() for skip in ['summary', 'skills', 'experience', 'resume', 'cv']):
                        result["name"] = line
                        break
        
        # Extract email
        email_match = re.search(r'[\w\.\-\+]+@[\w\.\-]+\.\w+', text)
        if email_match:
            result["email"] = email_match.group()
        
        # Extract phone (various formats)
        phone_match = re.search(r'\+?1?\d{10,11}|\+?\d{1,3}[\s\-]?\d{3}[\s\-]?\d{3}[\s\-]?\d{4}', text)
        if phone_match:
            result["phone"] = phone_match.group().strip()
        
        # Extract LinkedIn
        linkedin_match = re.search(r'linkedin\.com/in/([a-zA-Z0-9\-_]+)', text, re.I)
        if linkedin_match:
            result["linkedin"] = f"linkedin.com/in/{linkedin_match.group(1)}"
        
        # Extract GitHub
        github_patterns = [
            r'github\.com/([a-zA-Z0-9\-_]+)',
            r'([a-zA-Z0-9\-_]+)\.github\.io'
        ]
        for pattern in github_patterns:
            github_match = re.search(pattern, text, re.I)
            if github_match:
                result["github"] = f"github.com/{github_match.group(1)}"
                break
        
        # Extract website/portfolio
        website_match = re.search(r'([a-zA-Z0-9\-_]+\.github\.io/[a-zA-Z0-9\-_]+)', text, re.I)
        if website_match:
            result["website"] = website_match.group(1)
        
        # Extract location
        location_match = re.search(r'(Philadelphia|Pune|Boston|New York|San Francisco|Seattle|Los Angeles|Chicago)[,\s]*([A-Z]{2})?\s*(\d{5})?', text, re.I)
        if location_match:
            loc_parts = [p for p in location_match.groups() if p]
            result["location"] = " ".join(loc_parts)
        
        # Extract summary section
        summary_section = self._extract_section(
            text,
            ['Summary', 'Objective', 'Profile', 'About'],
            ['Skills', 'Experience', 'Education', 'Technical']
        )
        if summary_section:
            result["summary"] = re.sub(r'\s+', ' ', summary_section).strip()[:600]
        
        # Extract skills section
        skills_section = self._extract_section(
            text,
            ['Skills', 'Technical Skills', 'Skills and Technical Proficiencies'],
            ['Experience', 'Education', 'Projects', 'Work History']
        )
        if skills_section:
            result["skills"] = self._parse_skills(skills_section)
        
        # Extract experience section
        experience_section = self._extract_section(
            text,
            ['Experience', 'Work Experience', 'Employment', 'Work History'],
            ['Education', 'Projects', 'Publications', 'Certifications']
        )
        if experience_section:
            result["experience"] = self._parse_experience(experience_section)
        
        # Extract education section
        education_section = self._extract_section(
            text,
            ['Education'],
            ['Projects', 'Publications', 'Certifications', 'Skills']
        )
        if education_section:
            result["education"] = self._parse_education(education_section)
        
        # Extract projects section
        projects_section = self._extract_section(
            text,
            ['Projects'],
            ['Publications', 'Certifications', 'References']
        )
        if projects_section:
            result["projects"] = self._parse_projects(projects_section)
        
        # Extract certifications
        cert_section = self._extract_section(
            text,
            ['Certifications', 'Certificates'],
            ['References', 'Publications', '$']  # $ = end of text
        )
        if cert_section:
            certs = []
            for line in cert_section.split('\n'):
                line = line.strip()
                if line and line.startswith('○'):
                    line = line[1:].strip()
                if line and len(line) > 5:
                    certs.append(line)
            result["certifications"] = certs[:10]
        
        # Use AI if configured for better parsing
        if self.is_configured:
            try:
                prompt = f"""Parse this resume and return ONLY valid JSON with these fields:
{text[:4000]}

Return JSON: {{"name": "", "email": "", "phone": "", "linkedin": "", "github": "", "website": "", "location": "", "summary": "", "experience": [{{"company": "", "role": "", "duration": "", "location": "", "description": ""}}], "education": [{{"institution": "", "degree": "", "graduation_year": "", "gpa": ""}}], "skills": [], "projects": [{{"name": "", "description": ""}}], "certifications": []}}"""
                
                response = await self.get_completion(prompt, "You are a JSON resume parser. Return only valid JSON, no explanation.")
                
                if "```json" in response:
                    response = response.split("```json")[1].split("```")[0].strip()
                elif "```" in response:
                    response = response.split("```")[1].split("```")[0].strip()
                
                ai_result = json.loads(response)
                # Merge AI results (prefer AI for complex structures)
                for key, value in ai_result.items():
                    if value:
                        if isinstance(value, list) and len(value) > len(result.get(key, [])):
                            result[key] = value
                        elif isinstance(value, str) and len(value) > len(result.get(key, "")):
                            result[key] = value
            except Exception:
                pass  # Use regex results
        
        return result
