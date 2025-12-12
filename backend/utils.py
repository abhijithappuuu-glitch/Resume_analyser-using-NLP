import io
import re
import spacy
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from docx import Document
from pdfminer.high_level import extract_text_to_fp
from datetime import datetime

# Load spaCy model
try:
    nlp = spacy.load("en_core_web_sm")
except:
    print("Warning: 'en_core_web_sm' not found. Downloading...")
    from spacy.cli import download
    download("en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

# Expanded Skill Database
SKILL_DB = {
    # Programming Languages
    "python", "java", "c++", "c", "c#", "ruby", "php", "swift", "kotlin", "go", "rust", "typescript", "javascript", "scala", "perl", "r", "matlab", "dart", "lua", "shell", "bash", "powershell",
    # Web Development
    "html", "css", "react", "angular", "vue", "node.js", "django", "flask", "spring boot", "asp.net", "laravel", "ruby on rails", "jquery", "bootstrap", "tailwind", "sass", "less", "graphql", "rest api", "soap",
    # Data Science & AI
    "machine learning", "deep learning", "nlp", "computer vision", "tensorflow", "pytorch", "keras", "scikit-learn", "pandas", "numpy", "matplotlib", "seaborn", "opencv", "hugging face", "transformers", "llm", "generative ai", "data analysis", "data visualization", "big data", "spark", "hadoop",
    # Database
    "sql", "mysql", "postgresql", "mongodb", "redis", "oracle", "sql server", "sqlite", "cassandra", "dynamodb", "elasticsearch", "firebase", "snowflake", "databricks",
    # DevOps & Cloud
    "aws", "azure", "google cloud", "gcp", "docker", "kubernetes", "jenkins", "gitlab ci", "github actions", "terraform", "ansible", "linux", "unix", "nginx", "apache", "circleci", "travis ci",
    # Business & Data Tools
    "excel", "power bi", "tableau", "salesforce", "sap", "jira", "confluence", "sharepoint", "ms office", "google analytics", "seo", "sem", "crm",
    # Tools & Others
    "git", "github", "gitlab", "bitbucket", "trello", "slack", "agile", "scrum", "kanban", "sdlc", "unit testing", "selenium", "cypress", "jest", "mocha", "junit",
    # Soft Skills
    "communication", "leadership", "teamwork", "problem solving", "critical thinking", "time management", "adaptability", "creativity", "collaboration", "mentoring", "presentation", "project management", "negotiation"
}

def extract_text_from_bytes(file_bytes, file_type):
    """Extracts text from PDF, DOCX, or TXT files provided as bytes."""
    try:
        if file_type == "application/pdf":
            output_string = io.StringIO()
            extract_text_to_fp(io.BytesIO(file_bytes), output_string)
            return output_string.getvalue()
            
        elif file_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            doc = Document(io.BytesIO(file_bytes))
            return "\n".join([paragraph.text for paragraph in doc.paragraphs])

        elif file_type == "text/plain":
            return file_bytes.decode("utf-8")
            
        return "Unsupported file format."
    except Exception as e:
        return f"Error extracting text: {str(e)}"

def clean_text(text):
    """Cleans text while preserving technical terms like C++, C#, .NET, Node.js"""
    text = text.lower()
    # Replace newlines and multiple spaces
    text = re.sub(r'\s+', ' ', text)
    # Remove special characters but keep +, #, . for technical terms
    # We allow a-z, 0-9, +, #, ., and space
    text = re.sub(r'[^a-z0-9\+\#\.\s]', '', text)
    return text

def extract_skills(text):
    """Extracts skills from text using the SKILL_DB and regex for exact word matching."""
    cleaned_text = clean_text(text)
    found_skills = set()
    
    # Check for each skill in the DB
    for skill in SKILL_DB:
        # Escape special characters in skill name for regex (like c++, c#)
        skill_escaped = re.escape(skill)
        # Use word boundaries to avoid partial matches (e.g., "go" in "google")
        # For skills with special chars like C++, boundaries might be tricky, so we handle them carefully
        if re.search(r'(?:^|\s)' + skill_escaped + r'(?:$|\s)', cleaned_text):
            found_skills.add(skill)
            
    return list(found_skills)

def extract_years_of_experience(text):
    """Estimates years of experience based on date ranges found in the text."""
    # Regex to find date ranges like "Jan 2020 - Present" or "01/2019 - 03/2021"
    # Matches: (Month Year) - (Month Year | Present)
    date_pattern = r'(?:(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*(\d{4})|(\d{1,2})[/-](\d{4}))\s*(?:-|to)\s*(?:(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*(\d{4})|(\d{1,2})[/-](\d{4})|(present|current|now))'
    
    matches = re.findall(date_pattern, text.lower())
    total_months = 0
    
    for match in matches:
        try:
            start_date = None
            end_date = datetime.now()
            
            # Parse Start Date
            if match[0] and match[1]: # Month Name Year (Jan 2020)
                start_date = datetime.strptime(f"{match[0][:3]} {match[1]}", "%b %Y")
            elif match[2] and match[3]: # MM/YYYY (01/2020)
                start_date = datetime.strptime(f"{match[2]}/{match[3]}", "%m/%Y")
                
            # Parse End Date
            if match[8] in ['present', 'current', 'now']:
                end_date = datetime.now()
            elif match[4] and match[5]: # Month Name Year
                end_date = datetime.strptime(f"{match[4][:3]} {match[5]}", "%b %Y")
            elif match[6] and match[7]: # MM/YYYY
                end_date = datetime.strptime(f"{match[6]}/{match[7]}", "%m/%Y")
            
            if start_date and end_date:
                months = (end_date.year - start_date.year) * 12 + (end_date.month - start_date.month)
                if months > 0:
                    total_months += months
        except:
            continue
            
    return round(total_months / 12, 1)

def parse_resume(text):
    doc = nlp(text)
    
    parsed_data = {
        "name": "N/A", "email": "N/A", "phone": "N/A",
        "skills": [], "education": [], "experience": [], "years_of_experience": 0
    }
    
    # Extract Email
    emails = re.findall(r"[a-z0-9\.\-+_]+@[a-z0-9\.\-+]+\.[a-z]+", text.lower())
    if emails: parsed_data["email"] = emails[0]
    
    # Extract Phone
    phones = re.findall(r'(?:(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *[x/#]{1}(\d+))?)', text)
    if phones:
        # Flatten the tuple and join valid digits
        valid_phone = "".join([p for p in phones[0] if p])
        parsed_data["phone"] = valid_phone

    # Extract Skills
    parsed_data["skills"] = extract_skills(text)
    
    # Extract Experience Years
    parsed_data["years_of_experience"] = extract_years_of_experience(text)
    
    # Extract Education (Simple Heuristic)
    for ent in doc.ents:
        if ent.label_ == "ORG" and any(x in ent.text.lower() for x in ["university", "college", "institute", "school"]):
            if ent.text not in parsed_data["education"]:
                parsed_data["education"].append(ent.text)
        # Extract Experience Entities (Companies)
        elif ent.label_ == "ORG" and ent.text not in parsed_data["education"]:
             # Filter out common non-company ORGs if needed
             pass

    return parsed_data

def parse_jd(text):
    """Parses Job Description to extract required skills and experience."""
    required_skills = extract_skills(text)
    
    # Extract required years of experience
    # Patterns: "5+ years", "5 years", "at least 3 years"
    exp_pattern = r'(\d+)\+?\s*years?'
    matches = re.findall(exp_pattern, text.lower())
    min_years = 0
    if matches:
        try:
            min_years = max([int(m) for m in matches])
        except:
            min_years = 0
            
    return {
        "required_skills": required_skills,
        "min_years_required": min_years
    }

def calculate_ats_score(resume_text, jd_text, parsed_resume, parsed_jd):
    # 1. Keyword Matching (Cosine Similarity)
    corpus = [clean_text(resume_text), clean_text(jd_text)]
    vectorizer = TfidfVectorizer(stop_words='english')
    try:
        tfidf_matrix = vectorizer.fit_transform(corpus)
        cosine_sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
    except:
        cosine_sim = 0.0
    
    keyword_density_score = cosine_sim * 100
    
    # 2. Skill Matching
    resume_skills = set(parsed_resume.get("skills", []))
    required_skills = set(parsed_jd.get("required_skills", []))
    
    if not required_skills:
        skill_match_percent = 100.0
        matched_skills = list(resume_skills)
    else:
        matched_skills = list(resume_skills.intersection(required_skills))
        skill_match_percent = (len(matched_skills) / len(required_skills)) * 100
    
    # 3. Experience Matching
    resume_exp = parsed_resume.get("years_of_experience", 0)
    required_exp = parsed_jd.get("min_years_required", 0)
    
    if required_exp == 0:
        experience_match_percent = 100.0
    else:
        # Cap at 100% if they have more than required
        experience_match_percent = min((resume_exp / required_exp) * 100, 100.0)
    
    # Weighted Scoring
    w_skill = 0.45      # Skills are most important
    w_keyword = 0.35    # Context/Keywords
    w_experience = 0.20 # Experience
    
    overall_ats_score = round(
        (min(skill_match_percent, 100) * w_skill) + 
        (min(keyword_density_score, 100) * w_keyword) + 
        (min(experience_match_percent, 100) * w_experience), 
        2
    )
    
    match_details = {
        "Skill Match": round(min(skill_match_percent, 100.0), 2),
        "Keyword Density": round(min(keyword_density_score, 100.0), 2),
        "Experience Match": round(min(experience_match_percent, 100.0), 2),
        "Matched Skills": matched_skills,
        "Resume Experience": f"{resume_exp} years",
        "Required Experience": f"{required_exp}+ years"
    }
    
    return overall_ats_score, match_details, list(required_skills)

def generate_suggestions(required_skills, matched_skills):
    missing_skills = list(required_skills.difference(set(matched_skills)))
    
    suggestions = []
    if missing_skills:
        # Show top 5 missing skills
        suggestions.append(f"Missing Critical Skills: Your resume is missing {', '.join(missing_skills[:5])}. Adding these can significantly boost your score.")
    
    suggestions.append("Formatting: Ensure you use standard section headers (Experience, Education, Skills).")
    suggestions.append("Keywords: Mirror the terminology used in the job description.")
    
    return suggestions
