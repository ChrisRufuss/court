export interface User {
  id: number;
  full_name: string;
  email: string;
  role: string;
}

export interface CaseStats {
  documents_count: number;
  pages_count: number;
  facts_count: number;
  evidence_count: number;
  provisions_count: number;
  contradictions_count: number;
  gaps_count: number;
}

export interface LegalCase {
  id: number;
  title: string;
  reference_number: string;
  jurisdiction: string;
  case_type: string;
  description?: string;
  notes?: string;
  status: 'active' | 'archived';
  analysis_status: 'pending' | 'processing' | 'completed' | 'review_required';
  documents_count?: number;
  stats?: CaseStats;
  created_at: string;
  updated_at?: string;
}

export interface CaseDocument {
  id: number;
  filename: string;
  file_type: string;
  file_size_bytes?: number;
  page_count: number;
  status: 'uploaded' | 'processing' | 'processed' | 'error';
  ocr_required: boolean;
  ocr_confidence: number;
  upload_date: string;
  full_text?: string;
  pages?: DocumentPage[];
}

export interface DocumentPage {
  page_number: number;
  text_content: string;
  ocr_confidence: number;
}

export interface ExtractedFact {
  id: number;
  category: 'People' | 'Location' | 'Date and Time' | 'Event' | 'Object' | 'Allegation';
  fact_description: string;
  source_document: string;
  page_number: number;
  confidence: number;
  advocate_status: 'accepted' | 'rejected' | 'needs_review';
  advocate_notes?: string;
}

export interface Entity {
  id: number;
  name: string;
  entity_type: string;
  role: string;
  mentions_count: number;
}

export interface TimelineEvent {
  id: number;
  timestamp_str: string;
  event_type: string;
  description: string;
  source_document: string;
  page_number: number;
  location?: string;
  parties_involved?: string;
}

export interface EvidenceItem {
  id: number;
  evidence_code: string;
  evidence_type: string;
  description: string;
  source_document: string;
  page_number: number;
  related_person?: string;
  date_str?: string;
  status: string;
}

export interface ElementMapping {
  element_id: number;
  element_name: string;
  status: 'Evidence Found' | 'Evidence Not Detected' | 'Contradictory Evidence';
  evidence_details: string;
  source_document: string;
  page_number: number;
  confidence: number;
}

export interface LegalProvision {
  id: string;
  jurisdiction: string;
  statute: string;
  section_number: string;
  title: string;
  description: string;
  elements: string[];
  exceptions: string[];
  penalty: string;
  effective_date: string;
  source_name: string;
  source_url?: string;
  relevance_score: number;
  confidence_label: string;
  retrieval_justification: string;
  verification_status: string;
  disclaimer: string;
  element_mappings?: ElementMapping[];
  fulfillment_summary?: string;
}

export interface ContradictionIssue {
  id: number;
  issue_code: string;
  category: string;
  doc_a_name: string;
  doc_a_page: number;
  doc_a_quote: string;
  doc_b_name: string;
  doc_b_page: number;
  doc_b_quote: string;
  difference_summary: string;
  advocate_status: 'accepted' | 'rejected' | 'needs_review';
  advocate_notes?: string;
}

export interface InformationGap {
  id: number;
  gap_code: string;
  gap_type: string;
  description: string;
  impact_level: 'High' | 'Medium' | 'Low';
  advocate_status: 'open' | 'resolved' | 'ignored';
}

export interface ChatCitation {
  document: string;
  page: number;
}

export interface ChatResponse {
  question: string;
  answer: string;
  citations: ChatCitation[];
  disclaimer: string;
}
