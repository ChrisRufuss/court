import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.schemas import CaseModel, CaseDocumentModel, ExtractedFactModel, EntityModel, EventModel, EvidenceModel, ContradictionModel, InformationGapModel, ReportModel
from app.services.legal_retrieval import perform_hybrid_legal_retrieval
from app.services.evidence_mapper import map_evidence_to_provisions
from app.services.report_generator import generate_structured_case_report

router = APIRouter(prefix="/cases/{case_id}/report", tags=["Reports"])

@router.get("/")
def get_or_generate_report(case_id: int, db: Session = Depends(get_db)):
    case = db.query(CaseModel).filter(CaseModel.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found.")

    docs = db.query(CaseDocumentModel).filter(CaseDocumentModel.case_id == case_id).all()
    facts = db.query(ExtractedFactModel).filter(ExtractedFactModel.case_id == case_id).all()
    entities = db.query(EntityModel).filter(EntityModel.case_id == case_id).all()
    events = db.query(EventModel).filter(EventModel.case_id == case_id).all()
    evidence = db.query(EvidenceModel).filter(EvidenceModel.case_id == case_id).all()
    contradictions = db.query(ContradictionModel).filter(ContradictionModel.case_id == case_id).all()
    gaps = db.query(InformationGapModel).filter(InformationGapModel.case_id == case_id).all()

    facts_dict = [{"fact_description": f.fact_description, "source_document": f.source_document, "page_number": f.page_number} for f in facts]
    evidence_dict = [{"description": ev.description, "source_document": ev.source_document} for ev in evidence]

    provisions = perform_hybrid_legal_retrieval(facts_dict, case.jurisdiction)
    mapped_provisions = map_evidence_to_provisions(provisions, facts_dict, evidence_dict)

    case_data = {
        "case_info": {
            "title": case.title,
            "reference_number": case.reference_number,
            "jurisdiction": case.jurisdiction,
            "case_type": case.case_type,
            "description": case.description
        },
        "documents": [{"filename": d.filename, "page_count": d.page_count, "ocr_required": d.ocr_required, "ocr_confidence": d.ocr_confidence} for d in docs],
        "facts": [{"category": f.category, "description": f.fact_description, "source": f.source_document, "page": f.page_number} for f in facts],
        "entities": [{"name": e.name, "type": e.entity_type, "role": e.role} for e in entities],
        "events": [{"timestamp": ev.timestamp_str, "type": ev.event_type, "description": ev.description, "source": ev.source_document, "page": ev.page_number} for ev in events],
        "evidence": [{"code": ev.evidence_code, "type": ev.evidence_type, "description": ev.description, "source": ev.source_document, "page": ev.page_number} for ev in evidence],
        "provisions": mapped_provisions,
        "contradictions": [{"code": c.issue_code, "category": c.category, "doc_a": c.doc_a_name, "quote_a": c.doc_a_quote, "doc_b": c.doc_b_name, "quote_b": c.doc_b_quote, "summary": c.difference_summary} for c in contradictions],
        "gaps": [{"code": g.gap_code, "type": g.gap_type, "description": g.description, "impact": g.impact_level} for g in gaps]
    }

    report = generate_structured_case_report(case_data)
    return report
