import os
import shutil
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.schemas import CaseModel, CaseDocumentModel, DocumentPageModel
from app.services.doc_processor import process_file_content

router = APIRouter(prefix="/cases/{case_id}/documents", tags=["Documents"])

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/")
def list_documents(case_id: int, db: Session = Depends(get_db)):
    docs = db.query(CaseDocumentModel).filter(CaseDocumentModel.case_id == case_id).all()
    results = []
    for d in docs:
        results.append({
            "id": d.id,
            "filename": d.filename,
            "file_type": d.file_type,
            "file_size_bytes": d.file_size_bytes,
            "page_count": d.page_count,
            "status": d.status,
            "ocr_required": d.ocr_required,
            "ocr_confidence": d.ocr_confidence,
            "upload_date": d.upload_date.strftime("%Y-%m-%d %H:%M")
        })
    return results

@router.post("/")
async def upload_document(case_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    case = db.query(CaseModel).filter(CaseModel.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found.")

    case_folder = os.path.join(UPLOAD_DIR, f"case_{case_id}")
    os.makedirs(case_folder, exist_ok=True)

    file_path = os.path.join(case_folder, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_size = os.path.getsize(file_path)

    # Process Document
    processed = process_file_content(file_path, file.filename)

    doc_model = CaseDocumentModel(
        case_id=case_id,
        filename=file.filename,
        file_type=file.filename.split('.')[-1].lower(),
        file_path=file_path,
        file_size_bytes=file_size,
        page_count=processed["page_count"],
        status="processed",
        ocr_required=processed["ocr_required"],
        ocr_confidence=processed["ocr_confidence"],
        extracted_text=processed["full_text"]
    )
    db.add(doc_model)
    db.commit()
    db.refresh(doc_model)

    # Save pages
    for p in processed["pages"]:
        page_model = DocumentPageModel(
            document_id=doc_model.id,
            page_number=p["page_number"],
            text_content=p["text_content"],
            ocr_confidence=p["ocr_confidence"]
        )
        db.add(page_model)
    db.commit()

    return {
        "id": doc_model.id,
        "filename": doc_model.filename,
        "page_count": doc_model.page_count,
        "ocr_required": doc_model.ocr_required,
        "ocr_confidence": doc_model.ocr_confidence,
        "status": doc_model.status
    }

@router.get("/{doc_id}")
def get_document_details(case_id: int, doc_id: int, db: Session = Depends(get_db)):
    doc = db.query(CaseDocumentModel).filter(CaseDocumentModel.id == doc_id, CaseDocumentModel.case_id == case_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    pages = db.query(DocumentPageModel).filter(DocumentPageModel.document_id == doc_id).order_by(DocumentPageModel.page_number).all()

    pages_data = []
    for p in pages:
        pages_data.append({
            "page_number": p.page_number,
            "text_content": p.text_content,
            "ocr_confidence": p.ocr_confidence
        })

    # If no separate page models exist (e.g. from demo seeder), build page list from extracted_text
    if not pages_data and doc.extracted_text:
        pages_data = [{
            "page_number": 1,
            "text_content": doc.extracted_text,
            "ocr_confidence": doc.ocr_confidence
        }]

    return {
        "id": doc.id,
        "filename": doc.filename,
        "file_type": doc.file_type,
        "page_count": doc.page_count,
        "ocr_required": doc.ocr_required,
        "ocr_confidence": doc.ocr_confidence,
        "full_text": doc.extracted_text,
        "pages": pages_data
    }
