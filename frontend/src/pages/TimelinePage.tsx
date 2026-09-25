import React, { useState } from 'react';
import { Clock, FileText, Calendar, Filter, User, MapPin } from 'lucide-react';
import { TimelineEvent } from '../types';

interface TimelinePageProps {
  events: TimelineEvent[];
  onOpenDocument: (docName: string, pageNum: number) => void;
}

export const TimelinePage: React.FC<TimelinePageProps> = ({ events, onOpenDocument }) => {
  const [filterType, setFilterType] = useState<string>('All');

  const filteredEvents = filterType === 'All' ? events : events.filter((e) => e.event_type === filterType);

  return (
    <div className="space-y-6">
      {/* Intro Box */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-serif font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            Chronological Case Event Timeline
          </h2>
          <p className="text-xs text-slate-500">Automatically constructed event sequence grounded in document text citations.</p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-500 ml-1" />
          {['All', 'Incident', 'Medical Examination', 'Police Action'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded-md font-medium transition ${
                filterType === type ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Tree */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm relative">
        <div className="absolute left-8 top-10 bottom-10 w-0.5 bg-slate-200 hidden sm:block"></div>

        <div className="space-y-6 sm:pl-12">
          {filteredEvents.map((evt) => (
            <div key={evt.id} className="relative bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-xs space-y-2">
              <div className="absolute -left-12 top-5 w-4 h-4 rounded-full bg-indigo-600 border-4 border-white shadow-sm hidden sm:block"></div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <span className="bg-indigo-900 text-white font-mono font-bold text-xs px-2.5 py-1 rounded">
                    {evt.timestamp_str}
                  </span>
                  <span className="font-bold text-slate-900 text-sm">{evt.event_type}</span>
                </div>

                <button
                  onClick={() => onOpenDocument(evt.source_document, evt.page_number)}
                  className="bg-white hover:bg-slate-100 text-slate-800 text-[11px] font-mono font-semibold px-2.5 py-1 rounded border border-slate-300 flex items-center gap-1 shrink-0"
                >
                  <FileText className="w-3 h-3 text-amber-600" />
                  {evt.source_document} • Page {evt.page_number}
                </button>
              </div>

              <p className="text-xs text-slate-800 leading-relaxed font-sans">{evt.description}</p>

              <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1 font-mono">
                {evt.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-rose-500" />
                    {evt.location}
                  </span>
                )}
                {evt.parties_involved && (
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-blue-500" />
                    {evt.parties_involved}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
