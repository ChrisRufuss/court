import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertTriangle, Eye, RefreshCw, Trash2, FileCheck } from 'lucide-react';
import { CaseDocument } from '../types';
import { fetchApi } from '../api/client';

interface DocumentsPageProps {
  caseId: number;
  documents: CaseDocument[];
  onSelectDocument: (doc: CaseDocument) => void;
  onRefresh: () => void;
}

export const DocumentsPage: React.FC<DocumentsPageProps> = ({ caseId, documents, onSelectDocument, onRefresh }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('file', files[i]);
        await fetchApi(`/cases/${caseId}/documents/`, {
          method: 'POST',
          body: formData,
        });
      }
      onRefresh();
    } catch (err) {
      console.warn('Upload fallback notice', err);
      onRefresh();
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Box */}
      <div className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-amber-500 transition cursor-pointer relative group">
        <input
          type="file"
          multiple
          accept=".pdf,.docx,.doc,.txt,.jpg,.jpeg,.png,.tiff"
          onChange={handleFileUpload}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
        />
        <div className="space-y-3 pointer-events-none">
          <div className="w-12 h-12 bg-amber-50 text-amber-700 rounded-xl flex items-center justify-center mx-auto border border-amber-200 group-hover:scale-105 transition">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Upload Case Files & Evidence Documents</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Supports PDF, DOCX, TXT, JPG, PNG, TIFF files (FIR, Witness Statements, Medical Reports, Police Panchnama)
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-slate-400">
            <span>Automatic Text Preservation</span> • <span>OCR Confidence Tracking</span> • <span>Page Provenance Mapping</span>
          </div>
          {uploading && <p className="text-xs text-amber-600 font-bold animate-pulse">Uploading and extracting text...</p>}
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Indexed Case Documents</h2>
            <p className="text-xs text-slate-500">Every document maintains explicit page boundaries and provenance citations.</p>
          </div>
          <span className="text-xs font-mono font-semibold bg-slate-100 text-slate-700 px-3 py-1 rounded-md border border-slate-200">
            {documents.length} Files Indexed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead className="bg-slate-50 text-slate-600 uppercase font-mono text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Document Name</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Page Count</th>
                <th className="px-6 py-3">Extraction Mode</th>
                <th className="px-6 py-3">OCR Confidence</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-semibold text-slate-900 flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{doc.filename}</span>
                  </td>
                  <td className="px-6 py-4 uppercase font-mono text-[11px] text-slate-500">{doc.file_type}</td>
                  <td className="px-6 py-4 font-mono font-medium">{doc.page_count} Pages</td>
                  <td className="px-6 py-4">
                    {doc.ocr_required ? (
                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 text-[10px] font-semibold px-2 py-0.5 rounded border border-amber-200">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        OCR Extracted
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Digital Native
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-900">{doc.ocr_confidence}%</td>
                  <td className="px-6 py-4">
                    <span className="text-emerald-700 font-semibold uppercase text-[10px]">Processed</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => onSelectDocument(doc)}
                      className="bg-slate-900 text-white hover:bg-slate-800 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ml-auto shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      Inspect Text & Pages
                    </button>
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
