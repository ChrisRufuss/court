import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scale, ShieldCheck, FileSearch, GitMerge, AlertTriangle, FileCheck, ArrowRight, CheckCircle2, Lock } from 'lucide-react';
import { fetchApi } from '../api/client';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLaunchDemo = async () => {
    try {
      await fetchApi('/cases/seed-demo', { method: 'POST' });
      navigate('/dashboard');
    } catch (e) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Banner */}
      <nav className="bg-slate-950 text-white border-b border-slate-800 px-6 py-4 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500 text-slate-950 p-2 rounded-lg font-bold">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <span className="font-serif font-bold text-xl text-white tracking-wide block">LexAnalyze</span>
              <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase block">AI Legal Case File Intelligence</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2">
              Sign In
            </Link>
            <button
              onClick={handleLaunchDemo}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs px-4 py-2 rounded-lg transition shadow-sm"
            >
              Analyze Demo Case File
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-slate-900 text-white py-20 px-6 border-b border-slate-800">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-slate-800/80 text-amber-400 text-xs px-3 py-1 rounded-full border border-slate-700 font-mono">
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            Zero Hallucination Grounded AI • Indian Law Corpus Verified
          </div>

          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight leading-tight">
            AI-Assisted Legal Case File Analysis & Evidence Intelligence Platform
          </h1>

          <p className="text-slate-300 text-base md:text-lg max-w-3xl mx-auto font-sans leading-relaxed">
            LexAnalyze empowers advocates and legal teams to index large case files, extract structured facts, retrieve potentially relevant legal provisions from a verified knowledge base, and perform automated case integrity checks to catch document inconsistencies.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleLaunchDemo}
              className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm px-7 py-3.5 rounded-lg transition shadow-lg flex items-center justify-center gap-2"
            >
              Analyze Case File Now
              <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              to="/register"
              className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-semibold text-sm px-7 py-3.5 rounded-lg transition"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      {/* Workflow Diagram (Prompt Section 5) */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-serif font-bold text-slate-900">End-to-End Advocate Workflow</h2>
          <p className="text-xs text-slate-500 mt-1">From raw PDF/DOCX case files to structured evidence mapping and legal reports</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">01</div>
            <h3 className="font-bold text-slate-900 text-sm">Upload Case Files</h3>
            <p className="text-xs text-slate-600">FIR, medical reports, witness statements, police reports, and charge sheets.</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">02</div>
            <h3 className="font-bold text-slate-900 text-sm">Fact & Entity Mining</h3>
            <p className="text-xs text-slate-600">Extract people, locations, dates, objects, allegations, and chronological events.</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-xs">03</div>
            <h3 className="font-bold text-slate-900 text-sm">Legal Provision Retrieval</h3>
            <p className="text-xs text-slate-600">Hybrid keyword + vector search against verified Indian statutes (BNS, MVA, BSA).</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center font-bold text-xs">04</div>
            <h3 className="font-bold text-slate-900 text-sm">Integrity & Report</h3>
            <p className="text-xs text-slate-600">Catch timestamp/name discrepancies, flag missing evidence, and export PDF reports.</p>
          </div>
        </div>
      </section>

      {/* Safety & Confidentiality */}
      <section className="bg-slate-900 text-slate-200 py-12 px-6 border-t border-slate-800">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8 justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Lock className="w-4 h-4" />
              Strict Confidentiality & Legal Safety Architecture
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              LexAnalyze never presents AI-generated legal conclusions as guaranteed facts. Every provision retrieved is grounded in verified statutes, framed as «Potentially relevant provision», and requires advocate verification. Case files remain confidential user data.
            </p>
          </div>
          <button
            onClick={handleLaunchDemo}
            className="shrink-0 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-6 py-3 rounded-lg transition"
          >
            Launch Demo Case File
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-500 text-xs py-6 px-6 border-t border-slate-900 mt-auto text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 LexAnalyze • AI-Assisted Legal Case File Analysis & Evidence Intelligence Platform</p>
          <p className="text-[11px] text-amber-500/80">Independent Advocate Verification Required</p>
        </div>
      </footer>
    </div>
  );
};
