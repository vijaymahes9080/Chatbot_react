import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Paperclip, Mic, FileText,
  Sparkles, X, BrainCircuit, Pin,
  ChevronDown, Check, Zap, Shield, Activity, Globe, Wind
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import ChatBubble from './ChatBubble';
import VoiceRecorderUI from './VoiceRecorderUI';
import { api } from '../../utils/api';
import { MODELS } from '../../utils/mockData';

const getModelIcon = (icon, cls = 'h-3.5 w-3.5') => {
  switch (icon) {
    case 'zap':       return <Zap className={`${cls} text-amber-400`} />;
    case 'shield':    return <Shield className={`${cls} text-teal-400`} />;
    case 'sparkles': return <Sparkles className={`${cls} text-indigo-400`} />;
    case 'activity': return <Activity className={`${cls} text-emerald-400`} />;
    case 'globe':    return <Globe className={`${cls} text-blue-400`} />;
    case 'wind':     return <Wind className={`${cls} text-violet-400`} />;
    default:         return <Sparkles className={`${cls} text-indigo-400`} />;
  }
};

const ChatArea = () => {
  const {
    activeConversation,
    sendMessage,
    isStreaming,
    uploadedFiles,
    handleFileUpload,
    deleteUploadedFile,
    pinnedMessages,
    activeModelId,
    setActiveModelId
  } = useChat();

  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const selectedModel = MODELS.find(m => m.id === activeModelId) || MODELS[0];

  const [apiKeys, setApiKeys] = useState({
    openai: false,
    anthropic: false,
    google: false,
    deepseek: false
  });

  useEffect(() => {
    const loadConnectionConfig = async () => {
      try {
        const config = await api.getSettings();
        if (config && config.api_keys) {
          setApiKeys({
            openai: !!(config.api_keys.openai || config.api_keys.OPENAI),
            anthropic: !!(config.api_keys.anthropic || config.api_keys.ANTHROPIC),
            google: !!(config.api_keys.google || config.api_keys.GOOGLE),
            deepseek: !!(config.api_keys.deepseek || config.api_keys.DEEPSEEK)
          });
        }
      } catch (err) {
        console.error('Failed to load active connection keys', err);
      }
    };
    loadConnectionConfig();
  }, [activeConversation]);

  const [input, setInput] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages?.length, isStreaming]);

  const handleSend = () => {
    if (!input.trim() && uploadedFiles.length === 0) return;
    
    // Send message with any currently ready uploaded files
    const readyFiles = uploadedFiles.filter(f => f.status === 'ready');
    sendMessage(input, readyFiles);
    
    // Clear input & uploads
    setInput('');
    readyFiles.forEach(f => deleteUploadedFile(f.id));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const selectSuggestedPrompt = (promptText) => {
    setInput(promptText);
  };

  const activeUploads = uploadedFiles.filter(f => f.status === 'uploading' || f.status === 'ready');

  return (
    <div 
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#05070f]"
    >
      {/* Drag & Drop Overlay */}
      {dragActive && (
        <div className="absolute inset-0 bg-indigo-950/80 backdrop-blur-sm border-2 border-dashed border-indigo-500 z-50 flex flex-col items-center justify-center pointer-events-none transition-all">
          <Paperclip className="h-12 w-12 text-indigo-400 animate-bounce" />
          <h3 className="mt-4 text-lg font-semibold text-slate-100">Drop files here to upload context</h3>
          <p className="text-sm text-slate-400 mt-1">PDFs, CSVs, TXT, images up to 50MB</p>
        </div>
      )}

      {/* Header bar of ChatArea */}
      <div className="h-16 border-b border-chat-border/60 flex items-center justify-between px-6 shrink-0 bg-[#060810]/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-1 rounded bg-indigo-500/10 text-indigo-400">
            <BrainCircuit className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-xs font-semibold text-slate-200">
              {activeConversation ? activeConversation.title : 'New Chat'}
            </h2>
            <p className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Conversation Memory Stack Active
            </p>
          </div>
        </div>

        {/* Pinned Messages Badge */}
        {pinnedMessages.length > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-500/10 border border-indigo-500/30 text-[10px] text-indigo-300">
            <Pin className="h-3 w-3" />
            <span>{pinnedMessages.length} Pinned</span>
          </div>
        )}
      </div>

      {/* Messages Scroll Viewport */}
      <div className="flex-1 overflow-y-auto px-4 md:px-12 py-6 space-y-6 scroll-smooth">
        {activeConversation && activeConversation.messages.length > 0 ? (
          <div className="max-w-3xl mx-auto w-full space-y-6">
            {activeConversation.messages.map(msg => (
              <ChatBubble key={msg.id} message={msg} />
            ))}
            {isStreaming && (
              <div className="flex justify-start items-start gap-4">
                <div className="h-7 w-7 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow shadow-indigo-500/30">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <div className="glass-card p-4 rounded-2xl rounded-tl-none border border-white/5 space-y-1.5 max-w-[80%]">
                  <div className="flex space-x-1.5 items-center justify-start py-1">
                    <div className="h-2 w-2 bg-indigo-500 rounded-full typing-dot" />
                    <div className="h-2 w-2 bg-indigo-500 rounded-full typing-dot" />
                    <div className="h-2 w-2 bg-indigo-500 rounded-full typing-dot" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          /* Empty State Dashboard */
          <div className="h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto space-y-8 select-none">
            <div className="h-16 w-16 bg-gradient-to-tr from-indigo-500 via-indigo-400 to-pink-500 rounded-2xl p-0.5 shadow-xl shadow-indigo-500/15 animate-float">
              <div className="h-full w-full bg-[#05070f] rounded-[14px] flex items-center justify-center">
                <BrainCircuit className="h-8 w-8 text-indigo-400" />
              </div>
            </div>
            
            <div>
              <h1 className="text-xl font-bold font-sans text-slate-100 tracking-tight">How can I accelerate your workspace goals today?</h1>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                Prompt AetherMind to construct code implementations, trigger hybrid vector index searchers, scrape current URLs, or test postgres databases.
              </p>
            </div>

            {/* Model Connections List */}
            <div id="connections-list" className="w-full bg-[#0b0f19]/80 border border-white/5 rounded-2xl p-4 space-y-3">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left">Active Model Gateways</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { name: 'GPT-5', connected: apiKeys.openai },
                  { name: 'Claude 3.7', connected: apiKeys.anthropic },
                  { name: 'Gemini 2.5', connected: apiKeys.google },
                  { name: 'DeepSeek-R1', connected: apiKeys.deepseek },
                  { name: 'Llama 3.3', connected: true, isFree: true }
                ].map((gate) => (
                  <div key={gate.name} className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-white/5 gap-1">
                    <span className="text-[10px] font-medium text-slate-300 truncate">{gate.name}</span>
                    <span className="flex items-center gap-1.5 shrink-0">
                      {gate.isFree && <span className="text-[8px] text-blue-400 font-mono">Free</span>}
                      <span className="flex h-2 w-2 relative">
                        {gate.connected && (
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                            gate.isFree ? 'bg-blue-400' : 'bg-emerald-400'
                          }`} />
                        )}
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${
                          gate.isFree ? 'bg-blue-500' : gate.connected ? 'bg-emerald-500' : 'bg-amber-500'
                        }`} />
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
              {[
                { title: 'Optimize hybrid vector chunking', desc: 'Solve vector collisions inside PDFs', prompt: 'How can we solve vector collision issues when processing large semantic chunks of academic PDFs?' },
                { title: 'Explain React 19 Context changes', desc: 'Migration code differences and code diffs', prompt: 'What are the main breaking changes when refactoring context providers to React 19?' },
                { title: 'Write a python simulation script', desc: 'Compare latency with chart outputs', prompt: 'Write a python script that evaluates latency vs chunk size and outputs a table.' },
                { title: 'Test postgres MCP integration', desc: 'Show tools schema connection', prompt: 'Show me how to configure postgres MCP client connection.' }
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => selectSuggestedPrompt(item.prompt)}
                  className="p-3.5 text-left rounded-xl glass-card border border-white/5 hover:border-indigo-500/20 hover:bg-white/5 transition-all flex flex-col justify-between group"
                >
                  <p className="font-semibold text-xs text-slate-200 group-hover:text-indigo-400 transition-colors">{item.title}</p>
                  <p className="text-[10px] text-slate-500 mt-1">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input panel block */}
      <div className="p-4 border-t border-chat-border/60 bg-[#060810]/40 backdrop-blur-md shrink-0">
        <div className="max-w-4xl mx-auto space-y-3">
          
          {/* Files Upload Previews queue inside input area */}
          {activeUploads.length > 0 && (
            <div className="flex flex-wrap gap-2 py-1 max-h-24 overflow-y-auto">
              {activeUploads.map(file => (
                <div key={file.id} className="flex items-center gap-1.5 py-1 pl-2 pr-1.5 rounded-lg bg-slate-900 border border-white/5 text-[10px] text-slate-300">
                  <FileText className="h-3 w-3 text-indigo-400" />
                  <span className="max-w-[120px] truncate">{file.name}</span>
                  {file.status === 'uploading' ? (
                    <span className="text-[8px] text-slate-500 font-mono">({file.progress}%)</span>
                  ) : (
                    <button 
                      onClick={() => deleteUploadedFile(file.id)}
                      className="p-0.5 rounded hover:bg-white/10 text-slate-400 hover:text-rose-400"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Core Input box */}
          <div className="relative rounded-2xl bg-slate-950 border border-white/5 focus-within:border-indigo-500/50 shadow-inner flex flex-col p-1.5">
            
            {/* Main Input Textarea */}
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask AetherMind anything... (Shift + Enter for newlines)"
              rows={2}
              className="w-full resize-none bg-transparent border-0 outline-none text-slate-200 text-xs p-2.5 focus:ring-0 max-h-32 scrollbar-hidden leading-relaxed"
            />

            {/* Bottom Controls inside input container */}
            <div className="flex items-center justify-between border-t border-white/5 pt-2 px-1">
              <div className="flex items-center gap-1">
                {/* File Attachment Button */}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  multiple 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload workspace file"
                  className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                >
                  <Paperclip className="h-4 w-4" />
                </button>

                {/* Voice record trigger */}
                <button
                  onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
                  title="Record audio context"
                  className={`p-2 rounded-lg transition-colors cursor-pointer ${
                    showVoiceRecorder ? 'text-rose-400 bg-rose-500/10' : 'text-slate-400 hover:text-indigo-400 hover:bg-white/5'
                  }`}
                >
                  <Mic className="h-4 w-4" />
                </button>

                {/* Separator */}
                <div className="w-px h-4 bg-white/10 mx-1" />

                {/* Inline Model Selector */}
                <div className="relative">
                  <button
                    onClick={() => setModelDropdownOpen(prev => !prev)}
                    title="Switch AI Model"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-white/8 hover:border-indigo-500/40 hover:bg-slate-800 transition-all text-[11px] font-medium text-slate-300 hover:text-slate-100 cursor-pointer"
                  >
                    {getModelIcon(selectedModel.icon)}
                    <span className="max-w-[110px] truncate">{selectedModel.name}</span>
                    <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform duration-200 ${modelDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {modelDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setModelDropdownOpen(false)} />
                      <div className="absolute bottom-full mb-2 left-0 w-64 bg-slate-950/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl shadow-black/50 p-1.5 z-50">
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-2 py-1">Select Model</p>
                        <div className="space-y-0.5">
                          {MODELS.map(m => (
                            <button
                              key={m.id}
                              onClick={() => { setActiveModelId(m.id); setModelDropdownOpen(false); }}
                              className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left transition-all ${
                                activeModelId === m.id
                                  ? 'bg-indigo-500/20 text-indigo-200'
                                  : 'hover:bg-white/5 text-slate-300 hover:text-slate-100'
                              }`}
                            >
                              <div className="shrink-0">{getModelIcon(m.icon)}</div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-semibold truncate">{m.name}</p>
                                <p className="text-[9px] text-slate-500 truncate font-mono">{m.provider}</p>
                              </div>
                              {activeModelId === m.id && <Check className="h-3 w-3 text-indigo-400 shrink-0" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Submit trigger button */}
              <button
                onClick={handleSend}
                disabled={(!input.trim() && activeUploads.length === 0) || isStreaming}
                className="p-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-pink-600 disabled:opacity-40 text-white rounded-xl transition-all shadow-md shadow-indigo-500/15 cursor-pointer disabled:cursor-not-allowed hover:scale-105"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Voice recorder view container */}
          {showVoiceRecorder && (
            <VoiceRecorderUI onClose={() => setShowVoiceRecorder(false)} />
          )}

        </div>
      </div>
    </div>
  );
};

export default ChatArea;
