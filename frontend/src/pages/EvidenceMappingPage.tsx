import React from 'react';
import { GitMerge, CheckCircle2, XCircle, FileText, ArrowRight } from 'lucide-react';
import { LegalProvision } from '../types';

interface EvidenceMappingPageProps {
  provisions: LegalProvision[];
  onOpenDocument: (docName: string, pageNum: number) => void;
}

export const EvidenceMappingPage: React.FC<EvidenceMappingPageProps> = ({ provisions, onOpenDocument }) => {
  return (
    <div className="space-y-6">
      {/* Intro Box */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-2">
        <h2 className="text-base font-serif font-bold text-slate-900 flex items-center gap-2">
          <GitMerge className="w-5 h-5 text-amber-600" />
          Evidence-to-Statutory Provision Mapping Matrix
        </h2>
        <p className="text-xs text-slate-500 max-w-4xl leading-relaxed">
          This feature breaks down each retrieved statutory provision into its essential legal elements and checks whether supporting documentary evidence exists within uploaded case files.
        </p>
      </div>

      {/* Provision Tree List */}
      <div className="space-y-6">
        {provisions.map((prov) => (
          <div key={prov.id} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="bg-amber-500 text-slate-950 font-mono font-bold text-xs px-3 py-1 rounded">
                  {prov.section_number}
                </span>
                <div>
                  <h3 className="font-bold text-white text-sm">{prov.title}</h3>
                  <span className="text-xs text-slate-400">{prov.statute}</span>
                </div>
              </div>

              <span className="text-xs font-mono font-medium text-amber-400 bg-slate-800 px-3 py-1 rounded border border-slate-700">
                {prov.fulfillment_summary || 'Statutory Mapping Active'}
              </span>
            </div>

            {/* Tree Branch List */}
            <div className="p-6 space-y-4 font-sans">
              {prov.element_mappings?.map((elem, idx) => {
                const isFound = elem.status === 'Evidence Found';
                return (
                  <div
                    key={idx}
                    className={`border rounded-lg p-4 transition ${
                      isFound ? 'bg-emerald-50/50 border-emerald-200' : 'bg-amber-50/50 border-amber-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-500">Element #{elem.element_id}:</span>
                          <span className="font-bold text-slate-900 text-xs">{elem.element_name}</span>
                        </div>

                        <p className="text-xs text-slate-700 font-sans">{elem.evidence_details}</p>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {isFound ? (
                          <span className="inline-flex items-center gap-1.5 bg-emerald-600 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-sm">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Evidence Found
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-amber-600 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-sm">
                            <XCircle className="w-3.5 h-3.5" />
                            Evidence Not Detected
                          </span>
                        )}

                        {isFound && elem.source_document !== 'N/A' && (
                          <button
                            onClick={() => onOpenDocument(elem.source_document, elem.page_number)}
                            className="bg-white hover:bg-slate-50 text-slate-800 text-[11px] font-mono font-semibold px-2.5 py-1 rounded border border-slate-300 flex items-center gap-1 shadow-xs"
                          >
                            <FileText className="w-3 h-3 text-amber-600" />
                            {elem.source_document} • Page {elem.page_number}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
