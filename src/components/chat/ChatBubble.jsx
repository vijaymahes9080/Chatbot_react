import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { 
  Copy, Edit3, RotateCw, ThumbsUp, ThumbsDown, Smile, Pin, Check,
  User, Sparkles, FileText, Image, MessageSquare, AlertCircle
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';

const ChatBubble = ({ message }) => {
  const { 
    editUserMessage,
    regenerateResponse,
    handleLikeDislike,
    handleAddReaction,
    togglePinMessage,
    pinnedMessages
  } = useChat();

  const isUser = message.sender === 'user';
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text);
  const [showEmojiMenu, setShowEmojiMenu] = useState(false);

  const isPinned = pinnedMessages.some(m => m.id === message.id);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = () => {
    if (editText.trim() && editText !== message.text) {
      editUserMessage(message.id, editText);
    }
    setIsEditing(false);
  };

  const reactionEmojis = ['👍', '🧠', '🔥', '🚀', '👀', '🎉'];

  return (
    <div className={`flex items-start gap-4 animate-slide-up group ${
      isUser ? 'flex-row-reverse' : 'flex-row'
    }`}>
      {/* Avatar */}
      <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 shadow-md ${
        isUser 
          ? 'bg-gradient-to-tr from-indigo-500 to-pink-500 text-white' 
          : 'bg-[#0f172a] text-indigo-400 border border-indigo-500/30'
      }`}>
        {isUser ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4 animate-float" />}
      </div>

      {/* Bubble Shell */}
      <div className="flex flex-col max-w-[80%] space-y-1">
        <div className="flex items-center gap-2 text-[10px] text-slate-500 px-1 font-mono">
          <span>{isUser ? 'SARAH' : 'AETHERMIND'}</span>
          <span>•</span>
          <span>{message.timestamp}</span>
          {isPinned && <Pin className="h-3 w-3 text-indigo-400 rotate-45 shrink-0" />}
        </div>

        {/* Outer content container */}
        <div className={`relative p-4 rounded-2xl border transition-all ${
          isUser 
            ? 'bg-slate-900/80 border-indigo-500/20 rounded-tr-none' 
            : 'bg-[#0a0f1d]/90 border-white/5 rounded-tl-none hover:border-indigo-500/10'
        }`}>
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full bg-slate-950 border border-indigo-500 rounded-lg p-2.5 text-xs text-white outline-none focus:ring-1 focus:ring-indigo-400"
                rows={3}
              />
              <div className="flex justify-end gap-1.5 text-[10px]">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="px-2 py-1 bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveEdit}
                  className="px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-500"
                >
                  Submit
                </button>
              </div>
            </div>
          ) : (
            /* Rendered Content */
            <div className="space-y-3 text-xs leading-relaxed text-slate-200">
              
              {/* Message Attachments */}
              {message.attachments && message.attachments.length > 0 && (
                <div className="grid grid-cols-1 gap-2 mb-2">
                  {message.attachments.map((file, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-slate-950/80 border border-white/5 flex items-center justify-between gap-3 text-[10px]">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="h-4 w-4 text-indigo-400 shrink-0" />
                        <span className="font-medium text-slate-200 truncate">{file.name}</span>
                        <span className="text-slate-500">({file.size})</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">
                        Ingested
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Markdown Body Parser */}
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <div className="relative my-3 rounded-lg overflow-hidden border border-white/5">
                        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950 border-b border-white/5 text-[9px] text-slate-400 font-mono">
                          <span>{match[1].toUpperCase()}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                            }}
                            className="flex items-center gap-1 hover:text-white"
                          >
                            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                            <span>{copied ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <SyntaxHighlighter
                          style={atomDark}
                          language={match[1]}
                          PreTag="div"
                          customStyle={{ margin: 0, padding: '12px', fontSize: '11px', background: 'rgb(5, 7, 15)' }}
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      </div>
                    ) : (
                      <code className="bg-slate-800 text-indigo-300 px-1 py-0.5 rounded font-mono text-[10px]" {...props}>
                        {children}
                      </code>
                    );
                  },
                  table({ children }) {
                    return (
                      <div className="overflow-x-auto my-3 rounded-lg border border-white/5">
                        <table className="min-w-full divide-y divide-white/5 text-[10px] text-left font-mono">
                          {children}
                        </table>
                      </div>
                    );
                  },
                  th({ children }) {
                    return <th className="px-3 py-2 bg-slate-950 text-slate-300 font-bold">{children}</th>;
                  },
                  td({ children }) {
                    return <td className="px-3 py-1.5 bg-[#090b14] text-slate-400 border-t border-white/5">{children}</td>;
                  }
                }}
              >
                {message.text}
              </ReactMarkdown>

              {/* Render Simulated Mermaid Diagram Flowchart if requested */}
              {message.isMermaid && (
                <div className="my-3 p-3 bg-slate-950 rounded-lg border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-white/5 pb-1 font-mono">
                    <span>Flowchart Compilation</span>
                    <span className="text-emerald-400">Mermaid Render OK</span>
                  </div>
                  <div className="flex items-center justify-center p-3 bg-slate-900/60 rounded border border-white/5">
                    {/* Inline SVG Simulator mapping the structure cleanly */}
                    <svg viewBox="0 0 400 220" className="w-full max-w-[340px] text-[10px] font-mono text-slate-200">
                      <defs>
                        <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 0 L 10 5 L 0 10 z" fill="#6366F1" />
                        </marker>
                      </defs>
                      {/* Node A */}
                      <rect x="10" y="10" width="120" height="30" rx="5" fill="#1e293b" stroke="#6366F1" strokeWidth="1" />
                      <text x="70" y="28" textAnchor="middle">Academic PDFs</text>
                      
                      {/* Node B */}
                      <rect x="10" y="90" width="120" height="30" rx="5" fill="#1e293b" stroke="#6366F1" strokeWidth="1" />
                      <text x="70" y="108" textAnchor="middle">Parent-Child Parser</text>
                      
                      {/* Node C */}
                      <rect x="230" y="50" width="140" height="30" rx="15" fill="#1e293b" stroke="#EC4899" strokeDasharray="4,2" />
                      <text x="300" y="68" textAnchor="middle">Parent Store (Context)</text>
                      
                      {/* Node D */}
                      <rect x="230" y="130" width="140" height="30" rx="5" fill="#1e293b" stroke="#10B981" strokeWidth="1" />
                      <text x="300" y="148" textAnchor="middle">Child Store (Vector)</text>
                      
                      {/* Lines */}
                      <line x1="70" y1="40" x2="70" y2="90" stroke="#6366F1" strokeWidth="1.5" markerEnd="url(#arrow)" />
                      <path d="M 130 105 L 200 105 L 200 65 L 230 65" fill="none" stroke="#6366F1" strokeWidth="1.5" markerEnd="url(#arrow)" />
                      <path d="M 130 105 L 200 105 L 200 145 L 230 145" fill="none" stroke="#6366F1" strokeWidth="1.5" markerEnd="url(#arrow)" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Render Simulated RAG Match Data Chart */}
              {message.isChart && (
                <div className="my-3 p-3 bg-slate-950 rounded-lg border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-white/5 pb-1 font-mono">
                    <span>Similarity Weight distribution</span>
                    <span className="text-indigo-400">Recharts Simulator</span>
                  </div>
                  {/* Inline Responsive SVG Chart bar metrics */}
                  <div className="flex items-end justify-between gap-4 px-4 h-32 pt-4 bg-[#0a0d17] border border-white/5 rounded">
                    {[
                      { l: '0.9+', h: 80, c: 'bg-indigo-500' },
                      { l: '0.8+', h: 95, c: 'bg-indigo-400' },
                      { l: '0.7+', h: 60, c: 'bg-indigo-300' },
                      { l: '0.6+', h: 30, c: 'bg-purple-500' },
                      { l: '0.5+', h: 10, c: 'bg-pink-500' }
                    ].map((bar, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                        <div 
                          className={`w-full rounded-t-sm ${bar.c} shadow shadow-indigo-500/20 transition-all duration-1000`} 
                          style={{ height: `${bar.h}%` }}
                        />
                        <span className="text-[8px] text-slate-500 font-mono">{bar.l}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action overlay shortcuts on hover */}
          <div className={`absolute bottom-[-14px] flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 px-1.5 py-0.5 rounded bg-slate-900 border border-white/5 shadow-md ${
            isUser ? 'left-2' : 'right-2'
          }`}>
            {isUser ? (
              <button
                onClick={() => setIsEditing(true)}
                title="Edit message"
                className="p-1 hover:bg-white/5 rounded text-slate-400 hover:text-indigo-300"
              >
                <Edit3 className="h-3.5 w-3.5" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => regenerateResponse(message.id)}
                  title="Regenerate reply"
                  className="p-1 hover:bg-white/5 rounded text-slate-400 hover:text-indigo-300"
                >
                  <RotateCw className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleLikeDislike(message.id, 'like')}
                  title="Like reply"
                  className={`p-1 hover:bg-white/5 rounded ${message.feedback === 'like' ? 'text-indigo-400' : 'text-slate-400 hover:text-indigo-300'}`}
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleLikeDislike(message.id, 'dislike')}
                  title="Dislike reply"
                  className={`p-1 hover:bg-white/5 rounded ${message.feedback === 'dislike' ? 'text-rose-400' : 'text-slate-400 hover:text-rose-300'}`}
                >
                  <ThumbsDown className="h-3.5 w-3.5" />
                </button>
              </>
            )}

            {/* General Action Buttons */}
            <button
              onClick={handleCopy}
              title="Copy to clipboard"
              className="p-1 hover:bg-white/5 rounded text-slate-400 hover:text-slate-200"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
            <button
              onClick={() => togglePinMessage(message)}
              title={isPinned ? 'Unpin message' : 'Pin message'}
              className={`p-1 hover:bg-white/5 rounded ${isPinned ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Pin className="h-3.5 w-3.5" />
            </button>
            
            {/* Emoji Reactions picker */}
            <div className="relative">
              <button
                onClick={() => setShowEmojiMenu(!showEmojiMenu)}
                title="React to message"
                className="p-1 hover:bg-white/5 rounded text-slate-400 hover:text-indigo-400"
              >
                <Smile className="h-3.5 w-3.5" />
              </button>
              {showEmojiMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowEmojiMenu(false)} />
                  <div className="absolute left-1/2 bottom-full mb-1 transform -translate-x-1/2 bg-slate-900 border border-slate-800 shadow-xl rounded p-1 z-50 flex gap-1">
                    {reactionEmojis.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => { handleAddReaction(message.id, emoji); setShowEmojiMenu(false); }}
                        className="hover:bg-white/10 p-1 rounded text-xs transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Existing Reactions display */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1 pl-1">
            {message.reactions.map((emoji, idx) => (
              <button 
                key={idx}
                onClick={() => handleAddReaction(message.id, emoji)}
                className="px-1.5 py-0.5 rounded-full bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800 text-[10px] text-slate-300 font-mono transition-all"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBubble;
