import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, XCircle, FileText, MessageSquare, ShieldAlert } from 'lucide-react';
import { ContradictionIssue } from '../types';
import { fetchApi } from '../api/client';

interface ContradictionsPageProps {
  caseId: number;
  contradictions: ContradictionIssue[];
  onOpenDocument: (docName: string, pageNum: number) => void;
  onRefresh: () => void;
}

export const ContradictionsPage: React.FC<ContradictionsPageProps> = ({ caseId, contradictions, onOpenDocument, onRefresh }) => {
  const [notesMap, setNotesMap] = useState<Record<number, string>>({});

  const handleAction = async (id: number, status: 'accepted' | 'rejected' | 'needs_review') => {
    try {
      await fetchApi(`/cases/${caseId}/contradictions/${id}/action`, {
        method: 'POST',
        body: JSON.stringify({
          status,
          notes: notesMap[id] || '',
        }),
      });
      onRefresh();
    } catch (e) {
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-rose-950 text-white p-6 rounded-xl border border-rose-900 shadow-md space-y-2">
        <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
          <ShieldAlert className="w-5 h-5 text-rose-400" />
          Case Integrity Check Engine — Potential Document Inconsistencies
        </div>
        <p className="text-xs text-rose-200 max-w-4xl leading-relaxed">
          LexAnalyze detected the following side-by-side contradictions in timestamps, dates, and name spellings across case documents. These are flagged for advocate review and do not constitute definitive legal conclusions.
        </p>
      </div>

      {/* Issues List (Prompt Section 22 UI) */}
      <div className="space-y-6">
        {contradictions.map((c) => (
          <div key={c.id} className="bg-white border border-rose-200 rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-rose-50/60 border-b border-rose-200 px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="bg-rose-600 text-white font-mono font-bold text-xs px-2.5 py-1 rounded">
                  {c.issue_code}
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{c.category}</h3>
                  <span className="text-xs text-slate-500">Cross-Document Inconsistency Flag</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full border ${
                    c.advocate_status === 'accepted'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : c.advocate_status === 'rejected'
                      ? 'bg-slate-100 text-slate-700 border-slate-300'
                      : 'bg-rose-100 text-rose-800 border-rose-300'
                  }`}
                >
                  Status: {c.advocate_status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-5">
              {/* Difference Summary */}
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs text-slate-800 space-y-1">
                <span className="font-bold text-slate-900 block">Discrepancy Analysis:</span>
                <p>{c.difference_summary}</p>
              </div>

              {/* Side by Side Diff Grid (Prompt Section 22 UI) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Document A */}
                <div className="bg-slate-50 border border-slate-300 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-slate-500" />
                      Document A: {c.doc_a_name}
                    </span>
                    <button
                      onClick={() => onOpenDocument(c.doc_a_name, c.doc_a_page)}
                      className="text-[11px] font-mono text-blue-700 hover:underline font-semibold"
                    >
                      Page {c.doc_a_page} →
                    </button>
                  </div>
                  <blockquote className="text-xs font-serif text-slate-800 bg-white border-l-4 border-amber-500 p-3 rounded italic">
                    "{c.doc_a_quote}"
                  </blockquote>
                </div>

                {/* Document B */}
                <div className="bg-slate-50 border border-slate-300 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-slate-500" />
                      Document B: {c.doc_b_name}
                    </span>
                    <button
                      onClick={() => onOpenDocument(c.doc_b_name, c.doc_b_page)}
                      className="text-[11px] font-mono text-blue-700 hover:underline font-semibold"
                    >
                      Page {c.doc_b_page} →
                    </button>
                  </div>
                  <blockquote className="text-xs font-serif text-slate-800 bg-white border-l-4 border-rose-500 p-3 rounded italic">
                    "{c.doc_b_quote}"
                  </blockquote>
                </div>
              </div>

              {/* Advocate Review Controls (Prompt Section 46) */}
              <div className="bg-slate-900 text-white p-4 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4" />
                    Advocate Review Decision & Legal Note
                  </span>
                  <span className="text-[11px] text-slate-400">Advocate retains final judgment</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="text"
                    placeholder="Add advocate review note (e.g. Cross-examine witness on visibility)..."
                    value={notesMap[c.id] || c.advocate_notes || ''}
                    onChange={(e) => setNotesMap({ ...notesMap, [c.id]: e.target.value })}
                    className="flex-1 bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
                  />

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleAction(c.id, 'accepted')}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-lg transition"
                    >
                      Accept Issue
                    </button>
                    <button
                      onClick={() => handleAction(c.id, 'rejected')}
                      className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold px-3 py-2 rounded-lg transition"
                    >
                      Dismiss / Ignore
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
