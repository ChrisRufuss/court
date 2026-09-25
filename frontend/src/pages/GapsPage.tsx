import React from 'react';
import { HelpCircle, AlertTriangle, AlertCircle, FileSearch, ShieldAlert } from 'lucide-react';
import { InformationGap } from '../types';

interface GapsPageProps {
  gaps: InformationGap[];
}

export const GapsPage: React.FC<GapsPageProps> = ({ gaps }) => {
  return (
    <div className="space-y-6">
      {/* Intro Box */}
      <div className="bg-amber-950 text-white p-6 rounded-xl border border-amber-900 shadow-md space-y-2">
        <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
          <HelpCircle className="w-5 h-5 text-amber-400" />
          Evidence & Information Gaps Detection
        </div>
        <p className="text-xs text-amber-200 max-w-4xl leading-relaxed">
          The engine scans case files for uncollected forensic evidence, missing procedural reports, and unverified statutory elements. Phraseology rule: LexAnalyze uses «Not detected in the uploaded documents» and does not claim evidence does not exist.
        </p>
      </div>

      {/* Gaps List */}
      <div className="space-y-4">
        {gaps.map((gap) => (
          <div key={gap.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <span className="bg-amber-500 text-slate-950 font-mono font-bold text-xs px-2.5 py-1 rounded">
                  {gap.gap_code}
                </span>
                <h3 className="font-bold text-slate-900 text-sm">{gap.gap_type}</h3>
              </div>

              <span
                className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full border ${
                  gap.impact_level === 'High'
                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                    : 'bg-amber-100 text-amber-900 border-amber-300'
                }`}
              >
                Impact: {gap.impact_level}
              </span>
            </div>

            <p className="text-xs text-slate-800 leading-relaxed font-sans">{gap.description}</p>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1.5 font-medium">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Action Required: Subpoena or requisition missing document/specimen.
              </span>
              <span className="font-mono text-[11px] text-slate-500 uppercase">Status: {gap.advocate_status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
