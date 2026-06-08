import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_CONVERSATIONS, FOLDERS, MODELS, WORKSPACES, NOTIFICATIONS } from '../utils/mockData';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [conversations, setConversations] = useState(() => {
    const saved = localStorage.getItem('aether_conversations');
    return saved ? JSON.parse(saved) : INITIAL_CONVERSATIONS;
  });
  
  const [activeConversationId, setActiveConversationId] = useState(null);

  const [folders, setFolders] = useState(FOLDERS);
  const [activeModelId, setActiveModelId] = useState('gemini-2-5');
  const [activeWorkspaceId, setActiveWorkspaceId] = useState('personal');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState('browser');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [pinnedMessages, setPinnedMessages] = useState([]);

  // Persist conversations
  useEffect(() => {
    localStorage.setItem('aether_conversations', JSON.stringify(conversations));
  }, [conversations]);

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  const createConversation = (folderId = null) => {
    const newChat = {
      id: `chat-${Date.now()}`,
      title: 'New Workspace Chat',
      folderId,
      pinned: false,
      modelId: activeModelId,
      lastUpdated: 'Just now',
      messages: []
    };
    setConversations(prev => [newChat, ...prev]);
    setActiveConversationId(newChat.id);
    return newChat;
  };

  const deleteConversation = (id) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConversationId === id) {
      const remaining = conversations.filter(c => c.id !== id);
      setActiveConversationId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const renameConversation = (id, newTitle) => {
    setConversations(prev => prev.map(c => c.id === id ? { ...c, title: newTitle } : c));
  };

  const togglePinConversation = (id) => {
    setConversations(prev => prev.map(c => c.id === id ? { ...c, pinned: !c.pinned } : c));
  };

  const moveConversationToFolder = (id, folderId) => {
    setConversations(prev => prev.map(c => c.id === id ? { ...c, folderId } : c));
  };

  const handleFileUpload = (filesList) => {
    const newFiles = Array.from(filesList).map(file => {
      const fileId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const fileType = file.name.split('.').pop().toLowerCase();
      
      // Initial upload status
      const meta = {
        id: fileId,
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
        type: fileType,
        status: 'uploading',
        progress: 10,
        uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      // Simulate upload progress
      let p = 10;
      const interval = setInterval(() => {
        p += 30;
        if (p >= 100) {
          p = 100;
          clearInterval(interval);
          setUploadedFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: 'ready', progress: 100 } : f));
        } else {
          setUploadedFiles(prev => prev.map(f => f.id === fileId ? { ...f, progress: p } : f));
        }
      }, 400);

      return meta;
    });

    setUploadedFiles(prev => [...newFiles, ...prev]);
    return newFiles;
  };

  const deleteUploadedFile = (id) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  const clearAllNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  // Asynchronous streaming reply simulation
  const sendMessage = (text, attachments = []) => {
    if (!text.trim() && attachments.length === 0) return;
    if (isStreaming) return;

    let targetChatId = activeConversationId;
    if (!targetChatId) {
      const newChat = createConversation();
      targetChatId = newChat.id;
    }

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Create user message
    const userMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp,
      reactions: [],
      attachments: attachments.map(f => ({ name: f.name, size: f.size, type: f.type, status: 'ready' }))
    };

    // Update conversation with user message
    setConversations(prev => prev.map(c => {
      if (c.id === targetChatId) {
        return {
          ...c,
          lastUpdated: 'Just now',
          messages: [...c.messages, userMessage]
        };
      }
      return c;
    }));

    // Trigger AI response streaming
    setIsStreaming(true);
    
    // Create empty message for streaming
    const aiMessageId = `msg-${Date.now() + 1}`;
    const aiMessagePlaceholder = {
      id: aiMessageId,
      sender: 'assistant',
      text: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reactions: [],
      feedback: null
    };

    setConversations(prev => prev.map(c => {
      if (c.id === targetChatId) {
        return {
          ...c,
          messages: [...c.messages, aiMessagePlaceholder]
        };
      }
      return c;
    }));

    // Define simulated responses based on model and text
    const activeModel = MODELS.find(m => m.id === activeModelId) || MODELS[0];
    const rawResponses = [
      `As **${activeModel.name}**, I have successfully intercepted your instruction and scanned the connected workspaces. 

Based on our Vector DB metadata and active MCP profiles:
* Document ingestion: Completed
* Embeddings calculated: **3,072 dimensions** via \`text-embedding-3-large\`
* Query latency: **14ms**

Would you like to trigger a secondary web research sweep via the Browser Agent to aggregate current references?`,
      
      `Understood. I've initiated the local sandbox code interpreter. Below is a plot analysis script checking token usage versus RAG similarity density:

\`\`\`python
# Simulation of response speed vs chunk overlaps
import numpy as np

def calculate_rag_efficiency(chunks, overlap_rate=0.20):
    latency_multiplier = 1.0 + (overlap_rate * 1.5)
    retrieval_accuracy = 1.0 - np.exp(-chunks / 100.0)
    return retrieval_accuracy / latency_multiplier

print(f"RAG accuracy score: {calculate_rag_efficiency(150):.4f}")
\`\`\`

Here is a quick model analysis table:

| Parameter | Current Node | Target Weight | Status |
| :--- | :--- | :--- | :--- |
| Latency | 12ms | <15ms | Optimized |
| Vector Chunks | 142 units | 500 units | Scaling |
| MCP Links | 3 servers | 5 servers | Active |
`
    ];

    const targetResponseText = text.toLowerCase().includes('code') || text.toLowerCase().includes('table') 
      ? rawResponses[1] 
      : rawResponses[0];

    const words = targetResponseText.split(/(\s+)/);
    let wordIndex = 0;
    let currentText = '';

    const streamInterval = setInterval(() => {
      if (wordIndex < words.length) {
        currentText += words[wordIndex];
        setConversations(prev => prev.map(c => {
          if (c.id === targetChatId) {
            return {
              ...c,
              messages: c.messages.map(m => m.id === aiMessageId ? { ...m, text: currentText } : m)
            };
          }
          return c;
        }));
        wordIndex++;
      } else {
        clearInterval(streamInterval);
        setIsStreaming(false);
      }
    }, 35);
  };

  const regenerateResponse = (messageId) => {
    if (isStreaming || !activeConversation) return;
    
    // Find index of message
    const msgIndex = activeConversation.messages.findIndex(m => m.id === messageId);
    if (msgIndex === -1) return;
    
    // Clear and restream
    setIsStreaming(true);
    setConversations(prev => prev.map(c => {
      if (c.id === activeConversationId) {
        const updated = [...c.messages];
        updated[msgIndex] = {
          ...updated[msgIndex],
          text: '',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        return { ...c, messages: updated };
      }
      return c;
    }));

    const regenerateText = `*System regenerated response via **${MODELS.find(m => m.id === activeModelId)?.name || 'Model'}** at ${new Date().toLocaleTimeString()}* \n\nI have recalibrated our context similarity index. The query has been re-evaluated. Our active MCP connection to \`postgres-db\` reports normal execution limits. Let me know if we need to inspect specific tables.`;

    const words = regenerateText.split(/(\s+)/);
    let wordIndex = 0;
    let currentText = '';

    const streamInterval = setInterval(() => {
      if (wordIndex < words.length) {
        currentText += words[wordIndex];
        setConversations(prev => prev.map(c => {
          if (c.id === activeConversationId) {
            const updated = [...c.messages];
            updated[msgIndex] = { ...updated[msgIndex], text: currentText };
            return { ...c, messages: updated };
          }
          return c;
        }));
        wordIndex++;
      } else {
        clearInterval(streamInterval);
        setIsStreaming(false);
      }
    }, 35);
  };

  const handleLikeDislike = (messageId, status) => {
    setConversations(prev => prev.map(c => {
      if (c.id === activeConversationId) {
        return {
          ...c,
          messages: c.messages.map(m => m.id === messageId ? { ...m, feedback: m.feedback === status ? null : status } : m)
        };
      }
      return c;
    }));
  };

  const handleAddReaction = (messageId, emoji) => {
    setConversations(prev => prev.map(c => {
      if (c.id === activeConversationId) {
        return {
          ...c,
          messages: c.messages.map(m => {
            if (m.id === messageId) {
              const reactions = m.reactions || [];
              const exists = reactions.includes(emoji);
              return {
                ...m,
                reactions: exists ? reactions.filter(r => r !== emoji) : [...reactions, emoji]
              };
            }
            return m;
          })
        };
      }
      return c;
    }));
  };

  const editUserMessage = (messageId, newText) => {
    setConversations(prev => prev.map(c => {
      if (c.id === activeConversationId) {
        // Edit message, truncate history after this message and trigger new AI message stream
        const msgIdx = c.messages.findIndex(m => m.id === messageId);
        if (msgIdx === -1) return c;
        const truncatedMessages = c.messages.slice(0, msgIdx + 1);
        truncatedMessages[msgIdx] = { ...truncatedMessages[msgIdx], text: newText };
        return { ...c, messages: truncatedMessages };
      }
      return c;
    }));

    setTimeout(() => {
      sendMessage(newText);
    }, 200);
  };

  const togglePinMessage = (message) => {
    setPinnedMessages(prev => {
      const exists = prev.some(m => m.id === message.id);
      return exists ? prev.filter(m => m.id !== message.id) : [...prev, message];
    });
  };

  return (
    <ChatContext.Provider value={{
      conversations,
      activeConversationId,
      activeConversation,
      folders,
      activeModelId,
      activeWorkspaceId,
      isSidebarCollapsed,
      isRightPanelOpen,
      rightPanelTab,
      searchQuery,
      uploadedFiles,
      isStreaming,
      notifications,
      pinnedMessages,
      setActiveConversationId,
      setActiveModelId,
      setActiveWorkspaceId,
      setIsSidebarCollapsed,
      setIsRightPanelOpen,
      setRightPanelTab,
      setSearchQuery,
      createConversation,
      deleteConversation,
      renameConversation,
      togglePinConversation,
      moveConversationToFolder,
      handleFileUpload,
      deleteUploadedFile,
      sendMessage,
      regenerateResponse,
      handleLikeDislike,
      handleAddReaction,
      editUserMessage,
      togglePinMessage,
      markNotificationRead,
      clearAllNotifications
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
