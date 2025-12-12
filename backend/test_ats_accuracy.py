"""
Test script to verify ATS scoring accuracy improvements
"""
from utils import (
    extract_skills, 
    parse_resume, 
    parse_jd, 
    calculate_ats_score,
    normalize_skill,
    extract_years_of_experience
)

def test_skill_extraction():
    """Test skill extraction with synonyms"""
    print("=" * 60)
    print("TEST 1: Skill Extraction & Synonym Handling")
    print("=" * 60)
    
    test_cases = [
        {
            "text": "I have 5 years of experience in Python, JavaScript, React.js, and Node.js. Also worked with AWS and Docker.",
            "expected_skills": ["python", "javascript", "react", "node.js", "aws", "docker"]
        },
        {
            "text": "Proficient in C++, C#, and GoLang. Experienced with PostgreSQL and Kubernetes (k8s).",
            "expected_skills": ["c++", "c#", "go", "postgresql", "kubernetes"]
        },
        {
            "text": "Strong expertise in Machine Learning, Deep Learning, TensorFlow, and scikit-learn (sklearn).",
            "expected_skills": ["machine learning", "deep learning", "tensorflow", "scikit-learn"]
        }
    ]
    
    for i, case in enumerate(test_cases, 1):
        print(f"\nTest Case {i}:")
        print(f"Text: {case['text'][:80]}...")
        
        found = extract_skills(case["text"])
        normalized = [normalize_skill(s) for s in found]
        
        print(f"Found Skills: {normalized}")
        print(f"Expected: {case['expected_skills']}")
        
        # Check if most expected skills are found
        matches = sum(1 for skill in case['expected_skills'] if skill in normalized)
        accuracy = (matches / len(case['expected_skills'])) * 100
        print(f"✓ Accuracy: {accuracy:.1f}% ({matches}/{len(case['expected_skills'])} skills matched)")

def test_experience_extraction():
    """Test years of experience extraction"""
    print("\n" + "=" * 60)
    print("TEST 2: Experience Extraction")
    print("=" * 60)
    
    test_cases = [
        {
            "text": "Software Engineer at Google | Jan 2020 - Present\nData Analyst at Microsoft | June 2018 - Dec 2019",
            "expected_range": (4.0, 7.0)  # Should be around 5-6 years
        },
        {
            "text": "5 years of experience in Python development",
            "expected_range": (5.0, 5.0)
        },
        {
            "text": "ML Engineer | 03/2021 - ongoing\n Previous: 01/2019 - 02/2021",
            "expected_range": (3.5, 6.0)
        }
    ]
    
    for i, case in enumerate(test_cases, 1):
        print(f"\nTest Case {i}:")
        print(f"Text: {case['text'][:80]}...")
        
        years = extract_years_of_experience(case["text"])
        min_exp, max_exp = case["expected_range"]
        
        print(f"Extracted: {years} years")
        print(f"Expected Range: {min_exp}-{max_exp} years")
        
        if min_exp <= years <= max_exp:
            print(f"✓ PASS: Within expected range")
        else:
            print(f"✗ FAIL: Outside expected range")

def test_jd_parsing():
    """Test job description parsing"""
    print("\n" + "=" * 60)
    print("TEST 3: Job Description Parsing")
    print("=" * 60)
    
    jd_text = """
    Senior Software Engineer - Full Stack
    
    Requirements:
    - 5+ years of experience in software development
    - Strong proficiency in Python, JavaScript, React, and Node.js
    - Experience with AWS, Docker, and Kubernetes
    - Knowledge of SQL databases (PostgreSQL, MySQL)
    - Bachelor's degree in Computer Science or related field
    
    Preferred:
    - Experience with machine learning and data analysis
    - Familiarity with CI/CD pipelines
    """
    
    parsed = parse_jd(jd_text)
    
    print(f"\nParsed JD:")
    print(f"Required Skills: {parsed['required_skills'][:10]}...")  # Show first 10
    print(f"Total Skills Found: {len(parsed['required_skills'])}")
    print(f"Minimum Years: {parsed['min_years_required']}")
    print(f"Education Requirements: {parsed.get('education_requirements', [])}")
    
    # Validate
    expected_skills = ["python", "javascript", "react", "node.js", "aws", "docker", "kubernetes", "sql", "postgresql", "mysql"]
    found_count = sum(1 for skill in expected_skills if skill in [normalize_skill(s) for s in parsed['required_skills']])
    
    print(f"\n✓ Found {found_count}/{len(expected_skills)} expected critical skills")
    print(f"✓ Experience requirement: {'PASS' if parsed['min_years_required'] == 5 else 'FAIL'}")

def test_ats_scoring():
    """Test complete ATS scoring pipeline"""
    print("\n" + "=" * 60)
    print("TEST 4: Complete ATS Scoring")
    print("=" * 60)
    
    # Simulated resume
    resume_text = """
    John Doe
    john.doe@email.com | (555) 123-4567
    
    EXPERIENCE
    Senior Software Engineer | Tech Corp | Jan 2019 - Present
    - Developed scalable web applications using React, Node.js, and Python
    - Implemented CI/CD pipelines with Docker and Kubernetes
    - Managed AWS infrastructure (EC2, S3, RDS)
    
    Software Developer | StartUp Inc | June 2016 - Dec 2018
    - Built RESTful APIs using Python and Flask
    - Worked with PostgreSQL and MongoDB databases
    
    SKILLS
    Python, JavaScript, React, Node.js, AWS, Docker, Kubernetes, PostgreSQL, 
    Git, Agile, Machine Learning, TensorFlow
    
    EDUCATION
    Bachelor of Science in Computer Science | University XYZ | 2016
    """
    
    jd_text = """
    Looking for a Senior Full Stack Developer with 5+ years of experience.
    
    Must have:
    - Strong Python and JavaScript skills
    - Experience with React and Node.js
    - Cloud experience (AWS preferred)
    - Docker and Kubernetes
    - SQL databases
    
    Nice to have:
    - Machine Learning experience
    - DevOps skills
    """
    
    print("\nAnalyzing resume against job description...")
    
    parsed_resume = parse_resume(resume_text)
    parsed_jd = parse_jd(jd_text)
    
    score, details, required = calculate_ats_score(resume_text, jd_text, parsed_resume, parsed_jd)
    
    print(f"\n📊 ATS SCORE: {score}/100")
    print("\n📈 Score Breakdown:")
    print(f"  - Skill Match: {details['Skill Match']}%")
    print(f"  - Keyword Density: {details['Keyword Density']:.2f}%")
    print(f"  - Experience Match: {details['Experience Match']}%")
    print(f"  - Resume Quality: {details['Resume Quality']}%")
    
    print(f"\n🎯 Matched Skills ({details['Total Matched Skills']}/{details['Total Required Skills']}):")
    print(f"  {', '.join(details['Matched Skills'][:15])}...")
    
    print(f"\n⏱️ Experience:")
    print(f"  Resume: {details['Resume Experience']}")
    print(f"  Required: {details['Required Experience']}")
    
    # Validate scoring
    print(f"\n✓ Score Assessment:")
    if score >= 80:
        print(f"  EXCELLENT - Strong match for the position")
    elif score >= 60:
        print(f"  GOOD - Decent match with some gaps")
    elif score >= 40:
        print(f"  FAIR - Significant gaps in qualifications")
    else:
        print(f"  POOR - Major misalignment")

def test_synonym_normalization():
    """Test skill synonym normalization"""
    print("\n" + "=" * 60)
    print("TEST 5: Skill Synonym Normalization")
    print("=" * 60)
    
    test_synonyms = [
        ("javascript", "js"),
        ("react.js", "react"),
        ("nodejs", "node.js"),
        ("kubernetes", "k8s"),
        ("postgresql", "postgres"),
        ("machine learning", "ml")
    ]
    
    for skill1, skill2 in test_synonyms:
        norm1 = normalize_skill(skill1)
        norm2 = normalize_skill(skill2)
        
        match = "✓ PASS" if norm1 == norm2 else "✗ FAIL"
        print(f"{match}: '{skill1}' and '{skill2}' -> {norm1} == {norm2}")

if __name__ == "__main__":
    print("\n" + "🚀 ATS SCORING ACCURACY TEST SUITE" + "\n")
    
    try:
        test_skill_extraction()
        test_experience_extraction()
        test_jd_parsing()
        test_ats_scoring()
        test_synonym_normalization()
        
        print("\n" + "=" * 60)
        print("✅ ALL TESTS COMPLETED")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
