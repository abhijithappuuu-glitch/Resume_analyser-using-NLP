from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json

from database import setup_database, register_user_db, authenticate_user_db
from utils import extract_text_from_bytes, parse_resume, parse_jd, calculate_ats_score, generate_suggestions

app = FastAPI()

# CORS setup - allow all for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize DB
setup_database()

# Models
class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    role: str

class UserLogin(BaseModel):
    email: str
    password: str

class AnalysisResult(BaseModel):
    ats_score: float
    match_details: dict
    suggestions: List[str]
    parsed_resume: dict

class CandidateResult(BaseModel):
    candidate_name: str
    ats_score: float
    skill_match: float
    keyword_density: float
    matched_skills: str
    missing_skills: str

# Routes

@app.post("/register")
def register(user: UserRegister):
    success, message = register_user_db(user.name, user.email, user.password, user.role)
    if not success:
        raise HTTPException(status_code=400, detail=message)
    return {"message": message}

@app.post("/login")
def login(user: UserLogin):
    result = authenticate_user_db(user.email, user.password)
    if not result['authenticated']:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return result

@app.post("/analyze-resume", response_model=AnalysisResult)
async def analyze_resume(
    resume: UploadFile = File(...),
    jd: Optional[UploadFile] = File(None),
    jd_text_input: Optional[str] = Form(None)
):
    # Read Resume
    resume_bytes = await resume.read()
    resume_text = extract_text_from_bytes(resume_bytes, resume.content_type)
    
    if "Error" in resume_text:
        raise HTTPException(status_code=400, detail=resume_text)

    # Read JD
    final_jd_text = ""
    if jd:
        jd_bytes = await jd.read()
        final_jd_text = extract_text_from_bytes(jd_bytes, jd.content_type)
    elif jd_text_input:
        final_jd_text = jd_text_input
    else:
        final_jd_text = "Highly skilled software engineer with strong Python, Machine Learning, and SQL expertise. Needs 5+ years of experience."

    if "Error" in final_jd_text:
        raise HTTPException(status_code=400, detail=final_jd_text)

    # Analyze
    parsed_resume = parse_resume(resume_text)
    parsed_jd = parse_jd(final_jd_text)
    
    ats_score, match_details, required_skills = calculate_ats_score(
        resume_text, final_jd_text, parsed_resume, parsed_jd
    )
    suggestions = generate_suggestions(set(parsed_jd["required_skills"]), set(match_details["Matched Skills"]))

    return {
        "ats_score": ats_score,
        "match_details": match_details,
        "suggestions": suggestions,
        "parsed_resume": parsed_resume
    }

@app.post("/rank-candidates", response_model=List[CandidateResult])
async def rank_candidates(
    jd: UploadFile = File(...),
    resumes: List[UploadFile] = File(...)
):
    # Read JD
    jd_bytes = await jd.read()
    jd_text = extract_text_from_bytes(jd_bytes, jd.content_type)
    
    if "Error" in jd_text:
        raise HTTPException(status_code=400, detail=f"JD Error: {jd_text}")
        
    parsed_jd = parse_jd(jd_text)
    required_skills_set = set(parsed_jd["required_skills"])
    
    results = []
    
    for resume in resumes:
        try:
            resume_bytes = await resume.read()
            resume_text = extract_text_from_bytes(resume_bytes, resume.content_type)
            
            if "Error" in resume_text:
                continue
                
            parsed_resume = parse_resume(resume_text)
            
            ats_score, match_details, required_skills = calculate_ats_score(
                resume_text, jd_text, parsed_resume, parsed_jd
            )
            
            missing_skills = required_skills_set.difference(set(match_details["Matched Skills"]))
            
            results.append({
                "candidate_name": resume.filename,
                "ats_score": ats_score,
                "skill_match": match_details["Skill Match"],
                "keyword_density": match_details["Keyword Density"],
                "matched_skills": ", ".join(match_details["Matched Skills"]),
                "missing_skills": ", ".join(missing_skills) or "None"
            })
        except Exception as e:
            print(f"Error processing {resume.filename}: {e}")
            continue
            
    # Sort by ATS Score
    results.sort(key=lambda x: x['ats_score'], reverse=True)
    return results
