import React, { useState } from 'react';
import { 
  User, Shield, Key, Sparkles, Eye, EyeOff, Bell, Cpu, 
  Layers, Server, Database, Trash2, CheckCircle2, RefreshCw
} from 'lucide-react';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'User Profile', icon: <User className="h-4 w-4" /> },
    { id: 'security', label: 'Security & Auth', icon: <Shield className="h-4 w-4" /> },
    { id: 'api-keys', label: 'API Keys', icon: <Key className="h-4 w-4" /> },
    { id: 'models', label: 'LLM Settings', icon: <Sparkles className="h-4 w-4" /> },
    { id: 'mcp-config', label: 'MCP Connectors', icon: <Cpu className="h-4 w-4" /> },
    { id: 'rag-vector', label: 'Vector & RAG', icon: <Server className="h-4 w-4" /> },
    { id: 'data-control', label: 'Data Controls', icon: <Database className="h-4 w-4" /> }
  ];

  // API Keys state simulation
  const [apiKeys, setApiKeys] = useState({
    openai: 'sk-proj-••••••••••••••••••••3A1B',
    anthropic: 'sk-ant-••••••••••••••••••••8C9D',
    google: 'AIzaSy••••••••••••••••••••E5F6',
    deepseek: 'sk-ds-••••••••••••••••••••G7H8'
  });
  const [showKey, setShowKey] = useState({ openai: false, anthropic: false, google: false, deepseek: false });
  const [savingKeys, setSavingKeys] = useState(false);

  const toggleKeyMask = (provider) => {
    setShowKey(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const handleSaveKeys = (e) => {
    e.preventDefault();
    setSavingKeys(true);
    setTimeout(() => {
      setSavingKeys(false);
    }, 1200);
  };

  return (
    <div className="h-full overflow-hidden flex flex-col md:flex-row bg-[#05070f] select-none">
      
      {/* Left panel tabs selector */}
      <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-chat-border/60 bg-[#070b14]/30 shrink-0 p-3 space-y-1">
        <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 py-2">System Config</h2>
        <div className="flex md:flex-col overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 gap-1 scrollbar-hidden">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 py-2 px-3 text-xs rounded-lg font-medium transition-all shrink-0 md:shrink-1 ${
                activeTab === tab.id
                  ? 'bg-indigo-500/15 text-indigo-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Right panel settings inputs */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 max-w-3xl">
        {activeTab === 'profile' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">User Profile Details</h2>
              <p className="text-[10px] text-slate-500 mt-1">Configure profile details and workspace default variables.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase font-mono">Display Name</label>
                <input type="text" defaultValue="Sarah Jenkins" className="w-full px-3 py-2 text-xs rounded-lg glass-input text-slate-200" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase font-mono">Email Address</label>
                <input type="email" defaultValue="s.jenkins@deepmind.ai" className="w-full px-3 py-2 text-xs rounded-lg glass-input text-slate-200" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase font-mono">Role Title</label>
                <input type="text" defaultValue="Senior Systems Architect" className="w-full px-3 py-2 text-xs rounded-lg glass-input text-slate-200" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase font-mono">Default model Node</label>
                <select className="w-full px-3 py-2 text-xs rounded-lg glass-input text-slate-200 bg-[#070b14]">
                  <option>Gemini 2.5 Flash</option>
                  <option>Claude 3.7 Sonnet</option>
                  <option>GPT-5 Ultra</option>
                  <option>DeepSeek-R1</option>
                </select>
              </div>
            </div>

            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-lg transition-all shadow-md shadow-indigo-500/10 cursor-pointer">
              Save Changes
            </button>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">Security & Auth Limits</h2>
              <p className="text-[10px] text-slate-500 mt-1">Configure user login sessions and safety controls.</p>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-slate-900 border border-white/5 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-xs text-slate-200">Two-Factor Authentication</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Enforces token verify checks during API handshakes.</p>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">Enabled</span>
              </div>

              <div className="p-3 bg-slate-900 border border-white/5 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-xs text-slate-200">API CORS Whitelists</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Restricts sandbox requests to permitted domain masks.</p>
                </div>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-1 rounded">Configured (3 origins)</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'api-keys' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">Platform API Credentials</h2>
              <p className="text-[10px] text-slate-500 mt-1">Configure access keys. These keys are cached locally in local storage.</p>
            </div>

            <form onSubmit={handleSaveKeys} className="space-y-4">
              {[
                { label: 'OpenAI API Key', key: 'openai' },
                { label: 'Anthropic Claude Key', key: 'anthropic' },
                { label: 'Google Gemini API Key', key: 'google' },
                { label: 'DeepSeek API Key', key: 'deepseek' }
              ].map((provider) => (
                <div key={provider.key} className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase font-mono flex items-center justify-between">
                    <span>{provider.label}</span>
                    <button 
                      type="button" 
                      onClick={() => toggleKeyMask(provider.key)}
                      className="text-indigo-400 hover:text-indigo-300 font-normal normal-case flex items-center gap-1 font-sans"
                    >
                      {showKey[provider.key] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      <span>{showKey[provider.key] ? 'Mask Key' : 'Reveal Key'}</span>
                    </button>
                  </label>
                  <input
                    type={showKey[provider.key] ? 'text' : 'password'}
                    value={apiKeys[provider.key]}
                    onChange={(e) => setApiKeys(prev => ({ ...prev, [provider.key]: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-lg glass-input text-slate-200 font-mono"
                  />
                </div>
              ))}

              <button 
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-lg transition-all flex items-center gap-2 shadow-md shadow-indigo-500/10 cursor-pointer"
              >
                {savingKeys && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                <span>{savingKeys ? 'Verifying keys...' : 'Commit API Keys'}</span>
              </button>
            </form>
          </div>
        )}

        {activeTab === 'mcp-config' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">Model Context Protocol Connections</h2>
              <p className="text-[10px] text-slate-500 mt-1">Configure and manage active host nodes for MCP tool execution.</p>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-900 border border-white/5 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-xs text-slate-200 font-mono">postgres-db</h4>
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                </div>
                <div className="bg-slate-950 p-2 rounded text-[9px] text-slate-400 font-mono overflow-x-auto select-text">
                  postgresql://localhost:5432/mcp_development
                </div>
              </div>

              <div className="p-3 bg-slate-900 border border-white/5 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-xs text-slate-200 font-mono">filesystem-local</h4>
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                </div>
                <div className="bg-slate-950 p-2 rounded text-[9px] text-slate-400 font-mono overflow-x-auto select-text">
                  C:/Users/vijay/workspace
                </div>
              </div>
            </div>
            
            <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-white/5 hover:border-white/10 text-slate-200 font-medium text-xs rounded-lg transition-all cursor-pointer">
              Register New MCP Server
            </button>
          </div>
        )}

        {activeTab === 'rag-vector' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">Vector Index & RAG Controls</h2>
              <p className="text-[10px] text-slate-500 mt-1">Configure similarity scoring thresholds and vector indices.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase font-mono">Similarity Threshold (Min Score)</label>
                <div className="flex items-center gap-3">
                  <input type="range" min="0" max="100" defaultValue="75" className="flex-1 accent-indigo-500 cursor-pointer h-1 bg-slate-900 rounded" />
                  <span className="font-mono text-xs text-indigo-300">0.75</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase font-mono">Max retrieved context chunks</label>
                <input type="number" defaultValue="5" className="w-full px-3 py-2 text-xs rounded-lg glass-input text-slate-200" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'data-control' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wider text-rose-400">Data Purge & Retention</h2>
              <p className="text-[10px] text-slate-500 mt-1">Manage database clearing, cache indexes, and local log sessions.</p>
            </div>

            <div className="space-y-3.5">
              <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-xs text-rose-400">Clear chat history log</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Destroys conversations cached in local storage.</p>
                </div>
                <button 
                  onClick={() => { localStorage.removeItem('aether_conversations'); window.location.reload(); }}
                  className="px-3 py-1.5 bg-rose-600/15 hover:bg-rose-600/30 text-rose-300 text-xs rounded font-medium border border-rose-500/20 transition-all cursor-pointer"
                >
                  Clear History
                </button>
              </div>

              <div className="p-4 bg-slate-900 border border-white/5 rounded-xl flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-xs text-slate-200">Export configuration variables</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Saves API credentials and settings as a JSON payload.</p>
                </div>
                <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded font-medium border border-white/5 hover:border-white/10 transition-all cursor-pointer">
                  Export JSON
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default SettingsPage;
