import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Search, ZoomIn, ZoomOut, FileText, CheckCircle2, AlertTriangle, Download } from 'lucide-react';
import { CaseDocument } from '../types';

interface DocumentViewerModalProps {
  document: CaseDocument | null;
  onClose: () => void;
  initialPage?: number;
  highlightText?: string;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({ document, onClose, initialPage = 1, highlightText }) => {
  if (!document) return null;

  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [searchTerm, setSearchTerm] = useState<string>(highlightText || '');

  const pages = document.pages && document.pages.length > 0 ? document.pages : [
    {
      page_number: 1,
      text_content: document.full_text || 'No text extracted.',
      ocr_confidence: document.ocr_confidence || 100
    }
  ];

  const activePageData = pages.find((p) => p.page_number === currentPage) || pages[0];

  const renderFormattedPageText = (text: string) => {
    if (!searchTerm.trim()) return text;
    const parts = text.split(new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === searchTerm.toLowerCase() ? (
        <mark key={i} className="bg-amber-200 text-amber-950 font-bold px-1 rounded border-b-2 border-amber-500">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
        {/* Header Bar */}
        <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500/20 text-amber-400 p-2 rounded-lg border border-amber-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                {document.filename}
                <span className="bg-slate-800 text-slate-300 font-mono text-[10px] px-2 py-0.5 rounded border border-slate-700">
                  {document.file_type.toUpperCase()} • {document.page_count} Pages
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Source Document Viewer • OCR Confidence: <span className="font-semibold text-emerald-400">{document.ocr_confidence}%</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Find in document..."
                className="bg-slate-800 text-xs text-slate-200 placeholder-slate-500 rounded-md pl-8 pr-3 py-1 border border-slate-700 focus:outline-none focus:border-amber-500 w-44"
              />
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-slate-800 rounded-md p-0.5 border border-slate-700 text-xs">
              <button
                onClick={() => setZoomLevel(Math.max(75, zoomLevel - 15))}
                className="p-1 text-slate-300 hover:text-white"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px] px-1.5 text-slate-300">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel(Math.min(150, zoomLevel + 15))}
                className="p-1 text-slate-300 hover:text-white"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Page Toolbar */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 py-2 flex items-center justify-between text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="p-1 rounded bg-white border border-slate-300 disabled:opacity-40 hover:bg-slate-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-medium">
              Page <span className="font-mono font-bold text-slate-900">{currentPage}</span> of {pages.length}
            </span>
            <button
              disabled={currentPage >= pages.length}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="p-1 rounded bg-white border border-slate-300 disabled:opacity-40 hover:bg-slate-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            {document.ocr_required ? (
              <span className="flex items-center gap-1 text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-medium">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                OCR Extracted Document
              </span>
            ) : (
              <span className="flex items-center gap-1 text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Digital Text Verified
              </span>
            )}
            <span className="text-slate-500 font-mono">Provenance ID: DOC-{document.id}</span>
          </div>
        </div>

        {/* Main Document Content Canvas */}
        <div className="flex-1 bg-slate-200 p-6 overflow-y-auto flex justify-center">
          <div
            style={{ fontSize: `${zoomLevel}%` }}
            className="bg-white shadow-lg border border-slate-300 rounded-md p-10 max-w-3xl w-full min-h-[600px] legal-document-text whitespace-pre-wrap transition-all select-text"
          >
            {renderFormattedPageText(activePageData.text_content)}
          </div>
        </div>

        {/* Footer info */}
        <div className="bg-slate-900 text-slate-400 text-xs px-6 py-2 flex items-center justify-between border-t border-slate-800">
          <span>LexAnalyze Document Intelligence Provenance Tracker</span>
          <span className="font-mono text-[11px] text-amber-400">Strict Source Citation Link Active</span>
        </div>
      </div>
    </div>
  );
};
