from functools import lru_cache
from services.ai_service import AIService
from services.job_service import JobService
from services.export_service import ExportService

@lru_cache()
def get_ai_service():
    return AIService()

@lru_cache()
def get_job_service():
    return JobService(get_ai_service())

@lru_cache()
def get_export_service():
    return ExportService()
