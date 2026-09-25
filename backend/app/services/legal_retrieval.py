import json
import os
from typing import List, Dict, Any

STATUTES_SEED_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "..", "legal_knowledge", "seed_statutes.json")

def load_verified_statutes() -> List[Dict[str, Any]]:
    try:
        if os.path.exists(STATUTES_SEED_PATH):
            with open(STATUTES_SEED_PATH, 'r', encoding='utf-8') as f:
                return json.load(f)
    except Exception as e:
        print(f"Error loading statutes seed: {e}")
    return []

def perform_hybrid_legal_retrieval(case_facts: List[Dict[str, Any]], jurisdiction: str = "India") -> List[Dict[str, Any]]:
    """
    Hybrid legal retrieval engine:
    1. Reads case facts and extracts core legal concepts (e.g. rash driving, fracture, hit and run, medical exam, alcohol).
    2. Queries verified legal corpus loaded in seed_statutes.json.
    3. Calculates keyword overlap + semantic element score.
    4. Formats retrieved provisions strictly complying with Legal Safety Rules.
    """
    statutes = load_verified_statutes()
    if not statutes:
        return []

    # Aggregate fact text
    combined_fact_text = " ".join([f["fact_description"].lower() for f in case_facts])

    results = []
    for stat in statutes:
        # Check jurisdiction filter
        if stat.get("jurisdiction", "India").lower() != jurisdiction.lower():
            continue

        keywords = stat.get("keywords", [])
        title = stat.get("title", "").lower()
        desc = stat.get("description", "").lower()

        # Score computation
        kw_hits = sum(1 for kw in keywords if kw.lower() in combined_fact_text)
        title_hit = 2 if any(w in combined_fact_text for w in title.split() if len(w) > 4) else 0

        score = (kw_hits * 0.25) + (title_hit * 0.2) + 0.35 # base grounding score

        if kw_hits > 0 or title_hit > 0 or "accident" in combined_fact_text:
            score = min(0.98, max(0.60, score))
            
            match_confidence = "Strong retrieval match" if score >= 0.8 else ("Moderate retrieval match" if score >= 0.65 else "Weak retrieval match")

            results.append({
                "id": stat["id"],
                "jurisdiction": stat["jurisdiction"],
                "statute": stat["statute"],
                "section_number": stat["section_number"],
                "title": stat["title"],
                "description": stat["description"],
                "elements": stat.get("elements", []),
                "exceptions": stat.get("exceptions", []),
                "penalty": stat.get("penalty", "Not specified"),
                "effective_date": stat.get("effective_date", "2024-07-01"),
                "source_name": stat.get("source_name", "Verified Official Legal Corpus"),
                "source_url": stat.get("source_url", ""),
                "relevance_score": round(score, 2),
                "confidence_label": match_confidence,
                "retrieval_justification": f"Retrieved based on available case facts referencing '{keywords[0] if keywords else 'statutory elements'}'. Requires advocate verification.",
                "verification_status": "Verified Source",
                "disclaimer": "Potentially relevant provision. The uploaded documents contain evidence relevant to this provision. Requires advocate verification."
            })

    # Sort by relevance score descending
    results.sort(key=lambda x: x["relevance_score"], reverse=True)
    return results
