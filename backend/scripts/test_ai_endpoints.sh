#!/bin/bash
# Test all AI-powered endpoints to ensure functionality

BASE_URL="http://localhost:8000"

echo "========================================="
echo " CareerAgentPro AI Endpoint Testing"
echo "========================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Health Check
echo -e "\n${YELLOW}1️⃣ Testing API Health...${NC}"
response=$(curl -s "$BASE_URL/" | jq -r '.message' 2>/dev/null)
if [ "$response" = "Welcome to CareerAgentPro API" ]; then
    echo -e "${GREEN}✅ API is healthy${NC}"
else
    echo -e "${RED}❌ API health check failed${NC}"
fi

# 2. Job Analysis
echo -e "\n${YELLOW}2️⃣ Testing Job Analysis (AI)...${NC}"
curl -s -X POST "$BASE_URL/analyze-job" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/job",
    "html_content": "<div>Product Manager role at TechCorp. Requirements: Python, SQL, Leadership, 5+ years experience. Responsibilities: Build analytics platform, manage cross-functional teams.</div>"
  }' | jq '.title, .company, .requirements[0:2]'

# 3. Bullet Analysis
echo -e "\n${YELLOW}3️⃣ Testing Bullet Analysis (6-Point Framework)...${NC}"
curl -s -X POST "$BASE_URL/analyze-bullet" \
  -H "Content-Type: application/json" \
  -d '{
    "bullet": "Led cross-functional team of 8 engineers to deliver analytics platform, reducing reporting time by 60% and enabling real-time insights for 200+ stakeholders"
  }' | jq '.score, .strengths[0:2], .missing_elements[0:1]'

# 4. JD Assessment
echo -e "\n${YELLOW}4️⃣ Testing JD Fit Assessment (AI Scoring)...${NC}"
curl -s -X POST "$BASE_URL/assess-job-fit" \
  -H "Content-Type: application/json" \
  -d '{
    "job_description": "Senior Product Manager with 5+ years experience. Strong technical skills in Python, SQL. Leadership experience required.",
    "resume_data": {
      "skills": ["Python", "SQL", "Product Strategy", "Agile"],
      "experience": [{"role": "Senior PM", "company": "TechCorp", "bullets": ["Led team"]}]
    }
  }' | jq '.fit_score, .fit_level, .decision, .strengths[0:2]'

# 5. Bullet Library Selection
echo -e "\n${YELLOW}5️⃣ Testing Bullet Library Selection (AI)...${NC}"
curl -s -X POST "$BASE_URL/bullet-library/select-for-job" \
  -H "Content-Type: application/json" \
  -d '{
    "bullets": [
      {"text": "Led analytics platform development", "competency": "leadership", "tags": ["analytics"]},
      {"text": "Built data pipeline with Python", "competency": "technical_skills", "tags": ["python"]}
    ],
    "job_description": "Looking for PM with analytics and Python experience",
    "count": 2
  }' | jq '.total_selected, .selected_bullets[0].text'

# 6. Resume Verification
echo -e "\n${YELLOW}6️⃣ Testing Resume Verification...${NC}"
curl -s -X POST "$BASE_URL/verify-resume" \
  -H "Content-Type: application/json" \
  -d '{
    "resume_data": {
      "name": "John Doe",
      "email": "john@example.com",
      "summary": "Product Manager with 5+ years of experience building data products and leading cross-functional teams. Specializing in analytics platforms, growth optimization, and technical product management with proven track record of shipping products that drive business impact.",
      "experience": [{
        "role": "PM",
        "company": "Corp",
        "bullets": ["Led team"]
      }],
      "skills": ["Python", "SQL", "Product Strategy"],
      "education": [{"institution": "University", "degree": "BS CS"}]
    }
  }' | jq '.status, .score, .checks | length'

# 7. Detect Company Stage
echo -e "\n${YELLOW}7️⃣ Testing Company Stage Detection...${NC}"
curl -s -X POST "$BASE_URL/detect-company-stage" \
  -H "Content-Type: application/json" \
  -d '{
    "company_description": "Fast-paced startup building the next generation of analytics tools. Seed funded, team of 12."
  }' | jq '.stage, .signals[0:2]'

# 8. Complete Resume Analysis
echo -e "\n${YELLOW}8️⃣ Testing Complete Resume Analysis...${NC}"
curl -s -X POST "$BASE_URL/analyze-complete-resume" \
  -H "Content-Type: application/json" \
  -d '{
    "resume_data": {
      "experience": [{
        "role": "PM",
        "bullets": [
          "Led team to deliver platform",
          "Built analytics with Python"
        ]
      }]
    }
  }' | jq '.metric_diversity.all_types_present, .verb_uniqueness.all_unique'

echo -e "\n${GREEN}=========================================${NC}"
echo -e "${GREEN} ✅ Testing Complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "Note: If you see errors, ensure:"
echo "  1. Backend is running (python main.py)"
echo "  2. Running on port 8000"
echo "  3. All dependencies installed"
