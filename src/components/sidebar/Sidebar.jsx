import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Plus, Search, ChevronLeft, ChevronRight, 
  Folder, Pin, Trash2, Edit3, Archive, Settings, BarChart2,
  FolderPlus, User, Check, X, LogOut, ChevronDown, Sparkles
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { WORKSPACES } from '../../utils/mockData';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    conversations,
    activeConversationId,
    folders,
    isSidebarCollapsed,
    searchQuery,
    activeWorkspaceId,
    setActiveConversationId,
    setIsSidebarCollapsed,
    setSearchQuery,
    createConversation,
    deleteConversation,
    renameConversation,
    togglePinConversation,
    moveConversationToFolder,
    setActiveWorkspaceId
  } = useChat();

  const [editingChatId, setEditingChatId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);

  const handleStartRename = (e, id, title) => {
    e.stopPropagation();
    setEditingChatId(id);
    setEditTitle(title);
  };

  const handleSaveRename = (e, id) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      renameConversation(id, editTitle);
    }
    setEditingChatId(null);
  };

  const handleCancelRename = (e) => {
    e.stopPropagation();
    setEditingChatId(null);
  };

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedChats = filteredConversations.filter(c => c.pinned);
  const unpinnedChats = filteredConversations.filter(c => !c.pinned);

  // Group unpinned chats by folder or as general recents
  const folderChats = (folderId) => unpinnedChats.filter(c => c.folderId === folderId);
  const noFolderChats = unpinnedChats.filter(c => !c.folderId);

  const activeWorkspace = WORKSPACES.find(w => w.id === activeWorkspaceId) || WORKSPACES[0];

  const handleNav = (path) => {
    navigate(path);
  };

  return (
    <motion.aside
      animate={{ width: isSidebarCollapsed ? 72 : 280 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="h-full border-r border-chat-border bg-chat-sidebar flex flex-col relative z-20 select-none overflow-hidden"
    >
      {/* Brand Header */}
      <div className="p-4 flex items-center justify-between border-b border-chat-border h-16 shrink-0">
        {!isSidebarCollapsed && (
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNav('/')}>
            <div className="h-8 w-8 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-lg p-0.5 shadow-md shadow-indigo-500/20">
              <div className="h-full w-full bg-[#05070f] rounded-[6px] flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-indigo-400" />
              </div>
            </div>
            <span className="font-semibold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent font-sans">
              AetherMind
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-mono">
              v1.0
            </span>
          </div>
        )}

        {isSidebarCollapsed && (
          <div className="h-8 w-8 mx-auto bg-gradient-to-tr from-indigo-500 to-pink-500 rounded-lg flex items-center justify-center cursor-pointer" onClick={() => handleNav('/')}>
            <Sparkles className="h-4 w-4 text-white" />
          </div>
        )}

        {/* Collapsible toggle */}
        {!isSidebarCollapsed && (
          <button 
            onClick={() => setIsSidebarCollapsed(true)}
            className="text-slate-400 hover:text-white p-1 hover:bg-white/5 rounded-md transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Expand toggle when collapsed */}
      {isSidebarCollapsed && (
        <div className="absolute top-[72px] left-1/2 transform -translate-x-1/2 z-30">
          <button 
            onClick={() => setIsSidebarCollapsed(false)}
            className="text-slate-400 hover:text-white p-1.5 bg-slate-900 border border-chat-border rounded-full hover:bg-slate-800 transition-all shadow-md shadow-indigo-500/10"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Workspace Menu Selector */}
      {!isSidebarCollapsed && (
        <div className="px-3 py-2 shrink-0 border-b border-chat-border relative">
          <button 
            onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
            className="w-full flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all text-left"
          >
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs uppercase">
                {activeWorkspace.name[0]}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-100">{activeWorkspace.name}</p>
                <p className="text-[10px] text-slate-400 capitalize">{activeWorkspace.type} Plan</p>
              </div>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          <AnimatePresence>
            {workspaceMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setWorkspaceMenuOpen(false)} />
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute left-3 right-3 top-full mt-1.5 glass-panel rounded-lg shadow-xl border border-white/10 p-1.5 z-50 overflow-hidden"
                >
                  {WORKSPACES.map(w => (
                    <button
                      key={w.id}
                      onClick={() => {
                        setActiveWorkspaceId(w.id);
                        setWorkspaceMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 text-xs rounded-md text-left transition-all ${
                        activeWorkspaceId === w.id ? 'bg-indigo-500/20 text-indigo-300' : 'hover:bg-white/5 text-slate-300'
                      }`}
                    >
                      <span>{w.name}</span>
                      {activeWorkspaceId === w.id && <Check className="h-3.5 w-3.5" />}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Sidebar Navigation & Controls */}
      <div className="p-3 shrink-0 flex flex-col gap-2">
        <button
          onClick={() => {
            createConversation();
            if (location.pathname !== '/') navigate('/');
          }}
          className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-medium text-sm transition-all duration-300 ${
            isSidebarCollapsed 
              ? 'bg-gradient-to-tr from-indigo-600 to-violet-600 shadow-md shadow-indigo-500/20 hover:scale-105 text-white' 
              : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/25 text-white border border-indigo-400/20'
          }`}
        >
          <Plus className="h-4 w-4 shrink-0" />
          {!isSidebarCollapsed && <span>New Chat</span>}
        </button>

        {!isSidebarCollapsed && (
          <div className="relative mt-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg glass-input text-slate-200"
            />
          </div>
        )}
      </div>

      {/* Chat History List (Mimics ChatGPT) */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-4 select-none">
        {/* Pinned Section */}
        {pinnedChats.length > 0 && (
          <div>
            {!isSidebarCollapsed && (
              <div className="px-3 mb-1 text-[10px] font-bold text-slate-400 tracking-wider flex items-center gap-1.5 uppercase">
                <Pin className="h-3 w-3 text-indigo-400" />
                <span>Pinned Chats</span>
              </div>
            )}
            <div className="space-y-0.5">
              {pinnedChats.map(chat => (
                <SidebarChatItem 
                  key={chat.id} 
                  chat={chat} 
                  activeId={activeConversationId}
                  isCollapsed={isSidebarCollapsed}
                  editingId={editingChatId}
                  editTitle={editTitle}
                  onSelect={(id) => { setActiveConversationId(id); if (location.pathname !== '/') navigate('/'); }}
                  onStartRename={handleStartRename}
                  onSaveRename={handleSaveRename}
                  onCancelRename={handleCancelRename}
                  onTogglePin={togglePinConversation}
                  onDelete={deleteConversation}
                  onSetTitle={setEditTitle}
                  folders={folders}
                  onMoveToFolder={moveConversationToFolder}
                />
              ))}
            </div>
          </div>
        )}

        {/* Folders Section */}
        {!isSidebarCollapsed && folders.map(folder => {
          const chats = folderChats(folder.id);
          return (
            <div key={folder.id} className="space-y-1">
              <div className="px-3 py-1 flex items-center justify-between text-xs font-semibold text-slate-400 hover:text-slate-200 group transition-all">
                <div className="flex items-center gap-1.5">
                  <Folder className="h-3.5 w-3.5" style={{ color: folder.color }} />
                  <span className="truncate">{folder.name}</span>
                </div>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-full font-mono">
                  {chats.length}
                </span>
              </div>
              <div className="pl-3 space-y-0.5 border-l border-slate-800 ml-5">
                {chats.map(chat => (
                  <SidebarChatItem 
                    key={chat.id} 
                    chat={chat} 
                    activeId={activeConversationId}
                    isCollapsed={isSidebarCollapsed}
                    editingId={editingChatId}
                    editTitle={editTitle}
                    onSelect={(id) => { setActiveConversationId(id); if (location.pathname !== '/') navigate('/'); }}
                    onStartRename={handleStartRename}
                    onSaveRename={handleSaveRename}
                    onCancelRename={handleCancelRename}
                    onTogglePin={togglePinConversation}
                    onDelete={deleteConversation}
                    onSetTitle={setEditTitle}
                    folders={folders}
                    onMoveToFolder={moveConversationToFolder}
                  />
                ))}
                {chats.length === 0 && (
                  <p className="text-[10px] text-slate-600 pl-3 py-1 italic">Empty folder</p>
                )}
              </div>
            </div>
          );
        })}

        {/* Recent (No folder) Section */}
        <div>
          {!isSidebarCollapsed && (
            <div className="px-3 mb-1 text-[10px] font-bold text-slate-400 tracking-wider flex items-center gap-1.5 uppercase">
              <MessageSquare className="h-3 w-3 text-slate-400" />
              <span>Recent Conversations</span>
            </div>
          )}
          <div className="space-y-0.5">
            {noFolderChats.map(chat => (
              <SidebarChatItem 
                key={chat.id} 
                chat={chat} 
                activeId={activeConversationId}
                isCollapsed={isSidebarCollapsed}
                editingId={editingChatId}
                editTitle={editTitle}
                onSelect={(id) => { setActiveConversationId(id); if (location.pathname !== '/') navigate('/'); }}
                onStartRename={handleStartRename}
                onSaveRename={handleSaveRename}
                onCancelRename={handleCancelRename}
                onTogglePin={togglePinConversation}
                onDelete={deleteConversation}
                onSetTitle={setEditTitle}
                folders={folders}
                onMoveToFolder={moveConversationToFolder}
              />
            ))}
            {noFolderChats.length === 0 && (
              <p className="text-center text-xs text-slate-600 py-4 italic">No chats found</p>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar Footer Controls */}
      <div className="mt-auto border-t border-chat-border p-3 shrink-0 space-y-1">
        {/* Navigation items: Dashboard, Settings */}
        <SidebarFooterButton 
          active={location.pathname === '/dashboard'}
          icon={<BarChart2 className="h-4 w-4" />}
          text="Analytics"
          collapsed={isSidebarCollapsed}
          onClick={() => handleNav('/dashboard')}
        />
        <SidebarFooterButton 
          active={location.pathname === '/settings'}
          icon={<Settings className="h-4 w-4" />}
          text="Settings"
          collapsed={isSidebarCollapsed}
          onClick={() => handleNav('/settings')}
        />

        {/* Profile Details */}
        <div className={`flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors mt-2 cursor-pointer ${
          isSidebarCollapsed ? 'justify-center' : ''
        }`}>
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop" 
              alt="User" 
              className="h-8 w-8 rounded-full border border-indigo-500/30 object-cover"
            />
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border border-slate-900" />
          </div>
          {!isSidebarCollapsed && (
            <div className="flex-1 truncate">
              <p className="text-xs font-semibold text-slate-200">Sarah Jenkins</p>
              <p className="text-[10px] text-slate-400 truncate">s.jenkins@deepmind.ai</p>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
};

// Sub-component: Individual chat row item inside history
const SidebarChatItem = ({
  chat, activeId, isCollapsed, editingId, editTitle,
  onSelect, onStartRename, onSaveRename, onCancelRename, onTogglePin, onDelete, onSetTitle,
  folders, onMoveToFolder
}) => {
  const isActive = chat.id === activeId;
  const isEditing = chat.id === editingId;
  const [folderMenuOpen, setFolderMenuOpen] = useState(false);

  if (isCollapsed) {
    return (
      <div 
        onClick={() => onSelect(chat.id)}
        className={`h-10 w-10 mx-auto flex items-center justify-center rounded-lg transition-all cursor-pointer relative group my-1 ${
          isActive ? 'bg-indigo-500/25 text-indigo-300' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
        }`}
      >
        <MessageSquare className="h-4 w-4" />
        {chat.pinned && (
          <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-indigo-400" />
        )}
        {/* Tooltip */}
        <span className="absolute left-full ml-2 px-2 py-1 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
          {chat.title}
        </span>
      </div>
    );
  }

  return (
    <div
      onClick={() => !isEditing && onSelect(chat.id)}
      className={`group flex items-center justify-between p-2 rounded-lg text-sm transition-all cursor-pointer select-none my-0.5 ${
        isActive 
          ? 'bg-indigo-500/15 text-indigo-200 border-l-2 border-indigo-500' 
          : 'text-slate-300 hover:bg-slate-800/60'
      }`}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <MessageSquare className={`h-4 w-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
        
        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => onSetTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSaveRename(e, chat.id);
              if (e.key === 'Escape') onCancelRename(e);
            }}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 bg-slate-900 border border-indigo-500 rounded px-1.5 py-0.5 text-xs text-white outline-none"
            autoFocus
          />
        ) : (
          <span className="truncate text-xs font-medium">{chat.title}</span>
        )}
      </div>

      {/* Inline Operations */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
        {isEditing ? (
          <>
            <button 
              onClick={(e) => onSaveRename(e, chat.id)}
              className="text-emerald-400 hover:text-emerald-300 p-0.5 hover:bg-white/5 rounded"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
            <button 
              onClick={onCancelRename}
              className="text-slate-400 hover:text-white p-0.5 hover:bg-white/5 rounded"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={(e) => onStartRename(e, chat.id, chat.title)}
              title="Rename Chat"
              className="text-slate-400 hover:text-slate-100 p-0.5 hover:bg-white/5 rounded"
            >
              <Edit3 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onTogglePin(chat.id); }}
              title={chat.pinned ? 'Unpin' : 'Pin'}
              className={`p-0.5 hover:bg-white/5 rounded ${chat.pinned ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-100'}`}
            >
              <Pin className="h-3.5 w-3.5" />
            </button>

            {/* Folder selection trigger */}
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setFolderMenuOpen(!folderMenuOpen); }}
                title="Move to Folder"
                className="text-slate-400 hover:text-slate-100 p-0.5 hover:bg-white/5 rounded"
              >
                <FolderPlus className="h-3.5 w-3.5" />
              </button>
              {folderMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setFolderMenuOpen(false); }} />
                  <div className="absolute right-0 bottom-full mb-1 bg-slate-900 border border-slate-800 shadow-xl rounded p-1 z-50 text-xs w-32 space-y-0.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); onMoveToFolder(chat.id, null); setFolderMenuOpen(false); }}
                      className="w-full text-left p-1 hover:bg-white/5 rounded text-slate-400 hover:text-slate-200"
                    >
                      Remove from Folder
                    </button>
                    {folders.map(f => (
                      <button
                        key={f.id}
                        onClick={(e) => { e.stopPropagation(); onMoveToFolder(chat.id, f.id); setFolderMenuOpen(false); }}
                        className="w-full text-left p-1 hover:bg-white/5 rounded flex items-center gap-1 hover:text-white"
                      >
                        <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: f.color }} />
                        <span className="truncate">{f.name}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); deleteConversation(chat.id); }}
              title="Delete Chat"
              className="text-slate-400 hover:text-rose-400 p-0.5 hover:bg-white/5 rounded"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// Sidebar navigation link helper
const SidebarFooterButton = ({ active, icon, text, collapsed, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-2.5 text-xs rounded-lg font-medium transition-all ${
        active 
          ? 'bg-indigo-500/15 text-indigo-300 font-semibold border-l-2 border-indigo-500' 
          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
      } ${collapsed ? 'justify-center' : ''}`}
    >
      <div className="shrink-0">{icon}</div>
      {!collapsed && <span>{text}</span>}
    </button>
  );
};

export default Sidebar;
