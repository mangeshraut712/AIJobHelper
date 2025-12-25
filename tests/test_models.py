"""
OpenRouter Free Models Evaluation for Resume Enhancement
Tests multiple free models with different temperature settings
for ATS scoring and resume optimization.
"""

import os
import json
import asyncio
import httpx
from datetime import datetime

# Sample resume and job for testing
SAMPLE_RESUME = {
    "name": "John Developer",
    "email": "john@example.com",
    "phone": "555-1234",
    "summary": "Software engineer with 5 years of experience building web applications",
    "skills": ["Python", "JavaScript", "React", "SQL"],
    "experience": [
        {
            "role": "Senior Developer",
            "company": "TechCorp",
            "duration": "2020-2023",
            "description": "Built web apps and worked on projects"
        }
    ],
    "education": [
        {
            "institution": "MIT",
            "degree": "BS Computer Science",
            "graduation_year": "2020"
        }
    ]
}

SAMPLE_JOB = {
    "title": "Senior Software Engineer",
    "company": "TikTok",
    "description": "Build great products using modern technologies. Work with distributed systems and cloud infrastructure.",
    "requirements": ["5+ years experience", "Python", "Strong CS fundamentals", "AWS experience"],
    "skills": ["Python", "Java", "Go", "AWS", "Kubernetes", "Docker", "TypeScript", "React"]
}

# Free models to test on OpenRouter
FREE_MODELS = [
    # Latest DeepSeek models
    "nex-agi/deepseek-v3.1-nex-n1:free",
    "deepseek/deepseek-chat-v3-0324:free",
    "deepseek/deepseek-r1-zero:free",
    
    # Google Gemini models
    "google/gemini-2.0-flash-exp:free",
    "google/gemini-2.5-pro-exp-03-25:free",
    "google/gemma-2-9b-it:free",
    
    # Moonshot AI
    "moonshotai/kimi-k2:free",
    "moonshotai/kimi-vl-a3b-thinking:free",
    
    # Meta Llama
    "meta-llama/llama-3.3-70b-instruct:free",
    "meta-llama/llama-4-maverick:free",
    
    # OpenAI Open Source
    "openai/gpt-oss-120b:free",
    
    # Mistral
    "mistralai/mistral-small-3.1-24b-instruct:free",
    "mistralai/devstral-2-2512:free",
    
    # Other top performers
    "nvidia/nemotron-3-nano-30b-a3b:free",
    "zhipu-ai/glm-4.5-air:free",
    "arcee-ai/trinity-mini:free",
    "qwen/qwen3-coder-480b-a35b:free",
]

TEMPERATURES = [0.1, 0.2, 0.3]

class ModelTester:
    def __init__(self):
        self.api_key = os.environ.get("OPENROUTER_API_KEY", "")
        self.base_url = "https://openrouter.ai/api/v1/chat/completions"
        self.results = []
        
    async def test_model(self, model: str, temperature: float) -> dict:
        """Test a single model with given temperature."""
        prompt = f"""As an expert career coach and ATS optimization specialist, analyze this resume for the job and provide improvements.

JOB: {SAMPLE_JOB['title']} at {SAMPLE_JOB['company']}
Required Skills: {', '.join(SAMPLE_JOB['skills'][:8])}
Key Requirements: {SAMPLE_JOB['description']}

CANDIDATE PROFILE:
- Summary: {SAMPLE_RESUME['summary']}
- Skills: {', '.join(SAMPLE_RESUME['skills'])}
- Experience: {SAMPLE_RESUME['experience'][0]['description']}

Generate a JSON response with:
1. "ats_score": Estimated ATS compatibility score (0-100)
2. "enhanced_summary": A powerful 2-3 sentence professional summary tailored for this role
3. "experience_bullets": Array of 3 impactful bullet points with metrics for the experience
4. "missing_skills": Array of skills to add from the job requirements
5. "keyword_optimization": Score (0-100) for how well keywords are used

Return ONLY valid JSON, no explanation."""

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                start_time = datetime.now()
                response = await client.post(
                    self.base_url,
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": model,
                        "temperature": temperature,
                        "messages": [
                            {"role": "system", "content": "You are an expert resume writer and ATS optimization specialist. Return valid JSON only."},
                            {"role": "user", "content": prompt}
                        ]
                    }
                )
                end_time = datetime.now()
                latency_ms = (end_time - start_time).total_seconds() * 1000
                
                if response.status_code == 200:
                    data = response.json()
                    content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
                    
                    # Try to parse JSON from response
                    try:
                        # Clean up response
                        if "```json" in content:
                            content = content.split("```json")[1].split("```")[0].strip()
                        elif "```" in content:
                            content = content.split("```")[1].split("```")[0].strip()
                        
                        parsed = json.loads(content)
                        
                        return {
                            "model": model,
                            "temperature": temperature,
                            "success": True,
                            "latency_ms": latency_ms,
                            "ats_score": parsed.get("ats_score", 0),
                            "has_summary": bool(parsed.get("enhanced_summary")),
                            "has_bullets": len(parsed.get("experience_bullets", [])) > 0,
                            "bullet_count": len(parsed.get("experience_bullets", [])),
                            "missing_skills_count": len(parsed.get("missing_skills", [])),
                            "keyword_score": parsed.get("keyword_optimization", 0),
                            "summary_length": len(parsed.get("enhanced_summary", "")),
                            "raw_response": parsed,
                        }
                    except json.JSONDecodeError:
                        return {
                            "model": model,
                            "temperature": temperature,
                            "success": False,
                            "error": "Invalid JSON response",
                            "latency_ms": latency_ms,
                            "raw_content": content[:500],
                        }
                else:
                    return {
                        "model": model,
                        "temperature": temperature,
                        "success": False,
                        "error": f"HTTP {response.status_code}: {response.text[:200]}",
                        "latency_ms": latency_ms,
                    }
        except Exception as e:
            return {
                "model": model,
                "temperature": temperature,
                "success": False,
                "error": str(e),
            }
    
    async def run_tests(self, models: list = None, temperatures: list = None):
        """Run tests on all specified models and temperatures."""
        models = models or FREE_MODELS
        temperatures = temperatures or TEMPERATURES
        
        print(f"\n{'='*80}")
        print(f"OpenRouter Free Models Evaluation for Resume Enhancement")
        print(f"Testing {len(models)} models x {len(temperatures)} temperatures")
        print(f"{'='*80}\n")
        
        for model in models:
            for temp in temperatures:
                print(f"Testing: {model} (temp={temp})...", end=" ", flush=True)
                result = await self.test_model(model, temp)
                self.results.append(result)
                
                if result.get("success"):
                    print(f"✅ ATS: {result.get('ats_score', 'N/A')}%, Latency: {result.get('latency_ms', 0):.0f}ms")
                else:
                    print(f"❌ {result.get('error', 'Unknown error')[:50]}")
                
                # Small delay to respect rate limits
                await asyncio.sleep(0.5)
        
        return self.results
    
    def generate_report(self):
        """Generate a summary report ranking the models."""
        successful = [r for r in self.results if r.get("success")]
        
        if not successful:
            print("\n❌ No successful tests to report")
            return
        
        # Score each result
        for result in successful:
            score = 0
            score += result.get("ats_score", 0) * 0.3  # 30% weight for ATS score
            score += result.get("keyword_score", 0) * 0.2  # 20% weight for keyword optimization
            score += min(result.get("bullet_count", 0) * 10, 30)  # 30% for bullet quality
            score += min(result.get("summary_length", 0) / 10, 20)  # 20% for summary quality
            # Prefer lower latency
            latency_penalty = min(result.get("latency_ms", 10000) / 1000, 10)
            score -= latency_penalty
            result["total_score"] = score
        
        # Sort by total score
        ranked = sorted(successful, key=lambda x: x.get("total_score", 0), reverse=True)
        
        print(f"\n{'='*80}")
        print(f"RANKING REPORT - Top Performing Free Models")
        print(f"{'='*80}\n")
        
        print(f"{'Rank':<5} {'Model':<45} {'Temp':<6} {'ATS':<6} {'Keywords':<10} {'Bullets':<8} {'Score':<8} {'Latency':<10}")
        print("-" * 100)
        
        for i, result in enumerate(ranked[:15], 1):
            model_short = result['model'][:43] if len(result['model']) > 43 else result['model']
            print(f"{i:<5} {model_short:<45} {result['temperature']:<6} {result.get('ats_score', 'N/A'):<6} {result.get('keyword_score', 'N/A'):<10} {result.get('bullet_count', 0):<8} {result.get('total_score', 0):.1f:<8} {result.get('latency_ms', 0):.0f}ms")
        
        # Recommend the best
        if ranked:
            best = ranked[0]
            print(f"\n{'='*80}")
            print(f"🏆 RECOMMENDED MODEL: {best['model']}")
            print(f"   Temperature: {best['temperature']}")
            print(f"   ATS Score: {best.get('ats_score', 'N/A')}%")
            print(f"   Keyword Optimization: {best.get('keyword_score', 'N/A')}%")
            print(f"   Latency: {best.get('latency_ms', 0):.0f}ms")
            print(f"{'='*80}\n")
            
            # Print sample output from best model
            raw = best.get("raw_response", {})
            if raw:
                print("Sample Output from Best Model:")
                print(f"\nEnhanced Summary:\n{raw.get('enhanced_summary', 'N/A')}")
                print(f"\nExperience Bullets:")
                for bullet in raw.get("experience_bullets", []):
                    print(f"  • {bullet}")
                print(f"\nMissing Skills: {', '.join(raw.get('missing_skills', []))}")
        
        return ranked


async def main():
    # Quick test with top models and one temperature
    tester = ModelTester()
    
    top_models = [
        "nex-agi/deepseek-v3.1-nex-n1:free",
        "google/gemini-2.0-flash-exp:free",
        "moonshotai/kimi-k2:free",
        "meta-llama/llama-3.3-70b-instruct:free",
        "deepseek/deepseek-chat-v3-0324:free",
        "zhipu-ai/glm-4.5-air:free",
    ]
    
    await tester.run_tests(models=top_models, temperatures=[0.1, 0.2])
    tester.generate_report()


if __name__ == "__main__":
    asyncio.run(main())
