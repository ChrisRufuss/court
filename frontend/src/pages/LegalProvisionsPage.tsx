import React from 'react';
import { BookOpen, ShieldAlert, CheckCircle2, AlertTriangle, ExternalLink, FileText, Scale } from 'lucide-react';
import { LegalProvision } from '../types';

interface LegalProvisionsPageProps {
  provisions: LegalProvision[];
  onOpenDocument: (docName: string, pageNum: number) => void;
}

export const LegalProvisionsPage: React.FC<LegalProvisionsPageProps> = ({ provisions, onOpenDocument }) => {
  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <div className="bg-slate-900 text-white p-6 rounded-xl border border-slate-800 shadow-md space-y-2">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
          <Scale className="w-5 h-5 text-amber-500" />
          Verified Legal Knowledge Base Retrieval (India Jurisdiction)
        </div>
        <p className="text-xs text-slate-300 max-w-4xl leading-relaxed">
          Provisions below are candidate matches retrieved from the installed verified statutory corpus based on extracted case facts. Every provision displays statutory elements, penalties, and source citations. Advocates must independently verify legal applicability.
        </p>
      </div>

      {/* Provision Cards */}
      <div className="space-y-6">
        {provisions.map((prov) => (
          <div key={prov.id} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="bg-blue-100 text-blue-900 font-mono font-bold text-xs px-3 py-1 rounded-lg border border-blue-200">
                  {prov.section_number}
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{prov.title}</h3>
                  <span className="text-xs text-slate-500 font-medium">{prov.statute}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase px-2.5 py-1 rounded border border-emerald-200">
                  {prov.verification_status}
                </span>
                <span className="bg-blue-50 text-blue-800 text-[10px] font-bold uppercase px-2.5 py-1 rounded border border-blue-200">
                  {prov.confidence_label} ({(prov.relevance_score * 100).toFixed(0)}%)
                </span>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-5">
              {/* Description */}
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">Statutory Text / Provision Description</span>
                <p className="text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-3 leading-relaxed font-sans">
                  {prov.description}
                </p>
              </div>

              {/* Retrieval Justification (Prompt Section 16 UI) */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3.5 space-y-1">
                <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  Why was this provision retrieved?
                </span>
                <p className="text-xs text-amber-900 leading-relaxed font-sans">{prov.retrieval_justification}</p>
              </div>

              {/* Elements & Exceptions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-900 block">Required Statutory Elements:</span>
                  <ul className="space-y-1.5">
                    {prov.elements.map((elem, i) => (
                      <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{elem}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-900 block">Statutory Exceptions / Defenses:</span>
                  <ul className="space-y-1.5">
                    {prov.exceptions.map((exc, i) => (
                      <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>{exc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Penalty & Source Details */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-semibold text-slate-900">Penalty / Punishment: </span>
                  <span className="text-rose-700 font-medium">{prov.penalty}</span>
                </div>

                {prov.source_url && (
                  <a
                    href={prov.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-700 hover:underline text-[11px] font-mono flex items-center gap-1"
                  >
                    Source Gazette Record ({prov.source_name})
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Safety Disclaimer Footer Box */}
              <div className="bg-slate-100 text-slate-700 text-[11px] p-2.5 rounded-md border border-slate-200 font-medium flex items-center justify-between">
                <span>⚠️ {prov.disclaimer}</span>
                <span className="font-mono text-slate-500">Effective: {prov.effective_date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
