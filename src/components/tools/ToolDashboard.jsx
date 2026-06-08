import React, { useState } from 'react';
import { 
  Globe, Calculator, Code, FileText, Database, Layers, 
  Link2, Play, CheckCircle, Clock, ChevronDown, ChevronUp
} from 'lucide-react';
import { TOOLS_LIST } from '../../utils/mockData';

const ToolDashboard = () => {
  const [tools, setTools] = useState(TOOLS_LIST);
  const [executingId, setExecutingId] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const getToolIcon = (iconName) => {
    switch (iconName) {
      case 'globe': return <Globe className="h-3.5 w-3.5" />;
      case 'calculator': return <Calculator className="h-3.5 w-3.5" />;
      case 'code': return <Code className="h-3.5 w-3.5" />;
      case 'file-text': return <FileText className="h-3.5 w-3.5" />;
      case 'database': return <Database className="h-3.5 w-3.5" />;
      case 'layers': return <Layers className="h-3.5 w-3.5" />;
      default: return <Link2 className="h-3.5 w-3.5" />;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running': return <Clock className="h-3.5 w-3.5 text-indigo-400 animate-spin" />;
      case 'success': return <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />;
      default: return <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />;
    }
  };

  const triggerTool = (id) => {
    if (executingId) return;
    setExecutingId(id);
    setTools(prev => prev.map(t => t.id === id ? { ...t, status: 'running', result: 'Loading workspace params...' } : t));

    setTimeout(() => {
      setTools(prev => prev.map(t => {
        if (t.id === id) {
          const finalResult = t.id === 't-calc' ? 'Answer: 843,204.12' 
            : t.id === 't-interpreter' ? 'Syntax OK. Executed plot.' 
            : 'Execution successful.';
          return {
            ...t,
            status: 'success',
            duration: `${(Math.random() * 2 + 0.5).toFixed(1)}s`,
            result: finalResult
          };
        }
        return t;
      }));
      setExecutingId(null);
    }, 2000);
  };

  return (
    <div className="p-4 space-y-4 select-none font-sans text-xs">
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Agent Tools</label>
        <span className="text-[9px] text-slate-500 font-mono">{tools.length} Loaded</span>
      </div>

      {/* Simplified Tools list */}
      <div className="space-y-1.5">
        {tools.map(tool => (
          <div key={tool.id} className="p-2.5 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-between gap-3 hover:border-white/10 transition-colors">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1 rounded bg-indigo-500/10 text-indigo-400">
                {getToolIcon(tool.icon)}
              </div>
              <div className="truncate">
                <p className="font-semibold text-xs text-slate-200 truncate">{tool.name}</p>
                <p className="text-[9px] text-slate-500 font-mono capitalize">{tool.status}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getStatusIcon(tool.status)}
              <button
                onClick={() => triggerTool(tool.id)}
                disabled={executingId !== null}
                className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded disabled:opacity-40 transition-colors cursor-pointer"
                title="Run tool simulation"
              >
                <Play className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Advanced diagnostics collapsible */}
      <button 
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="w-full flex items-center justify-between py-1.5 text-slate-400 hover:text-slate-200 text-[10px] font-bold uppercase tracking-wider border-t border-white/5 pt-3"
      >
        <span>Advanced Outputs</span>
        {showAdvanced ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>

      {showAdvanced && (
        <div className="space-y-2 animate-fade-in border-l border-white/5 pl-2 ml-1 mt-2">
          {tools.map(tool => (
            <div key={tool.id} className="p-1.5 bg-slate-950 rounded border border-white/5 text-[9px] space-y-1 font-mono text-slate-400">
              <div className="flex justify-between text-slate-500">
                <span>{tool.name}</span>
                <span>{tool.duration}</span>
              </div>
              <p className="text-slate-300 truncate">Result: {tool.result}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ToolDashboard;
