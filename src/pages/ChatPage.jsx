import React from 'react';
import ChatArea from '../components/chat/ChatArea';
import RightInfoPanel from '../components/chat/RightInfoPanel';
import { useChat } from '../context/ChatContext';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

const ChatPage = () => {
  const { isRightPanelOpen, setIsRightPanelOpen } = useChat();

  return (
    <div className="flex h-full w-full overflow-hidden relative bg-[#05070f]">
      {/* Central Chat Stream */}
      <div className="flex-1 h-full flex flex-col min-w-0">
        <ChatArea />
      </div>

      {/* Collapsible Integrations Info Panel */}
      <RightInfoPanel />

      {/* Small floating pull-out button when Right Panel is closed */}
      {!isRightPanelOpen && (
        <button
          onClick={() => setIsRightPanelOpen(true)}
          className="absolute right-4 top-4 z-30 p-2 bg-slate-900 border border-chat-border text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all rounded-lg shadow-md shadow-indigo-500/5"
          title="Open Integrations Panel"
        >
          <PanelLeftClose className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default ChatPage;
