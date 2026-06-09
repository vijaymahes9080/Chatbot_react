import React, { useState, useEffect } from 'react';
import { 
  User, Shield, Key, Sparkles, Eye, EyeOff, Bell, Cpu, 
  Layers, Server, Database, Trash2, CheckCircle2, RefreshCw,
  Zap, Globe, Activity, ExternalLink, CheckCircle, XCircle, Loader2, Gift
} from 'lucide-react';
import { api } from '../utils/api';

const FREE_PROVIDERS = [
  {
    key: 'groq',
    label: 'Groq API Key',
    name: 'Groq',
    badge: 'FREE · 14,400 req/day',
    badgeColor: 'emerald',
    icon: <Zap className="h-5 w-5 text-emerald-400" />,
    placeholder: 'gsk_...',
    signupUrl: 'https://console.groq.com',
    signupLabel: 'console.groq.com',
    models: ['Llama 3.3 70B', 'Llama 4 Scout', 'DeepSeek-R1 Distill'],
    desc: 'Ultra-fast LPU inference. No credit card required.',
  },
  {
    key: 'openrouter',
    label: 'OpenRouter API Key',
    name: 'OpenRouter',
    badge: 'FREE · 50+ Models',
    badgeColor: 'violet',
    icon: <Globe className="h-5 w-5 text-violet-400" />,
    placeholder: 'sk-or-v1-...',
    signupUrl: 'https://openrouter.ai',
    signupLabel: 'openrouter.ai',
    models: ['DeepSeek-R1:free', 'Qwen3 8B:free', 'Mistral 7B:free'],
    desc: 'Access 50+ free :free endpoints with one key. No credits needed.',
  },
  {
    key: 'gemini',
    label: 'Google Gemini API Key',
    name: 'Google Gemini',
    badge: 'FREE · 1,500 req/day',
    badgeColor: 'indigo',
    icon: <Sparkles className="h-5 w-5 text-indigo-400" />,
    placeholder: 'AIzaSy...',
    signupUrl: 'https://aistudio.google.com/app/apikey',
    signupLabel: 'aistudio.google.com',
    models: ['Gemini 1.5 Flash', 'Gemini 2.0 Flash'],
    desc: 'Google AI Studio gives free access forever. No billing info needed.',
  },
];

const BADGE_CLASSES = {
  emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
};

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

  // API Keys state
  const [apiKeys, setApiKeys] = useState({
    openai: '',
    anthropic: '',
    google: '',
    deepseek: ''
  });
  const [showKey, setShowKey] = useState({ openai: false, anthropic: false, google: false, deepseek: false });
  const [savingKeys, setSavingKeys] = useState(false);

  // Free provider keys state
  const [freeKeys, setFreeKeys] = useState({ groq: '', openrouter: '', gemini: '' });
  const [showFreeKey, setShowFreeKey] = useState({ groq: false, openrouter: false, gemini: false });
  const [testStatus, setTestStatus] = useState({ groq: null, openrouter: null, gemini: null });
  // null = untested, { loading: true } = testing, { success, message, model } = result
  const [savingFreeKeys, setSavingFreeKeys] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const config = await api.getSettings();
        if (config && config.api_keys) {
          setApiKeys({
            openai: config.api_keys.openai || config.api_keys.OPENAI || '',
            anthropic: config.api_keys.anthropic || config.api_keys.ANTHROPIC || '',
            google: config.api_keys.google || config.api_keys.GOOGLE || '',
            deepseek: config.api_keys.deepseek || config.api_keys.DEEPSEEK || ''
          });
          setFreeKeys({
            groq: config.api_keys.GROQ_API_KEY || config.api_keys.groq || '',
            openrouter: config.api_keys.OPENROUTER_API_KEY || config.api_keys.openrouter || '',
            gemini: config.api_keys.GEMINI_API_KEY || config.api_keys.google || config.api_keys.gemini || '',
          });
        }
      } catch (err) {
        console.error('Failed to load settings from API', err);
      }
    };
    loadSettings();
  }, []);

  const toggleKeyMask = (provider) => {
    setShowKey(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const handleSaveKeys = async (e) => {
    e.preventDefault();
    setSavingKeys(true);
    try {
      await api.updateSettingsKeys(apiKeys);
    } catch (err) {
      console.error('Failed to update API Keys', err);
    } finally {
      setSavingKeys(false);
    }
  };

  // Save free API keys
  const handleSaveFreeKeys = async (e) => {
    e.preventDefault();
    setSavingFreeKeys(true);
    try {
      await api.updateSettingsKeys({
        GROQ_API_KEY: freeKeys.groq,
        OPENROUTER_API_KEY: freeKeys.openrouter,
        GEMINI_API_KEY: freeKeys.gemini,
      });
    } catch (err) {
      console.error('Failed to save free API keys', err);
    } finally {
      setSavingFreeKeys(false);
    }
  };

  // Test a free provider connection
  const handleTestConnection = async (providerKey) => {
    const keyValue = freeKeys[providerKey];
    if (!keyValue.trim()) {
      setTestStatus(prev => ({
        ...prev,
        [providerKey]: { success: false, message: 'Please enter an API key first.' }
      }));
      return;
    }
    setTestStatus(prev => ({ ...prev, [providerKey]: { loading: true } }));
    const result = await api.testConnection(providerKey, keyValue);
    setTestStatus(prev => ({ ...prev, [providerKey]: result }));
  };

  const TestStatusBadge = ({ status }) => {
    if (!status) return null;
    if (status.loading) return (
      <span className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
        <Loader2 className="h-3 w-3 animate-spin" /> Testing...
      </span>
    );
    if (status.success) return (
      <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
        <CheckCircle className="h-3 w-3" /> {status.message}
      </span>
    );
    return (
      <span className="flex items-center gap-1.5 text-[10px] text-rose-400 font-mono">
        <XCircle className="h-3 w-3" /> {status.message}
      </span>
    );
  };

  return (
    <div className="h-full w-full overflow-hidden flex bg-[#05070f] select-none">
      
      {/* Left panel tabs selector */}
      <div className="w-full md:w-56 border-r border-chat-border/60 bg-[#070b14]/30 shrink-0 p-3 flex flex-col">
        <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 py-2">System Config</h2>
        <div className="flex flex-col gap-1 overflow-y-auto flex-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 py-2 px-3 text-xs rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-500/15 text-indigo-300 font-semibold border-l-2 border-indigo-500'
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
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
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
                  <option>Gemini 1.5 Flash (Free)</option>
                  <option>Groq Llama 3.3 70B (Free)</option>
                  <option>OpenRouter DeepSeek-R1 (Free)</option>
                  <option>Claude 3.7 Sonnet</option>
                  <option>GPT-5 Ultra</option>
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
          <div className="space-y-8 animate-fade-in">

            {/* ── FREE AI PROVIDERS SECTION ─────────────────────────── */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-emerald-400" />
                <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">Free AI Providers</h2>
                <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">NO CREDIT CARD</span>
              </div>
              <p className="text-[10px] text-slate-500 -mt-2">
                These providers are <span className="text-emerald-400 font-semibold">100% free forever</span> — no billing info, no trial, no expiry. Enter your key and click Test to activate real AI responses.
              </p>

              <form onSubmit={handleSaveFreeKeys} className="space-y-4">
                {FREE_PROVIDERS.map((provider) => {
                  const status = testStatus[provider.key];
                  const keyVal = freeKeys[provider.key];
                  return (
                    <div
                      key={provider.key}
                      className={`p-4 rounded-xl border transition-all ${
                        status?.success
                          ? 'bg-emerald-500/5 border-emerald-500/20'
                          : 'bg-slate-900/60 border-white/5 hover:border-white/10'
                      }`}
                    >
                      {/* Provider header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-lg bg-slate-800">
                            {provider.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-semibold text-slate-100">{provider.name}</h4>
                              <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded-full border ${BADGE_CLASSES[provider.badgeColor]}`}>
                                {provider.badge}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5">{provider.desc}</p>
                          </div>
                        </div>
                        <a
                          href={provider.signupUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[9px] text-indigo-400 hover:text-indigo-300 font-mono shrink-0 transition-colors"
                        >
                          <ExternalLink className="h-2.5 w-2.5" />
                          {provider.signupLabel}
                        </a>
                      </div>

                      {/* Free models chips */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {provider.models.map(m => (
                          <span key={m} className="text-[8px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-white/5">
                            {m}
                          </span>
                        ))}
                      </div>

                      {/* Key input row */}
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type={showFreeKey[provider.key] ? 'text' : 'password'}
                            value={keyVal}
                            onChange={(e) => {
                              setFreeKeys(prev => ({ ...prev, [provider.key]: e.target.value }));
                              setTestStatus(prev => ({ ...prev, [provider.key]: null }));
                            }}
                            placeholder={provider.placeholder}
                            className="w-full px-3 py-2 pr-8 text-xs rounded-lg glass-input text-slate-200 font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setShowFreeKey(prev => ({ ...prev, [provider.key]: !prev[provider.key] }))}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                          >
                            {showFreeKey[provider.key] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleTestConnection(provider.key)}
                          disabled={status?.loading}
                          className={`px-3 py-2 text-[10px] font-semibold rounded-lg border transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                            status?.success
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25'
                              : 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border-indigo-500/20'
                          }`}
                        >
                          {status?.loading ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : status?.success ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <Activity className="h-3 w-3" />
                          )}
                          {status?.loading ? 'Testing' : status?.success ? 'Live ✓' : 'Test'}
                        </button>
                      </div>

                      {/* Test result */}
                      {status && !status.loading && (
                        <div className="mt-2">
                          <TestStatusBadge status={status} />
                        </div>
                      )}
                    </div>
                  );
                })}

                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-lg transition-all flex items-center gap-2 shadow-md shadow-emerald-500/10 cursor-pointer"
                >
                  {savingFreeKeys && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  <Gift className="h-3.5 w-3.5" />
                  <span>{savingFreeKeys ? 'Saving...' : 'Save Free API Keys'}</span>
                </button>
              </form>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-[9px] text-slate-600 font-mono uppercase">Premium Providers</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>

            {/* ── PREMIUM KEYS SECTION ──────────────────────────────── */}
            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">Premium API Credentials</h2>
                <p className="text-[10px] text-slate-500 mt-1">Configure paid access keys for OpenAI, Anthropic, and DeepSeek.</p>
              </div>

              <form onSubmit={handleSaveKeys} className="space-y-4">
                {[
                  { label: 'OpenAI API Key', key: 'openai' },
                  { label: 'Anthropic Claude Key', key: 'anthropic' },
                  { label: 'DeepSeek API Key', key: 'deepseek', helper: 'Supports DeepSeek platform key or OpenRouter free API key starting with "sk-or-" for free DeepSeek-R1 access' }
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
                    {provider.helper && (
                      <p className="text-[9px] text-slate-500 font-mono mt-0.5">{provider.helper}</p>
                    )}
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
          </div>
        )}

        {activeTab === 'models' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">Model Connections Status</h2>
              <p className="text-[10px] text-slate-500 mt-1">Manage active integrations and gateway routing status for AetherMind endpoints.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { 
                  id: 'gpt-5', 
                  name: 'GPT-5 Ultra', 
                  provider: 'OpenAI', 
                  icon: <Sparkles className="h-4 w-4 text-amber-400" />, 
                  desc: 'Next-gen reasoning & complex problem solving',
                  connected: !!apiKeys.openai,
                  isFree: false
                },
                { 
                  id: 'claude-3-7', 
                  name: 'Claude 3.7 Sonnet', 
                  provider: 'Anthropic', 
                  icon: <Sparkles className="h-4 w-4 text-teal-400" />, 
                  desc: 'Refined coding & highly accurate Markdown analysis',
                  connected: !!apiKeys.anthropic,
                  isFree: false
                },
                { 
                  id: 'gemini-2-5', 
                  name: 'Gemini 1.5 Flash', 
                  provider: 'Google', 
                  icon: <Sparkles className="h-4 w-4 text-indigo-400" />, 
                  desc: 'Multimodal processing & speed-optimized search',
                  connected: !!(freeKeys.gemini || apiKeys.google),
                  isFree: true
                },
                { 
                  id: 'deepseek-r1', 
                  name: 'DeepSeek-R1', 
                  provider: 'DeepSeek', 
                  icon: <Activity className="h-4 w-4 text-emerald-400" />, 
                  desc: 'Deep reinforcement reasoning & math proofs',
                  connected: !!apiKeys.deepseek,
                  isFree: false
                },
                { 
                  id: 'groq-llama', 
                  name: 'Llama 3.3 70B', 
                  provider: 'Groq', 
                  icon: <Zap className="h-4 w-4 text-yellow-400" />, 
                  desc: 'Ultra-fast free LPU inference — Groq cloud',
                  connected: !!freeKeys.groq,
                  isFree: true
                },
                { 
                  id: 'or-deepseek', 
                  name: 'DeepSeek-R1:free', 
                  provider: 'OpenRouter', 
                  icon: <Globe className="h-4 w-4 text-violet-400" />, 
                  desc: 'DeepSeek-R1 via OpenRouter free endpoint',
                  connected: !!freeKeys.openrouter,
                  isFree: true
                }
              ].map((model) => (
                <div key={model.id} className="p-4 bg-slate-900 border border-white/5 rounded-xl flex flex-col justify-between space-y-3 transition-all hover:border-indigo-500/10">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-indigo-500/10">
                        {model.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-semibold text-xs text-slate-200">{model.name}</h4>
                          {model.isFree && (
                            <span className="text-[7px] font-mono text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded border border-emerald-500/15">FREE</span>
                          )}
                        </div>
                        <span className="text-[8px] text-slate-500 font-mono">{model.provider}</span>
                      </div>
                    </div>
                    {model.connected ? (
                      <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        Connected
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        Simulated
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">{model.desc}</p>
                </div>
              ))}
            </div>
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
