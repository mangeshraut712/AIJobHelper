import trafilatura
from bs4 import BeautifulSoup
import json
from schemas import JobDescription
from services.ai_service import AIService

class JobService:
    def __init__(self, ai_service: AIService):
        self.ai_service = ai_service

    async def extract_from_url(self, url: str) -> JobDescription:
        downloaded = trafilatura.fetch_url(url)
        if not downloaded:
            raise Exception("Could not download content from URL")
        
        content = trafilatura.extract(downloaded)
        
        # Use AI to parse the unstructured content into our JobDescription schema
        prompt = f"""
        Extract job details from the following text into a structured JSON format.
        URL: {url}
        CONTENT:
        {content}
        
        The JSON should have:
        - title
        - company
        - location
        - salary_range
        - description
        - requirements (list of strings)
        - responsibilities (list of strings)
        """
        
        response_text = await self.ai_service.get_completion(prompt, system_prompt="You are a data extraction specialist.")
        
        try:
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()
            
            data = json.loads(response_text)
            return JobDescription(**data, url=url)
        except Exception as e:
            # Fallback or partial data
            return JobDescription(
                title="Unknown Title",
                company="Unknown Company",
                description=content[:1000] if content else "No content",
                requirements=[],
                responsibilities=[],
                url=url
            )
