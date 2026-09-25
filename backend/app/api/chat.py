from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.schemas import CaseModel, CaseDocumentModel, ExtractedFactModel, EventModel, EvidenceModel, ContradictionModel, InformationGapModel, ChatRequest
from app.services.ai_assistant import answer_case_question
from app.services.legal_retrieval import perform_hybrid_legal_retrieval

router = APIRouter(prefix="/cases/{case_id}/chat", tags=["AI Assistant"])

@router.post("/")
def chat_with_case_assistant(case_id: int, req: ChatRequest, db: Session = Depends(get_db)):
    case = db.query(CaseModel).filter(CaseModel.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found.")

    docs = db.query(CaseDocumentModel).filter(CaseDocumentModel.case_id == case_id).all()
    facts = db.query(ExtractedFactModel).filter(ExtractedFactModel.case_id == case_id).all()
    events = db.query(EventModel).filter(EventModel.case_id == case_id).all()
    evidence = db.query(EvidenceModel).filter(EvidenceModel.case_id == case_id).all()
    contradictions = db.query(ContradictionModel).filter(ContradictionModel.case_id == case_id).all()
    gaps = db.query(InformationGapModel).filter(InformationGapModel.case_id == case_id).all()

    facts_dict = [{"fact_description": f.fact_description, "source_document": f.source_document, "page_number": f.page_number} for f in facts]
    provisions = perform_hybrid_legal_retrieval(facts_dict, case.jurisdiction)

    case_summary = {
        "facts": facts_dict,
        "events": [{"timestamp_str": e.timestamp_str, "event_type": e.event_type, "description": e.description, "source_document": e.source_document, "page_number": e.page_number} for e in events],
        "provisions": provisions,
        "contradictions": [{"category": c.category, "issue_code": c.issue_code, "doc_a_name": c.doc_a_name, "doc_a_page": c.doc_a_page, "doc_a_quote": c.doc_a_quote, "doc_b_name": c.doc_b_name, "doc_b_page": c.doc_b_page, "doc_b_quote": c.doc_b_quote, "difference_summary": c.difference_summary} for c in contradictions],
        "gaps": [{"gap_type": g.gap_type, "description": g.description, "impact_level": g.impact_level} for g in gaps],
        "evidence": [{"evidence_code": ev.evidence_code, "evidence_type": ev.evidence_type, "description": ev.description, "source_document": ev.source_document, "page_number": ev.page_number} for ev in evidence]
    }

    docs_dict = [{"filename": d.filename, "pages": [{"page_number": 1, "text_content": d.extracted_text or ""}]} for d in docs]

    result = answer_case_question(req.question, case_summary, docs_dict)
    return result
