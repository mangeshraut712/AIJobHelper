#!/usr/bin/env python3
"""Simple test script for backend API endpoints."""
import requests
import json
import sys

BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint."""
    print("Testing /health endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        response.raise_for_status()
        data = response.json()
        print(f"✅ Health check passed: {data['status']}")
        return True
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_root():
    """Test root endpoint."""
    print("\nTesting / endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/", timeout=5)
        response.raise_for_status()
        data = response.json()
        print(f"✅ Root endpoint: {data['message']}")
        return True
    except Exception as e:
        print(f"❌ Root endpoint failed: {e}")
        return False

def test_extract_job():
    """Test job extraction endpoint."""
    print("\nTesting /extract-job endpoint...")
    try:
        payload = {
            "url": "https://www.linkedin.com/jobs/view/123456789"
        }
        response = requests.post(
            f"{BASE_URL}/extract-job",
            json=payload,
            timeout=10
        )
        response.raise_for_status()
        data = response.json()
        print(f"✅ Job extraction: {data.get('title', 'N/A')} at {data.get('company', 'N/A')}")
        return True
    except Exception as e:
        print(f"❌ Job extraction failed: {e}")
        return False

def test_enhance_resume():
    """Test resume enhancement endpoint."""
    print("\nTesting /enhance-resume endpoint...")
    try:
        payload = {
            "resume_data": {
                "name": "Test User",
                "email": "test@example.com",
                "summary": "Experienced software engineer",
                "experience": [
                    {
                        "role": "Software Engineer",
                        "company": "Tech Corp",
                        "duration": "2020-2024",
                        "description": "Developed web applications"
                    }
                ],
                "education": [
                    {
                        "institution": "University",
                        "degree": "BS Computer Science",
                        "graduation_year": "2020"
                    }
                ],
                "skills": ["Python", "JavaScript", "React"]
            },
            "job_description": {
                "title": "Senior Software Engineer",
                "company": "Tech Company",
                "description": "Looking for experienced software engineer",
                "skills": ["Python", "JavaScript"],
                "requirements": ["5+ years experience"],
                "responsibilities": []
            }
        }
        response = requests.post(
            f"{BASE_URL}/enhance-resume",
            json=payload,
            timeout=30
        )
        response.raise_for_status()
        data = response.json()
        score = data.get('ats_score', data.get('score', 'N/A'))
        print(f"✅ Resume enhancement: ATS Score = {score}")
        return True
    except Exception as e:
        print(f"❌ Resume enhancement failed: {e}")
        return False

def main():
    """Run all tests."""
    print("=" * 50)
    print("Backend API Test Suite")
    print("=" * 50)
    
    results = []
    results.append(("Health Check", test_health()))
    results.append(("Root Endpoint", test_root()))
    results.append(("Extract Job", test_extract_job()))
    results.append(("Enhance Resume", test_enhance_resume()))
    
    print("\n" + "=" * 50)
    print("Test Results Summary")
    print("=" * 50)
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{name}: {status}")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    print(f"\nTotal: {passed}/{total} tests passed")
    
    return 0 if passed == total else 1

if __name__ == "__main__":
    sys.exit(main())

