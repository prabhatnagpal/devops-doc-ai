import requests
import sys
import json
from datetime import datetime
from io import BytesIO

class FocusedAPITester:
    def __init__(self, base_url="https://devops-doc-ai.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None, response_type='json'):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {}
        
        if files is None and data is not None:
            headers['Content-Type'] = 'application/json'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                if files:
                    response = requests.post(url, files=files, timeout=60)
                else:
                    response = requests.post(url, json=data, headers=headers, timeout=60)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                self.test_results.append({"test": name, "status": "PASS", "details": f"Status: {response.status_code}"})
                
                if response_type == 'json' and response.content:
                    try:
                        return True, response.json()
                    except:
                        return True, {}
                else:
                    return True, response.content
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                self.test_results.append({"test": name, "status": "FAIL", "details": f"Expected {expected_status}, got {response.status_code}"})
                if response.content:
                    try:
                        error_data = response.json()
                        print(f"   Error: {error_data}")
                    except:
                        print(f"   Error: {response.text[:200]}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.test_results.append({"test": name, "status": "FAIL", "details": f"Error: {str(e)}"})
            return False, {}

def main():
    print("🚀 Starting Focused Backend API Tests")
    print("=" * 60)
    
    tester = FocusedAPITester()
    
    # Test 1: POST /api/templates creates template
    print("\n📋 Testing Template CRUD Operations...")
    template_data = {
        "name": "Test Template for Testing",
        "description": "A test template created during testing",
        "prompt_template": "Test prompt template content"
    }
    
    success, template_response = tester.run_test(
        "POST /api/templates creates template",
        "POST",
        "templates",
        200,
        data=template_data
    )
    
    created_template_id = None
    if success and 'id' in template_response:
        created_template_id = template_response['id']
        print(f"   Created template ID: {created_template_id}")
    
    # Test 2: GET /api/templates returns templates
    success, templates_response = tester.run_test(
        "GET /api/templates returns templates",
        "GET",
        "templates",
        200
    )
    
    if success:
        print(f"   Found {len(templates_response)} templates")
    
    # Test 3: POST /api/upload uploads file successfully
    print("\n📁 Testing File Upload Operations...")
    test_content = b"fake image content for testing upload"
    files = {'file': ('test_screenshot.png', BytesIO(test_content), 'image/png')}
    
    success, upload_response = tester.run_test(
        "POST /api/upload uploads file successfully",
        "POST",
        "upload",
        200,
        files=files
    )
    
    uploaded_file_id = None
    if success and 'id' in upload_response:
        uploaded_file_id = upload_response['id']
        print(f"   Uploaded file ID: {uploaded_file_id}")
    
    # Test 4: GET /api/files/:file_id retrieves uploaded files
    if uploaded_file_id:
        success, file_response = tester.run_test(
            "GET /api/files/:file_id retrieves uploaded files",
            "GET",
            f"files/{uploaded_file_id}",
            200,
            response_type='binary'
        )
        
        if success:
            print(f"   Retrieved file size: {len(file_response)} bytes")
    
    # Test 5: GET /api/documentations returns documentation list
    print("\n📄 Testing Documentation Operations...")
    success, docs_response = tester.run_test(
        "GET /api/documentations returns documentation list",
        "GET",
        "documentations",
        200
    )
    
    if success:
        print(f"   Found {len(docs_response)} documentations")
    
    # Test 6: DELETE /api/templates/:id deletes template
    if created_template_id:
        success, delete_response = tester.run_test(
            "DELETE /api/templates/:id deletes template",
            "DELETE",
            f"templates/{created_template_id}",
            200
        )
    
    # Print results summary
    print("\n" + "=" * 60)
    print(f"📊 FOCUSED TEST RESULTS")
    print(f"Tests passed: {tester.tests_passed}/{tester.tests_run}")
    print(f"Success rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%" if tester.tests_run > 0 else "No tests run")
    
    print("\n📋 Detailed Results:")
    for result in tester.test_results:
        status_icon = "✅" if result["status"] == "PASS" else "❌"
        print(f"{status_icon} {result['test']}: {result['details']}")
    
    if tester.tests_passed == tester.tests_run:
        print("\n🎉 All focused tests passed!")
        return 0
    else:
        print(f"\n⚠️  {tester.tests_run - tester.tests_passed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())