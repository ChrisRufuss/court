import React, { useState, useEffect } from 'react';
import { FileCheck, Download, Printer, Share2, Scale, CheckCircle2, ShieldAlert } from 'lucide-react';
import { fetchApi } from '../api/client';

interface ReportPageProps {
  caseId: number;
}

export const ReportPage: React.FC<ReportPageProps> = ({ caseId }) => {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReport = async () => {
      try {
        const data = await fetchApi<any>(`/cases/${caseId}/report/`);
        setReportData(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadReport();
  }, [caseId]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    if (!reportData) return;
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LexAnalyze_Report_Case_${caseId}.json`;
    a.click();
  };

  if (loading) return <div className="p-12 text-center text-xs text-slate-500">Generating 14-Section Structured Case Analysis Report...</div>;

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-base font-serif font-bold text-slate-900 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-emerald-600" />
            Structured Case Analysis Report
          </h2>
          <p className="text-xs text-slate-500">14-Section exportable case analysis report with strict provenance references.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2 rounded-lg transition shadow-sm flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            Print / Save as PDF
          </button>
          <button
            onClick={handleDownloadJson}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs px-4 py-2 rounded-lg border border-slate-300 transition flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export JSON Data
          </button>
        </div>
      </div>

      {/* Report Document Page Canvas */}
      <div className="bg-white border border-slate-300 rounded-xl p-10 shadow-lg max-w-5xl mx-auto space-y-8 font-serif leading-relaxed text-slate-900 print:shadow-none print:border-none print:p-0">
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-6 text-center space-y-2">
          <div className="flex justify-center mb-2">
            <div className="bg-slate-900 text-amber-400 p-3 rounded-xl inline-block">
              <Scale className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 uppercase">LexAnalyze Case Analysis Report</h1>
          <p className="text-xs font-mono text-slate-600 uppercase tracking-widest">
            AI-Assisted Legal Case File Analysis & Evidence Intelligence Platform
          </p>
          <div className="text-xs font-mono text-slate-500 pt-1">
            Generated: {reportData?.metadata?.generated_at} • Jurisdiction: {reportData?.metadata?.jurisdiction}
          </div>
        </div>

        {/* Section 1: Case Information */}
        <div className="space-y-2 border-b border-slate-200 pb-6">
          <h2 className="text-sm font-bold font-sans uppercase text-slate-900 tracking-wider">1. Case Information</h2>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs font-sans space-y-1">
            <p><strong>Cause Title:</strong> {reportData?.section_1_case_information?.case_title}</p>
            <p><strong>Case Reference:</strong> {reportData?.section_1_case_information?.reference_number}</p>
            <p><strong>Jurisdiction:</strong> {reportData?.section_1_case_information?.jurisdiction} ({reportData?.section_1_case_information?.case_type})</p>
            <p><strong>Description:</strong> {reportData?.section_1_case_information?.description}</p>
          </div>
        </div>

        {/* Section 2: Executive Summary */}
        <div className="space-y-2 border-b border-slate-200 pb-6">
          <h2 className="text-sm font-bold font-sans uppercase text-slate-900 tracking-wider">2. Executive Summary</h2>
          <p className="text-xs text-slate-800 leading-relaxed font-sans">{reportData?.section_2_executive_summary?.summary}</p>
        </div>

        {/* Section 3: Documents Analyzed */}
        <div className="space-y-2 border-b border-slate-200 pb-6">
          <h2 className="text-sm font-bold font-sans uppercase text-slate-900 tracking-wider">3. Documents Analyzed</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans border-collapse">
              <thead>
                <tr className="bg-slate-100 font-mono text-[10px] text-slate-600 border-b">
                  <th className="p-2">Filename</th>
                  <th className="p-2">Pages</th>
                  <th className="p-2">OCR Status</th>
                  <th className="p-2">OCR Confidence</th>
                </tr>
              </thead>
              <tbody>
                {reportData?.section_3_documents_analyzed?.map((d: any, idx: number) => (
                  <tr key={idx} className="border-b text-xs">
                    <td className="p-2 font-semibold">{d.filename}</td>
                    <td className="p-2 font-mono">{d.pages}</td>
                    <td className="p-2">{d.ocr_status}</td>
                    <td className="p-2 font-mono">{d.ocr_confidence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Important Facts */}
        <div className="space-y-2 border-b border-slate-200 pb-6">
          <h2 className="text-sm font-bold font-sans uppercase text-slate-900 tracking-wider">4. Important Facts Extracted</h2>
          <ul className="space-y-2 text-xs font-sans text-slate-800">
            {reportData?.section_4_important_facts?.map((f: any, idx: number) => (
              <li key={idx} className="bg-slate-50 p-2.5 rounded border border-slate-200 flex justify-between gap-4">
                <span><strong>[{f.category}]</strong> {f.fact_description || f.description}</span>
                <span className="font-mono text-[10px] text-slate-500 shrink-0">{f.source_document || f.source} (Page {f.page_number || f.page})</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Section 8: Potentially Relevant Legal Provisions */}
        <div className="space-y-2 border-b border-slate-200 pb-6">
          <h2 className="text-sm font-bold font-sans uppercase text-slate-900 tracking-wider">8. Potentially Relevant Legal Provisions</h2>
          <div className="space-y-3 font-sans text-xs">
            {reportData?.section_8_potentially_relevant_legal_provisions?.map((p: any, idx: number) => (
              <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">{p.statute} — {p.section_number}: {p.title}</span>
                <p className="text-slate-700">{p.description}</p>
                <p className="text-[11px] text-rose-800 font-semibold">Penalty: {p.penalty}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 10: Potential Inconsistencies */}
        <div className="space-y-2 border-b border-slate-200 pb-6">
          <h2 className="text-sm font-bold font-sans uppercase text-slate-900 tracking-wider">10. Potential Inconsistencies (Case Integrity Check)</h2>
          <div className="space-y-2 font-sans text-xs">
            {reportData?.section_10_potential_inconsistencies?.map((c: any, idx: number) => (
              <div key={idx} className="bg-rose-50 p-3 rounded-lg border border-rose-200 space-y-1 text-rose-950">
                <span className="font-bold block">[{c.code || c.issue_code}] {c.category}</span>
                <p className="text-xs">{c.summary || c.difference_summary}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 12: Questions for Human Verification */}
        <div className="space-y-2 border-b border-slate-200 pb-6">
          <h2 className="text-sm font-bold font-sans uppercase text-slate-900 tracking-wider">12. Questions Requiring Advocate Human Verification</h2>
          <ul className="space-y-1.5 text-xs font-sans text-slate-800">
            {reportData?.section_12_questions_for_human_verification?.map((q: string, idx: number) => (
              <li key={idx} className="bg-amber-50 p-2.5 rounded border border-amber-200 text-amber-950 font-medium">
                {q}
              </li>
            ))}
          </ul>
        </div>

        {/* Section 14: AI Disclaimer */}
        <div className="bg-slate-900 text-slate-300 p-6 rounded-xl space-y-2 text-xs font-sans border border-slate-800">
          <span className="font-bold text-amber-400 block uppercase tracking-wider">14. AI Legal Disclaimer & Compliance Statement</span>
          <p className="leading-relaxed">{reportData?.section_14_ai_disclaimer}</p>
        </div>
      </div>
    </div>
  );
};
