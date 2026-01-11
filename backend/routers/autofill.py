from fastapi import APIRouter, HTTPException, Body, status
import logging
from services.autofill_service import AutofillService

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/generate-autofill")
async def generate_autofill(data: dict = Body(...)):
    """Generate autofill script for job application platforms."""
    try:
        resume_data = data.get("resume_data")
        platform = data.get("platform", "google")
        
        if not resume_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="resume_data is required"
            )
        
        if platform not in ["google", "indeed", "linkedin"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid platform. Supported: google, indeed, linkedin"
            )
        
        script = AutofillService.generate_autofill_script(resume_data, platform)
        logger.info(f"Autofill script generated for platform: {platform}")
        return {"script": script}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to generate autofill script: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate autofill script"
        )
