import trafilatura
import httpx
import re
import json
from typing import Optional
from schemas import JobDescription
from services.ai_service import AIService

class JobService:
    def __init__(self, ai_service: AIService):
        self.ai_service = ai_service
    
    async def _fetch_with_httpx(self, url: str) -> Optional[str]:
        """Fetch URL content using httpx with browser-like headers"""
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Accept-Encoding": "gzip, deflate, br",
            "DNT": "1",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
        }
        try:
            async with httpx.AsyncClient(follow_redirects=True, timeout=30.0) as client:
                response = await client.get(url, headers=headers)
                response.raise_for_status()
                return response.text
        except Exception as e:
            print(f"httpx fetch failed: {e}")
            return None
    
    def _extract_text_from_html(self, html: str) -> str:
        """Extract readable text from HTML using trafilatura or fallback to regex"""
        try:
            # Try trafilatura first
            text = trafilatura.extract(html, include_comments=False, include_tables=True)
            if text:
                return text
        except Exception:
            pass
        
        # Fallback: Basic HTML tag removal
        try:
            # Remove script and style elements
            html = re.sub(r'<script[^>]*>.*?</script>', '', html, flags=re.DOTALL | re.IGNORECASE)
            html = re.sub(r'<style[^>]*>.*?</style>', '', html, flags=re.DOTALL | re.IGNORECASE)
            # Remove HTML tags
            text = re.sub(r'<[^>]+>', ' ', html)
            # Clean up whitespace
            text = re.sub(r'\s+', ' ', text).strip()
            # Decode HTML entities
            import html as html_module
            text = html_module.unescape(text)
            return text[:10000]  # Limit text length
        except Exception:
            return ""

    async def extract_from_url(self, url: str) -> JobDescription:
        """Extract job details from a URL"""
        content = None
        
        # Method 1: Try trafilatura's fetch
        try:
            downloaded = trafilatura.fetch_url(url)
            if downloaded:
                content = trafilatura.extract(downloaded)
        except Exception as e:
            print(f"Trafilatura fetch failed: {e}")
        
        # Method 2: Fallback to httpx
        if not content:
            html = await self._fetch_with_httpx(url)
            if html:
                content = self._extract_text_from_html(html)
        
        # If still no content, return partial data with URL
        if not content or len(content.strip()) < 50:
            return JobDescription(
                title="Job from URL",
                company="Company",
                description=f"Please visit the job posting directly: {url}",
                requirements=["See job posting for requirements"],
                responsibilities=["See job posting for responsibilities"],
                url=url
            )
        
        # Use AI to parse the unstructured content into our JobDescription schema
        prompt = f"""Extract job details from the following text into a structured JSON format.
URL: {url}

CONTENT:
{content[:5000]}

Return ONLY valid JSON (no markdown, no explanation) with these fields:
- title: string (job title)
- company: string (company name)
- location: string or null
- salary_range: string or null
- description: string (job description summary)
- requirements: array of strings (job requirements/qualifications)
- responsibilities: array of strings (job duties)

If a field cannot be determined, use a sensible default or null."""
        
        try:
            response_text = await self.ai_service.get_completion(
                prompt, 
                system_prompt="You are a job posting data extractor. Return only valid JSON, no markdown or explanation."
            )
            
            # Clean up response
            response_text = response_text.strip()
            if response_text.startswith("```"):
                # Remove markdown code blocks
                lines = response_text.split("\n")
                json_lines = []
                in_block = False
                for line in lines:
                    if line.startswith("```"):
                        in_block = not in_block
                        continue
                    if in_block or not response_text.startswith("```"):
                        json_lines.append(line)
                response_text = "\n".join(json_lines)
            
            # Find JSON object in response
            json_match = re.search(r'\{[\s\S]*\}', response_text)
            if json_match:
                response_text = json_match.group()
            
            data = json.loads(response_text)
            
            # Ensure required fields exist
            return JobDescription(
                title=data.get("title", "Unknown Title"),
                company=data.get("company", "Unknown Company"),
                location=data.get("location"),
                salary_range=data.get("salary_range"),
                description=data.get("description", content[:500]),
                requirements=data.get("requirements", []),
                responsibilities=data.get("responsibilities", []),
                url=url
            )
        except Exception as e:
            print(f"AI parsing failed: {e}")
            # Fallback with extracted content
            return JobDescription(
                title=self._extract_title_from_content(content),
                company=self._extract_company_from_url(url),
                description=content[:1000] if content else "No content available",
                requirements=["See job posting for details"],
                responsibilities=["See job posting for details"],
                url=url
            )
    
    def _extract_title_from_content(self, content: str) -> str:
        """Try to extract job title from content"""
        # Common patterns for job titles
        patterns = [
            r'(?:job title|position|role)[\s:]+([^\n]+)',
            r'^([A-Z][a-z]+ (?:Engineer|Developer|Manager|Designer|Analyst)[^\n]*)',
        ]
        for pattern in patterns:
            match = re.search(pattern, content, re.IGNORECASE | re.MULTILINE)
            if match:
                return match.group(1).strip()[:100]
        return "Job Position"
    
    def _extract_company_from_url(self, url: str) -> str:
        """Extract company name from URL domain"""
        try:
            from urllib.parse import urlparse
            parsed = urlparse(url)
            domain = parsed.netloc.replace("www.", "")
            # Remove TLD
            company = domain.split(".")[0]
            return company.title()
        except Exception:
            return "Company"
