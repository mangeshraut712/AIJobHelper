import trafilatura
import httpx
import re
import json
from typing import Optional
from urllib.parse import urlparse
from schemas import JobDescription
from services.ai_service import AIService

# Allowed domains for job extraction (SSRF protection)
ALLOWED_DOMAINS = frozenset([
    "linkedin.com", "www.linkedin.com",
    "indeed.com", "www.indeed.com",
    "glassdoor.com", "www.glassdoor.com",
    "lever.co", "jobs.lever.co",
    "greenhouse.io", "boards.greenhouse.io",
    "workday.com",
    "monster.com", "www.monster.com",
    "ziprecruiter.com", "www.ziprecruiter.com",
    "angel.co", "wellfound.com",
    "careers.google.com",
    "amazon.jobs",
    "microsoft.com", "careers.microsoft.com",
    "apple.com", "jobs.apple.com",
    "meta.com", "www.metacareers.com",
])

class JobService:
    def __init__(self, ai_service: AIService):
        self.ai_service = ai_service
    
    def _is_allowed_url(self, url: str) -> bool:
        """Validate URL against allowlist to prevent SSRF attacks"""
        try:
            parsed = urlparse(url)
            # Only allow http/https schemes
            if parsed.scheme not in ("http", "https"):
                return False
            domain = parsed.netloc.lower()
            # Strict allowlist check - no exceptions
            for allowed in ALLOWED_DOMAINS:
                if domain == allowed or domain.endswith("." + allowed):
                    return True
            return False  # Reject unlisted domains
        except Exception:
            return False
    
    async def _fetch_with_httpx(self, url: str) -> Optional[str]:
        """Fetch URL content using httpx with browser-like headers.
        
        Security: URL must be pre-validated by _is_allowed_url before calling this.
        """
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
        }
        try:
            async with httpx.AsyncClient(follow_redirects=True, timeout=30.0) as client:
                response = await client.get(url, headers=headers)
                response.raise_for_status()
                return response.text
        except httpx.HTTPError:
            return None
        except Exception:
            return None
    
    def _extract_text_from_html(self, html_content: str) -> str:
        """Extract readable text from HTML using trafilatura"""
        try:
            text = trafilatura.extract(html_content, include_comments=False, include_tables=True)
            if text:
                return text[:10000]
        except Exception:
            pass
        
        # Fallback: Use html.parser (safer than regex)
        try:
            from html.parser import HTMLParser
            
            class TextExtractor(HTMLParser):
                def __init__(self):
                    super().__init__()
                    self.text_parts = []
                    self.skip_tags = {'script', 'style', 'noscript'}
                    self.current_tag = None
                
                def handle_starttag(self, tag, attrs):
                    self.current_tag = tag.lower()
                
                def handle_endtag(self, tag):
                    self.current_tag = None
                
                def handle_data(self, data):
                    if self.current_tag not in self.skip_tags:
                        text = data.strip()
                        if text:
                            self.text_parts.append(text)
            
            parser = TextExtractor()
            parser.feed(html_content)
            return ' '.join(parser.text_parts)[:10000]
        except Exception:
            return ""

    async def extract_from_url(self, url: str) -> JobDescription:
        """Extract job details from a URL.
        
        Security: Only allowed domains can be fetched (SSRF protection).
        """
        # Security: Validate URL against allowlist
        if not self._is_allowed_url(url):
            return JobDescription(
                title="Unsupported Job Board",
                company="Unknown",
                description="This job board is not currently supported. Please copy and paste the job description manually, or use a supported job board (LinkedIn, Indeed, Glassdoor, Lever, Greenhouse, etc.).",
                requirements=["Manual entry required"],
                responsibilities=["Manual entry required"],
                url=url
            )
        
        content = None
        
        # Method 1: Try trafilatura's fetch (uses allowlisted URL)
        try:
            downloaded = trafilatura.fetch_url(url)
            if downloaded:
                content = trafilatura.extract(downloaded)
        except Exception:
            pass
        
        # Method 2: Fallback to httpx (URL already validated above)
        if not content:
            html_content = await self._fetch_with_httpx(url)
            if html_content:
                content = self._extract_text_from_html(html_content)
        
        # If still no content, return helpful message
        if not content or len(content.strip()) < 50:
            return JobDescription(
                title="Job from URL",
                company=self._extract_company_from_url(url),
                description=f"Could not extract content. Please visit: {url}",
                requirements=["See job posting for requirements"],
                responsibilities=["See job posting for responsibilities"],
                url=url
            )
        
        # Use AI to parse the content
        prompt = f"""Extract job details from the following text into JSON format.

CONTENT:
{content[:5000]}

Return ONLY valid JSON with these fields:
- title: string
- company: string  
- location: string or null
- salary_range: string or null
- description: string
- requirements: array of strings
- responsibilities: array of strings"""
        
        try:
            response_text = await self.ai_service.get_completion(
                prompt, 
                system_prompt="You are a job data extractor. Return only valid JSON."
            )
            
            # Extract JSON from response
            response_text = response_text.strip()
            json_match = re.search(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', response_text)
            if json_match:
                response_text = json_match.group()
            
            data = json.loads(response_text)
            
            return JobDescription(
                title=str(data.get("title", "Unknown Title"))[:200],
                company=str(data.get("company", "Unknown Company"))[:200],
                location=data.get("location"),
                salary_range=data.get("salary_range"),
                description=str(data.get("description", content[:500]))[:2000],
                requirements=data.get("requirements", [])[:20],
                responsibilities=data.get("responsibilities", [])[:20],
                url=url
            )
        except json.JSONDecodeError:
            pass
        except Exception:
            pass
        
        # Fallback with extracted content
        return JobDescription(
            title="Job Position",
            company=self._extract_company_from_url(url),
            description=content[:1000] if content else "No content available",
            requirements=["See job posting for details"],
            responsibilities=["See job posting for details"],
            url=url
        )
    
    def _extract_company_from_url(self, url: str) -> str:
        """Extract company name from URL domain"""
        try:
            parsed = urlparse(url)
            domain = parsed.netloc.replace("www.", "")
            company = domain.split(".")[0]
            return company.title()[:100]
        except Exception:
            return "Company"
