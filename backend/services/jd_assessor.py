"""
JD Assessment Service - Job Description Analysis with Fit Scoring.
Inspired by Apply-Pilot's JD Assessor agent.
"""

import re
import logging
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field
from enum import Enum

logger = logging.getLogger(__name__)


class FitLevel(Enum):
    EXCELLENT = "excellent"  # 85-100%
    STRONG = "strong"        # 70-84%
    MODERATE = "moderate"    # 50-69%
    WEAK = "weak"           # Below 50%


@dataclass
class CompetencyMatch:
    """Match result for a competency area."""
    name: str
    weight: float  # 0-1, assigned from JD
    match_score: float  # 0-100
    matched_keywords: List[str]
    missing_keywords: List[str]
    recommendations: List[str]


@dataclass
class JDAssessment:
    """Complete JD assessment result."""
    fit_score: int  # 0-100
    fit_level: FitLevel
    competency_matches: List[CompetencyMatch]
    strengths: List[str]
    gaps: List[str]
    spinning_recommendation: str
    action_items: List[str]
    resume_distribution: Dict[str, int]  # Bullet distribution per role
    skills_intelligence: Dict[str, Any]
    summary_guidance: str
    interest_level: int  # 1-10
    decision: str  # PROCEED, ARCHIVE, or PRESENT TO USER


class JDAssessor:
    """
    JD Assessment Agent - Analyzes job descriptions and scores candidate fit.
    """
    
    # Default competency areas with keywords
    COMPETENCY_AREAS = {
        "technical_skills": {
            "weight": 0.25,
            "keywords": [
                "python", "javascript", "java", "sql", "react", "node", "aws",
                "docker", "kubernetes", "api", "database", "cloud", "machine learning",
                "data analysis", "software development", "programming", "coding"
            ]
        },
        "leadership": {
            "weight": 0.20,
            "keywords": [
                "lead", "manage", "mentor", "coach", "direct", "oversee",
                "team", "cross-functional", "stakeholder", "influence"
            ]
        },
        "product_strategy": {
            "weight": 0.20,
            "keywords": [
                "product", "roadmap", "strategy", "vision", "prioritize",
                "user research", "market analysis", "competitive", "growth"
            ]
        },
        "communication": {
            "weight": 0.15,
            "keywords": [
                "communicate", "present", "collaborate", "negotiate",
                "stakeholder", "documentation", "report", "articulate"
            ]
        },
        "execution": {
            "weight": 0.20,
            "keywords": [
                "deliver", "execute", "implement", "launch", "ship",
                "agile", "scrum", "project management", "deadline", "on-time"
            ]
        }
    }
    
    # Company archetype patterns
    ARCHETYPE_PATTERNS = {
        "early_stage": [
            "startup", "seed", "pre-seed", "angel", "bootstrap",
            "small team", "wear many hats", "fast-paced", "scrappy"
        ],
        "growth_stage": [
            "series a", "series b", "series c", "hypergrowth", "scaling",
            "rapid growth", "expanding", "growing team"
        ],
        "enterprise": [
            "fortune 500", "enterprise", "global", "multinational",
            "large-scale", "established", "public company"
        ]
    }

    # Skills Section Intelligence Mapping (Tier 1 vs Tier 2)
    SKILLS_INTELLIGENCE = {
        "tier_1": [
            "sql", "etl", "agile", "scrum", "product vision", "roadmap planning",
            "python", "javascript", "react", "api design", "system architecture",
            "stakeholder management", "user research", "prd authoring"
        ],
        "tier_2": {
            "tableau": ["looker", "power bi", "excel"],
            "mixpanel": ["amplitude", "heap", "google analytics"],
            "jira": ["linear", "asana", "trello"],
            "aws": ["gcp", "azure"],
            "postgresql": ["mysql", "mongodb", "redis"]
        },
        "domains": {
            "ai_heavy": ["generative ai", "llms", "pytorch", "tensorflow", "nlp"],
            "gtm_heavy": ["go-to-market", "salesforce", "hubspot", "customer acquisition"],
            "fintech": ["payment reconciliation", "kyc", "aml", "ledger systems"]
        }
    }

    @classmethod
    def analyze_skills_intelligence(cls, job_description: str) -> Dict[str, Any]:
        """
        Analyze JD to determine which Tier 1/2 skills should be prioritized.
        Based on Apply-Pilot's Skills Section Intelligence Framework.
        """
        jd_lower = job_description.lower()
        
        prioritized_tier_1 = [s for s in cls.SKILLS_INTELLIGENCE["tier_1"] if s in jd_lower]
        
        # Determine swaps for Tier 2 tools
        swaps = {}
        for primary, alternatives in cls.SKILLS_INTELLIGENCE["tier_2"].items():
            if primary in jd_lower:
                swaps[primary] = primary
            else:
                for alt in alternatives:
                    if alt in jd_lower:
                        swaps[primary] = alt
                        break
        
        # Detect domain-heavy JDs
        detected_domains = []
        for domain, keywords in cls.SKILLS_INTELLIGENCE["domains"].items():
            if any(k in jd_lower for k in keywords):
                detected_domains.append(domain)
        
        return {
            "prioritized_tier_1": prioritized_tier_1,
            "tier_2_swaps": swaps,
            "detected_domains": detected_domains,
            "recommendations": [
                f"Use {v} instead of {k}" for k, v in swaps.items() if k != (v if k in swaps else k)
            ] + [
                f"Add {d.replace('_', ' ').upper()} category to skills" for d in detected_domains
            ]
        }
    
    @classmethod
    def assess(
        cls,
        job_description: str,
        resume_data: Dict[str, Any],
        custom_competencies: Optional[Dict] = None
    ) -> JDAssessment:
        """
        Assess candidate fit against job description.
        """
        jd_lower = job_description.lower()
        competencies = custom_competencies or cls.COMPETENCY_AREAS
        
        # Extract candidate skills and experience
        candidate_skills = cls._extract_candidate_skills(resume_data)
        candidate_experience = cls._extract_experience_text(resume_data)
        
        # Assess each competency area
        competency_matches = []
        weighted_score = 0
        
        for area_name, area_config in competencies.items():
            match = cls._assess_competency(
                area_name, area_config, jd_lower,
                candidate_skills, candidate_experience
            )
            competency_matches.append(match)
            weighted_score += match.match_score * match.weight
        
        # Calculate overall fit score
        fit_score = min(100, int(weighted_score))
        fit_level = cls._determine_fit_level(fit_score)
        
        # Identify strengths and gaps
        strengths = [m.name.replace("_", " ").title() for m in competency_matches if m.match_score >= 70]
        gaps = [m.name.replace("_", " ").title() for m in competency_matches if m.match_score < 50]
        
        # Determine spinning recommendation
        spinning_rec = cls._get_spinning_recommendation(jd_lower)
        
        # Generate action items
        action_items = cls._generate_action_items(competency_matches, gaps)
        
        # Calculate resume distribution
        distribution = cls._calculate_bullet_distribution(competency_matches)
        
        # skills intelligence analysis
        skills_intel = cls.analyze_skills_intelligence(jd_lower)
        
        # summary guidance (Apply-Pilot 360-380 chars rule)
        summary_guidance = (
            "Create a 3-line summary (360-380 characters total). "
            "Frontload JD keywords. Avoid metrics in summary."
        )
        
        # Interest Level and Decision (Apply-Pilot Logic)
        interest_level = cls._calculate_interest_level(jd_lower, resume_data)
        decision = cls._determine_decision(fit_score, interest_level)
        
        return JDAssessment(
            fit_score=fit_score,
            fit_level=fit_level,
            competency_matches=competency_matches,
            strengths=strengths,
            gaps=gaps,
            spinning_recommendation=spinning_rec,
            action_items=action_items + skills_intel["recommendations"],
            resume_distribution=distribution,
            skills_intelligence=skills_intel,
            summary_guidance=summary_guidance,
            interest_level=interest_level,
            decision=decision
        )
    
    @classmethod
    def _extract_candidate_skills(cls, resume_data: Dict[str, Any]) -> List[str]:
        """Extract skills from resume."""
        skills = resume_data.get("skills", [])
        if isinstance(skills, str):
            skills = [s.strip().lower() for s in skills.split(",")]
        else:
            skills = [s.lower() if isinstance(s, str) else "" for s in skills]
        return skills
    
    @classmethod
    def _extract_experience_text(cls, resume_data: Dict[str, Any]) -> str:
        """Extract all experience text for keyword matching."""
        text_parts = []
        
        for exp in resume_data.get("experience", []):
            if isinstance(exp, dict):
                text_parts.append(exp.get("role", ""))
                text_parts.append(exp.get("title", ""))
                text_parts.append(exp.get("company", ""))
                desc = exp.get("description", exp.get("bullets", ""))
                if isinstance(desc, list):
                    text_parts.extend(desc)
                else:
                    text_parts.append(str(desc))
        
        return " ".join(text_parts).lower()
    
    @classmethod
    def _assess_competency(
        cls,
        area_name: str,
        area_config: Dict,
        jd_lower: str,
        candidate_skills: List[str],
        candidate_experience: str
    ) -> CompetencyMatch:
        """Assess a single competency area."""
        keywords = area_config.get("keywords", [])
        weight = area_config.get("weight", 0.2)
        
        # Find JD mentions
        jd_mentioned = [kw for kw in keywords if kw.lower() in jd_lower]
        
        if not jd_mentioned:
            # Competency not required by JD
            return CompetencyMatch(
                name=area_name, weight=0, match_score=100,
                matched_keywords=[], missing_keywords=[],
                recommendations=[]
            )
        
        # Recalculate weight based on JD mentions
        adjusted_weight = weight * (len(jd_mentioned) / len(keywords))
        
        # Check candidate match
        candidate_text = " ".join(candidate_skills) + " " + candidate_experience
        matched = [kw for kw in jd_mentioned if kw.lower() in candidate_text]
        missing = [kw for kw in jd_mentioned if kw.lower() not in candidate_text]
        
        match_score = (len(matched) / len(jd_mentioned)) * 100 if jd_mentioned else 100
        
        # Generate recommendations
        recommendations = []
        if missing:
            recommendations.append(f"Consider highlighting experience with: {', '.join(missing[:3])}")
        if match_score < 50:
            recommendations.append(f"Strengthen {area_name.replace('_', ' ')} section in resume")
        
        return CompetencyMatch(
            name=area_name,
            weight=adjusted_weight,
            match_score=round(match_score, 1),
            matched_keywords=matched,
            missing_keywords=missing,
            recommendations=recommendations
        )
    
    @classmethod
    def _determine_fit_level(cls, score: int) -> FitLevel:
        """Determine fit level from score."""
        if score >= 85:
            return FitLevel.EXCELLENT
        elif score >= 70:
            return FitLevel.STRONG
        elif score >= 50:
            return FitLevel.MODERATE
        else:
            return FitLevel.WEAK
    
    @classmethod
    def _get_spinning_recommendation(cls, jd_lower: str) -> str:
        """Determine spinning strategy based on company archetype."""
        scores = {arch: 0 for arch in cls.ARCHETYPE_PATTERNS}
        
        for archetype, patterns in cls.ARCHETYPE_PATTERNS.items():
            for pattern in patterns:
                if pattern in jd_lower:
                    scores[archetype] += 1
        
        top_archetype = max(scores, key=scores.get)
        
        recommendations = {
            "early_stage": "Use startup-focused language: 'agile', 'MVP', 'iterate quickly', 'wear many hats'",
            "growth_stage": "Emphasize scaling experience: 'growth metrics', '10x', 'process optimization'",
            "enterprise": "Highlight enterprise experience: 'cross-functional', 'stakeholder management', 'governance'"
        }
        
        return recommendations.get(top_archetype, "Standard professional language")
    
    @classmethod
    def _generate_action_items(
        cls,
        competency_matches: List[CompetencyMatch],
        gaps: List[str]
    ) -> List[str]:
        """Generate prioritized action items."""
        actions = []
        
        # Priority 1: Address gaps
        for gap in gaps[:2]:
            actions.append(f"🔴 Critical: Add more {gap} experience to resume")
        
        # Priority 2: Strengthen weak areas
        weak_areas = [m for m in competency_matches if 50 <= m.match_score < 70]
        for area in weak_areas[:2]:
            for rec in area.recommendations[:1]:
                actions.append(f"🟡 Improve: {rec}")
        
        # Priority 3: Optimize strong areas
        strong_areas = [m for m in competency_matches if m.match_score >= 70]
        if strong_areas:
            actions.append(f"🟢 Leverage: Lead with {strong_areas[0].name.replace('_', ' ')} experience")
        
        return actions
    
    @classmethod
    def _calculate_bullet_distribution(
        cls,
        competency_matches: List[CompetencyMatch]
    ) -> Dict[str, int]:
        """Calculate recommended bullet distribution (13 total bullets)."""
        total_bullets = 13
        
        # Filter to competencies with weight
        weighted = [m for m in competency_matches if m.weight > 0]
        if not weighted:
            return {"general": total_bullets}
        
        # Normalize weights
        total_weight = sum(m.weight for m in weighted)
        distribution = {}
        
        for match in weighted:
            bullets = int((match.weight / total_weight) * total_bullets)
            if bullets > 0:
                distribution[match.name] = bullets
        
        # Distribute remaining bullets
        remaining = total_bullets - sum(distribution.values())
        if remaining > 0 and distribution:
            top_area = max(distribution.keys(), key=lambda k: distribution[k])
            distribution[top_area] += remaining
        
        return distribution

    @classmethod
    def _calculate_interest_level(cls, jd_lower: str, resume_data: Dict[str, Any]) -> int:
        """
        Assess interest level (1-10) based on JD keywords and candidate preferences.
        """
        interest = 7  # Base interest
        
        # Boost for preferred archetypes/keywords if we had them in resume_data
        # For now, we simulate based on common high-interest signals
        high_interest_keywords = ["remote", "leadership", "0-to-1", "founding", "growth"]
        for kw in high_interest_keywords:
            if kw in jd_lower:
                interest += 1
                
        # Cap at 10
        return min(10, interest)

    @classmethod
    def _determine_decision(cls, fit_score: int, interest_level: int) -> str:
        """
        Determine the strategic decision based on Fit Score and Interest Level.
        HIGH PRIORITY: Fit 85+, Interest 8+ -> PROCEED
        MEDIUM PRIORITY: Fit 75-85, Interest 6-7 -> PRESENT TO USER
        LOW PRIORITY: Fit <75, Interest <6 -> ARCHIVE
        """
        if fit_score >= 85 and interest_level >= 8:
            return "PROCEED (High Priority)"
        elif fit_score >= 75 or interest_level >= 7:
            return "PRESENT TO USER (Medium Priority)"
        else:
            return "ARCHIVE (Low Priority)"


def assess_job_fit(job_description: str, resume_data: Dict[str, Any]) -> Dict[str, Any]:
    """Convenience function for API use."""
    assessment = JDAssessor.assess(job_description, resume_data)
    
    return {
        "fit_score": assessment.fit_score,
        "fit_level": assessment.fit_level.value,
        "interest_level": assessment.interest_level,
        "decision": assessment.decision,
        "strengths": assessment.strengths,
        "gaps": assessment.gaps,
        "spinning_recommendation": assessment.spinning_recommendation,
        "action_items": assessment.action_items,
        "resume_distribution": assessment.resume_distribution,
        "skills_intelligence": assessment.skills_intelligence,
        "summary_guidance": assessment.summary_guidance,
        "competency_breakdown": [
            {
                "area": m.name.replace("_", " ").title(),
                "score": m.match_score,
                "weight": round(m.weight * 100, 1),
                "matched": m.matched_keywords,
                "missing": m.missing_keywords
            }
            for m in assessment.competency_matches
            if m.weight > 0
        ]
    }
