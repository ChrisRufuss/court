import json
from datetime import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from pydantic import BaseModel, EmailStr
from app.core.database import Base

# ==========================================
# SQLALCHEMY ORM MODELS
# ==========================================

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="advocate")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    cases = relationship("CaseModel", back_populates="owner")


class CaseModel(Base):
    __tablename__ = "cases"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    reference_number = Column(String(100), index=True, nullable=False)
    jurisdiction = Column(String(100), default="India")
    case_type = Column(String(100), default="Criminal Law")
    description = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    status = Column(String(50), default="active") # active, archived
    analysis_status = Column(String(50), default="pending") # pending, processing, completed, review_required
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="cases")
    documents = relationship("CaseDocumentModel", back_populates="case", cascade="all, delete-orphan")
    facts = relationship("ExtractedFactModel", back_populates="case", cascade="all, delete-orphan")
    entities = relationship("EntityModel", back_populates="case", cascade="all, delete-orphan")
    events = relationship("EventModel", back_populates="case", cascade="all, delete-orphan")
    evidence_items = relationship("EvidenceModel", back_populates="case", cascade="all, delete-orphan")
    contradictions = relationship("ContradictionModel", back_populates="case", cascade="all, delete-orphan")
    information_gaps = relationship("InformationGapModel", back_populates="case", cascade="all, delete-orphan")
    analyses = relationship("AnalysisModel", back_populates="case", cascade="all, delete-orphan")
    reports = relationship("ReportModel", back_populates="case", cascade="all, delete-orphan")


class CaseDocumentModel(Base):
    __tablename__ = "case_documents"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"))
    filename = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size_bytes = Column(Integer, default=0)
    page_count = Column(Integer, default=1)
    status = Column(String(50), default="uploaded") # uploaded, processing, processed, error
    ocr_required = Column(Boolean, default=False)
    ocr_confidence = Column(Float, default=100.0)
    extracted_text = Column(Text, nullable=True)
    upload_date = Column(DateTime, default=datetime.utcnow)

    case = relationship("CaseModel", back_populates="documents")
    pages = relationship("DocumentPageModel", back_populates="document", cascade="all, delete-orphan")


class DocumentPageModel(Base):
    __tablename__ = "document_pages"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("case_documents.id"))
    page_number = Column(Integer, nullable=False)
    text_content = Column(Text, nullable=False)
    ocr_confidence = Column(Float, default=100.0)

    document = relationship("CaseDocumentModel", back_populates="pages")


class ExtractedFactModel(Base):
    __tablename__ = "extracted_facts"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"))
    category = Column(String(100), nullable=False) # People, Location, Date, Event, Object, Allegation
    fact_description = Column(Text, nullable=False)
    source_document = Column(String(255), nullable=False)
    page_number = Column(Integer, default=1)
    confidence = Column(Float, default=0.95)
    advocate_status = Column(String(50), default="needs_review") # accepted, rejected, needs_review
    advocate_notes = Column(Text, nullable=True)

    case = relationship("CaseModel", back_populates="facts")


class EntityModel(Base):
    __tablename__ = "entities"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"))
    name = Column(String(255), nullable=False)
    entity_type = Column(String(100), nullable=False) # Person, Organization, Location, Vehicle, Medical
    role = Column(String(100), nullable=True) # accused, complainant, victim, witness, doctor, officer
    mentions_count = Column(Integer, default=1)

    case = relationship("CaseModel", back_populates="entities")


class EventModel(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"))
    timestamp_str = Column(String(100), nullable=False)
    event_type = Column(String(100), nullable=False) # incident, complaint, medical_exam, police_action, arrest
    description = Column(Text, nullable=False)
    source_document = Column(String(255), nullable=False)
    page_number = Column(Integer, default=1)
    location = Column(String(255), nullable=True)
    parties_involved = Column(String(255), nullable=True)

    case = relationship("CaseModel", back_populates="events")


class EvidenceModel(Base):
    __tablename__ = "evidence_items"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"))
    evidence_code = Column(String(50), nullable=False)
    evidence_type = Column(String(100), nullable=False) # Physical, Document, Medical, Statement
    description = Column(Text, nullable=False)
    source_document = Column(String(255), nullable=False)
    page_number = Column(Integer, default=1)
    related_person = Column(String(255), nullable=True)
    date_str = Column(String(100), nullable=True)
    status = Column(String(50), default="verified")

    case = relationship("CaseModel", back_populates="evidence_items")


class ContradictionModel(Base):
    __tablename__ = "contradictions"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"))
    issue_code = Column(String(50), nullable=False)
    category = Column(String(100), nullable=False) # Date, Time, Name, Location, Statement, Quantity
    doc_a_name = Column(String(255), nullable=False)
    doc_a_page = Column(Integer, default=1)
    doc_a_quote = Column(Text, nullable=False)
    doc_b_name = Column(String(255), nullable=False)
    doc_b_page = Column(Integer, default=1)
    doc_b_quote = Column(Text, nullable=False)
    difference_summary = Column(Text, nullable=False)
    advocate_status = Column(String(50), default="needs_review") # accepted, rejected, needs_review
    advocate_notes = Column(Text, nullable=True)

    case = relationship("CaseModel", back_populates="contradictions")


class InformationGapModel(Base):
    __tablename__ = "information_gaps"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"))
    gap_code = Column(String(50), nullable=False)
    gap_type = Column(String(100), nullable=False) # missing_evidence, unverified_element, ocr_warning, missing_document
    description = Column(Text, nullable=False)
    impact_level = Column(String(50), default="Medium") # High, Medium, Low
    advocate_status = Column(String(50), default="open") # open, resolved, ignored

    case = relationship("CaseModel", back_populates="information_gaps")


class AnalysisModel(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"))
    executive_summary = Column(Text, nullable=False)
    facts_count = Column(Integer, default=0)
    evidence_count = Column(Integer, default=0)
    provisions_count = Column(Integer, default=0)
    contradictions_count = Column(Integer, default=0)
    gaps_count = Column(Integer, default=0)
    status = Column(String(50), default="completed")
    created_at = Column(DateTime, default=datetime.utcnow)

    case = relationship("CaseModel", back_populates="analyses")


class ReportModel(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"))
    report_title = Column(String(255), nullable=False)
    content_json = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    case = relationship("CaseModel", back_populates="reports")


class AuditLogModel(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, nullable=True)
    user_id = Column(Integer, nullable=True)
    action = Column(String(255), nullable=False)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)


# ==========================================
# PYDANTIC SCHEMAS FOR API
# ==========================================

class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenSchema(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class CaseCreate(BaseModel):
    title: str
    reference_number: str
    jurisdiction: str = "India"
    case_type: str = "Criminal Law"
    description: Optional[str] = None
    notes: Optional[str] = None

class AdvocateActionUpdate(BaseModel):
    status: str # accepted, rejected, needs_review
    notes: Optional[str] = None

class ChatRequest(BaseModel):
    question: str
