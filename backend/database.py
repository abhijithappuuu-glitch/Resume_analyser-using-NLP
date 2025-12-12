import sqlite3
import bcrypt

DB_PATH = "resume_analyzer.db"
APP_ID = "resume_analyzer_app"

def get_db_connection():
    """Establishes a connection to the SQLite database."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def setup_database():
    """Creates the necessary tables if they don't exist."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    TABLE_PREFIX = f"{APP_ID}_"

    cursor.execute(f"""
    CREATE TABLE IF NOT EXISTS {TABLE_PREFIX}users (
        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE NOT NULL,
        hashed_password TEXT NOT NULL,
        role TEXT NOT NULL, -- 'student' or 'recruiter'
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    cursor.execute(f"""
    CREATE TABLE IF NOT EXISTS {TABLE_PREFIX}resumes (
        resume_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER, -- FK to users
        text TEXT,
        parsed_json TEXT,
        upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    cursor.execute(f"""
    CREATE TABLE IF NOT EXISTS {TABLE_PREFIX}job_descriptions (
        jd_id INTEGER PRIMARY KEY AUTOINCREMENT,
        recruiter_id INTEGER, -- FK to users
        text TEXT,
        parsed_json TEXT,
        upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    cursor.execute(f"""
    CREATE TABLE IF NOT EXISTS {TABLE_PREFIX}results (
        result_id INTEGER PRIMARY KEY AUTOINCREMENT,
        resume_id INTEGER,
        jd_id INTEGER,
        ats_score REAL,
        match_details TEXT,
        suggestions TEXT,
        FOREIGN KEY(resume_id) REFERENCES {TABLE_PREFIX}resumes(resume_id),
        FOREIGN KEY(jd_id) REFERENCES {TABLE_PREFIX}job_descriptions(jd_id)
    )
    """)
    
    conn.commit()
    conn.close()

def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def check_password(password, hashed_password):
    try:
        return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))
    except ValueError:
        return False

def register_user_db(name, email, password, role):
    conn = get_db_connection()
    cursor = conn.cursor()
    TABLE_PREFIX = f"{APP_ID}_"
    
    try:
        hashed_pwd = hash_password(password)
        cursor.execute(f"""
        INSERT INTO {TABLE_PREFIX}users (name, email, hashed_password, role) 
        VALUES (?, ?, ?, ?)
        """, (name, email, hashed_pwd, role))
        conn.commit()
        return True, "Registration successful!"
    except sqlite3.IntegrityError:
        return False, "This email is already registered."
    except Exception as e:
        return False, f"An unexpected error occurred: {e}"
    finally:
        conn.close()

def authenticate_user_db(email, password):
    conn = get_db_connection()
    cursor = conn.cursor()
    TABLE_PREFIX = f"{APP_ID}_"
    
    cursor.execute(f"SELECT user_id, name, hashed_password, role FROM {TABLE_PREFIX}users WHERE email = ?", (email,))
    user_record = cursor.fetchone()
    conn.close()
    
    if user_record:
        if check_password(password, user_record['hashed_password']):
            return {
                'authenticated': True,
                'user_id': user_record['user_id'],
                'user_name': user_record['name'],
                'user_role': user_record['role']
            }
    return {'authenticated': False}
