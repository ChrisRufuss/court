import React from 'react';
import { Scale, CheckCircle2, AlertTriangle, Clock, ShieldCheck, RefreshCw } from 'lucide-react';
import { LegalCase } from '../types';

interface CaseStatusHeaderProps {
  currentCase: LegalCase;
  onRefresh?: () => void;
  isAnalyzing?: boolean;
}

export const CaseStatusHeader: React.FC<CaseStatusHeaderProps> = ({ currentCase, onRefresh, isAnalyzing }) => {
  const stats = currentCase.stats || {
    documents_count: 4,
    pages_count: 18,
    facts_count: 14,
    evidence_count: 8,
    provisions_count: 5,
    contradictions_count: 2,
    gaps_count: 2,
  };

  return (
    <div className="bg-white border-b border-slate-200 shadow-sm px-6 py-4">
      {/* Top Title Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-3">
            <span className="bg-slate-900 text-amber-400 p-2 rounded-lg font-serif font-bold text-lg flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">{currentCase.title}</h1>
                <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-0.5 rounded font-mono font-medium border border-slate-200">
                  {currentCase.reference_number}
                </span>
                <span className="bg-amber-50 text-amber-800 text-xs px-2 py-0.5 rounded font-semibold border border-amber-200">
                  {currentCase.jurisdiction} ({currentCase.case_type})
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Last updated: {currentCase.created_at} • Analysis Status:{' '}
                <span className="font-semibold text-emerald-700 uppercase">{currentCase.analysis_status}</span>
              </p>
            </div>
          </div>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isAnalyzing}
            className="flex items-center gap-2 bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold px-4 py-2 rounded-lg transition border border-slate-800 shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            {isAnalyzing ? 'Re-analyzing Case File...' : 'Run Analysis Pipeline'}
          </button>
        )}
      </div>

      {/* Metrics Row (Prompt Section 44) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 pt-4">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-center">
          <span className="block text-xs uppercase font-medium text-slate-500">Documents</span>
          <span className="text-lg font-bold text-slate-900">{stats.documents_count}</span>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-center">
          <span className="block text-xs uppercase font-medium text-slate-500">Pages</span>
          <span className="text-lg font-bold text-slate-900">{stats.pages_count}</span>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-center">
          <span className="block text-xs uppercase font-medium text-slate-500">Facts Extracted</span>
          <span className="text-lg font-bold text-slate-900">{stats.facts_count}</span>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-center">
          <span className="block text-xs uppercase font-medium text-slate-500">Evidence Items</span>
          <span className="text-lg font-bold text-slate-900">{stats.evidence_count}</span>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 text-center">
          <span className="block text-xs uppercase font-medium text-blue-700">Provisions</span>
          <span className="text-lg font-bold text-blue-900">{stats.provisions_count}</span>
        </div>
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-2.5 text-center">
          <span className="block text-xs uppercase font-medium text-rose-700">Inconsistencies</span>
          <span className="text-lg font-bold text-rose-900">{stats.contradictions_count}</span>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-center">
          <span className="block text-xs uppercase font-medium text-amber-800">Info Gaps</span>
          <span className="text-lg font-bold text-amber-900">{stats.gaps_count}</span>
        </div>
      </div>

      {/* Case Health / Review Status Badges (Prompt Section 44) */}
      <div className="flex flex-wrap items-center gap-4 pt-3 text-xs border-t border-slate-100 mt-3">
        <span className="font-semibold text-slate-600 uppercase tracking-wide">Case Review Health:</span>
        
        <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Documents Indexed
        </div>

        <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Text / OCR Extracted
        </div>

        <div className="flex items-center gap-1.5 bg-amber-50 text-amber-900 px-2.5 py-1 rounded-full border border-amber-300 font-medium">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          Legal Mapping: Review Required
        </div>

        <div className="flex items-center gap-1.5 bg-rose-50 text-rose-900 px-2.5 py-1 rounded-full border border-rose-300 font-medium">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          Contradictions: {stats.contradictions_count} Issues Detected
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200 font-medium">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          Advocate Decision: Pending
        </div>
      </div>
    </div>
  );
};
