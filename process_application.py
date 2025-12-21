import requests
import json
import os
from datetime import datetime
from slugify import slugify

# Helper to organize storage
def get_storage_path(job_title):
    date_str = datetime.now().strftime("%Y-%m-%d")
    slug_title = slugify(job_title or "general")
    path = os.path.join("storage", "exports", date_str, slug_title)
    os.makedirs(path, exist_ok=True)
    return path

job_description = {
    "title": "Software Engineer III, Full Stack, Google Cloud AI",
    "company": "Google",
    "location": "Mountain View, CA",
    "salary_range": "$141k - $202k",
    "description": "Google's software engineers develop next-generation technologies that handle information at a massive scale. As an SWE III, you will work on projects critical to Google’s needs, specifically within Google Cloud AI. The role requires versatility, leadership qualities, and an enthusiastic approach to full-stack problems.",
    "requirements": [
        "Bachelor’s degree or equivalent practical experience",
        "2 years of experience with software development in one or more programming languages",
        "2 years of experience with data structures or algorithms",
        "2 years of experience with full-stack development (Java, Python, Go, or C++) and front-end (JavaScript, TypeScript, HTML, CSS)"
    ],
    "responsibilities": [
        "Write product or system development code",
        "Participate in or lead design reviews",
        "Review code from other developers",
        "Contribute to documentation",
        "Triage, debug, track, and resolve product or system issues"
    ]
}

resume_data = {
    "name": "Mangesh Raut",
    "email": "mbr63drexel@gmail.com",
    "phone": "+16095053500",
    "linkedin": "mangeshraut71298",
    "website": "mangeshraut.pro",
    "summary": "Software Development Engineer (SDE) and Cloud Infrastructure Engineer skilled in full-stack development (Java, Python, AngularJS) and cloud-native solutions (AWS, Docker).",
    "experience": [
        {
            "company": "Customized Energy Solutions",
            "role": "Software Engineer",
            "duration": "Aug 2024 - Jul 2025",
            "description": "Engineered energy analytics dashboards using Java Spring Boot and AngularJS. Automated AWS deployments via Terraform and Jenkins. Constructed LSTM-based forecasting models."
        },
        {
            "company": "IoasiZ",
            "role": "Software Engineer",
            "duration": "Jul 2023 - Jul 2024",
            "description": "Refactored legacy Java monoliths into modular Spring services. Resolved 50+ microservices bugs. Integrated Redis caching."
        },
        {
            "company": "Aramark",
            "role": "Database Administrator",
            "duration": "Jun 2022 - Jun 2023",
            "description": "Implemented Python scripts to automate AWS inventory workflows. Migrated legacy databases to AWS RDS."
        }
    ],
    "education": [
        {
            "institution": "Drexel University",
            "degree": "Master of Science in Computer Science",
            "graduation_year": 2023
        }
    ],
    "skills": ["Java", "Python", "JavaScript", "Spring Boot", "AngularJS", "AWS", "Terraform", "Docker", "Jenkins", "TensorFlow", "Redis"]
}

# 1. Enhance Resume
print("Enhancing Resume...")
enhance_res = requests.post("http://localhost:8000/enhance-resume", json={
    "resume_data": resume_data,
    "job_description": job_description
})
enhance_data = enhance_res.json()
enhanced_resume_obj = enhance_data.get("enhanced_resume")

# 2. Export Files
print("\nExporting Files...")
store_path = get_storage_path(job_description["title"])
resume_name = slugify(resume_data["name"])

# PDF
pdf_res = requests.post("http://localhost:8000/export/pdf", json=enhanced_resume_obj)
pdf_path = os.path.join(store_path, f"{resume_name}_enhanced.pdf")
with open(pdf_path, "wb") as f:
    f.write(pdf_res.content)
print(f"- Saved: {pdf_path}")

# DOCX
docx_res = requests.post("http://localhost:8000/export/docx", json=enhanced_resume_obj)
docx_path = os.path.join(store_path, f"{resume_name}_enhanced.docx")
with open(docx_path, "wb") as f:
    f.write(docx_res.content)
print(f"- Saved: {docx_path}")

# LaTeX
latex_res = requests.post("http://localhost:8000/export/latex", json=enhanced_resume_obj)
latex_path = os.path.join(store_path, f"{resume_name}_enhanced.tex")
with open(latex_path, "w") as f:
    f.write(latex_res.text)
print(f"- Saved: {latex_path}")

# 3. Generate Cover Letter
print("\nGenerating Cover Letter...")
cover_res = requests.post("http://localhost:8000/generate-cover-letter", json={
    "resume_data": resume_data,
    "job_description": job_description,
    "template_type": "modern"
})
cover_content = cover_res.json().get("content")
cover_path = os.path.join(store_path, f"{resume_name}_cover_letter.txt")
with open(cover_path, "w") as f:
    f.write(cover_content)
print(f"- Saved: {cover_path}")

# 4. Generate Communication (LinkedIn)
print("\nGenerating LinkedIn Message...")
comm_res = requests.post("http://localhost:8000/generate-communication", json={
    "resume_data": resume_data,
    "job_description": job_description,
    "type": "linkedin_message"
})
print("\nLinkedIn Draft:")
print(comm_res.json().get("content"))
