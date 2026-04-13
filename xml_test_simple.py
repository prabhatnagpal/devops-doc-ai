import requests
import sys
from io import BytesIO

def test_xml_upload():
    """Test XML upload functionality only"""
    base_url = "https://devops-doc-ai.preview.emergentagent.com"
    api_url = f"{base_url}/api"
    
    print("🔍 Testing XML Upload...")
    
    # Read the test config.xml file
    try:
        with open('/tmp/test_config.xml', 'rb') as f:
            xml_content = f.read()
    except FileNotFoundError:
        print("❌ Test config.xml file not found at /tmp/test_config.xml")
        return False
    
    files = {'file': ('test_config.xml', BytesIO(xml_content), 'application/xml')}
    
    try:
        response = requests.post(f"{api_url}/upload-xml", files=files, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ XML Upload Success - Status: {response.status_code}")
            print(f"   File ID: {data.get('id')}")
            print(f"   Original filename: {data.get('original_filename')}")
            print(f"   Parsed job type: {data.get('parsed_data', {}).get('job_type', 'unknown')}")
            print(f"   Parameters found: {len(data.get('parsed_data', {}).get('parameters', []))}")
            print(f"   Build steps found: {len(data.get('parsed_data', {}).get('build_steps', []))}")
            
            # Test retrieval
            xml_id = data.get('id')
            if xml_id:
                print(f"\n🔍 Testing XML File Retrieval...")
                get_response = requests.get(f"{api_url}/xml-files/{xml_id}", timeout=30)
                if get_response.status_code == 200:
                    get_data = get_response.json()
                    print(f"✅ XML Retrieval Success - Status: {get_response.status_code}")
                    print(f"   Retrieved filename: {get_data.get('original_filename')}")
                    print(f"   Job type: {get_data.get('parsed_data', {}).get('job_type', 'unknown')}")
                    return True
                else:
                    print(f"❌ XML Retrieval Failed - Status: {get_response.status_code}")
                    return False
            
            return True
        else:
            print(f"❌ XML Upload Failed - Status: {response.status_code}")
            if response.content:
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text[:200]}")
            return False
            
    except Exception as e:
        print(f"❌ XML Upload Error: {str(e)}")
        return False

def test_api_root():
    """Test API root endpoint"""
    base_url = "https://devops-doc-ai.preview.emergentagent.com"
    api_url = f"{base_url}/api"
    
    print("🔍 Testing API Root...")
    
    try:
        response = requests.get(f"{api_url}/", timeout=10)
        if response.status_code == 200:
            print(f"✅ API Root Success - Status: {response.status_code}")
            print(f"   Response: {response.json()}")
            return True
        else:
            print(f"❌ API Root Failed - Status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ API Root Error: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 Testing XML Upload Feature")
    print("=" * 50)
    
    success1 = test_api_root()
    success2 = test_xml_upload()
    
    print("\n" + "=" * 50)
    if success1 and success2:
        print("🎉 All XML tests passed!")
        sys.exit(0)
    else:
        print("⚠️  Some XML tests failed")
        sys.exit(1)