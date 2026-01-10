#!/bin/bash
# Fixed test script with correct payloads

BASE_URL="http://localhost:8000"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}======================================================"
echo " 🤖 Testing All Endpoints (FIXED - No 4xx Errors)"
echo -e "======================================================${NC}"

test_count=0
pass_count=0

test_endpoint() {
    test_count=$((test_count + 1))
    echo -e "\n${BLUE}Test $test_count: $1${NC}"
    response=$(eval "$2" 2>&1)
    
    # Check for HTTP errors
    if echo "$response" | grep -q "HTTP/1.1 [45]"; then
        echo -e "${RED}❌ FAIL - HTTP Error${NC}"
        echo "$response" | head -5
    elif echo "$response" | jq . > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        echo "$response" | jq '.' | head -8
        pass_count=$((pass_count + 1))
    else
        echo -e "${RED}❌ FAIL${NC}"
        echo "$response" | head -5
    fi
}

# 1. Health Check
test_endpoint "API Health Check" "curl -s '$BASE_URL/'"

# 2. JD Fit Assessment
test_endpoint "JD Fit Assessment" "curl -s -X POST '$BASE_URL/assess-job-fit' \
  -H 'Content-Type: application/json' \
  -d '{
    \"job_description\": \"Senior PM with Python, SQL, leadership\",
    \"resume_data\": {
      \"skills\": [\"Python\", \"SQL\", \"Product Strategy\"],
      \"experience\": [{\"role\": \"Senior PM\", \"company\": \"TechCorp\"}]
    }
  }'"

# 3. Detect Company Stage (FIXED PAYLOAD)
test_endpoint "Detect Company Stage" "curl -s -X POST '$BASE_URL/detect-company-stage' \
  -H 'Content-Type: application/json' \
  -d '{
    \"job_description\": \"Fast-paced startup building analytics tools. Seed funded, team of 12, looking for scrappy PM.\"
  }'"

# 4. Analyze Complete Resume (FIXED PAYLOAD)  
test_endpoint "Complete Resume Analysis" "curl -s -X POST '$BASE_URL/analyze-complete-resume' \
  -H 'Content-Type: application/json' \
  -d '{
    \"resume_data\": {
      \"name\": \"John Doe\",
      \"email\": \"john@test.com\",
      \"experience\": [{
        \"role\": \"Product Manager\",
        \"company\": \"TechCorp\",
        \"bullets\": [
          \"Led cross-functional team to deliver analytics platform\",
          \"Built data pipeline with Python reducing costs by 40%\"
        ]
      }],
      \"education\": [],
      \"skills\": [\"Python\", \"SQL\"]
    }
  }'"

# 5. Bullet Library Selection
test_endpoint "Bullet Library Selection" "curl -s -X POST '$BASE_URL/bullet-library/select-for-job' \
  -H 'Content-Type: application/json' \
  -d '{
    \"bullets\": [
      {\"text\": \"Led team of 10\", \"competency\": \"leadership\"},
      {\"text\": \"Built Python pipeline\", \"competency\": \"technical_skills\"}
    ],
    \"job_description\": \"PM with Python and leadership\",
    \"count\": 2
  }'"

# 6. Resume Enhancement (AI-POWERED)
test_endpoint "Resume Enhancement (AI)" "curl -s -X POST '$BASE_URL/enhance-resume' \
  -H 'Content-Type: application/json' \
  -d '{
    \"resume_data\": {
      \"name\": \"John Doe\",
      \"email\": \"john@test.com\",
      \"summary\": \"Product Manager with 5 years experience\",
      \"experience\": [{
        \"role\": \"PM\",
        \"company\": \"Corp\",
        \"description\": \"Led product development\"
      }],
      \"education\": [],
      \"skills\": [\"Python\", \"SQL\", \"Product Strategy\"]
    },
    \"job_description\": \"Looking for PM with Python, SQL, and leadership experience\"
  }'"

# 7. Outreach Strategy
test_endpoint "Outreach Strategy" "curl -s -X POST '$BASE_URL/generate-outreach-strategy' \
  -H 'Content-Type: application/json' \
  -d '{
    \"job_data\": {\"title\": \"Product Manager\", \"company\": \"TechCorp\"},
    \"resume_data\": {\"name\": \"John Doe\"}
  }'"

# Summary
echo -e "\n${YELLOW}======================================================"
echo " 📊 TEST SUMMARY"
echo -e "======================================================${NC}"
echo -e "Total Tests: ${BLUE}$test_count${NC}"
echo -e "Passed: ${GREEN}$pass_count${NC}"
echo -e "Failed: ${RED}$((test_count - pass_count))${NC}"
echo -e "Success Rate: ${BLUE}$((pass_count * 100 / test_count))%${NC}"
echo ""

if [ $pass_count -eq $test_count ]; then
    echo -e "${GREEN}✅ ALL TESTS PASSED! No 4xx errors!${NC}"
else
    echo -e "${YELLOW}⚠️  Some tests failed. Check endpoint implementation.${NC}"
fi

echo ""
echo -e "${BLUE}🔍 Next Steps:${NC}"
echo "1. Add OpenRouter API key to backend/.env"
echo "2. Restart backend: cd backend && python main.py"
echo "3. Check OpenRouter activity: https://openrouter.ai/activity"
echo "4. You should see API calls appearing!"
echo ""
