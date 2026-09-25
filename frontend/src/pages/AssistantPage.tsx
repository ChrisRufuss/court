import React, { useState } from 'react';
import { MessageSquare, Send, Bot, User, FileText, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { fetchApi } from '../api/client';
import { ChatResponse } from '../types';

interface AssistantPageProps {
  caseId: number;
  onOpenDocument: (docName: string, pageNum: number) => void;
}

export const AssistantPage: React.FC<AssistantPageProps> = ({ caseId, onOpenDocument }) => {
  const [messages, setMessages] = useState<
    { sender: 'user' | 'assistant'; text: string; citations?: { document: string; page: number }[] }[]
  >([
    {
      sender: 'assistant',
      text: (
        "Welcome to LexAnalyze Grounded Case Assistant. I answer strictly from your uploaded case files and verified Indian legal statutes.\n\n" +
        "You can ask me to summarize allegations, detail document inconsistencies, list evidence gaps, or explain statutory provision retrieval."
      ),
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const suggestedPrompts = [
    'Summarize the allegations.',
    'What inconsistencies were detected?',
    'Which important information is missing?',
    'Why was Section 281 BNS retrieved?',
    'Show the chronological timeline.',
    'Show evidence relating to Section 125(b) BNS.',
  ];

  const handleSend = async (questionText?: string) => {
    const q = questionText || input;
    if (!q.trim() || loading) return;

    const userMsg = { sender: 'user' as const, text: q };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetchApi<ChatResponse>(`/cases/${caseId}/chat/`, {
        method: 'POST',
        body: JSON.stringify({ question: q }),
      });

      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: res.answer,
          citations: res.citations,
        },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: "I could not find sufficient evidence in the uploaded documents or verified legal sources to answer this question.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm h-[calc(100vh-14rem)] flex flex-col overflow-hidden">
      {/* Assistant Header */}
      <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500 text-slate-950 p-2 rounded-lg">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              LexAnalyze Case Assistant
              <span className="bg-amber-500/20 text-amber-400 font-mono text-[10px] px-2 py-0.5 rounded border border-amber-500/30">
                Grounded RAG Active
              </span>
            </h2>
            <p className="text-xs text-slate-400">Zero-hallucination legal document assistant strictly grounded in case files</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
          <ShieldAlert className="w-4 h-4 text-amber-500" />
          <span>No Unverified Assumptions</span>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="font-semibold text-slate-500 text-[11px] shrink-0 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          Suggested:
        </span>
        {suggestedPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="shrink-0 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-medium px-2.5 py-1 rounded-full shadow-2xs transition text-[11px]"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Chat Messages Window */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.sender === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center font-bold shrink-0 mt-1">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-2xl rounded-xl p-4 text-xs space-y-3 leading-relaxed shadow-xs ${
                m.sender === 'user'
                  ? 'bg-slate-900 text-white font-medium'
                  : 'bg-white border border-slate-200 text-slate-800 font-sans'
              }`}
            >
              <div className="whitespace-pre-wrap">{m.text}</div>

              {m.citations && m.citations.length > 0 && (
                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">
                    Source Citations (Click to View):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {m.citations.map((c, cIdx) => (
                      <button
                        key={cIdx}
                        onClick={() => onOpenDocument(c.document, c.page)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-slate-300 flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3 text-amber-600" />
                        {c.document} • Page {c.page}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {m.sender === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0 mt-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
        {loading && <div className="text-xs text-slate-500 font-mono italic animate-pulse">Searching case files & verified statutes...</div>}
      </div>

      {/* Input Bar */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about uploaded case documents or verified legal provisions..."
            className="flex-1 bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-lg px-4 py-2.5 focus:outline-none focus:border-amber-500 font-medium"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold px-4 py-2.5 rounded-lg text-xs flex items-center gap-1.5 transition disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
            Ask AI
          </button>
        </form>
      </div>
    </div>
  );
};
