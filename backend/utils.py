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

# Expanded Skill Database with Synonyms
SKILL_DB = {
    # Programming Languages
    "python", "java", "c++", "c", "c#", "csharp", "ruby", "php", "swift", "kotlin", "go", "golang", "rust", "typescript", "javascript", "js", "scala", "perl", "r", "matlab", "dart", "lua", "shell", "bash", "powershell", "objective-c", "vb.net", "fortran", "cobol", "haskell", "elixir", "clojure",
    # Web Development
    "html", "html5", "css", "css3", "react", "reactjs", "react.js", "angular", "angularjs", "vue", "vuejs", "vue.js", "node.js", "nodejs", "express", "expressjs", "django", "flask", "fastapi", "spring", "spring boot", "springboot", "asp.net", "laravel", "ruby on rails", "rails", "jquery", "bootstrap", "tailwind", "tailwindcss", "sass", "less", "scss", "webpack", "vite", "graphql", "rest", "rest api", "restful", "soap", "ajax", "json", "xml", "nextjs", "next.js", "gatsby", "nuxt", "svelte",
    # Data Science & AI
    "machine learning", "ml", "deep learning", "dl", "nlp", "natural language processing", "computer vision", "cv", "tensorflow", "pytorch", "keras", "scikit-learn", "sklearn", "pandas", "numpy", "matplotlib", "seaborn", "plotly", "opencv", "hugging face", "transformers", "llm", "large language model", "generative ai", "gen ai", "data analysis", "data science", "data visualization", "big data", "spark", "apache spark", "pyspark", "hadoop", "mapreduce", "xgboost", "lightgbm", "neural networks", "cnn", "rnn", "lstm", "gpt", "bert", "reinforcement learning",
    # Database
    "sql", "mysql", "postgresql", "postgres", "mongodb", "mongo", "redis", "oracle", "oracle db", "sql server", "mssql", "t-sql", "sqlite", "cassandra", "dynamodb", "elasticsearch", "elastic", "firebase", "firestore", "snowflake", "databricks", "mariadb", "couchdb", "neo4j", "graph database", "nosql", "rdbms", "database design", "data modeling",
    # DevOps & Cloud
    "aws", "amazon web services", "azure", "microsoft azure", "google cloud", "gcp", "google cloud platform", "docker", "kubernetes", "k8s", "jenkins", "gitlab ci", "gitlab", "github actions", "circleci", "travis ci", "terraform", "ansible", "puppet", "chef", "linux", "unix", "ubuntu", "centos", "redhat", "nginx", "apache", "ci/cd", "continuous integration", "continuous deployment", "devops", "cloudformation", "ecs", "eks", "lambda", "ec2", "s3", "rds", "microservices", "serverless", "containerization",
    # Business & Data Tools
    "excel", "ms excel", "power bi", "powerbi", "tableau", "looker", "salesforce", "sap", "jira", "confluence", "sharepoint", "ms office", "microsoft office", "google analytics", "ga", "google tag manager", "seo", "search engine optimization", "sem", "crm", "erp", "business intelligence", "bi", "etl", "data warehousing",
    # Tools & Version Control
    "git", "github", "gitlab", "bitbucket", "svn", "subversion", "mercurial", "version control", "source control", "code review", "pull request", "merge request",
    # Project Management & Methodologies
    "trello", "slack", "teams", "microsoft teams", "asana", "monday.com", "agile", "scrum", "kanban", "waterfall", "sdlc", "software development lifecycle", "jira", "confluence", "project management", "product management", "lean", "six sigma",
    # Testing & Quality
    "unit testing", "integration testing", "test automation", "selenium", "cypress", "jest", "mocha", "chai", "junit", "testng", "pytest", "cucumber", "bdd", "tdd", "test-driven development", "qa", "quality assurance", "postman", "rest assured", "load testing", "performance testing", "jmeter",
    # Mobile Development
    "android", "ios", "react native", "flutter", "xamarin", "ionic", "swift", "kotlin", "objective-c", "mobile development", "app development",
    # Backend & APIs
    "api development", "microservices", "rest api", "graphql", "grpc", "websocket", "message queue", "rabbitmq", "kafka", "apache kafka", "event-driven", "serverless", "lambda functions",
    # Security
    "cybersecurity", "information security", "penetration testing", "ethical hacking", "owasp", "ssl", "tls", "encryption", "oauth", "jwt", "authentication", "authorization", "firewall", "vpn",
    # Soft Skills
    "communication", "verbal communication", "written communication", "leadership", "team leadership", "teamwork", "collaboration", "problem solving", "analytical thinking", "critical thinking", "time management", "adaptability", "flexibility", "creativity", "innovation", "mentoring", "coaching", "presentation", "public speaking", "project management", "stakeholder management", "negotiation", "conflict resolution", "decision making", "attention to detail"
}

# Skill Synonyms Mapping for better matching
SKILL_SYNONYMS = {
    "javascript": ["js", "javascript", "ecmascript"],
    "python": ["python", "py"],
    "typescript": ["typescript", "ts"],
    "react": ["react", "reactjs", "react.js"],
    "angular": ["angular", "angularjs"],
    "vue": ["vue", "vuejs", "vue.js"],
    "node.js": ["node.js", "nodejs", "node"],
    "c#": ["c#", "csharp", "c sharp"],
    "c++": ["c++", "cpp", "cplusplus"],
    "go": ["go", "golang"],
    "postgresql": ["postgresql", "postgres"],
    "mongodb": ["mongodb", "mongo"],
    "sql server": ["sql server", "mssql", "microsoft sql server"],
    "aws": ["aws", "amazon web services"],
    "azure": ["azure", "microsoft azure"],
    "gcp": ["gcp", "google cloud", "google cloud platform"],
    "kubernetes": ["kubernetes", "k8s"],
    "docker": ["docker", "containerization"],
    "machine learning": ["machine learning", "ml"],
    "deep learning": ["deep learning", "dl"],
    "nlp": ["nlp", "natural language processing"],
    "computer vision": ["computer vision", "cv"],
    "scikit-learn": ["scikit-learn", "sklearn", "scikit learn"],
    "tensorflow": ["tensorflow", "tf"],
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
    """Extracts skills from text using enhanced matching with synonyms and fuzzy logic."""
    cleaned_text = clean_text(text)
    found_skills = set()
    
    # Check for each skill in the DB
    for skill in SKILL_DB:
        # Escape special characters in skill name for regex (like c++, c#)
        skill_escaped = re.escape(skill)
        # Use word boundaries to avoid partial matches (e.g., "go" in "google")
        # For skills with special chars like C++, boundaries might be tricky, so we handle them carefully
        if re.search(r'(?:^|\s)' + skill_escaped + r'(?:$|\s|,|\.)', cleaned_text):
            # Normalize the skill to its canonical form
            canonical_skill = normalize_skill(skill)
            found_skills.add(canonical_skill)
    
    # Additional pattern matching for common formats
    # Match patterns like "3+ years of Python", "experienced in Java"
    skill_context_pattern = r'(?:experience with|proficient in|skilled in|knowledge of|expertise in|familiar with|working with|using)\s+([a-z0-9\+\#\.]+(?:\s+[a-z0-9\+\#\.]+)?)'
    context_matches = re.findall(skill_context_pattern, cleaned_text)
    for match in context_matches:
        match_clean = match.strip()
        if match_clean in SKILL_DB:
            canonical_skill = normalize_skill(match_clean)
            found_skills.add(canonical_skill)
    
    return list(found_skills)

def normalize_skill(skill):
    """Normalize skill to its canonical form using synonyms mapping."""
    skill_lower = skill.lower().strip()
    
    # Check if this skill is a synonym and return the canonical form
    for canonical, synonyms in SKILL_SYNONYMS.items():
        if skill_lower in synonyms:
            return canonical
    
    return skill_lower

def extract_years_of_experience(text):
    """Estimates years of experience based on date ranges found in the text."""
    # Regex to find date ranges like "Jan 2020 - Present" or "01/2019 - 03/2021"
    # Matches: (Month Year) - (Month Year | Present)
    date_pattern = r'(?:(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*(\d{4})|(\d{1,2})[/-](\d{4}))\s*(?:-|to|–|—)\s*(?:(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*(\d{4})|(\d{1,2})[/-](\d{4})|(present|current|now|ongoing))'
    
    matches = re.findall(date_pattern, text.lower())
    total_months = 0
    experiences = []
    
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
            if match[8] in ['present', 'current', 'now', 'ongoing']:
                end_date = datetime.now()
            elif match[4] and match[5]: # Month Name Year
                end_date = datetime.strptime(f"{match[4][:3]} {match[5]}", "%b %Y")
            elif match[6] and match[7]: # MM/YYYY
                end_date = datetime.strptime(f"{match[6]}/{match[7]}", "%m/%Y")
            
            if start_date and end_date and end_date >= start_date:
                months = (end_date.year - start_date.year) * 12 + (end_date.month - start_date.month)
                if months > 0:
                    experiences.append(months)
        except Exception as e:
            continue
    
    # Handle overlapping experiences (sum unique experiences)
    if experiences:
        total_months = sum(experiences)
    
    # Also check for explicit mentions like "5 years of experience", "3+ years"
    exp_mentions = re.findall(r'(\d+)\+?\s*(?:years?|yrs?)\s+(?:of\s+)?(?:experience|exp)', text.lower())
    if exp_mentions:
        mentioned_years = max([int(y) for y in exp_mentions])
        calculated_years = total_months / 12
        # Take the maximum of calculated vs mentioned
        return round(max(mentioned_years, calculated_years), 1)
    
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
    """Enhanced Job Description parsing to extract required skills and experience."""
    required_skills = extract_skills(text)
    
    # Extract required years of experience - Multiple patterns
    exp_patterns = [
        r'(\d+)\+?\s*(?:years?|yrs?)\s+(?:of\s+)?(?:experience|exp)',
        r'(?:minimum|min|at least)\s+(\d+)\s*(?:years?|yrs?)',
        r'(\d+)\s*(?:years?|yrs?)\s+(?:minimum|required|preferred)',
        r'(\d+)\s*to\s*(\d+)\s*(?:years?|yrs?)'  # range like "3 to 5 years"
    ]
    
    min_years = 0
    all_years = []
    
    for pattern in exp_patterns:
        matches = re.findall(pattern, text.lower())
        if matches:
            for match in matches:
                try:
                    if isinstance(match, tuple):
                        # For range patterns, take the minimum
                        all_years.extend([int(m) for m in match if m])
                    else:
                        all_years.append(int(match))
                except:
                    continue
    
    if all_years:
        min_years = max(all_years)  # Take the highest mentioned requirement
    
    # Extract education requirements
    education_requirements = []
    edu_patterns = [
        r"bachelor'?s?\s+(?:degree)?",
        r"master'?s?\s+(?:degree)?",
        r"phd|doctorate",
        r"b\.?s\.?|b\.?a\.?",
        r"m\.?s\.?|m\.?a\.?",
        r"mba"
    ]
    
    for pattern in edu_patterns:
        if re.search(pattern, text.lower()):
            education_requirements.append(pattern)
    
    return {
        "required_skills": required_skills,
        "min_years_required": min_years,
        "education_requirements": education_requirements
    }

def calculate_ats_score(resume_text, jd_text, parsed_resume, parsed_jd):
    """
    Enhanced ATS scoring with multi-factor analysis:
    1. Skill Matching (40%) - Exact + Fuzzy matching with synonyms
    2. Keyword/Context Matching (35%) - TF-IDF cosine similarity
    3. Experience Matching (15%) - Years comparison
    4. Resume Quality (10%) - Structure, completeness, formatting
    """
    
    # 1. SKILL MATCHING (40% weight)
    resume_skills = set(parsed_resume.get("skills", []))
    required_skills = set(parsed_jd.get("required_skills", []))
    
    # Normalize both sets using synonyms
    resume_skills_normalized = {normalize_skill(s) for s in resume_skills}
    required_skills_normalized = {normalize_skill(s) for s in required_skills}
    
    if not required_skills_normalized:
        skill_match_percent = 100.0
        matched_skills_list = list(resume_skills_normalized)
    else:
        matched_skills = resume_skills_normalized.intersection(required_skills_normalized)
        matched_skills_list = list(matched_skills)
        
        # Base skill match
        base_match = len(matched_skills) / len(required_skills_normalized)
        
        # Bonus for extra relevant skills (capped at 10% bonus)
        extra_skills = resume_skills_normalized - required_skills_normalized
        relevant_extra = len([s for s in extra_skills if s in SKILL_DB])
        bonus = min(relevant_extra * 0.02, 0.10)  # 2% per extra skill, max 10%
        
        skill_match_percent = min((base_match + bonus) * 100, 100.0)
    
    # 2. KEYWORD/CONTEXT MATCHING (35% weight) - Enhanced TF-IDF
    corpus = [clean_text(resume_text), clean_text(jd_text)]
    vectorizer = TfidfVectorizer(
        stop_words='english',
        ngram_range=(1, 3),  # Capture unigrams, bigrams, trigrams
        min_df=1,
        max_features=500
    )
    try:
        tfidf_matrix = vectorizer.fit_transform(corpus)
        cosine_sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        keyword_density_score = cosine_sim * 100
        
        # Adjust keyword score based on resume length (penalize very short resumes)
        resume_word_count = len(resume_text.split())
        if resume_word_count < 100:
            keyword_density_score *= 0.7  # 30% penalty for very short resumes
        elif resume_word_count < 200:
            keyword_density_score *= 0.85  # 15% penalty for short resumes
            
    except Exception as e:
        print(f"TF-IDF Error: {e}")
        keyword_density_score = 0.0
    
    # 3. EXPERIENCE MATCHING (15% weight)
    resume_exp = parsed_resume.get("years_of_experience", 0)
    required_exp = parsed_jd.get("min_years_required", 0)
    
    if required_exp == 0:
        experience_match_percent = 100.0
    else:
        # More granular experience scoring
        exp_ratio = resume_exp / required_exp
        if exp_ratio >= 1.0:
            experience_match_percent = 100.0
        elif exp_ratio >= 0.75:
            experience_match_percent = 85.0 + (exp_ratio - 0.75) * 60  # 85-100%
        elif exp_ratio >= 0.5:
            experience_match_percent = 60.0 + (exp_ratio - 0.5) * 100  # 60-85%
        else:
            experience_match_percent = exp_ratio * 120  # 0-60%
        
        experience_match_percent = min(experience_match_percent, 100.0)
    
    # 4. RESUME QUALITY SCORE (10% weight)
    quality_score = 0.0
    
    # Has email
    if parsed_resume.get("email") and parsed_resume["email"] != "N/A":
        quality_score += 20
    
    # Has phone
    if parsed_resume.get("phone") and parsed_resume["phone"] != "N/A":
        quality_score += 20
    
    # Has education
    if parsed_resume.get("education") and len(parsed_resume["education"]) > 0:
        quality_score += 20
    
    # Has skills (at least 3)
    if len(resume_skills) >= 3:
        quality_score += 20
    
    # Has reasonable experience
    if resume_exp > 0:
        quality_score += 20
    
    quality_score = min(quality_score, 100.0)
    
    # WEIGHTED SCORING
    w_skill = 0.40          # Skills are most critical
    w_keyword = 0.35        # Context/Keywords important
    w_experience = 0.15     # Experience matters
    w_quality = 0.10        # Resume completeness
    
    overall_ats_score = round(
        (skill_match_percent * w_skill) + 
        (keyword_density_score * w_keyword) + 
        (experience_match_percent * w_experience) +
        (quality_score * w_quality),
        2
    )
    
    # Ensure score is between 0-100
    overall_ats_score = max(0, min(overall_ats_score, 100))
    
    match_details = {
        "Skill Match": round(skill_match_percent, 2),
        "Keyword Density": round(keyword_density_score, 2),
        "Experience Match": round(experience_match_percent, 2),
        "Resume Quality": round(quality_score, 2),
        "Matched Skills": matched_skills_list,
        "Total Matched Skills": len(matched_skills_list),
        "Total Required Skills": len(required_skills_normalized),
        "Resume Experience": f"{resume_exp} years",
        "Required Experience": f"{required_exp}+ years"
    }
    
    return overall_ats_score, match_details, list(required_skills_normalized)

def generate_suggestions(required_skills, matched_skills):
    """Generate actionable suggestions based on analysis."""
    missing_skills = list(required_skills.difference(set(matched_skills)))
    
    suggestions = []
    
    if missing_skills:
        # Categorize missing skills
        critical_count = min(len(missing_skills), 5)
        suggestions.append(
            f"🎯 Critical Skills Gap: Add {', '.join(missing_skills[:critical_count])} to your resume. "
            f"These are key requirements mentioned in the job description."
        )
        
        if len(missing_skills) > 5:
            suggestions.append(
                f"📋 Additional Skills: Consider highlighting {', '.join(missing_skills[5:10])} if you have experience with them."
            )
    else:
        suggestions.append("✅ Excellent! Your skills align well with the job requirements.")
    
    # General best practices
    suggestions.append(
        "💡 Keyword Optimization: Use exact phrases from the job description throughout your resume (especially in Skills, Experience sections)."
    )
    suggestions.append(
        "📊 Quantify Achievements: Add metrics and numbers to your accomplishments (e.g., 'Improved performance by 30%', 'Led team of 5')."
    )
    suggestions.append(
        "📝 Format Tips: Use clear section headers (Summary, Skills, Experience, Education, Projects). Use bullet points for readability."
    )
    suggestions.append(
        "🔍 ATS-Friendly: Avoid tables, graphics, and unusual fonts. Use standard resume formats (Word/PDF). Include relevant keywords naturally."
    )
    
    return suggestions
