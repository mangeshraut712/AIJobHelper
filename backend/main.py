"""Main FastAPI application for CareerAgentPro backend."""
import sys
import os
import logging

# Add current directory to path for serverless/deployment environments
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, HTTPException, Body, File, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, PlainTextResponse
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
import uvicorn
from dotenv import load_dotenv
from schemas import EnhancementRequest, CoverLetterRequest, CommunicationRequest, ResumeData
from services.ai_service import AIService
from services.job_service import JobService
from services.export_service import ExportService
from services.autofill_service import AutofillService
from services.resume_parser import ResumeParser

load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="CareerAgentPro API",
    version="1.0.0",
    description="AI-Powered Career Platform API",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
ai_service = AIService()
job_service = JobService(ai_service)
export_service = ExportService()

# Exception handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    """Handle validation errors."""
    logger.warning(f"Validation error: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"error": "Validation error", "details": exc.errors()},
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Handle HTTP exceptions."""
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail},
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handle unexpected exceptions."""
    logger.error(f"Unexpected error: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"error": "Internal server error", "message": "An unexpected error occurred."},
    )


@app.post("/parse-resume")
async def parse_resume(file: UploadFile = File(...)):
    """Parse resume file and extract structured data."""
    try:
        # Read file content
        content = await file.read()
        filename = file.filename or "unknown.pdf"
        
        # Extract text from file
        try:
            text = ResumeParser.extract_text(content, filename)
        except Exception as extract_err:
            raise HTTPException(
                status_code=400, 
                detail=f"Could not read file. Supported formats: PDF, DOCX, TXT. Error: {type(extract_err).__name__}"
            )
        
        if not text or not text.strip():
            raise HTTPException(
                status_code=400, 
                detail="Could not extract text from resume. Please ensure the file contains readable text."
            )
        
        # Parse the extracted text
        try:
            parsed_data = await ai_service.parse_resume(text)
            logger.info(f"Successfully parsed resume: {filename}")
            return parsed_data
        except Exception as parse_err:
            logger.error(f"Error parsing resume: {str(parse_err)}", exc_info=True)
            raise HTTPException(
                status_code=500, 
                detail=f"Error parsing resume content: {type(parse_err).__name__}"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error processing resume: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, 
            detail=f"Unexpected error processing resume: {type(e).__name__}"
        )

@app.get("/health")
async def health():
    """Comprehensive health check endpoint."""
    from datetime import datetime
    
    health_status = {
        "status": "healthy",
        "service": "CareerAgentPro",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "checks": {
            "api": "ok",
            "ai_service": "ok" if ai_service.is_configured else "not_configured",
        }
    }
    
    # Check AI service
    if not ai_service.is_configured:
        health_status["status"] = "degraded"
    
    return health_status

@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Welcome to CareerAgentPro API"}

@app.post("/extract-job")
async def extract_job(url_data: dict = Body(...)):
    """Extract job description from URL."""
    try:
        url = url_data.get("url")
        if not url:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="URL is required"
            )
        
        if not isinstance(url, str) or not url.startswith(("http://", "https://")):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid URL format"
            )
        
        result = await job_service.extract_from_url(url)
        logger.info(f"Successfully extracted job from URL: {url}")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to extract job: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to extract job description from URL"
        )

@app.post("/enhance-resume")
async def enhance_resume(request: EnhancementRequest):
    """Enhance resume based on job description."""
    try:
        result = await ai_service.enhance_resume(request.resume_data, request.job_description)
        logger.info("Resume enhancement completed successfully")
        return result
    except Exception as e:
        logger.error(f"Failed to enhance resume: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to enhance resume"
        )

@app.post("/generate-cover-letter")
async def generate_cover_letter(request: CoverLetterRequest):
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

@app.post("/generate-communication")
async def generate_communication(request: CommunicationRequest):
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

@app.post("/export/docx")
async def export_docx(resume: ResumeData):
    """Export resume as DOCX file."""
    try:
        import tempfile
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=".docx") as tmp_file:
            output_path = tmp_file.name
        
        export_service.to_docx(resume, output_path)
        
        response = FileResponse(
            output_path,
            filename=f"{resume.name.replace(' ', '_')}_resume.docx",
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )
        logger.info(f"DOCX export completed for: {resume.name}")
        return response
    except Exception as e:
        logger.error(f"Failed to export DOCX: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to export resume as DOCX"
        )

@app.post("/export/pdf")
async def export_pdf(resume: ResumeData):
    """Export resume as PDF file."""
    try:
        import tempfile
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
            output_path = tmp_file.name
        
        export_service.to_pdf(resume, output_path)
        
        response = FileResponse(
            output_path,
            filename=f"{resume.name.replace(' ', '_')}_resume.pdf",
            media_type="application/pdf"
        )
        logger.info(f"PDF export completed for: {resume.name}")
        return response
    except Exception as e:
        logger.error(f"Failed to export PDF: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to export resume as PDF"
        )

@app.post("/export/latex")
async def export_latex(resume: ResumeData):
    """Export resume as LaTeX file."""
    try:
        content = export_service.to_latex(resume)
        logger.info(f"LaTeX export completed for: {resume.name}")
        return PlainTextResponse(content, media_type="text/plain")
    except Exception as e:
        logger.error(f"Failed to export LaTeX: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to export resume as LaTeX"
        )

@app.post("/generate-autofill")
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


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )

