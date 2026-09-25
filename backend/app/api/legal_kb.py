from typing import List, Optional
from fastapi import APIRouter, Query
from app.services.legal_retrieval import load_verified_statutes

router = APIRouter(prefix="/legal", tags=["Legal Knowledge Base"])

@router.get("/statutes")
def list_statutes(jurisdiction: str = Query("India")):
    statutes = load_verified_statutes()
    filtered = [s for s in statutes if s.get("jurisdiction", "India").lower() == jurisdiction.lower()]
    return {
        "jurisdiction": jurisdiction,
        "total_statutes": len(filtered),
        "installed_statutes": filtered,
        "scope_notice": "Showing verified legal corpus currently installed. Additional statutes can be ingested via the LexAnalyze ingestion pipeline."
    }

@router.get("/search")
def search_legal_provisions(q: str = Query(...), jurisdiction: str = Query("India")):
    statutes = load_verified_statutes()
    q_lower = q.lower()

    matches = []
    for s in statutes:
        if s.get("jurisdiction", "India").lower() != jurisdiction.lower():
            continue
        text_corp = f"{s['section_number']} {s['title']} {s['description']} {' '.join(s.get('keywords', []))}".lower()
        if q_lower in text_corp or any(w in text_corp for w in q_lower.split() if len(w) > 3):
            matches.append(s)

    return {
        "query": q,
        "jurisdiction": jurisdiction,
        "matches_count": len(matches),
        "results": matches
    }
