import requests
import sys
import json
import os
from datetime import datetime
from io import BytesIO

class JenkinsDocGenAPITester:
    def __init__(self, base_url="https://devops-doc-ai.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.uploaded_file_ids = []
        self.created_doc_id = None
        self.created_template_id = None

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
                
                if response_type == 'json' and response.content:
                    try:
                        return True, response.json()
                    except:
                        return True, {}
                else:
                    return True, response.content
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                if response.content:
                    try:
                        error_data = response.json()
                        print(f"   Error: {error_data}")
                    except:
                        print(f"   Error: {response.text[:200]}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test API root endpoint"""
        success, response = self.run_test(
            "API Root",
            "GET",
            "",
            200
        )
        return success

    def test_file_upload(self):
        """Test file upload functionality"""
        # Create a test image file
        test_content = b"fake image content for testing"
        files = {'file': ('test_jenkins_screenshot.png', BytesIO(test_content), 'image/png')}
        
        success, response = self.run_test(
            "File Upload",
            "POST",
            "upload",
            200,
            files=files
        )
        
        if success and 'id' in response:
            self.uploaded_file_ids.append(response['id'])
            print(f"   Uploaded file ID: {response['id']}")
            return True
        return False

    def test_get_file(self):
        """Test file retrieval"""
        if not self.uploaded_file_ids:
            print("❌ No uploaded files to test retrieval")
            return False
            
        file_id = self.uploaded_file_ids[0]
        success, response = self.run_test(
            "Get File",
            "GET",
            f"files/{file_id}",
            200,
            response_type='binary'
        )
        return success

    def test_create_template(self):
        """Test template creation"""
        template_data = {
            "name": "Test Jenkins Pipeline Template",
            "description": "A test template for Jenkins pipeline documentation",
            "prompt_template": "You are an expert DevOps engineer. Analyze the Jenkins pipeline screenshots and create comprehensive documentation focusing on: 1. Pipeline stages 2. Build steps 3. Deployment process"
        }
        
        success, response = self.run_test(
            "Create Template",
            "POST",
            "templates",
            200,
            data=template_data
        )
        
        if success and 'id' in response:
            self.created_template_id = response['id']
            print(f"   Created template ID: {response['id']}")
            return True
        return False

    def test_get_templates(self):
        """Test template listing"""
        success, response = self.run_test(
            "Get Templates",
            "GET",
            "templates",
            200
        )
        
        if success:
            print(f"   Found {len(response)} templates")
            return True
        return False

    def test_generate_documentation(self):
        """Test documentation generation"""
        if not self.uploaded_file_ids:
            print("❌ No uploaded files for documentation generation")
            return False
            
        doc_data = {
            "title": "Test Jenkins Pipeline Documentation",
            "file_ids": self.uploaded_file_ids,
            "template_id": self.created_template_id,
            "ai_provider": "claude"
        }
        
        success, response = self.run_test(
            "Generate Documentation",
            "POST",
            "generate",
            200,
            data=doc_data
        )
        
        if success and 'id' in response:
            self.created_doc_id = response['id']
            print(f"   Generated documentation ID: {response['id']}")
            print(f"   Content preview: {response.get('content', '')[:100]}...")
            return True
        return False

    def test_get_documentations(self):
        """Test documentation listing"""
        success, response = self.run_test(
            "Get Documentations",
            "GET",
            "documentations",
            200
        )
        
        if success:
            print(f"   Found {len(response)} documentations")
            return True
        return False

    def test_get_documentation(self):
        """Test single documentation retrieval"""
        if not self.created_doc_id:
            print("❌ No created documentation to retrieve")
            return False
            
        success, response = self.run_test(
            "Get Documentation",
            "GET",
            f"documentations/{self.created_doc_id}",
            200
        )
        return success

    def test_update_documentation(self):
        """Test documentation update"""
        if not self.created_doc_id:
            print("❌ No created documentation to update")
            return False
            
        update_data = {
            "title": "Updated Test Jenkins Pipeline Documentation",
            "content": "# Updated Documentation\n\nThis is updated content for testing."
        }
        
        success, response = self.run_test(
            "Update Documentation",
            "PUT",
            f"documentations/{self.created_doc_id}",
            200,
            data=update_data
        )
        return success

    def test_export_pdf(self):
        """Test PDF export"""
        if not self.created_doc_id:
            print("❌ No created documentation to export")
            return False
            
        success, response = self.run_test(
            "Export PDF",
            "GET",
            f"export/pdf/{self.created_doc_id}",
            200,
            response_type='binary'
        )
        
        if success:
            print(f"   PDF size: {len(response)} bytes")
            return True
        return False

    def test_export_word(self):
        """Test Word export"""
        if not self.created_doc_id:
            print("❌ No created documentation to export")
            return False
            
        success, response = self.run_test(
            "Export Word",
            "GET",
            f"export/word/{self.created_doc_id}",
            200,
            response_type='binary'
        )
        
        if success:
            print(f"   Word document size: {len(response)} bytes")
            return True
        return False

    def test_delete_documentation(self):
        """Test documentation deletion"""
        if not self.created_doc_id:
            print("❌ No created documentation to delete")
            return False
            
        success, response = self.run_test(
            "Delete Documentation",
            "DELETE",
            f"documentations/{self.created_doc_id}",
            200
        )
        return success

    def test_delete_template(self):
        """Test template deletion"""
        if not self.created_template_id:
            print("❌ No created template to delete")
            return False
            
        success, response = self.run_test(
            "Delete Template",
            "DELETE",
            f"templates/{self.created_template_id}",
            200
        )
        return success

def main():
    print("🚀 Starting Jenkins Documentation Generator API Tests")
    print("=" * 60)
    
    tester = JenkinsDocGenAPITester()
    
    # Test sequence
    tests = [
        tester.test_root_endpoint,
        tester.test_file_upload,
        tester.test_get_file,
        tester.test_create_template,
        tester.test_get_templates,
        tester.test_generate_documentation,
        tester.test_get_documentations,
        tester.test_get_documentation,
        tester.test_update_documentation,
        tester.test_export_pdf,
        tester.test_export_word,
        tester.test_delete_documentation,
        tester.test_delete_template,
    ]
    
    # Run all tests
    for test in tests:
        try:
            test()
        except Exception as e:
            print(f"❌ Test {test.__name__} failed with exception: {e}")
    
    # Print results
    print("\n" + "=" * 60)
    print(f"📊 FINAL RESULTS")
    print(f"Tests passed: {tester.tests_passed}/{tester.tests_run}")
    print(f"Success rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%" if tester.tests_run > 0 else "No tests run")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())