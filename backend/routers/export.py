from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.responses import FileResponse, PlainTextResponse
import logging
import tempfile
from schemas import ResumeData
from services.export_service import ExportService
from dependencies import get_export_service

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/export/docx")
async def export_docx(
    resume: ResumeData,
    export_service: ExportService = Depends(get_export_service)
):
    """Export resume as DOCX file."""
    try:
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

@router.post("/export/pdf")
async def export_pdf(
    resume: ResumeData,
    export_service: ExportService = Depends(get_export_service)
):
    """Export resume as PDF file."""
    try:
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

@router.post("/export/latex")
async def export_latex(
    resume: ResumeData,
    export_service: ExportService = Depends(get_export_service)
):
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
