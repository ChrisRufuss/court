import React, { useState } from 'react';
import { Database, Search, FileText, CheckCircle2 } from 'lucide-react';
import { EvidenceItem } from '../types';

interface EvidenceExplorerPageProps {
  evidence: EvidenceItem[];
  onOpenDocument: (docName: string, pageNum: number) => void;
}

export const EvidenceExplorerPage: React.FC<EvidenceExplorerPageProps> = ({ evidence, onOpenDocument }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = evidence.filter(
    (item) =>
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.evidence_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.source_document.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-serif font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-600" />
            Searchable Evidence Inventory & Exhibits Table
          </h2>
          <p className="text-xs text-slate-500">Every evidence exhibit links directly to source document citations.</p>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search evidence..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 text-xs rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead className="bg-slate-50 text-slate-600 uppercase font-mono text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Evidence ID</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3">Source Document & Page</th>
                <th className="px-6 py-3">Related Party</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-mono font-bold text-slate-900">{item.evidence_code}</td>
                  <td className="px-6 py-4 font-semibold text-slate-800">{item.evidence_type}</td>
                  <td className="px-6 py-4 text-slate-700 font-medium max-w-md">{item.description}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => onOpenDocument(item.source_document, item.page_number)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-mono text-[11px] font-semibold px-2.5 py-1 rounded border border-slate-300 flex items-center gap-1"
                    >
                      <FileText className="w-3 h-3 text-amber-600" />
                      {item.source_document} • P.{item.page_number}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{item.related_person || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Verified Exhibit
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
