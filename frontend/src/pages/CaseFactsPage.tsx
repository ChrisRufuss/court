import React, { useState } from 'react';
import { Users, MapPin, Calendar, Activity, Box, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';
import { ExtractedFact, Entity, CaseDocument } from '../types';

interface CaseFactsPageProps {
  facts: ExtractedFact[];
  entities: Entity[];
  onOpenDocument: (docName: string, pageNum: number) => void;
}

export const CaseFactsPage: React.FC<CaseFactsPageProps> = ({ facts, entities, onOpenDocument }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'People', 'Location', 'Date and Time', 'Event', 'Object', 'Allegation'];

  const filteredFacts = selectedCategory === 'All' ? facts : facts.filter((f) => f.category === selectedCategory);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'People':
        return <Users className="w-4 h-4 text-blue-600" />;
      case 'Location':
        return <MapPin className="w-4 h-4 text-rose-600" />;
      case 'Date and Time':
        return <Calendar className="w-4 h-4 text-amber-600" />;
      case 'Event':
        return <Activity className="w-4 h-4 text-indigo-600" />;
      case 'Object':
        return <Box className="w-4 h-4 text-emerald-600" />;
      default:
        return <ShieldAlert className="w-4 h-4 text-purple-600" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Entities Summary Grid (Prompt Section 12) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Key People & Entities Extracted</h2>
            <p className="text-xs text-slate-500">Entities identified across case documents with assigned legal roles.</p>
          </div>
          <span className="text-xs font-mono font-semibold bg-slate-100 text-slate-700 px-3 py-1 rounded-md border border-slate-200">
            {entities.length} Entities
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {entities.map((e) => (
            <div key={e.id} className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs">{e.name}</span>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                    e.role === 'accused'
                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                      : e.role === 'complainant'
                      ? 'bg-blue-50 text-blue-800 border-blue-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  {e.role}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                Type: {e.entity_type} • Mentioned {e.mentions_count} time(s)
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Facts Filter Tabs & List */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden space-y-4">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Extracted Case Facts & Provenance</h2>
            <p className="text-xs text-slate-500">Every fact is grounded with explicit document name and page provenance.</p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3 py-1 rounded-md font-medium transition ${
                  selectedCategory === cat ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-slate-100 px-6 pb-6 space-y-3">
          {filteredFacts.map((fact) => (
            <div key={fact.id} className="pt-3 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2 rounded-lg bg-slate-100 border border-slate-200 mt-0.5">{getCategoryIcon(fact.category)}</div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 text-xs">{fact.category}</span>
                    <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {(fact.confidence * 100).toFixed(0)}% Confidence
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-sans">{fact.fact_description}</p>
                </div>
              </div>

              <button
                onClick={() => onOpenDocument(fact.source_document, fact.page_number)}
                className="shrink-0 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-semibold font-mono px-3 py-1.5 rounded-lg border border-slate-300 flex items-center gap-1.5 shadow-sm"
              >
                <FileText className="w-3.5 h-3.5 text-amber-600" />
                {fact.source_document} • Page {fact.page_number}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
