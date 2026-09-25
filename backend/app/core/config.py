import os

class Settings:
    PROJECT_NAME: str = "LexAnalyze"
    SUBTITLE: str = "AI-Assisted Legal Case File Analysis & Evidence Intelligence Platform"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "lexanalyze_secret_key_super_secure_legal_tech_2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Environment mode
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "true").lower() in ("true", "1", "yes")
    
    # Optional LLM / OpenAI API Keys
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./lexanalyze.db")

settings = Settings()
