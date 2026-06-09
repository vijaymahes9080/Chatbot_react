import React, { useState, useEffect } from 'react';
import { 
  Globe, Search, ArrowRight, ExternalLink, Pause, Play,
  Terminal, ChevronDown, ChevronUp
} from 'lucide-react';
import { BROWSER_AGENT_MOCK } from '../../utils/mockData';
import { api } from '../../utils/api';

const BrowserDashboard = () => {
  const [browserState, setBrowserState] = useState(BROWSER_AGENT_MOCK);
  const [customQuery, setCustomQuery] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [liveLogs, setLiveLogs] = useState(browserState.logs);

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!customQuery.trim()) return;

    setIsRunning(true);
    const query = customQuery;
    setCustomQuery('');

    setLiveLogs(prev => [...prev, `[USER_QUERY] Initiated live crawler research: "${query}"`]);

    try {
      const searchResponse = await api.searchWeb(query);
      setBrowserState(searchResponse);
      setLiveLogs(searchResponse.logs || []);
    } catch (err) {
      console.error('Failed to run browser agent web search', err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="p-4 space-y-4 select-none font-sans text-xs">
      {/* Basic Search Status */}
      <div className="rounded-lg bg-slate-900 border border-white/5 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Web Search Agent</span>
          <span className={`h-2 w-2 rounded-full ${isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
        </div>
        
        <form onSubmit={handleSearchSubmit} className="flex gap-1.5">
          <input
            type="text"
            placeholder="Search web for references..."
            value={customQuery}
            onChange={(e) => setCustomQuery(e.target.value)}
            className="flex-1 px-2.5 py-1.5 rounded-lg glass-input text-slate-200 text-xs"
          />
          <button type="submit" className="p-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white transition-colors">
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono bg-slate-950 p-2 rounded">
          <span className="truncate max-w-[220px]">URL: {browserState.currentUrl}</span>
          <a href={browserState.currentUrl} target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 shrink-0">
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Simplified Scraped Sources List */}
      <div className="space-y-1.5">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Scraped Sources</h4>
        <div className="space-y-1">
          {browserState.visitedPages.slice(0, 2).map((page, idx) => (
            <div key={idx} className="p-2 rounded bg-white/5 flex items-center justify-between">
              <span className="font-semibold text-slate-200 truncate pr-2">{page.title}</span>
              <span className="text-[9px] text-emerald-400 font-mono">Matched</span>
            </div>
          ))}
        </div>
      </div>

      {/* Advanced Diagnostics Collapsible Trigger */}
      <button 
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="w-full flex items-center justify-between py-1.5 text-slate-400 hover:text-slate-200 text-[10px] font-bold uppercase tracking-wider border-t border-white/5 pt-3"
      >
        <span>Advanced logs & paths</span>
        {showAdvanced ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>

      {showAdvanced && (
        <div className="space-y-4 animate-fade-in border-l border-white/5 pl-2 ml-1 mt-2">
          {/* Detailed Timeline */}
          <div className="space-y-2">
            <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Research Timeline</p>
            <div className="border-l border-indigo-500/20 ml-1.5 space-y-2.5 py-0.5">
              {browserState.timeline.map((t, idx) => (
                <div key={idx} className="relative pl-4">
                  <span className={`absolute left-0 top-1 transform -translate-x-1/2 h-1.5 w-1.5 rounded-full ${
                    t.status === 'done' ? 'bg-indigo-500' : 'bg-pink-500'
                  }`} />
                  <p className="text-[10px] text-slate-300 leading-tight">{t.step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Diagnostic Console logs */}
          <div className="space-y-1.5">
            <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider flex items-center gap-1">
              <Terminal className="h-3 w-3" /> Console Stream
            </p>
            <div className="bg-slate-950 rounded p-2 font-mono text-[9px] text-slate-400 h-24 overflow-y-auto space-y-1 scrollbar-hidden">
              {liveLogs.map((log, idx) => (
                <p key={idx} className="truncate select-text">
                  {log}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowserDashboard;
