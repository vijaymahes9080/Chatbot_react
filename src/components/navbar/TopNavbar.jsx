import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, ChevronDown, Check, Moon, Search, User, LogOut, 
  Settings, Grid, LayoutGrid, Zap, Shield, Sparkles, Activity, Globe, Wind,
  MessageSquare
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { MODELS, TEAMS } from '../../utils/mockData';

const TopNavbar = () => {
  const navigate = useNavigate();
  const { 
    activeModelId, 
    setActiveModelId,
    notifications,
    markNotificationRead,
    clearAllNotifications
  } = useChat();

  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [teamOpen, setTeamOpen] = useState(false);
  const [activeTeamId, setActiveTeamId] = useState('core-ai');

  const selectedModel = MODELS.find(m => m.id === activeModelId) || MODELS[0];
  const activeTeam = TEAMS.find(t => t.id === activeTeamId) || TEAMS[0];

  const unreadNotifications = notifications.filter(n => n.unread).length;

  const getModelIcon = (icon) => {
    switch (icon) {
      case 'zap': return <Zap className="h-4 w-4 text-amber-400" />;
      case 'shield': return <Shield className="h-4 w-4 text-teal-400" />;
      case 'sparkles': return <Sparkles className="h-4 w-4 text-indigo-400" />;
      case 'activity': return <Activity className="h-4 w-4 text-emerald-400" />;
      case 'globe': return <Globe className="h-4 w-4 text-blue-400" />;
      case 'wind': return <Wind className="h-4 w-4 text-violet-400" />;
      default: return <Sparkles className="h-4 w-4 text-indigo-400" />;
    }
  };

  return (
    <header className="h-16 w-full glass-panel border-b border-chat-border px-6 flex items-center justify-between z-10 shrink-0 select-none">
      {/* Left: Model Selector & Team Switcher */}
      <div className="flex items-center gap-4">
        {/* LLM Model Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-white/5 hover:border-white/10 hover:bg-slate-900 transition-all text-sm font-medium"
          >
            {getModelIcon(selectedModel.icon)}
            <span className="text-slate-100">{selectedModel.name}</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-1" />
          </button>

          {modelDropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setModelDropdownOpen(false)} />
              <div className="absolute left-0 mt-1.5 w-72 glass-panel rounded-lg shadow-xl border border-white/10 p-1.5 z-50">
                <p className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">Select LLM Provider</p>
                <div className="space-y-0.5 mt-1">
                  {MODELS.map(m => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setActiveModelId(m.id);
                        setModelDropdownOpen(false);
                      }}
                      className={`w-full flex items-start gap-3 p-2 rounded-md text-left transition-all ${
                        activeModelId === m.id ? 'bg-indigo-500/20 text-indigo-300' : 'hover:bg-white/5 text-slate-300'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">{getModelIcon(m.icon)}</div>
                      <div className="min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold">{m.name}</span>
                          <span className="text-[9px] text-slate-500 font-mono px-1 rounded bg-slate-800">{m.provider}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{m.desc}</p>
                      </div>
                      {activeModelId === m.id && <Check className="h-3.5 w-3.5 text-indigo-400 ml-auto shrink-0 self-center" />}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Chat Workspace Link */}
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-white/5 hover:border-white/10 hover:bg-slate-900 transition-all text-sm font-medium text-slate-200 hover:text-white"
          title="Go to Chat Workspace"
        >
          <MessageSquare className="h-4 w-4 text-indigo-400" />
          <span>Chat</span>
        </button>

        {/* Team Selector */}
        <div className="relative hidden md:block">
          <button 
            onClick={() => setTeamOpen(!teamOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800 text-slate-300 hover:text-slate-100 transition-all"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            <span>{activeTeam.name}</span>
            <ChevronDown className="h-3 w-3 text-slate-500" />
          </button>

          {teamOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setTeamOpen(false)} />
              <div className="absolute left-0 mt-1.5 w-48 glass-panel rounded-lg shadow-xl border border-white/10 p-1 z-50">
                {TEAMS.map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setActiveTeamId(t.id);
                      setTeamOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 text-xs rounded-md text-left transition-all ${
                      activeTeamId === t.id ? 'bg-indigo-500/20 text-indigo-300' : 'hover:bg-white/5 text-slate-300'
                    }`}
                  >
                    <div>
                      <p className="font-medium">{t.name}</p>
                      <p className="text-[9px] text-slate-500">{t.members} active keys</p>
                    </div>
                    {activeTeamId === t.id && <Check className="h-3.5 w-3.5 text-indigo-400" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Middle: Universal Search Bar */}
      <div className="hidden lg:flex items-center w-96 relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input 
          type="text" 
          placeholder="Command Palette... (Ctrl + K)" 
          className="w-full pl-9 pr-3 py-2 text-xs rounded-lg glass-input text-slate-300"
          readOnly
        />
      </div>

      {/* Right: Theme, Notifications, Settings, Profile */}
      <div className="flex items-center gap-3">
        {/* Theme Indicator */}
        <button 
          title="Dark Mode Default"
          className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-white/5 rounded-lg transition-colors cursor-pointer relative"
        >
          <Moon className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-indigo-500" />
        </button>

        {/* Notifications Icon & Popover */}
        <div className="relative">
          <button 
            onClick={() => setNotificationOpen(!notificationOpen)}
            className={`p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer relative ${
              notificationOpen ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            <Bell className="h-4 w-4" />
            {unreadNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>

          {notificationOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setNotificationOpen(false)} />
              <div className="absolute right-0 mt-1.5 w-80 glass-panel rounded-lg shadow-xl border border-white/10 p-2 z-50">
                <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2 px-1">
                  <h4 className="text-xs font-bold text-slate-200">Alert Center</h4>
                  <button 
                    onClick={clearAllNotifications}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300"
                  >
                    Clear unread
                  </button>
                </div>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {notifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-2 rounded text-xs transition-colors cursor-pointer ${
                        n.unread ? 'bg-indigo-500/10 hover:bg-indigo-500/15' : 'hover:bg-white/5 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200">{n.title}</span>
                        <span className="text-[9px] text-slate-500 font-mono">{n.time}</span>
                      </div>
                      <p className="text-[10px] mt-0.5 truncate">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Account Menu */}
        <div className="relative">
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-1.5 p-0.5 rounded-full border border-slate-700/60 hover:border-slate-400/50 transition-colors"
          >
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop" 
              alt="Avatar" 
              className="h-7 w-7 rounded-full object-cover"
            />
          </button>

          {profileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
              <div className="absolute right-0 mt-1.5 w-56 glass-panel rounded-lg shadow-xl border border-white/10 p-1 z-50">
                <div className="p-2 border-b border-white/5 mb-1">
                  <p className="text-xs font-semibold text-slate-200">Sarah Jenkins</p>
                  <p className="text-[10px] text-slate-500">System Architect</p>
                </div>
                
                <button 
                  onClick={() => { navigate('/settings'); setProfileOpen(false); }}
                  className="w-full flex items-center gap-2 p-2 text-xs rounded hover:bg-white/5 text-slate-300 hover:text-white transition-colors"
                >
                  <Settings className="h-3.5 w-3.5" />
                  <span>Account Settings</span>
                </button>
                <button 
                  onClick={() => { navigate('/dashboard'); setProfileOpen(false); }}
                  className="w-full flex items-center gap-2 p-2 text-xs rounded hover:bg-white/5 text-slate-300 hover:text-white transition-colors"
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  <span>Usage Analytics</span>
                </button>
                
                <div className="border-t border-white/5 my-1" />
                
                <button 
                  onClick={() => setProfileOpen(false)}
                  className="w-full flex items-center gap-2 p-2 text-xs rounded hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Logout Session</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
