from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.schemas import CaseModel, CaseDocumentModel, ExtractedFactModel, EntityModel, EventModel, EvidenceModel, ContradictionModel, InformationGapModel, AnalysisModel, AdvocateActionUpdate
from app.services.fact_extractor import extract_case_facts
from app.services.legal_retrieval import perform_hybrid_legal_retrieval
from app.services.evidence_mapper import map_evidence_to_provisions
from app.services.contradiction_engine import detect_case_contradictions
from app.services.gap_detector import detect_information_gaps

router = APIRouter(prefix="/cases/{case_id}", tags=["Case Analysis"])

@router.post("/analyze")
def trigger_case_analysis(case_id: int, db: Session = Depends(get_db)):
    case = db.query(CaseModel).filter(CaseModel.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found.")

    docs = db.query(CaseDocumentModel).filter(CaseDocumentModel.case_id == case_id).all()
    if not docs:
        raise HTTPException(status_code=400, detail="No documents uploaded for this case. Upload at least one document before analyzing.")

    processed_docs = [
        {
            "filename": d.filename,
            "full_text": d.extracted_text or "",
            "ocr_required": d.ocr_required,
            "ocr_confidence": d.ocr_confidence,
            "pages": [{"page_number": 1, "text_content": d.extracted_text or ""}]
        } for d in docs
    ]

    # Clear previous analysis
    db.query(ExtractedFactModel).filter(ExtractedFactModel.case_id == case_id).delete()
    db.query(EntityModel).filter(EntityModel.case_id == case_id).delete()
    db.query(EventModel).filter(EventModel.case_id == case_id).delete()
    db.query(EvidenceModel).filter(EvidenceModel.case_id == case_id).delete()
    db.query(ContradictionModel).filter(ContradictionModel.case_id == case_id).delete()
    db.query(InformationGapModel).filter(InformationGapModel.case_id == case_id).delete()
    db.commit()

    # 1. Fact Extraction
    extraction = extract_case_facts(processed_docs)
    for f in extraction["facts"]:
        db.add(ExtractedFactModel(
            case_id=case_id,
            category=f["category"],
            fact_description=f["fact_description"],
            source_document=f["source_document"],
            page_number=f["page_number"],
            confidence=f["confidence"]
        ))

    for e in extraction["entities"]:
        db.add(EntityModel(
            case_id=case_id,
            name=e["name"],
            entity_type=e["entity_type"],
            role=e["role"],
            mentions_count=e["mentions_count"]
        ))

    for ev in extraction["events"]:
        db.add(EventModel(
            case_id=case_id,
            timestamp_str=ev["timestamp_str"],
            event_type=ev["event_type"],
            description=ev["description"],
            source_document=ev["source_document"],
            page_number=ev["page_number"],
            location=ev["location"],
            parties_involved=ev["parties_involved"]
        ))

    for item in extraction["evidence_items"]:
        db.add(EvidenceModel(
            case_id=case_id,
            evidence_code=item["evidence_code"],
            evidence_type=item["evidence_type"],
            description=item["description"],
            source_document=item["source_document"],
            page_number=item["page_number"],
            related_person=item["related_person"],
            date_str=item["date_str"],
            status=item["status"]
        ))

    # 2. Legal Provision Retrieval
    provisions = perform_hybrid_legal_retrieval(extraction["facts"], case.jurisdiction)

    # 3. Evidence Mapping
    mapped_provisions = map_evidence_to_provisions(provisions, extraction["facts"], extraction["evidence_items"])

    # 4. Contradictions & Gaps
    contradictions = detect_case_contradictions(processed_docs)
    for c in contradictions:
        db.add(ContradictionModel(
            case_id=case_id,
            issue_code=c["issue_code"],
            category=c["category"],
            doc_a_name=c["doc_a_name"],
            doc_a_page=c["doc_a_page"],
            doc_a_quote=c["doc_a_quote"],
            doc_b_name=c["doc_b_name"],
            doc_b_page=c["doc_b_page"],
            doc_b_quote=c["doc_b_quote"],
            difference_summary=c["difference_summary"],
            advocate_status=c["advocate_status"],
            advocate_notes=c["advocate_notes"]
        ))

    gaps = detect_information_gaps(processed_docs, mapped_provisions)
    for g in gaps:
        db.add(InformationGapModel(
            case_id=case_id,
            gap_code=g["gap_code"],
            gap_type=g["gap_type"],
            description=g["description"],
            impact_level=g["impact_level"],
            advocate_status=g["advocate_status"]
        ))

    case.analysis_status = "completed"
    db.commit()

    return {
        "message": "Analysis completed successfully.",
        "facts_count": len(extraction["facts"]),
        "evidence_count": len(extraction["evidence_items"]),
        "provisions_count": len(provisions),
        "contradictions_count": len(contradictions),
        "gaps_count": len(gaps)
    }

@router.get("/facts")
def get_facts(case_id: int, db: Session = Depends(get_db)):
    facts = db.query(ExtractedFactModel).filter(ExtractedFactModel.case_id == case_id).all()
    entities = db.query(EntityModel).filter(EntityModel.case_id == case_id).all()
    return {
        "facts": [
            {
                "id": f.id,
                "category": f.category,
                "fact_description": f.fact_description,
                "source_document": f.source_document,
                "page_number": f.page_number,
                "confidence": f.confidence,
                "advocate_status": f.advocate_status,
                "advocate_notes": f.advocate_notes
            } for f in facts
        ],
        "entities": [
            {
                "id": e.id,
                "name": e.name,
                "entity_type": e.entity_type,
                "role": e.role,
                "mentions_count": e.mentions_count
            } for e in entities
        ]
    }

@router.get("/timeline")
def get_timeline(case_id: int, db: Session = Depends(get_db)):
    events = db.query(EventModel).filter(EventModel.case_id == case_id).all()
    return [
        {
            "id": e.id,
            "timestamp_str": e.timestamp_str,
            "event_type": e.event_type,
            "description": e.description,
            "source_document": e.source_document,
            "page_number": e.page_number,
            "location": e.location,
            "parties_involved": e.parties_involved
        } for e in events
    ]

@router.get("/evidence")
def get_evidence(case_id: int, db: Session = Depends(get_db)):
    evidence = db.query(EvidenceModel).filter(EvidenceModel.case_id == case_id).all()
    return [
        {
            "id": ev.id,
            "evidence_code": ev.evidence_code,
            "evidence_type": ev.evidence_type,
            "description": ev.description,
            "source_document": ev.source_document,
            "page_number": ev.page_number,
            "related_person": ev.related_person,
            "date_str": ev.date_str,
            "status": ev.status
        } for ev in evidence
    ]

@router.get("/provisions")
def get_provisions(case_id: int, db: Session = Depends(get_db)):
    case = db.query(CaseModel).filter(CaseModel.id == case_id).first()
    facts = db.query(ExtractedFactModel).filter(ExtractedFactModel.case_id == case_id).all()
    evidence = db.query(EvidenceModel).filter(EvidenceModel.case_id == case_id).all()

    facts_dict = [{"fact_description": f.fact_description, "source_document": f.source_document, "page_number": f.page_number} for f in facts]
    evidence_dict = [{"description": ev.description, "source_document": ev.source_document} for ev in evidence]

    provisions = perform_hybrid_legal_retrieval(facts_dict, case.jurisdiction if case else "India")
    mapped = map_evidence_to_provisions(provisions, facts_dict, evidence_dict)
    return mapped

@router.get("/contradictions")
def get_contradictions(case_id: int, db: Session = Depends(get_db)):
    contradictions = db.query(ContradictionModel).filter(ContradictionModel.case_id == case_id).all()
    return [
        {
            "id": c.id,
            "issue_code": c.issue_code,
            "category": c.category,
            "doc_a_name": c.doc_a_name,
            "doc_a_page": c.doc_a_page,
            "doc_a_quote": c.doc_a_quote,
            "doc_b_name": c.doc_b_name,
            "doc_b_page": c.doc_b_page,
            "doc_b_quote": c.doc_b_quote,
            "difference_summary": c.difference_summary,
            "advocate_status": c.advocate_status,
            "advocate_notes": c.advocate_notes
        } for c in contradictions
    ]

@router.post("/contradictions/{contradiction_id}/action")
def update_contradiction_action(case_id: int, contradiction_id: int, action: AdvocateActionUpdate, db: Session = Depends(get_db)):
    item = db.query(ContradictionModel).filter(ContradictionModel.id == contradiction_id, ContradictionModel.case_id == case_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Contradiction issue not found.")
    item.advocate_status = action.status
    if action.notes:
        item.advocate_notes = action.notes
    db.commit()
    return {"message": "Advocate decision recorded.", "status": item.advocate_status}

@router.get("/gaps")
def get_gaps(case_id: int, db: Session = Depends(get_db)):
    gaps = db.query(InformationGapModel).filter(InformationGapModel.case_id == case_id).all()
    return [
        {
            "id": g.id,
            "gap_code": g.gap_code,
            "gap_type": g.gap_type,
            "description": g.description,
            "impact_level": g.impact_level,
            "advocate_status": g.advocate_status
        } for g in gaps
    ]
