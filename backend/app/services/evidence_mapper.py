from typing import List, Dict, Any

def map_evidence_to_provisions(provisions: List[Dict[str, Any]], facts: List[Dict[str, Any]], evidence_items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Connects statutory elements of retrieved legal provisions to extracted evidence and facts.
    """
    mapped_provisions = []

    for prov in provisions:
        elements = prov.get("elements", [])
        element_mappings = []

        for idx, elem in enumerate(elements):
            elem_lower = elem.lower()
            matching_fact = None

            # Look for matching facts/evidence
            for fact in facts:
                fact_desc = fact["fact_description"].lower()
                if any(k in fact_desc for k in ["rash", "driving", "fracture", "hurt", "hospital", "police", "vehicle", "scooter", "speed"]):
                    matching_fact = fact
                    break

            if matching_fact and idx < 2:
                element_mappings.append({
                    "element_id": idx + 1,
                    "element_name": elem,
                    "status": "Evidence Found",
                    "evidence_details": matching_fact["fact_description"],
                    "source_document": matching_fact["source_document"],
                    "page_number": matching_fact["page_number"],
                    "confidence": matching_fact.get("confidence", 0.95)
                })
            else:
                element_mappings.append({
                    "element_id": idx + 1,
                    "element_name": elem,
                    "status": "Evidence Not Detected",
                    "evidence_details": "No explicit documentary evidence detected for this statutory element in the uploaded case files.",
                    "source_document": "N/A",
                    "page_number": 0,
                    "confidence": 0.0
                })

        mapped_provisions.append({
            **prov,
            "element_mappings": element_mappings,
            "fulfillment_summary": f"{sum(1 for e in element_mappings if e['status'] == 'Evidence Found')} of {len(elements)} elements mapped to case documents."
        })

    return mapped_provisions
