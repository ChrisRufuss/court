import React from 'react';
import {
  FileText,
  Users,
  BookOpen,
  GitMerge,
  AlertTriangle,
  HelpCircle,
  Clock,
  Database,
  MessageSquare,
  FileCheck,
  LayoutDashboard
} from 'lucide-react';

export type TabType =
  | 'documents'
  | 'facts'
  | 'provisions'
  | 'mapping'
  | 'contradictions'
  | 'gaps'
  | 'timeline'
  | 'evidence'
  | 'assistant'
  | 'report';

interface SidebarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  counts?: {
    documents: number;
    facts: number;
    provisions: number;
    contradictions: number;
    gaps: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab, counts }) => {
  const menuItems: { id: TabType; label: string; icon: any; count?: number; badgeColor?: string }[] = [
    { id: 'documents', label: '1. Case Documents', icon: FileText, count: counts?.documents },
    { id: 'facts', label: '2. Case Facts & Entities', icon: Users, count: counts?.facts },
    { id: 'provisions', label: '3. Legal Provisions', icon: BookOpen, count: counts?.provisions, badgeColor: 'bg-blue-100 text-blue-800' },
    { id: 'mapping', label: '4. Evidence → Provision Map', icon: GitMerge },
    { id: 'contradictions', label: '5. Integrity Check (Contradictions)', icon: AlertTriangle, count: counts?.contradictions, badgeColor: 'bg-rose-100 text-rose-800' },
    { id: 'gaps', label: '6. Evidence & Info Gaps', icon: HelpCircle, count: counts?.gaps, badgeColor: 'bg-amber-100 text-amber-800' },
    { id: 'timeline', label: '7. Case Timeline', icon: Clock },
    { id: 'evidence', label: '8. Evidence Explorer', icon: Database },
    { id: 'assistant', label: '9. AI Case Assistant', icon: MessageSquare },
    { id: 'report', label: '10. Case Analysis Report', icon: FileCheck, badgeColor: 'bg-emerald-100 text-emerald-800' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-3 border-b border-slate-800/80">
        <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500 block px-3 py-1">
          ANALYSIS WORKFLOW
        </span>
      </div>

      <nav className="p-2 space-y-1 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition text-left ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'hover:bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.count !== undefined && item.count > 0 && (
                <span
                  className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-slate-950 text-amber-400' : item.badgeColor || 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800/80 text-[11px] text-slate-500 space-y-2">
        <div className="flex items-center justify-between">
          <span>Retrieval Engine:</span>
          <span className="font-mono text-emerald-400 font-medium">Hybrid Grounded</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Safety Validator:</span>
          <span className="font-mono text-amber-400 font-medium">Active (Zero Hallucination)</span>
        </div>
      </div>
    </aside>
  );
};
