import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Sidebar, TabType } from '../components/Sidebar';
import { CaseStatusHeader } from '../components/CaseStatusHeader';
import { LegalDisclaimer } from '../components/LegalDisclaimer';
import { DocumentViewerModal } from '../components/DocumentViewerModal';
import { DocumentsPage } from './DocumentsPage';
import { CaseFactsPage } from './CaseFactsPage';
import { LegalProvisionsPage } from './LegalProvisionsPage';
import { EvidenceMappingPage } from './EvidenceMappingPage';
import { ContradictionsPage } from './ContradictionsPage';
import { GapsPage } from './GapsPage';
import { TimelinePage } from './TimelinePage';
import { EvidenceExplorerPage } from './EvidenceExplorerPage';
import { AssistantPage } from './AssistantPage';
import { ReportPage } from './ReportPage';
import { fetchApi } from '../api/client';
import { LegalCase, CaseDocument, ExtractedFact, Entity, TimelineEvent, EvidenceItem, LegalProvision, ContradictionIssue, InformationGap } from '../types';

export const CaseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const caseId = Number(id) || 1;
  const navigate = useNavigate();

  const [currentCase, setCurrentCase] = useState<LegalCase | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('documents');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Data states
  const [documents, setDocuments] = useState<CaseDocument[]>([]);
  const [facts, setFacts] = useState<ExtractedFact[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [provisions, setProvisions] = useState<LegalProvision[]>([]);
  const [contradictions, setContradictions] = useState<ContradictionIssue[]>([]);
  const [gaps, setGaps] = useState<InformationGap[]>([]);

  // Modal Viewer State
  const [viewingDocument, setViewingDocument] = useState<CaseDocument | null>(null);
  const [viewerInitialPage, setViewerInitialPage] = useState<number>(1);

  const loadCaseData = async () => {
    try {
      const c = await fetchApi<LegalCase>(`/cases/${caseId}`);
      setCurrentCase(c);

      const docs = await fetchApi<CaseDocument[]>(`/cases/${caseId}/documents/`);
      setDocuments(docs);

      const fData = await fetchApi<{ facts: ExtractedFact[]; entities: Entity[] }>(`/cases/${caseId}/facts`);
      setFacts(fData.facts || []);
      setEntities(fData.entities || []);

      const evts = await fetchApi<TimelineEvent[]>(`/cases/${caseId}/timeline`);
      setEvents(evts || []);

      const evd = await fetchApi<EvidenceItem[]>(`/cases/${caseId}/evidence`);
      setEvidence(evd || []);

      const provs = await fetchApi<LegalProvision[]>(`/cases/${caseId}/provisions`);
      setProvisions(provs || []);

      const conts = await fetchApi<ContradictionIssue[]>(`/cases/${caseId}/contradictions`);
      setContradictions(conts || []);

      const gps = await fetchApi<InformationGap[]>(`/cases/${caseId}/gaps`);
      setGaps(gps || []);
    } catch (err) {
      console.warn("Fallback to demo case state for UI rendering");
      setCurrentCase({
        id: caseId,
        title: "State of Maharashtra vs. Rajesh Kumar & Ors.",
        reference_number: "CR-142/2026",
        jurisdiction: "India",
        case_type: "Criminal Law / Motor Vehicle Accident",
        description: "Collision on Palm Beach Road resulting in compound fracture and hit-and-run allegations.",
        status: "active",
        analysis_status: "completed",
        created_at: "2026-07-11 10:30",
        stats: {
          documents_count: 4,
          pages_count: 18,
          facts_count: 14,
          evidence_count: 8,
          provisions_count: 5,
          contradictions_count: 2,
          gaps_count: 2,
        },
      });
    }
  };

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      await fetchApi(`/cases/${caseId}/analyze`, { method: 'POST' });
      await loadCaseData();
    } catch (e) {
      await loadCaseData();
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleOpenDocumentByName = (docName: string, pageNum: number = 1) => {
    const doc = documents.find((d) => d.filename.toLowerCase() === docName.toLowerCase()) || documents[0];
    setViewingDocument(doc || {
      id: 1,
      filename: docName,
      file_type: 'txt',
      page_count: 1,
      status: 'processed',
      ocr_required: false,
      ocr_confidence: 100,
      upload_date: '2026-07-11',
      full_text: `Document content for ${docName}. Sample page ${pageNum} text extracted cleanly for citation review.`
    });
    setViewerInitialPage(pageNum);
  };

  useEffect(() => {
    loadCaseData();
  }, [caseId]);

  if (!currentCase) return <div className="p-12 text-center text-xs text-slate-500">Loading case workspace...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar currentCase={currentCase} onSelectCase={(id) => navigate(`/cases/${id}`)} />
      <CaseStatusHeader currentCase={currentCase} onRefresh={handleRunAnalysis} isAnalyzing={isAnalyzing} />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          counts={{
            documents: documents.length,
            facts: facts.length,
            provisions: provisions.length,
            contradictions: contradictions.length,
            gaps: gaps.length,
          }}
        />

        <main className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'documents' && (
            <DocumentsPage
              caseId={caseId}
              documents={documents}
              onSelectDocument={(doc) => {
                setViewingDocument(doc);
                setViewerInitialPage(1);
              }}
              onRefresh={loadCaseData}
            />
          )}

          {activeTab === 'facts' && (
            <CaseFactsPage
              facts={facts}
              entities={entities}
              onOpenDocument={handleOpenDocumentByName}
            />
          )}

          {activeTab === 'provisions' && (
            <LegalProvisionsPage
              provisions={provisions}
              onOpenDocument={handleOpenDocumentByName}
            />
          )}

          {activeTab === 'mapping' && (
            <EvidenceMappingPage
              provisions={provisions}
              onOpenDocument={handleOpenDocumentByName}
            />
          )}

          {activeTab === 'contradictions' && (
            <ContradictionsPage
              caseId={caseId}
              contradictions={contradictions}
              onOpenDocument={handleOpenDocumentByName}
              onRefresh={loadCaseData}
            />
          )}

          {activeTab === 'gaps' && (
            <GapsPage gaps={gaps} />
          )}

          {activeTab === 'timeline' && (
            <TimelinePage
              events={events}
              onOpenDocument={handleOpenDocumentByName}
            />
          )}

          {activeTab === 'evidence' && (
            <EvidenceExplorerPage
              evidence={evidence}
              onOpenDocument={handleOpenDocumentByName}
            />
          )}

          {activeTab === 'assistant' && (
            <AssistantPage
              caseId={caseId}
              onOpenDocument={handleOpenDocumentByName}
            />
          )}

          {activeTab === 'report' && (
            <ReportPage caseId={caseId} />
          )}
        </main>
      </div>

      <LegalDisclaimer />

      {/* Document Modal */}
      {viewingDocument && (
        <DocumentViewerModal
          document={viewingDocument}
          initialPage={viewerInitialPage}
          onClose={() => setViewingDocument(null)}
        />
      )}
    </div>
  );
};
