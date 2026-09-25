import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scale, Search, Shield, User, LogOut, BookOpen, Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LegalCase } from '../types';

interface NavbarProps {
  currentCase?: LegalCase;
  cases?: LegalCase[];
  onSelectCase?: (caseId: number) => void;
  onGlobalSearch?: (term: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentCase, cases, onSelectCase, onGlobalSearch }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-slate-950 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo & Branding */}
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="bg-amber-500 text-slate-950 p-2 rounded-lg font-bold transition group-hover:bg-amber-400 shadow-sm">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <span className="font-serif font-bold text-lg text-white tracking-wide block leading-tight">LexAnalyze</span>
            <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase block">Evidence & Legal Intelligence</span>
          </div>
        </Link>

        {/* Search Bar & Case Selector */}
        {isAuthenticated && (
          <div className="flex items-center gap-3 flex-1 max-w-xl mx-4">
            {cases && cases.length > 0 && onSelectCase && (
              <div className="relative">
                <select
                  value={currentCase?.id || ''}
                  onChange={(e) => onSelectCase(Number(e.target.value))}
                  className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-amber-500 font-medium"
                >
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.reference_number} — {c.title.substring(0, 24)}...
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="relative flex-1 hidden md:block">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Global Search facts, evidence, legal provisions, dates, people..."
                onChange={(e) => onGlobalSearch && onGlobalSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 text-xs rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-amber-500 border-slate-700"
              />
            </div>
          </div>
        )}

        {/* Right Menu Controls */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-900 text-amber-400 border border-slate-800 text-xs px-2.5 py-1 rounded-md">
            <Shield className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-mono text-[11px]">Jurisdiction: India (Verified Corpus)</span>
          </div>

          {isAuthenticated ? (
            <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
              <div className="text-right hidden sm:block">
                <span className="text-xs font-semibold text-slate-200 block">{user?.full_name}</span>
                <span className="text-[10px] text-slate-400 block">{user?.role}</span>
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                title="Sign Out"
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-xs text-slate-300 hover:text-white px-3 py-1.5 font-medium">
                Log In
              </Link>
              <Link
                to="/register"
                className="bg-amber-500 text-slate-950 hover:bg-amber-400 text-xs font-semibold px-3.5 py-1.5 rounded-lg transition shadow-sm"
              >
                Analyze Case
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
