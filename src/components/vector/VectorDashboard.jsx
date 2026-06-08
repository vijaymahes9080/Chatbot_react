import React, { useState } from 'react';
import { 
  Database, Server, Cpu, HardDrive, RefreshCw,
  CheckCircle2, CircleAlert, ChevronDown, ChevronUp, ChevronRight
} from 'lucide-react';
import { VECTOR_DB_MOCK } from '../../utils/mockData';

const VectorDashboard = () => {
  const [dbState] = useState(VECTOR_DB_MOCK);
  const [selectedProvider, setSelectedProvider] = useState('pinecone');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const activeDB = dbState.providers[selectedProvider];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return <CheckCircle2 className="h-3 w-3 text-emerald-400" />;
      case 'warning': return <CircleAlert className="h-3 w-3 text-rose-400 animate-pulse" />;
      default: return <Server className="h-3 w-3 text-slate-500" />;
    }
  };

  return (
    <div className="p-4 space-y-4 select-none font-sans text-xs">
      
      {/* Simple Provider List */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Vector Indexes</label>
        <div className="space-y-1.5">
          {Object.entries(dbState.providers).map(([key, provider]) => (
            <button
              key={key}
              onClick={() => setSelectedProvider(key)}
              className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition-all ${
                selectedProvider === key
                  ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-200'
                  : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-2">
                {getStatusIcon(provider.status)}
                <span className="font-semibold text-xs">{provider.name}</span>
              </div>
              <span className="font-mono text-[10px] text-slate-400">{provider.embeddings.toLocaleString()} vectors</span>
            </button>
          ))}
        </div>
      </div>

      {/* Basic Metrics for Selected DB */}
      <div className="p-3 bg-slate-900 border border-white/5 rounded-lg flex items-center justify-between text-[11px]">
        <div>
          <p className="text-[8px] text-slate-500 uppercase font-bold">Latency</p>
          <p className="font-mono font-bold text-slate-200 mt-0.5">{activeDB.latency}</p>
        </div>
        <div>
          <p className="text-[8px] text-slate-500 uppercase font-bold">Storage</p>
          <p className="font-mono font-bold text-slate-200 mt-0.5">{activeDB.usage}</p>
        </div>
        <div>
          <p className="text-[8px] text-slate-500 uppercase font-bold">Namespaces</p>
          <p className="font-mono font-bold text-slate-200 mt-0.5">{activeDB.namespaces} partition(s)</p>
        </div>
      </div>

      {/* Advanced metrics accordion */}
      <button 
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="w-full flex items-center justify-between py-1.5 text-slate-400 hover:text-slate-200 text-[10px] font-bold uppercase tracking-wider border-t border-white/5 pt-3"
      >
        <span>Advanced Index Details</span>
        {showAdvanced ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>

      {showAdvanced && (
        <div className="space-y-4 animate-fade-in border-l border-white/5 pl-2 ml-1 mt-2">
          {/* Partition Allocation list */}
          <div className="space-y-1">
            <p className="text-[8px] text-slate-500 uppercase font-bold tracking-wider mb-1.5">Namespace allocation</p>
            {[
              { ns: 'academic-papers', vectors: Math.floor(activeDB.embeddings * 0.45) },
              { ns: 'system-codebase', vectors: Math.floor(activeDB.embeddings * 0.30) }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-1 text-[10px] text-slate-300">
                <span className="font-mono text-slate-400">{item.ns}</span>
                <span className="font-mono text-slate-500">{item.vectors.toLocaleString()} vectors</span>
              </div>
            ))}
          </div>

          {/* Collection Status detail */}
          <div className="p-2 rounded bg-slate-950 border border-white/5 text-[10px] space-y-1 font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Logical Collections</span>
              <span>{activeDB.collections}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Logical Partition keys</span>
              <span>{activeDB.namespaces}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VectorDashboard;
