import os
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.schemas import CaseModel, CaseCreate, CaseDocumentModel, ExtractedFactModel, EntityModel, EventModel, EvidenceModel, ContradictionModel, InformationGapModel, AnalysisModel, ReportModel
from app.services.doc_processor import process_file_content
from app.services.fact_extractor import extract_case_facts
from app.services.legal_retrieval import perform_hybrid_legal_retrieval
from app.services.evidence_mapper import map_evidence_to_provisions
from app.services.contradiction_engine import detect_case_contradictions
from app.services.gap_detector import detect_information_gaps

router = APIRouter(prefix="/cases", tags=["Cases"])

DEMO_DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", "demo_data")

@router.get("/")
def list_cases(db: Session = Depends(get_db)):
    cases = db.query(CaseModel).order_by(CaseModel.updated_at.desc()).all()
    results = []
    for c in cases:
        doc_count = db.query(CaseDocumentModel).filter(CaseDocumentModel.case_id == c.id).count()
        results.append({
            "id": c.id,
            "title": c.title,
            "reference_number": c.reference_number,
            "jurisdiction": c.jurisdiction,
            "case_type": c.case_type,
            "description": c.description,
            "status": c.status,
            "analysis_status": c.analysis_status,
            "documents_count": doc_count,
            "created_at": c.created_at.strftime("%Y-%m-%d %H:%M"),
            "updated_at": c.updated_at.strftime("%Y-%m-%d %H:%M")
        })
    return results

@router.post("/")
def create_case(case_in: CaseCreate, db: Session = Depends(get_db)):
    case = CaseModel(
        title=case_in.title,
        reference_number=case_in.reference_number,
        jurisdiction=case_in.jurisdiction,
        case_type=case_in.case_type,
        description=case_in.description,
        notes=case_in.notes,
        owner_id=1
    )
    db.add(case)
    db.commit()
    db.refresh(case)
    return {
        "id": case.id,
        "title": case.title,
        "reference_number": case.reference_number,
        "jurisdiction": case.jurisdiction,
        "case_type": case.case_type,
        "status": case.status,
        "analysis_status": case.analysis_status
    }

@router.get("/{case_id}")
def get_case(case_id: int, db: Session = Depends(get_db)):
    case = db.query(CaseModel).filter(CaseModel.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found.")
    
    docs = db.query(CaseDocumentModel).filter(CaseDocumentModel.case_id == case_id).all()
    facts_count = db.query(ExtractedFactModel).filter(ExtractedFactModel.case_id == case_id).count()
    evidence_count = db.query(EvidenceModel).filter(EvidenceModel.case_id == case_id).count()
    contradictions_count = db.query(ContradictionModel).filter(ContradictionModel.case_id == case_id).count()
    gaps_count = db.query(InformationGapModel).filter(InformationGapModel.case_id == case_id).count()

    return {
        "id": case.id,
        "title": case.title,
        "reference_number": case.reference_number,
        "jurisdiction": case.jurisdiction,
        "case_type": case.case_type,
        "description": case.description,
        "notes": case.notes,
        "status": case.status,
        "analysis_status": case.analysis_status,
        "stats": {
            "documents_count": len(docs),
            "pages_count": sum(d.page_count for d in docs),
            "facts_count": facts_count,
            "evidence_count": evidence_count,
            "provisions_count": 5 if case.analysis_status == "completed" else 0,
            "contradictions_count": contradictions_count,
            "gaps_count": gaps_count
        },
        "created_at": case.created_at.strftime("%Y-%m-%d %H:%M")
    }

@router.delete("/{case_id}")
def delete_case(case_id: int, db: Session = Depends(get_db)):
    case = db.query(CaseModel).filter(CaseModel.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found.")
    db.delete(case)
    db.commit()
    return {"message": f"Case #{case_id} deleted successfully."}

@router.post("/seed-demo")
def seed_demo_case(db: Session = Depends(get_db)):
    """
    Populates a complete fictional demonstration case with 5 sample files, extracted facts, 
    contradictions (time & date), missing evidence gap (BAC test), legal mappings, and report.
    """
    existing = db.query(CaseModel).filter(CaseModel.reference_number == "CR-142/2026").first()
    if existing:
        return {"message": "Demo case already loaded.", "case_id": existing.id}

    case = CaseModel(
        title="State of Maharashtra vs. Rajesh Kumar & Ors.",
        reference_number="CR-142/2026",
        jurisdiction="India",
        case_type="Criminal Law / Motor Vehicle Accident",
        description="Fictional demonstration case involving a rash driving hit-and-run collision on Palm Beach Road resulting in compound leg fracture (Grievous Hurt).",
        notes="Loaded automatically in Demo Mode for full system evaluation.",
        owner_id=1,
        status="active",
        analysis_status="completed"
    )
    db.add(case)
    db.commit()
    db.refresh(case)

    # Load Demo Data Files
    demo_files = [
        "FIR_001_Accident.txt",
        "Witness_Statement_01.txt",
        "Medical_Report_001.txt",
        "Police_Report_001.txt"
    ]

    processed_docs = []
    for fname in demo_files:
        fpath = os.path.join(DEMO_DATA_DIR, fname)
        if os.path.exists(fpath):
            pdata = process_file_content(fpath, fname)
            processed_docs.append(pdata)
            
            doc_model = CaseDocumentModel(
                case_id=case.id,
                filename=fname,
                file_type="txt",
                file_path=fpath,
                page_count=pdata["page_count"],
                status="processed",
                ocr_required=pdata["ocr_required"],
                ocr_confidence=pdata["ocr_confidence"],
                extracted_text=pdata["full_text"]
            )
            db.add(doc_model)

    db.commit()

    # Extract structured facts, entities, events, evidence
    extraction = extract_case_facts(processed_docs)
    for f in extraction["facts"]:
        db.add(ExtractedFactModel(
            case_id=case.id,
            category=f["category"],
            fact_description=f["fact_description"],
            source_document=f["source_document"],
            page_number=f["page_number"],
            confidence=f["confidence"]
        ))

    for e in extraction["entities"]:
        db.add(EntityModel(
            case_id=case.id,
            name=e["name"],
            entity_type=e["entity_type"],
            role=e["role"],
            mentions_count=e["mentions_count"]
        ))

    for ev in extraction["events"]:
        db.add(EventModel(
            case_id=case.id,
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
            case_id=case.id,
            evidence_code=item["evidence_code"],
            evidence_type=item["evidence_type"],
            description=item["description"],
            source_document=item["source_document"],
            page_number=item["page_number"],
            related_person=item["related_person"],
            date_str=item["date_str"],
            status=item["status"]
        ))

    # Retrieve Legal Provisions
    provisions = perform_hybrid_legal_retrieval(extraction["facts"], "India")
    mapped_provisions = map_evidence_to_provisions(provisions, extraction["facts"], extraction["evidence_items"])

    # Detect Contradictions & Gaps
    contradictions = detect_case_contradictions(processed_docs)
    for c in contradictions:
        db.add(ContradictionModel(
            case_id=case.id,
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
            case_id=case.id,
            gap_code=g["gap_code"],
            gap_type=g["gap_type"],
            description=g["description"],
            impact_level=g["impact_level"],
            advocate_status=g["advocate_status"]
        ))

    db.add(AnalysisModel(
        case_id=case.id,
        executive_summary="Fictional demonstration case analysis completed successfully.",
        facts_count=len(extraction["facts"]),
        evidence_count=len(extraction["evidence_items"]),
        provisions_count=len(provisions),
        contradictions_count=len(contradictions),
        gaps_count=len(gaps),
        status="completed"
    ))

    db.commit()

    return {"message": "Demo case seeded successfully.", "case_id": case.id}
