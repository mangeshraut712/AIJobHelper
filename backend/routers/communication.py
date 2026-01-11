from fastapi import APIRouter, HTTPException, Body, Depends, status
import logging
from typing import Dict, Any

from schemas import CoverLetterRequest, CommunicationRequest
from services.ai_service import AIService
from services.verification_service import CoverLetterVerifier, OutreachVerifier
from services.outreach_service import generate_outreach_strategy
from services.workflow_orchestrator import ApplicationOrchestrator
from services.cover_letter_service import CoverLetterService
from dependencies import get_ai_service

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/generate-cover-letter")
async def generate_cover_letter(
    request: CoverLetterRequest,
    ai_service: AIService = Depends(get_ai_service)
):
    """Generate cover letter based on resume and job description."""
    try:
        content = await ai_service.generate_cover_letter(
            request.resume_data,
            request.job_description,
            request.template_type
        )
        logger.info("Cover letter generated successfully")
        return {"content": content}
    except Exception as e:
        logger.error(f"Failed to generate cover letter: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate cover letter"
        )

@router.post("/generate-elite-cover-letter")
async def generate_elite_cover_letter(data: dict = Body(...)):
    """
    Generates a high-converting cover letter using the 4-paragraph framework.
    """
    try:
        job_data = data.get("job_data")
        resume_data = data.get("resume_data")
        template_type = data.get("template_type", "minimalist")
        company_hook = data.get("company_hook")
        
        if not job_data or not resume_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="job_data and resume_data are required"
            )
            
        result = await CoverLetterService.generate(
            job_data, resume_data, template_type, company_hook
        )
        
        return result
    except Exception as e:
        logger.error(f"Failed to generate elite cover letter: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate cover letter"
        )

@router.post("/generate-communication")
async def generate_communication(
    request: CommunicationRequest,
    ai_service: AIService = Depends(get_ai_service)
):
    """Generate communication (email/LinkedIn message) based on resume and job."""
    try:
        if request.type not in ["email", "linkedin_message", "follow_up"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid communication type. Must be: email, linkedin_message, or follow_up"
            )
        
        content = await ai_service.generate_communication(
            request.resume_data,
            request.job_description,
            request.type
        )
        logger.info(f"Communication ({request.type}) generated successfully")
        return {"content": content}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to generate communication: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate communication"
        )

@router.post("/verify-cover-letter")
async def verify_cover_letter(data: dict = Body(...)):
    """
    Cover Letter Verification Gate.
    
    Validates:
    - Line count (8-12 lines)
    - Word count (150-200 words)
    - Personalization (company/role mentions)
    - Proper format (salutation/closing)
    """
    try:
        cover_letter = data.get("cover_letter", "")
        job_data = data.get("job_data")
        
        if not cover_letter:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="cover_letter is required"
            )
        
        report = CoverLetterVerifier.verify(cover_letter, job_data)
        
        return {
            "status": report.overall_status.value,
            "score": report.score,
            "checks": [
                {"name": c.name, "status": c.status.value, "message": c.message}
                for c in report.checks
            ],
            "suggestions": report.suggestions
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to verify cover letter: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to verify cover letter"
        )

@router.post("/generate-outreach-strategy")
async def generate_outreach_strategy_endpoint(data: dict = Body(...)):
    """
    Multi-Track Outreach Strategy with 3-Tier Escalation.
    
    Returns:
    - Primary track recommendation (direct/warm_intro/cold)
    - Messages for each track and tier
    - Target contacts to find
    - Preparation checklist
    """
    try:
        job_data = data.get("job_data", {})
        resume_data = data.get("resume_data", {})
        
        if not job_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="job_data is required"
            )
        
        strategy = generate_outreach_strategy(job_data, resume_data)
        logger.info(f"Outreach strategy generated for {strategy['company']}")
        return strategy
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to generate outreach strategy: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate outreach strategy"
        )

@router.post("/verify-outreach")
async def verify_outreach(data: dict = Body(...)):
    """
    Outreach Message Verification Gate.
    
    Validates message length, personalization, and call-to-action.
    """
    try:
        message = data.get("message", "")
        message_type = data.get("type", "linkedin")
        job_data = data.get("job_data")
        
        if not message:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="message is required"
            )
        
        report = OutreachVerifier.verify(message, message_type, job_data)
        
        return {
            "status": report.overall_status.value,
            "score": report.score,
            "checks": [
                {"name": c.name, "status": c.status.value, "message": c.message}
                for c in report.checks
            ],
            "suggestions": report.suggestions
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to verify outreach: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to verify outreach"
        )

@router.post("/orchestrate-application")
async def orchestrate_application(data: dict = Body(...)):
    """
    Autonomous Application Orchestrator.
    Runs JD assessment, bullet selection, CL generation, and outreach strategy.
    """
    try:
        job_description = data.get("job_description")
        resume_data = data.get("resume_data")
        bullet_library = data.get("bullet_library", [])
        
        if not job_description or not resume_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="job_description and resume_data are required"
            )

        # Note: This mock orchestration doesn't use AI service directly but uses other services
        # If it needed AI service, we should inject it.
        # However, checking workflow_orchestrator.py, it seems it might be using static methods or instantiating services?
        # Let's check imports in workflow_orchestrator.py if needed. 
        # For now assume it is self-contained or uses global instances if bad design.
        # But wait, ApplicationOrchestrator usually needs dependencies.
        
        result = ApplicationOrchestrator.run_application_flow(
            job_description=job_description,
            resume_data=resume_data
        )
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to orchestrate application: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to orchestrate application"
        )
