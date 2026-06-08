import React, { useState } from 'react';
import { 
  Cpu, Share2, Code, ChevronDown, ChevronUp, Terminal
} from 'lucide-react';
import { MCP_MOCK } from '../../utils/mockData';

const McpDashboard = () => {
  const [mcpState] = useState(MCP_MOCK);
  const [selectedServer, setSelectedServer] = useState(mcpState.servers[0].id);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [expandedTool, setExpandedTool] = useState(null);

  const activeServer = mcpState.servers.find(s => s.id === selectedServer) || mcpState.servers[0];
  const serverTools = mcpState.tools.filter(t => t.server === activeServer.name);

  const getHealthColor = (health) => {
    switch (health) {
      case 'healthy': return 'bg-emerald-500';
      case 'warning': return 'bg-amber-500';
      case 'offline': return 'bg-rose-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="p-4 space-y-4 select-none font-sans text-xs">
      
      {/* Basic Node list */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Connected Server Nodes</label>
        <div className="space-y-1.5">
          {mcpState.servers.map(server => (
            <div
              key={server.id}
              onClick={() => setSelectedServer(server.id)}
              className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                selectedServer === server.id
                  ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-200'
                  : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`h-1.5 w-1.5 rounded-full ${getHealthColor(server.health)}`} />
                  <span className="font-semibold text-xs">{server.name}</span>
                </div>
                <span className="text-[10px] text-slate-400 capitalize font-mono">
                  {server.capabilities.slice(0, 2).join(', ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Exposed tools simplified list */}
      <div className="space-y-1.5">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Available Methods: {activeServer.name}
        </h4>
        <div className="space-y-1 max-h-36 overflow-y-auto">
          {serverTools.map(tool => (
            <div key={tool.name} className="p-2 rounded bg-slate-900 border border-white/5 font-mono text-[10px] text-slate-300 flex items-center gap-1.5">
              <Code className="h-3.5 w-3.5 text-indigo-400" />
              <span>{tool.name}()</span>
            </div>
          ))}
        </div>
      </div>

      {/* Advanced toggle */}
      <button 
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="w-full flex items-center justify-between py-1.5 text-slate-400 hover:text-slate-200 text-[10px] font-bold uppercase tracking-wider border-t border-white/5 pt-3"
      >
        <span>Advanced Diagnostic Stream</span>
        {showAdvanced ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>

      {showAdvanced && (
        <div className="space-y-4 animate-fade-in border-l border-white/5 pl-2 ml-1 mt-2">
          {/* Detailed schemas */}
          <div className="space-y-1.5">
            <p className="text-[8px] text-slate-500 uppercase font-bold tracking-wider">Method parameter definitions</p>
            {serverTools.map(tool => (
              <div key={tool.name} className="p-1.5 bg-slate-950 rounded border border-white/5 text-[9px]">
                <p className="font-mono text-slate-300">{tool.name}</p>
                <p className="text-slate-500 text-[8px] mt-0.5">{tool.desc}</p>
              </div>
            ))}
          </div>

          {/* Connection diagnostics logs */}
          <div className="space-y-1.5">
            <p className="text-[8px] text-slate-500 uppercase font-bold tracking-wider flex items-center gap-1">
              <Terminal className="h-3 w-3" /> Logs
            </p>
            <div className="bg-slate-950 rounded p-2 font-mono text-[8px] text-slate-400 h-24 overflow-y-auto scrollbar-hidden">
              {mcpState.logs.slice(0, 3).map((log, idx) => (
                <p key={idx} className="truncate">{log}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default McpDashboard;
