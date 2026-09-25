import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const LegalDisclaimer: React.FC = () => {
  return (
    <div className="bg-amber-50 border-t border-amber-200 px-4 py-2.5 text-xs text-amber-900 flex items-center justify-between shadow-inner">
      <div className="flex items-center gap-2 max-w-6xl mx-auto">
        <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
        <p>
          <strong className="font-semibold text-amber-950">LEGAL SAFETY DISCLAIMER:</strong> LexAnalyze provides AI-assisted document analysis and legal research support. It does not provide legal advice or replace professional legal judgment. Legal provisions, interpretations, and case findings must be independently verified by a qualified legal professional.
        </p>
      </div>
    </div>
  );
};
