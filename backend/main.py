import sys
import os
# Add current directory to path for serverless/deployment environments
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, Depends, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, PlainTextResponse
import uvicorn
from dotenv import load_dotenv
from schemas import EnhancementRequest, CoverLetterRequest, CommunicationRequest, JobDescription, ResumeData
from services.ai_service import AIService
from services.job_service import JobService
from services.export_service import ExportService
from services.autofill_service import AutofillService

load_dotenv()

app = FastAPI(title="CareerAgentPro API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ai_service = AIService()
job_service = JobService(ai_service)
export_service = ExportService()

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "CareerAgentPro", "version": "1.0.0"}

@app.get("/")
async def root():
    return {"message": "Welcome to AIJobHelper API"}

@app.post("/extract-job")
async def extract_job(url_data: dict):
    url = url_data.get("url")
    return await job_service.extract_from_url(url)

@app.post("/enhance-resume")
async def enhance_resume(request: EnhancementRequest):
    return await ai_service.enhance_resume(request.resume_data, request.job_description)

@app.post("/generate-cover-letter")
async def generate_cover_letter(request: CoverLetterRequest):
    content = await ai_service.generate_cover_letter(request.resume_data, request.job_description, request.template_type)
    return {"content": content}

@app.post("/generate-communication")
async def generate_communication(request: CommunicationRequest):
    content = await ai_service.generate_communication(request.resume_data, request.job_description, request.type)
    return {"content": content}

@app.post("/export/docx")
async def export_docx(resume: ResumeData):
    output_path = "temp_resume.docx"
    export_service.to_docx(resume, output_path)
    return FileResponse(output_path, filename=f"{resume.name}_resume.docx", media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document")

@app.post("/export/pdf")
async def export_pdf(resume: ResumeData):
    output_path = "temp_resume.pdf"
    export_service.to_pdf(resume, output_path)
    return FileResponse(output_path, filename=f"{resume.name}_resume.pdf", media_type="application/pdf")

@app.post("/export/latex")
async def export_latex(resume: ResumeData):
    content = export_service.to_latex(resume)
    return PlainTextResponse(content)

@app.post("/generate-autofill")
async def generate_autofill(data: dict = Body(...)):
    # Expects {"resume_data": {...}, "platform": "google"}
    resume_data = data.get("resume_data")
    platform = data.get("platform", "google")
    script = AutofillService.generate_autofill_script(resume_data, platform)
    return {"script": script}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
