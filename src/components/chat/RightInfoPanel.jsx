import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, Layers, Cpu, Server, Terminal, Wrench, X, PanelRightClose
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';

// Dashboards imports
import BrowserDashboard from '../tools/BrowserDashboard';
import RagDashboard from '../rag/RagDashboard';
import VectorDashboard from '../vector/VectorDashboard';
import McpDashboard from '../mcp/McpDashboard';
import ToolDashboard from '../tools/ToolDashboard';

const RightInfoPanel = () => {
  const { isRightPanelOpen, setIsRightPanelOpen, rightPanelTab, setRightPanelTab } = useChat();

  const tabs = [
    { id: 'browser', label: 'Browser Agent', icon: <Globe className="h-4 w-4" /> },
    { id: 'rag', label: 'RAG Pipeline', icon: <Layers className="h-4 w-4" /> },
    { id: 'vector', label: 'Vector Database', icon: <Server className="h-4 w-4" /> },
    { id: 'mcp', label: 'MCP Hub', icon: <Cpu className="h-4 w-4" /> },
    { id: 'tools', label: 'AI Tools', icon: <Wrench className="h-4 w-4" /> }
  ];

  const renderActiveTab = () => {
    switch (rightPanelTab) {
      case 'browser': return <BrowserDashboard />;
      case 'rag': return <RagDashboard />;
      case 'vector': return <VectorDashboard />;
      case 'mcp': return <McpDashboard />;
      case 'tools': return <ToolDashboard />;
      default: return <BrowserDashboard />;
    }
  };

  return (
    <AnimatePresence>
      {isRightPanelOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 380, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="h-full border-l border-chat-border bg-chat-sidebar flex flex-col overflow-hidden relative shrink-0 z-10"
        >
          {/* Header Panel */}
          <div className="p-4 border-b border-chat-border flex items-center justify-between h-16 shrink-0">
            <span className="text-sm font-semibold tracking-wider text-slate-300 font-sans uppercase">
              {tabs.find(t => t.id === rightPanelTab)?.label || 'Integrations'}
            </span>
            <button
              onClick={() => setIsRightPanelOpen(false)}
              className="text-slate-400 hover:text-white p-1 hover:bg-white/5 rounded-md transition-colors"
              title="Close panel"
            >
              <PanelRightClose className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation Tabs Grid */}
          <div className="flex border-b border-chat-border/60 bg-[#070b13] p-1 gap-0.5 shrink-0">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setRightPanelTab(tab.id)}
                title={tab.label}
                className={`flex-1 py-2 rounded flex items-center justify-center transition-all ${
                  rightPanelTab === tab.id
                    ? 'bg-indigo-500/15 text-indigo-300 border-b-2 border-indigo-500'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                }`}
              >
                {tab.icon}
              </button>
            ))}
          </div>

          {/* Tab Viewport */}
          <div className="flex-1 overflow-y-auto bg-[#070a12]/30">
            {renderActiveTab()}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RightInfoPanel;
