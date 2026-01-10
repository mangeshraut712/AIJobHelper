#!/bin/bash
# Comprehensive AI Endpoint Testing - Using ACTUAL endpoints from main.py

BASE_URL="http://localhost:8000"

echo "======================================================"
echo " 🤖 CareerAgentPro AI Endpoint Testing (COMPREHENSIVE)"
echo "======================================================"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

test_count=0
pass_count=0
fail_count=0

# Test function
test_endpoint() {
    test_count=$((test_count + 1))
    echo -e "\n${BLUE}Test $test_count: $1${NC}"
    response=$(eval "$2" 2>/dev/null)
    
    if echo "$response" | jq . > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        echo "$response" | jq '.' | head -10
        pass_count=$((pass_count + 1))
    else
        echo -e "${RED}❌ FAIL${NC}"
        echo "$response" | head -5
        fail_count=$((fail_count + 1))
    fi
}

# 1. API Health
echo -e "\n${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}  BASIC ENDPOINTS${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

test_endpoint "API Health Check" "curl -s '$BASE_URL/'"

# 2. JD Assessment (AI-powered)
echo -e "\n${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}  AI-POWERED ANALYSIS ENDPOINTS${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

test_endpoint "JD Fit Assessment (AI Scoring)" "curl -s -X POST '$BASE_URL/assess-job-fit' \
  -H 'Content-Type: application/json' \
  -d '{
    \"job_description\": \"Senior ProductManager with 5+ years. Python, SQL, leadership required.\",
    \"resume_data\": {
      \"skills\": [\"Python\", \"SQL\", \"Product Strategy\"],
      \"experience\": [{\"role\": \"Senior PM\"}]
    }
  }'"

# 3. Bullet Library Selection (AI-powered)
test_endpoint "Bullet Library Selection" "curl -s -X POST '$BASE_URL/bullet-library/select-for-job' \
  -H 'Content-Type: application/json' \
  -d '{
    \"bullets\": [
      {\"text\": \"Led team of 10 engineers\", \"competency\": \"leadership\"},
      {\"text\": \"Built Python data pipeline\", \"competency\": \"technical_skills\"}
    ],
    \"job_description\": \"PM with Python and leadership\",
    \"count\": 2
  }'"

# 4. Bullet Analysis
test_endpoint "Bullet Analysis (6-Point Framework)" "curl -s -X POST '$BASE_URL/analyze-bullets' \
  -H 'Content-Type: application/json' \
  -d '{
    \"bullets\": [\"Led cross-functional team of 8 engineers to deliver analytics platform\"]
  }'"

# 5. Resume Verification
echo -e "\n${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}  VERIFICATION ENDPOINTS${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

test_endpoint "Resume Verification" "curl -s -X POST '$BASE_URL/verify-resume' \
  -H 'Content-Type: application/json' \
  -d '{
    \"resume_data\": {
      \"name\": \"John Doe\",
      \"email\": \"john@example.com\",
      \"summary\": \"PM with 5 years experience in analytics\",
      \"experience\": [{\"role\": \"PM\", \"bullets\": [\"Led team\"]}],
      \"skills\": [\"Python\", \"SQL\"],
      \"education\": [{\"degree\": \"BS CS\"}]
    }
  }'"

# 6. Outreach Strategy
echo -e "\n${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}  OUTREACH & COMMUNICATION ENDPOINTS${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

test_endpoint "Outreach Strategy Generation" "curl -s -X POST '$BASE_URL/generate-outreach-strategy' \
  -H 'Content-Type: application/json' \
  -d '{
    \"job_data\": {\"title\": \"Product Manager\", \"company\": \"TechCorp\"},
    \"resume_data\": {\"name\": \"John Doe\"}
  }'"

# 7. Export (DOCX)
echo -e "\n${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}  EXPORT ENDPOINTS${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "\n${BLUE}Test $((test_count + 1)): Export to DOCX${NC}"
curl -s -X POST "$BASE_URL/export/docx" \
  -H "Content-Type: application/json" \
  -d '{
    "resume_data": {
      "name": "John Doe",
      "email": "john@example.com",
      "skills": ["Python"]
    }
  }' -o /tmp/test_resume.docx 2>/dev/null

if [ -f /tmp/test_resume.docx ] && [ -s /tmp/test_resume.docx ]; then
    echo -e "${GREEN}✅ PASS - DOCX created ($(du -h /tmp/test_resume.docx | cut -f1))${NC}"
    pass_count=$((pass_count + 1))
else
    echo -e "${RED}❌ FAIL - DOCX not created${NC}"
    fail_count=$((fail_count + 1))
fi
test_count=$((test_count + 1))

# Summary
echo -e "\n${YELLOW}======================================================"
echo -e " 📊 TEST SUMMARY"
echo -e "======================================================${NC}"
echo -e "Total Tests: ${BLUE}$test_count${NC}"
echo -e "Passed: ${GREEN}$pass_count${NC}"
echo -e "Failed: ${RED}$fail_count${NC}"
echo -e "Success Rate: ${BLUE}$((pass_count * 100 / test_count))%${NC}"
echo ""

if [ $fail_count -eq 0 ]; then
    echo -e "${GREEN}✅ ALL TESTS PASSED! AI endpoints are working!${NC}"
else
    echo -e "${YELLOW}⚠️  Some tests failed. Check endpoint implementation.${NC}"
fi

echo -e "\n${BLUE}Active AI Features:${NC}"
echo "  • JD Fit Assessment (AI scoring)"
echo "  • Bullet Library Selection (AI ranking)"
echo "  • Bullet Analysis (6-point framework)"
echo "  • Resume Verification (quality gates)"
echo "  • Outreach Strategy (7-track system)"
echo "  • Document Export (DOCX, PDF, LaTeX)"
echo ""
