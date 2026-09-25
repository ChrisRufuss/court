from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine, SessionLocal
from app.api.auth import router as auth_router
from app.api.cases import router as cases_router, seed_demo_case
from app.api.documents import router as docs_router
from app.api.analysis import router as analysis_router
from app.api.legal_kb import router as legal_router
from app.api.chat import router as chat_router
from app.api.report import router as report_router

# Create Database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.SUBTITLE,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(cases_router, prefix=settings.API_V1_STR)
app.include_router(docs_router, prefix=settings.API_V1_STR)
app.include_router(analysis_router, prefix=settings.API_V1_STR)
app.include_router(legal_router, prefix=settings.API_V1_STR)
app.include_router(chat_router, prefix=settings.API_V1_STR)
app.include_router(report_router, prefix=settings.API_V1_STR)

@app.on_event("startup")
def startup_db_seed():
    db = SessionLocal()
    try:
        seed_demo_case(db)
    except Exception as e:
        print(f"Auto demo seed notice: {e}")
    finally:
        db.close()

@app.get("/")
def root():
    return {
        "name": settings.PROJECT_NAME,
        "subtitle": settings.SUBTITLE,
        "status": "online",
        "demo_mode": settings.DEMO_MODE,
        "docs": "/docs",
        "disclaimer": "LexAnalyze provides AI-assisted document analysis and legal research support. It does not provide legal advice."
    }
