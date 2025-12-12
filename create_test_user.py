"""Create test accounts for Resume Analyzer"""
import requests

BASE_URL = "http://127.0.0.1:8000"

# Test credentials
STUDENT_ACCOUNT = {
    "name": "John Student",
    "email": "student@test.com",
    "password": "student123",
    "role": "student"
}

RECRUITER_ACCOUNT = {
    "name": "Jane Recruiter",
    "email": "recruiter@test.com",
    "password": "recruiter123",
    "role": "recruiter"
}

def create_account(user_data):
    """Register a new user account"""
    try:
        response = requests.post(f"{BASE_URL}/register", json=user_data)
        if response.status_code == 200:
            print(f"✅ Successfully created {user_data['role']} account:")
            print(f"   Email: {user_data['email']}")
            print(f"   Password: {user_data['password']}")
            return True
        elif response.status_code == 400 and "already registered" in response.json().get("detail", ""):
            print(f"ℹ️  Account already exists for {user_data['email']}")
            print(f"   Password: {user_data['password']}")
            return True
        else:
            print(f"❌ Failed to create {user_data['role']} account: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error creating account: {e}")
        return False

def test_login(email, password):
    """Test login with credentials"""
    try:
        response = requests.post(f"{BASE_URL}/login", json={"email": email, "password": password})
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Login successful for {email}")
            print(f"   User: {data.get('user_name')}")
            print(f"   Role: {data.get('user_role')}")
            return True
        else:
            print(f"❌ Login failed for {email}: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error during login: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("Creating Test Accounts for Resume Analyzer")
    print("=" * 60)
    print()
    
    # Create student account
    print("Creating Student Account...")
    create_account(STUDENT_ACCOUNT)
    print()
    
    # Create recruiter account
    print("Creating Recruiter Account...")
    create_account(RECRUITER_ACCOUNT)
    print()
    
    # Test logins
    print("=" * 60)
    print("Testing Login Credentials")
    print("=" * 60)
    print()
    
    print("Testing Student Login...")
    test_login(STUDENT_ACCOUNT["email"], STUDENT_ACCOUNT["password"])
    print()
    
    print("Testing Recruiter Login...")
    test_login(RECRUITER_ACCOUNT["email"], RECRUITER_ACCOUNT["password"])
    print()
    
    print("=" * 60)
    print("SUMMARY - Login Credentials")
    print("=" * 60)
    print()
    print("STUDENT ACCOUNT:")
    print(f"  Email:    {STUDENT_ACCOUNT['email']}")
    print(f"  Password: {STUDENT_ACCOUNT['password']}")
    print()
    print("RECRUITER ACCOUNT:")
    print(f"  Email:    {RECRUITER_ACCOUNT['email']}")
    print(f"  Password: {RECRUITER_ACCOUNT['password']}")
    print()
    print("Access the app at: http://localhost:5173")
    print("=" * 60)
