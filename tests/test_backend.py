import sys
import os
import pytest
from fastapi.testclient import TestClient

# Add backend directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from app.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "LexAnalyze"
    assert "disclaimer" in data

def test_legal_statutes_endpoint():
    response = client.get("/api/legal/statutes?jurisdiction=India")
    assert response.status_code == 200
    data = response.json()
    assert data["total_statutes"] > 0
    assert len(data["installed_statutes"]) >= 5

def test_seed_demo_case():
    response = client.post("/api/cases/seed-demo")
    assert response.status_code == 200
    assert "case_id" in response.json()

def test_cases_list_and_demo():
    response = client.get("/api/cases/")
    assert response.status_code == 200
    cases = response.json()
    assert len(cases) > 0

def test_case_details_and_facts():
    # Seed demo case first
    client.post("/api/cases/seed-demo")
    response = client.get("/api/cases/1")
    assert response.status_code == 200
    cdata = response.json()
    assert "State of Maharashtra" in cdata["title"]

    facts_res = client.get("/api/cases/1/facts")
    assert facts_res.status_code == 200
    assert len(facts_res.json()["facts"]) > 0

def test_contradictions_and_gaps():
    client.post("/api/cases/seed-demo")
    contradictions_res = client.get("/api/cases/1/contradictions")
    assert contradictions_res.status_code == 200
    assert len(contradictions_res.json()) >= 1

    gaps_res = client.get("/api/cases/1/gaps")
    assert gaps_res.status_code == 200
    assert len(gaps_res.json()) >= 1

def test_report_generation():
    client.post("/api/cases/seed-demo")
    report_res = client.get("/api/cases/1/report")
    assert report_res.status_code == 200
    rdata = report_res.json()
    assert "section_1_case_information" in rdata
    assert "section_14_ai_disclaimer" in rdata
