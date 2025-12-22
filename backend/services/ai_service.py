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
    
    # Best free models ranked by performance for resume enhancement
    # Based on OpenRouter free tier (models with :free suffix)
    AVAILABLE_MODELS = {
        # Top Tier - Best for resume enhancement (Grok is default for testing)
        "grok": "x-ai/grok-3-fast-beta",  # Grok 3 Fast - excellent for creative content
        "gemini": "google/gemini-2.0-flash-exp:free",  # Fast, reliable, good JSON
        "deepseek": "deepseek/deepseek-chat-v3-0324:free",  # Excellent reasoning
        
        # Second Tier - Good alternatives
        "kimi": "moonshotai/kimi-k2:free",  # Good reasoning
        "llama": "meta-llama/llama-3.3-70b-instruct:free",  # Multilingual
        "glm": "thudm/glm-z1-32b:free",  # General purpose
        
        # Third Tier - Specialized/Backup
        "qwen": "qwen/qwen3-235b-a22b:free",  # Strong coding
        "mistral": "mistralai/mistral-small-3.1-24b-instruct:free",  # Fast
        
        # Note: Anthropic Claude models are NOT free on OpenRouter
        # They are paid models with per-token pricing
    }

    
    def __init__(self, model_name: str = "grok", temperature: float = 0.15):
        # Get API key from environment (works on Vercel without .env file)
        self.api_key = os.environ.get("OPENROUTER_API_KEY", "")
        self.base_url = "https://openrouter.ai/api/v1"
        self.is_configured = bool(self.api_key and len(self.api_key) > 20)
        self.temperature = temperature
        
        # Debug logging (Safe)
        print(f"🔧 [AIService Init] Is Configured: {self.is_configured}")
        print(f"🤖 [AIService Init] Model: {model_name}")
        
        if self.is_configured:
            self.client = OpenAI(
                base_url=self.base_url,
                api_key=self.api_key,
            )
            print(f"✅ OpenRouter API configured - using {model_name} model ({self.AVAILABLE_MODELS.get(model_name)})")
        else:
            self.client = None
            print("⚠️ Running in local mode - OPENROUTER_API_KEY not found in environment")
            print(f"   Available env vars: {[k for k in os.environ.keys() if 'KEY' in k or 'API' in k]}")
        
        # Select model - default to Grok for testing visibility on OpenRouter dashboard
        self.model = self.AVAILABLE_MODELS.get(model_name, self.AVAILABLE_MODELS["grok"])
        self.model_name = model_name

    async def get_completion(self, prompt: str, system_prompt: str = "You are a professional career coach.", temperature: float = None) -> str:
        if not self.is_configured:
            return '{"error": "API not configured"}'
        
        temp = temperature if temperature is not None else self.temperature
        
        # Top 3 models in ranking order for fallback
        fallback_models = [
            self.model,  # User's selected model
            self.AVAILABLE_MODELS["gemini"],  # 🥇 Primary fallback
            self.AVAILABLE_MODELS["deepseek"],  # 🥈 Secondary fallback
            self.AVAILABLE_MODELS["grok"],  # 🥉 Tertiary fallback
        ]
        
        # Remove duplicates while preserving order
        seen = set()
        fallback_models = [m for m in fallback_models if not (m in seen or seen.add(m))]
            
        # Try each model in order
        for model in fallback_models:
            try:
                response = self.client.chat.completions.create(
                    model=model,
                    temperature=temp,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": prompt},
                    ],
                )
                return response.choices[0].message.content
            except Exception as e:
                # If this is the last model, return error
                if model == fallback_models[-1]:
                    return '{"error": "API request failed"}'
                # Otherwise, try next model in fallback chain
                continue
        
        return '{"error": "API request failed"}'



    async def enhance_resume(self, resume: ResumeData, job: JobDescription) -> Dict[str, Any]:
        """
        Comprehensive ATS-style resume analysis with real scoring and section-by-section improvements.
        
        Scoring factors (weighted):
        - Skills Match: 30% (keyword matching)
        - Experience Relevance: 25% (role + description keywords)
        - Keyword Density: 20% (job description terms in resume)
        - Education: 10%
        - Format Quality: 15% (completeness of sections)
        """
        
        # ============ REAL ATS SCORING ============
        scores = {
            "skills_match": 0,
            "experience_relevance": 0,
            "keyword_density": 0,
            "education": 0,
            "format_quality": 0,
        }
        
        # 1. Skills Match (30%)
        resume_skills = set(s.lower().strip() for s in (resume.skills or []))
        job_skills = set(s.lower().strip() for s in (job.skills or []))
        job_requirements = set()
        for req in (job.requirements or []):
            words = re.findall(r'\b[a-zA-Z+#]+\b', req.lower())
            job_requirements.update(words)
        
        all_job_keywords = job_skills.union(job_requirements)
        if all_job_keywords:
            matched_skills = resume_skills.intersection(all_job_keywords)
            scores["skills_match"] = min(100, int((len(matched_skills) / max(len(job_skills), 1)) * 100))
        else:
            scores["skills_match"] = 50  # Default if no job skills
        
        # 2. Experience Relevance (25%)
        experience_text = " ".join([
            f"{exp.get('role', '')} {exp.get('description', '')} {exp.get('company', '')}"
            for exp in (resume.experience or [])
        ]).lower()
        
        job_title_words = set(re.findall(r'\b[a-z]+\b', (job.title or "").lower()))
        job_desc_words = set(re.findall(r'\b[a-z]{4,}\b', (job.description or "").lower()))
        important_job_words = job_title_words.union(job_desc_words) - {'the', 'and', 'with', 'for', 'that', 'this', 'from'}
        
        if important_job_words and experience_text:
            matched_exp = sum(1 for word in important_job_words if word in experience_text)
            scores["experience_relevance"] = min(100, int((matched_exp / max(len(important_job_words), 1)) * 150))
        else:
            scores["experience_relevance"] = 30 if resume.experience else 0
        
        # 3. Keyword Density (20%)
        full_resume_text = f"{resume.summary or ''} {experience_text} {' '.join(resume.skills or [])}".lower()
        if job_skills:
            keyword_hits = sum(1 for skill in job_skills if skill in full_resume_text)
            scores["keyword_density"] = min(100, int((keyword_hits / len(job_skills)) * 100))
        else:
            scores["keyword_density"] = 50
        
        # 4. Education Score (10%)
        if resume.education and len(resume.education) > 0:
            scores["education"] = 80
            # Bonus for degree keywords
            edu_text = " ".join([f"{e.get('degree', '')} {e.get('institution', '')}" for e in resume.education]).lower()
            if any(kw in edu_text for kw in ['bachelor', 'master', 'phd', 'computer', 'engineering', 'science']):
                scores["education"] = 100
        else:
            scores["education"] = 20
        
        # 5. Format Quality (15%)
        format_checks = [
            bool(resume.name),
            bool(resume.email),
            bool(resume.phone),
            bool(resume.summary and len(resume.summary) > 50),
            len(resume.skills or []) >= 5,
            len(resume.experience or []) >= 1,
            len(resume.education or []) >= 1,
        ]
        scores["format_quality"] = int((sum(format_checks) / len(format_checks)) * 100)
        
        # Calculate weighted ATS score
        ats_score = int(
            scores["skills_match"] * 0.30 +
            scores["experience_relevance"] * 0.25 +
            scores["keyword_density"] * 0.20 +
            scores["education"] * 0.10 +
            scores["format_quality"] * 0.15
        )
        ats_score = min(100, max(0, ats_score))
        
        # ============ SECTION-BY-SECTION IMPROVEMENTS ============
        section_improvements = {
            "summary": {
                "current": resume.summary or "",
                "issues": [],
                "suggested": "",
                "tips": [],
            },
            "experience": {
                "items": [],
                "general_tips": [],
            },
            "skills": {
                "matched": list(resume_skills.intersection(job_skills)) if job_skills else [],
                "missing": list(job_skills - resume_skills) if job_skills else [],
                "suggested_additions": [],
            },
            "projects": {
                "tips": [],
                "suggested": [],
            },
        }
        
        # Summary improvements
        if not resume.summary:
            section_improvements["summary"]["issues"].append("Missing professional summary")
            section_improvements["summary"]["tips"].append("Add a 2-3 sentence summary highlighting your key strengths")
        elif len(resume.summary) < 100:
            section_improvements["summary"]["issues"].append("Summary is too short")
            section_improvements["summary"]["tips"].append("Expand your summary to 100-200 characters")
        
        if job.title and resume.summary and job.title.lower() not in resume.summary.lower():
            section_improvements["summary"]["tips"].append(f"Mention '{job.title}' in your summary")
        
        # Generate tailored summary
        if job.title:
            section_improvements["summary"]["suggested"] = f"Results-driven professional with expertise in {', '.join(list(resume_skills)[:3]) if resume_skills else 'relevant technologies'}. Seeking {job.title} role at {job.company or 'a leading company'} where I can leverage my experience to drive impact. {resume.summary[:200] if resume.summary else ''}"
        
        # Experience improvements - SOPHISTICATED LOCAL ANALYSIS
        for i, exp in enumerate(resume.experience or []):
            role = exp.get("role", "Professional").strip()
            company = exp.get("company", "Company").strip()
            description = exp.get("description", "")
            
            exp_analysis = {
                "original": exp,
                "issues": [],
                "suggested_bullets": [],
                "ai_suggested_bullets": [],  # Add AI-style bullets for local generation too
            }
            
            # ============ ANALYZE EXISTING CONTENT ============
            desc_lower = description.lower()
            
            # Identify issues
            bullet_count = description.count('•') + description.count('-') + description.count('*')
            has_metrics = bool(re.search(r'\d+[%$K+]|\d+\s*(percent|users|customers|projects)', description, re.I))
            has_action_verbs = any(verb in desc_lower for verb in [
                'developed', 'led', 'managed', 'created', 'implemented', 'designed', 
                'built', 'engineered', 'architected', 'optimized', 'reduced', 'improved',
                'deployed', 'integrated', 'automated', 'scaled', 'migrated'
            ])
            
            if len(description) < 100:
                exp_analysis["issues"].append("Description too brief - expand with 3-5 detailed bullet points")
            if not has_metrics:
                exp_analysis["issues"].append("Missing quantified achievements - add specific metrics (%, $, time, users)")
            if not has_action_verbs:
                exp_analysis["issues"].append("Weak action verbs - use impactful verbs like Architected, Engineered, Led, Optimized")
            if bullet_count < 3:
                exp_analysis["issues"].append(f"Only {bullet_count} bullet points found - aim for 4-6 impactful points")
            
            # ============ EXTRACT TECHNOLOGIES FROM DESCRIPTION ============
            existing_tech = set()
            tech_patterns = [
                r'\b(java|python|javascript|typescript|sql|react|angular|vue|node\.?js?|spring|django|flask)\b',
                r'\b(aws|azure|gcp|kubernetes|docker|terraform|jenkins|ci\/cd|git)\b',
                r'\b(mongodb|postgresql|mysql|redis|elasticsearch|kafka|spark)\b',
                r'\b(tensorflow|pytorch|machine learning|ml|ai|deep learning)\b',
                r'\b(rest|api|graphql|microservices|serverless|lambda)\b',
            ]
            for pattern in tech_patterns:
                matches = re.findall(pattern, desc_lower)
                existing_tech.update([m.upper() if m in ['aws', 'gcp', 'api', 'sql', 'ci/cd'] else m.title() for m in matches])
            
            # ============ DETERMINE ROLE CATEGORY ============
            role_lower = role.lower()
            if any(x in role_lower for x in ['full stack', 'fullstack', 'software engineer', 'developer']):
                role_category = 'fullstack'
            elif any(x in role_lower for x in ['frontend', 'front-end', 'ui', 'ux']):
                role_category = 'frontend'
            elif any(x in role_lower for x in ['backend', 'back-end', 'server', 'api']):
                role_category = 'backend'
            elif any(x in role_lower for x in ['data', 'ml', 'machine learning', 'ai', 'analytics']):
                role_category = 'data'
            elif any(x in role_lower for x in ['devops', 'sre', 'cloud', 'infrastructure', 'platform']):
                role_category = 'devops'
            elif any(x in role_lower for x in ['database', 'dba', 'db admin']):
                role_category = 'database'
            elif any(x in role_lower for x in ['network', 'system', 'admin']):
                role_category = 'infrastructure'
            else:
                role_category = 'general'
            
            # ============ MATCH JOB KEYWORDS TO ROLE ============
            job_title_lower = job.title.lower() if job.title else ""
            target_is_fullstack = any(x in job_title_lower for x in ['full stack', 'fullstack', 'software engineer'])
            
            # Get missing skills for this specific experience
            missing_skills = [s for s in job_skills if s.lower() not in desc_lower][:6]
            matched_skills = [s for s in job_skills if s.lower() in desc_lower]
            
            # ============ GENERATE CONTEXT-AWARE BULLET POINTS ============
            ai_bullets = []
            
            # Role-specific bullet templates
            bullet_templates = {
                'fullstack': [
                    "Architected and developed full-stack web applications using {tech1} and {tech2}, serving 50K+ monthly active users with 99.9% uptime and sub-500ms page load times",
                    "Engineered RESTful APIs and microservices architecture with {tech1}, reducing API response time by 65% and enabling horizontal scaling for 10x traffic growth",
                    "Led migration of legacy monolithic application to containerized microservices using {tech2} and Kubernetes, cutting deployment time from days to under 15 minutes",
                    "Implemented CI/CD pipelines with automated testing achieving 95% code coverage, reducing production bugs by 70% and accelerating release cycles by 3x",
                    "Collaborated with cross-functional teams of 8+ engineers to deliver agile sprints, consistently exceeding velocity targets by 20% while maintaining code quality standards",
                ],
                'frontend': [
                    "Designed and implemented responsive, accessible UI components using {tech1} and modern CSS frameworks, improving Lighthouse scores from 65 to 95+",
                    "Optimized front-end performance by implementing code splitting, lazy loading, and CDN caching, reducing bundle size by 60% and improving FCP by 45%",
                    "Built reusable component library with {tech1} used across 5+ applications, reducing development time by 40% and ensuring design system consistency",
                    "Integrated state management solutions with Redux/Context API, reducing prop drilling complexity by 80% and improving application maintainability",
                    "Conducted A/B testing and implemented UI/UX improvements resulting in 25% boost in user engagement and 15% reduction in bounce rate",
                ],
                'backend': [
                    "Developed high-performance backend services using {tech1} and {tech2}, processing 1M+ daily transactions with 99.99% reliability",
                    "Architected event-driven microservices with Apache Kafka, reducing inter-service latency by 75% and enabling real-time data processing",
                    "Implemented database optimization strategies including indexing, query optimization, and connection pooling, improving query performance by 80%",
                    "Built secure authentication and authorization systems with OAuth 2.0 and JWT, handling 100K+ concurrent user sessions with zero security incidents",
                    "Led API versioning and documentation initiatives using OpenAPI/Swagger, reducing developer onboarding time by 50%",
                ],
                'data': [
                    "Developed machine learning models using {tech1} and {tech2} achieving 92% accuracy in predictive analytics, directly impacting $2M+ in revenue optimization",
                    "Built automated data pipelines processing 5TB+ daily using Apache Spark and Airflow, reducing ETL processing time from 8 hours to 45 minutes",
                    "Implemented real-time analytics dashboards using Tableau/PowerBI, enabling data-driven decision making for C-level executives",
                    "Conducted statistical analysis and A/B testing across 20+ experiments, providing actionable insights that increased conversion rates by 18%",
                    "Collaborated with data engineering team to design data warehouse schemas, improving query performance by 65% and reducing storage costs by 30%",
                ],
                'devops': [
                    "Architected and managed cloud infrastructure on {tech1} supporting 500+ services with 99.99% uptime SLA",
                    "Implemented Infrastructure as Code using {tech2} and Ansible, reducing provisioning time from weeks to hours and eliminating configuration drift",
                    "Built comprehensive monitoring and alerting systems with Prometheus, Grafana, and PagerDuty, reducing MTTR by 60%",
                    "Automated security scanning and compliance checks in CI/CD pipelines, achieving SOC 2 and PCI-DSS compliance",
                    "Led disaster recovery initiatives implementing multi-region failover, achieving RPO of 15 minutes and RTO of 30 minutes",
                ],
                'database': [
                    "Managed enterprise database systems including {tech1} and {tech2}, ensuring 99.99% availability for mission-critical applications",
                    "Optimized database performance through index tuning, query rewriting, and partitioning strategies, reducing average query time by 75%",
                    "Led migration of legacy databases to cloud-managed services ({tech1}), reducing operational overhead by 40% and infrastructure costs by 35%",
                    "Implemented automated backup and disaster recovery procedures with point-in-time recovery capabilities, meeting RPO/RTO requirements",
                    "Designed and implemented data governance policies ensuring GDPR/CCPA compliance across 50+ database instances",
                ],
                'infrastructure': [
                    "Administered enterprise network infrastructure supporting 5,000+ endpoints across multiple data centers with 99.9% uptime",
                    "Implemented network security measures including firewalls, VPNs, and intrusion detection systems, blocking 10K+ monthly threat attempts",
                    "Automated infrastructure monitoring and alerting using {tech1} and custom scripts, reducing incident response time by 50%",
                    "Led virtualization initiatives migrating 200+ physical servers to VMware/Hyper-V, reducing hardware costs by 60%",
                    "Managed Active Directory and identity systems for 3,000+ users, implementing MFA and SSO solutions",
                ],
                'general': [
                    "Delivered enterprise software solutions using {tech1} and {tech2}, contributing to $500K+ annual cost savings through process automation",
                    "Collaborated with cross-functional teams to implement Agile methodologies, improving sprint velocity by 35% and reducing time-to-market",
                    "Led technical initiatives resulting in 40% improvement in system performance and 25% reduction in support tickets",
                    "Mentored junior team members in best practices, conducting code reviews and knowledge sharing sessions",
                    "Documented technical specifications and maintained comprehensive runbooks, reducing onboarding time by 30%",
                ],
            }
            
            # Get templates for this role
            templates = bullet_templates.get(role_category, bullet_templates['general'])
            
            # Select technologies to use in bullets
            available_tech = list(missing_skills) + list(existing_tech) + list(resume_skills)[:5]
            tech1 = available_tech[0] if available_tech else "modern technologies"
            tech2 = available_tech[1] if len(available_tech) > 1 else "industry best practices"
            
            # Generate 4-5 customized bullets
            for template in templates[:5]:
                bullet = template.format(tech1=tech1, tech2=tech2 if tech2 != tech1 else "cloud services")
                ai_bullets.append(f"• {bullet.lstrip('• ')}")
            
            # Add role and company context
            exp_analysis["ai_suggested_bullets"] = ai_bullets
            exp_analysis["suggested_bullets"] = ai_bullets[:3]  # Shorter list for suggested
            
            # Add analysis metadata
            exp_analysis["analysis"] = {
                "role_category": role_category,
                "existing_technologies": list(existing_tech),
                "missing_keywords": missing_skills[:5],
                "strengths": matched_skills[:3] if matched_skills else ["Shows relevant experience"],
                "improvement_areas": exp_analysis["issues"],
            }
            
            section_improvements["experience"]["items"].append(exp_analysis)
        
        section_improvements["experience"]["general_tips"] = [
            "Start each bullet with a power verb: Architected, Engineered, Spearheaded, Optimized, Transformed",
            "Include specific metrics: '35% reduction', '$500K savings', '10x performance improvement'",
            "Focus on business impact: What problems did you solve? What value did you create?",
            "Incorporate job keywords: " + (', '.join(list(job_skills)[:5]) if job_skills else "Add relevant technical keywords"),
            "Use the XYZ formula: Accomplished [X] as measured by [Y], by doing [Z]",
        ]
        
        # Skills suggestions
        section_improvements["skills"]["suggested_additions"] = list(job_skills - resume_skills)[:10] if job_skills else []
        
        # Projects suggestions
        if not resume.projects or len(resume.projects) == 0:
            section_improvements["projects"]["tips"].append("Add 2-3 relevant projects showcasing your skills")
        section_improvements["projects"]["tips"].append(f"Include projects using: {', '.join(list(job_skills)[:3])}" if job_skills else "Add projects with relevant technologies")
        
        # ============ BUILD RESPONSE ============
        response = {
            "ats_score": ats_score,
            "score_breakdown": scores,
            "score": ats_score,  # Legacy support
            "feedback": self._generate_feedback(scores, ats_score),
            "tailored_summary": section_improvements["summary"]["suggested"],
            "section_improvements": section_improvements,
            "suggestions": self._generate_actionable_suggestions(section_improvements, job),
            "enhanced_resume": resume.dict(),
        }
        
        # Use AI if configured for even better suggestions
        if self.is_configured:
            try:
                print(f"[AI Debug] Calling AI enhancement with API key configured: {bool(self.api_key)}")
                ai_enhanced_improvements = await self._get_ai_improvements(resume, job, section_improvements)
                if ai_enhanced_improvements:
                    # Replace section_improvements with AI-enhanced version
                    response["section_improvements"] = ai_enhanced_improvements
                    
                    # Update tailored summary if AI provided one
                    if ai_enhanced_improvements.get("summary", {}).get("ai_enhanced"):
                        response["tailored_summary"] = ai_enhanced_improvements["summary"]["ai_enhanced"]
                        response["enhanced_summary"] = ai_enhanced_improvements["summary"]["ai_enhanced"]
                    
                    # Add estimated new score if provided
                    if ai_enhanced_improvements.get("estimated_new_score"):
                        response["estimated_new_score"] = ai_enhanced_improvements["estimated_new_score"]
                    
                    # Add ATS tips if provided
                    if ai_enhanced_improvements.get("ats_tips"):
                        response["ats_tips"] = ai_enhanced_improvements["ats_tips"]
                    
                    print(f"[AI Debug] Successfully integrated AI improvements")
            except Exception as e:
                print(f"[AI Debug] Error during AI enhancement: {str(e)}")
                pass  # Use local analysis
        
        return response
    
    def _generate_feedback(self, scores: dict, total: int) -> str:
        """Generate human-readable feedback based on scores."""
        feedback = []
        if scores["skills_match"] >= 70:
            feedback.append("✓ Strong skills alignment")
        elif scores["skills_match"] >= 40:
            feedback.append("⚠ Moderate skills match - add more keywords")
        else:
            feedback.append("✗ Low skills match - update your skills section")
        
        if scores["experience_relevance"] >= 60:
            feedback.append("✓ Relevant experience detected")
        else:
            feedback.append("⚠ Tailor experience descriptions to the job")
        
        if scores["format_quality"] < 70:
            feedback.append("⚠ Complete all profile sections")
        
        return " | ".join(feedback)
    
    def _generate_actionable_suggestions(self, improvements: dict, job: JobDescription) -> List[str]:
        """Generate a list of actionable suggestions."""
        suggestions = []
        
        if improvements["skills"]["missing"]:
            suggestions.append(f"Add these skills: {', '.join(improvements['skills']['missing'][:5])}")
        
        if improvements["summary"]["issues"]:
            suggestions.append(improvements["summary"]["issues"][0])
        
        for item in improvements["experience"]["items"][:2]:
            if item["issues"]:
                suggestions.append(f"Experience: {item['issues'][0]}")
        
        suggestions.append("Quantify 2-3 achievements with specific metrics")
        
        if job.company:
            suggestions.append(f"Research {job.company} and customize your cover letter")
        
        return suggestions[:6]
    
    async def _get_ai_improvements(self, resume: ResumeData, job: JobDescription, current_improvements: dict) -> dict:
        """
        COMPREHENSIVE AI-POWERED RESUME ENHANCEMENT
        
        This method performs deep analysis and enhancement of ALL resume sections,
        with special focus on work experience bullet points for maximum ATS compatibility.
        
        Key Enhancement Areas:
        1. Work Experience Bullets - Deep analysis, keyword integration, metrics, action verbs
        2. Professional Summary - Tailored to job posting with key skills
        3. Skills Optimization - Missing skills identification and prioritization
        4. Projects Enhancement - Relevant project recommendations
        5. Certifications - Industry-relevant certification suggestions
        """
        
        # ============ PREPARE DETAILED EXPERIENCE DATA ============
        experience_details = ""
        for i, exp in enumerate(resume.experience or []):
            role = exp.get('role', 'N/A')
            company = exp.get('company', 'N/A')
            duration = exp.get('duration', 'N/A')
            description = exp.get('description', 'N/A')
            
            experience_details += f"""
═══════════════════════════════════════════════════════════════
EXPERIENCE #{i+1}:
═══════════════════════════════════════════════════════════════
Position: {role}
Company: {company}
Duration: {duration}
Current Description/Bullets:
{description}
"""
        
        # Prepare education details
        education_details = ""
        for edu in (resume.education or []):
            education_details += f"• {edu.get('degree', 'N/A')} from {edu.get('institution', 'N/A')} ({edu.get('graduation_year', 'N/A')})\n"
        
        # Prepare projects details
        projects_details = ""
        for proj in (resume.projects or []):
            projects_details += f"• {proj.get('name', 'N/A')}: {proj.get('description', 'N/A')[:100]}\n"
        
        # Extract job keywords for targeting
        job_keywords = set()
        if job.skills:
            job_keywords.update([s.lower() for s in job.skills])
        if job.requirements:
            for req in job.requirements:
                words = re.findall(r'\b[a-zA-Z+#]{3,}\b', req.lower())
                job_keywords.update(words)
        
        # ============ COMPREHENSIVE ENHANCEMENT PROMPT ============
        prompt = f"""You are a SENIOR TECHNICAL RESUME WRITER and ATS OPTIMIZATION EXPERT with 20+ years of experience 
helping candidates land roles at top tech companies. Your expertise includes:
- Analyzing and rewriting work experience bullet points for maximum impact
- Integrating ATS-friendly keywords naturally while maintaining readability
- Quantifying achievements with specific metrics, percentages, and dollar amounts
- Using powerful action verbs that demonstrate leadership and impact

═══════════════════════════════════════════════════════════════════════════════
                              TARGET JOB ANALYSIS
═══════════════════════════════════════════════════════════════════════════════

JOB TITLE: {job.title}
COMPANY: {job.company}
LOCATION: {job.location or 'Not specified'}

KEY REQUIREMENTS FROM JOB POSTING:
{(job.description or '')[:1000]}

REQUIRED SKILLS (CRITICAL for ATS matching):
{', '.join((job.skills or [])[:20])}

TOP RESPONSIBILITIES:
{chr(10).join(['• ' + r for r in (job.responsibilities or [])[:8]])}

═══════════════════════════════════════════════════════════════════════════════
                            CANDIDATE'S CURRENT RESUME
═══════════════════════════════════════════════════════════════════════════════

NAME: {resume.name}
CURRENT SKILLS: {', '.join((resume.skills or [])[:25])}

PROFESSIONAL SUMMARY:
{resume.summary or 'No summary provided - NEEDS TO BE CREATED'}

{experience_details}

EDUCATION:
{education_details or 'Not provided'}

PROJECTS:
{projects_details or 'No projects listed'}

═══════════════════════════════════════════════════════════════════════════════
                              CURRENT ATS ANALYSIS
═══════════════════════════════════════════════════════════════════════════════

CURRENT ATS SCORE: {current_improvements.get('ats_score', 'N/A')}%
EXPERIENCE RELEVANCE: {current_improvements.get('score_breakdown', {}).get('experience_relevance', 'N/A')}%

CRITICAL MISSING SKILLS: {', '.join(current_improvements.get('skills', {}).get('missing', [])[:15])}

═══════════════════════════════════════════════════════════════════════════════
                        YOUR TASK: COMPREHENSIVE ENHANCEMENT
═══════════════════════════════════════════════════════════════════════════════

Analyze the resume thoroughly and provide DETAILED enhancements in JSON format.

**CRITICAL REQUIREMENTS FOR WORK EXPERIENCE BULLET POINTS:**

1. **ANALYZE FIRST**: For each experience, identify:
   - Strengths of current bullets (what's working)
   - Weaknesses (brevity, lack of metrics, missing keywords, generic language)
   - Relevance to {job.title} role
   - Keywords from job description that should be incorporated

2. **ENHANCE BULLETS** - Each bullet point MUST:
   - START with a powerful action verb (Architected, Spearheaded, Engineered, Optimized, etc.)
   - INCLUDE specific metrics (% improvement, $ saved, time reduced, users served)
   - NATURALLY incorporate 2-3 keywords from: {', '.join(list(job_keywords)[:15])}
   - Be DETAILED and SUBSTANTIVE (minimum 15-20 words each)
   - SHOW IMPACT and business value, not just duties
   - Be UNIQUE and specific to the candidate's actual work
   - AVOID generic phrases like "Responsible for" or "Worked on"

3. **BULLET POINT FORMULA**: [Action Verb] + [What You Did] + [How/With What Technology] + [Result/Impact with Metric]
   
   Examples for {job.title}:
   - "Architected and deployed scalable microservices architecture using Node.js and Kubernetes, reducing deployment time by 60% and supporting 2M+ daily active users"
   - "Engineered real-time data pipeline using Apache Kafka and Spark, processing 10TB+ daily transactions with 99.99% uptime"
   - "Led cross-functional team of 8 engineers to redesign legacy monolith into event-driven architecture, improving system performance by 45%"

Generate the following JSON structure:

{{
  "enhanced_summary": "A compelling 3-4 sentence professional summary tailored to {job.title} at {job.company}. Include years of experience, key technologies from the job posting, and a unique value proposition.",
  
  "experience_enhancements": [
    {{
      "experience_index": 0,
      "role": "{(resume.experience[0].get('role', 'N/A') if resume.experience and len(resume.experience) > 0 else 'N/A')}",
      "company": "{(resume.experience[0].get('company', 'N/A') if resume.experience and len(resume.experience) > 0 else 'N/A')}",
      "analysis": {{
        "current_strengths": ["What's good about existing bullets"],
        "weaknesses": ["What needs improvement - brevity, lack of metrics, etc."],
        "relevance_to_target": "How relevant this role is to {job.title}",
        "keywords_to_incorporate": ["Specific keywords from job posting to add"]
      }},
      "ai_suggested_bullets": [
        "Powerful, detailed bullet point 1 with metrics and keywords...",
        "Powerful, detailed bullet point 2 with metrics and keywords...",
        "Powerful, detailed bullet point 3 with metrics and keywords...",
        "Powerful, detailed bullet point 4 with metrics and keywords...",
        "Powerful, detailed bullet point 5 with metrics and keywords..."
      ]
    }}
  ],
  
  "skills_to_add": [
    {{"skill": "skill_name", "priority": "high/medium", "reason": "Why this skill matters for the role"}}
  ],
  
  "education_enhancements": {{
    "suggestions": ["Specific enhancement tips"],
    "relevant_coursework": ["Courses that align with {job.title}"],
    "gpa_recommendation": "Include if above 3.5"
  }},
  
  "projects_recommendations": [
    {{
      "title": "Project name relevant to {job.title}",
      "description": "2-3 sentence description showing relevant skills",
      "technologies": ["tech1", "tech2"],
      "impact": "Expected impact or learning outcome"
    }}
  ],
  
  "certifications_to_pursue": [
    {{"name": "Certification name", "provider": "AWS/Google/etc", "importance": "high/medium"}}
  ],
  
  "keywords_to_add": [
    {{"keyword": "keyword", "placement": "Where to add it (summary/experience/skills)", "importance": "high/medium"}}
  ],
  
  "ats_optimization_tips": [
    "Specific, actionable tip 1",
    "Specific, actionable tip 2"
  ],
  
  "estimated_new_ats_score": "Estimated score after implementing all changes"
}}

**IMPORTANT:**
- Generate 4-5 DETAILED bullet points for EACH work experience
- Each bullet MUST be substantive (15-25 words minimum)
- Focus on the {job.title} role requirements
- Use actual metrics and numbers (reasonable estimates based on context)
- Return ONLY valid JSON - no markdown, no explanations outside JSON

Generate the complete, detailed JSON now:"""

        try:
            # Use slightly higher temperature for more creative bullet points
            response = await self.get_completion(
                prompt, 
                """You are a world-class technical resume writer who has helped 10,000+ candidates land 
roles at FAANG companies. Your bullet points are legendary for being specific, metric-driven, 
and ATS-optimized while remaining authentic and readable. Return ONLY valid JSON.""",
                temperature=0.2  # Slightly higher for creative bullet points
            )
            
            # Clean up response - handle various markdown formats
            if "```json" in response:
                response = response.split("```json")[1].split("```")[0].strip()
            elif "```" in response:
                parts = response.split("```")
                for part in parts[1:]:
                    if "{" in part:
                        response = part.split("```")[0].strip()
                        break
            
            # Remove any leading/trailing whitespace or newlines
            response = response.strip()
            
            # Parse the JSON
            ai_improvements = json.loads(response)
            
            # ============ MERGE AI IMPROVEMENTS ============
            
            # Enhanced Summary
            if "enhanced_summary" in ai_improvements:
                current_improvements["summary"]["ai_enhanced"] = ai_improvements["enhanced_summary"]
            
            # Experience Enhancements with Analysis
            if "experience_enhancements" in ai_improvements:
                for enhancement in ai_improvements["experience_enhancements"]:
                    idx = enhancement.get("experience_index", 0)
                    if idx < len(current_improvements["experience"]["items"]):
                        exp_item = current_improvements["experience"]["items"][idx]
                        
                        # Add AI-generated bullets
                        exp_item["ai_suggested_bullets"] = enhancement.get("ai_suggested_bullets", [])
                        
                        # Add analysis if provided
                        if "analysis" in enhancement:
                            exp_item["ai_analysis"] = enhancement["analysis"]
                        
                        # Add role/company for reference
                        exp_item["ai_role"] = enhancement.get("role", "")
                        exp_item["ai_company"] = enhancement.get("company", "")
            
            # Skills with priority and reason
            if "skills_to_add" in ai_improvements:
                skills = ai_improvements["skills_to_add"]
                if isinstance(skills, list):
                    if skills and isinstance(skills[0], dict):
                        current_improvements["skills"]["ai_recommended"] = skills
                    else:
                        current_improvements["skills"]["ai_recommended"] = [
                            {"skill": s, "priority": "medium", "reason": "Matches job requirements"} 
                            for s in skills
                        ]
            
            # Education enhancements
            if "education_enhancements" in ai_improvements:
                current_improvements["education"] = ai_improvements["education_enhancements"]
            
            # Project recommendations
            if "projects_recommendations" in ai_improvements:
                current_improvements["projects"]["ai_suggestions"] = ai_improvements["projects_recommendations"]
            
            # Certifications
            if "certifications_to_pursue" in ai_improvements:
                current_improvements["certifications"] = {
                    "recommended": ai_improvements["certifications_to_pursue"]
                }
            
            # Keywords with placement hints
            if "keywords_to_add" in ai_improvements:
                keywords = ai_improvements["keywords_to_add"]
                if isinstance(keywords, list):
                    if keywords and isinstance(keywords[0], dict):
                        current_improvements["keywords"] = {"missing": keywords}
                    else:
                        current_improvements["keywords"] = {
                            "missing": [{"keyword": k, "placement": "experience", "importance": "high"} for k in keywords]
                        }
            
            # ATS optimization tips
            if "ats_optimization_tips" in ai_improvements:
                current_improvements["ats_tips"] = ai_improvements["ats_optimization_tips"]
            
            # Estimated new score
            if "estimated_new_ats_score" in ai_improvements:
                current_improvements["estimated_new_score"] = ai_improvements["estimated_new_ats_score"]
            
            return current_improvements
            
        except json.JSONDecodeError as je:
            print(f"JSON parsing error: {je}")
            print(f"Response was: {response[:500]}...")
            # Try to extract just the experience bullets if full JSON fails
            try:
                # Attempt partial extraction
                if "ai_suggested_bullets" in response:
                    import re
                    bullets_match = re.search(r'"ai_suggested_bullets"\s*:\s*\[(.*?)\]', response, re.DOTALL)
                    if bullets_match:
                        bullets_str = "[" + bullets_match.group(1) + "]"
                        bullets = json.loads(bullets_str)
                        if current_improvements["experience"]["items"]:
                            current_improvements["experience"]["items"][0]["ai_suggested_bullets"] = bullets
            except:
                pass
            return current_improvements
            
        except Exception as e:
            print(f"AI enhancement error: {e}")
            import traceback
            traceback.print_exc()
            return current_improvements





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
        
        # Strategy: Look for entries with date patterns like "Jan 2020 - Present" or "2019 - 2022"
        lines = [l.strip() for l in text.split('\n') if l.strip()]
        
        current_exp = None
        bullets = []
        
        for i, line in enumerate(lines):
            # Check if line contains a date range (likely start of new experience)
            date_match = re.search(
                r'([A-Z][a-z]{2,8}\s*\d{4}|(?:19|20)\d{2})\s*[–\-to]+\s*([A-Z][a-z]{2,8}\s*\d{4}|(?:19|20)\d{2}|Present|Current|Now)',
                line, re.I
            )
            
            if date_match:
                # Save previous experience if exists
                if current_exp and (current_exp["company"] or current_exp["role"]):
                    current_exp["description"] = " | ".join(bullets[:5])
                    experiences.append(current_exp)
                
                # Start new experience
                current_exp = {"company": "", "role": "", "duration": "", "location": "", "description": ""}
                current_exp["duration"] = f"{date_match.group(1)} - {date_match.group(2)}"
                
                # Extract role (text before dates)
                role_text = line[:date_match.start()].strip()
                if role_text:
                    current_exp["role"] = role_text.rstrip(' -–|,')
                
                # Check previous line for company name
                if i > 0:
                    prev_line = lines[i-1].strip()
                    # Skip if previous line is a bullet or section header
                    if not prev_line.startswith(('•', '-', '○', '*')) and \
                       not any(h in prev_line.lower() for h in ['experience', 'employment', 'work history']):
                        # Extract company and location
                        loc_match = re.search(r',?\s*([A-Z][a-zA-Z\s]+,?\s*[A-Z]{2}|Remote|Hybrid)$', prev_line)
                        if loc_match:
                            current_exp["company"] = prev_line[:loc_match.start()].strip().rstrip(',')
                            current_exp["location"] = loc_match.group(1).strip()
                        else:
                            current_exp["company"] = prev_line
                
                bullets = []
            
            # Collect bullet points for current experience
            elif current_exp is not None:
                # Check if it's a bullet point
                if line.startswith(('•', '-', '○', '*', '►')) or re.match(r'^\d+\.', line):
                    clean_line = re.sub(r'^[•\-○*►\d.]+\s*', '', line)
                    if len(clean_line) > 15:
                        bullets.append(clean_line)
        
        # Don't forget the last experience
        if current_exp and (current_exp["company"] or current_exp["role"]):
            current_exp["description"] = " | ".join(bullets[:5])
            experiences.append(current_exp)
        
        return experiences


    def _parse_education(self, text: str) -> List[Dict[str, str]]:
        """Parse education entries from text."""
        education = []
        
        lines = [l.strip() for l in text.split('\n') if l.strip()]
        
        i = 0
        while i < len(lines):
            line = lines[i]
            edu = {"institution": "", "degree": "", "graduation_year": "", "gpa": ""}
            
            # Look for institution keywords
            is_institution = any(kw in line.lower() for kw in [
                'university', 'college', 'institute', 'school', 'academy', 'polytechnic'
            ])
            
            # Also check for degree patterns in this line
            has_degree = bool(re.search(
                r"(Bachelor|Master|Ph\.?D|B\.?S\.?|M\.?S\.?|B\.?A\.?|M\.?A\.?|B\.?E\.?|M\.?E\.?|B\.?Tech|M\.?Tech|MBA|Associate)",
                line, re.I
            ))
            
            if is_institution or has_degree:
                # Extract institution name
                if is_institution:
                    # Remove location suffix if present
                    inst_match = re.match(r'^(.+?(?:University|College|Institute|School|Academy))', line, re.I)
                    if inst_match:
                        edu["institution"] = inst_match.group(1).strip()
                    else:
                        edu["institution"] = line.split(',')[0].strip()
                
                # Look for degree in current or next line
                degree_text = line
                if i + 1 < len(lines):
                    degree_text = line + " " + lines[i + 1]
                
                # Extract degree
                degree_match = re.search(
                    r"\b(Bachelor(?:'s)?|Master(?:'s)?|Ph\.?D\.?|B\.S\.?|M\.S\.?|B\.A\.?|M\.A\.?|B\.E\.?|M\.E\.?|B\.?Tech|M\.?Tech|MBA|Associate(?:'s)?)\b"
                    r"(?:\s+(?:of|in)\s+)?([A-Za-z\s]{3,40})?",
                    degree_text, re.I
                )
                if degree_match:
                    degree_type = degree_match.group(1)
                    field = degree_match.group(2).strip() if degree_match.group(2) else ""
                    # Clean up field - remove trailing numbers/years
                    field = re.sub(r'\s*\d{4}.*$', '', field).strip()
                    if field and len(field) > 2:
                        edu["degree"] = f"{degree_type} in {field}"
                    else:
                        edu["degree"] = degree_type

                
                # Extract graduation year
                year_match = re.search(r'(?:19|20)\d{2}', degree_text)
                if year_match:
                    edu["graduation_year"] = year_match.group()
                
                # Extract GPA
                gpa_match = re.search(r'GPA[:\s]*(\d+\.?\d*)', degree_text, re.I)
                if gpa_match:
                    edu["gpa"] = gpa_match.group(1)
                
                if edu["institution"] or edu["degree"]:
                    education.append(edu)
                    i += 1  # Skip next line if we used it for degree
            
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
