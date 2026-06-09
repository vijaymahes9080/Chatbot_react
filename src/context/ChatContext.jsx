import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_CONVERSATIONS, FOLDERS, MODELS, WORKSPACES, NOTIFICATIONS } from '../utils/mockData';
import { api } from '../utils/api';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [folders, setFolders] = useState([]);
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

  // Fetch Folders and Conversations from backend database on load
  useEffect(() => {
    const loadData = async () => {
      try {
        const dbFolders = await api.getFolders();
        setFolders(dbFolders);

        const dbChats = await api.getChats();
        setConversations(dbChats);
        
        if (dbChats.length > 0) {
          setActiveConversationId(dbChats[0].id);
        }
      } catch (err) {
        console.error('Failed to load initial data from API', err);
      }
    };
    loadData();
  }, []);

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  const createConversation = async (folderId = null) => {
    const chatId = `chat-${Date.now()}`;
    const newChat = {
      id: chatId,
      title: 'New Workspace Chat',
      folderId,
      pinned: false,
      modelId: activeModelId,
      lastUpdated: 'Just now',
      messages: []
    };
    
    setConversations(prev => [newChat, ...prev]);
    setActiveConversationId(chatId);

    // Call API async
    await api.createChat(chatId, newChat.title, folderId, activeModelId);
    return newChat;
  };

  const deleteConversation = async (id) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConversationId === id) {
      const remaining = conversations.filter(c => c.id !== id);
      setActiveConversationId(remaining.length > 0 ? remaining[0].id : null);
    }
    await api.deleteChat(id);
  };

  const renameConversation = async (id, newTitle) => {
    setConversations(prev => prev.map(c => c.id === id ? { ...c, title: newTitle } : c));
    await api.renameChat(id, newTitle);
  };

  const togglePinConversation = (id) => {
    setConversations(prev => prev.map(c => c.id === id ? { ...c, pinned: !c.pinned } : c));
  };

  const moveConversationToFolder = async (id, folderId) => {
    setConversations(prev => prev.map(c => c.id === id ? { ...c, folderId } : c));
    await api.moveChat(id, folderId);
  };

  const handleFileUpload = async (filesList) => {
    const newFiles = await Promise.all(Array.from(filesList).map(async file => {
      const fileId = `file-uploading-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const fileType = file.name.split('.').pop().toLowerCase();
      
      const meta = {
        id: fileId,
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
        type: fileType,
        status: 'uploading',
        progress: 20,
        uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setUploadedFiles(prev => [meta, ...prev]);

      try {
        const uploadedDoc = await api.uploadFile(file, activeConversationId);
        setUploadedFiles(prev => prev.map(f => f.id === fileId ? {
          id: uploadedDoc.id,
          name: uploadedDoc.name,
          size: uploadedDoc.size,
          type: uploadedDoc.type,
          status: 'ready',
          progress: 100,
          uploadedAt: uploadedDoc.uploadedAt
        } : f));
        return uploadedDoc;
      } catch (err) {
        console.error('File upload failed:', err);
        setUploadedFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: 'error' } : f));
        return { ...meta, status: 'error' };
      }
    }));

    return newFiles;
  };

  const deleteUploadedFile = async (id) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
    if (!id.startsWith('file-uploading-')) {
      await api.deleteFile(id);
    }
  };

  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  const clearAllNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const sendMessage = async (text, attachments = []) => {
    if (!text.trim() && attachments.length === 0) return;
    if (isStreaming) return;

    let targetChatId = activeConversationId;
    if (!targetChatId) {
      const newChat = await createConversation();
      targetChatId = newChat.id;
    }

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsgId = `msg-${Date.now()}`;
    
    const userMessage = {
      id: userMsgId,
      sender: 'user',
      text,
      timestamp,
      reactions: [],
      attachments: attachments.map(f => ({ name: f.name, size: f.size, type: f.type, status: 'ready' }))
    };

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

    setIsStreaming(true);
    
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

    await api.sendMessageStream(
      targetChatId,
      userMsgId,
      text,
      attachments,
      (chunk) => {
        if (chunk.accumulated !== undefined) {
          setConversations(prev => prev.map(c => {
            if (c.id === targetChatId) {
              return {
                ...c,
                messages: c.messages.map(m => m.id === aiMessageId ? {
                  ...m,
                  text: chunk.accumulated,
                  isMermaid: chunk.is_mermaid || m.isMermaid,
                  mermaidCode: chunk.mermaid_code || m.mermaidCode,
                  isChart: chunk.is_chart || m.isChart,
                  chartType: chunk.chart_type || m.chartType
                } : m)
              };
            }
            return c;
          }));
        }
      },
      (doneData) => {
        setConversations(prev => prev.map(c => {
          if (c.id === targetChatId) {
            return {
              ...c,
              messages: c.messages.map(m => m.id === aiMessageId ? {
                ...m,
                text: doneData.accumulated,
                isMermaid: doneData.is_mermaid,
                mermaidCode: doneData.mermaid_code,
                isChart: doneData.is_chart,
                chartType: doneData.chart_type,
                tokensUsed: doneData.tokens_used,
                cost: doneData.cost,
                latencyMs: doneData.latency_ms
              } : m)
            };
          }
          return c;
        }));
        setIsStreaming(false);
      }
    );
  };

  const regenerateResponse = async (messageId) => {
    if (isStreaming || !activeConversation) return;
    
    const msgIndex = activeConversation.messages.findIndex(m => m.id === messageId);
    if (msgIndex === -1) return;
    
    const userPromptMsg = activeConversation.messages[msgIndex - 1];
    const promptText = userPromptMsg ? userPromptMsg.text : "Please regenerate response";

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

    await api.sendMessageStream(
      activeConversationId,
      userPromptMsg?.id || `msg-regen-${Date.now()}`,
      promptText,
      [],
      (chunk) => {
        if (chunk.accumulated !== undefined) {
          setConversations(prev => prev.map(c => {
            if (c.id === activeConversationId) {
              const updated = [...c.messages];
              updated[msgIndex] = {
                ...updated[msgIndex],
                text: chunk.accumulated,
                isMermaid: chunk.is_mermaid || updated[msgIndex].isMermaid,
                mermaidCode: chunk.mermaid_code || updated[msgIndex].mermaidCode,
                isChart: chunk.is_chart || updated[msgIndex].isChart,
                chartType: chunk.chart_type || updated[msgIndex].chartType
              };
              return { ...c, messages: updated };
            }
            return c;
          }));
        }
      },
      (doneData) => {
        setConversations(prev => prev.map(c => {
          if (c.id === activeConversationId) {
            const updated = [...c.messages];
            updated[msgIndex] = {
              ...updated[msgIndex],
              text: doneData.accumulated,
              isMermaid: doneData.is_mermaid,
              mermaidCode: doneData.mermaid_code,
              isChart: doneData.is_chart,
              chartType: doneData.chart_type,
              tokensUsed: doneData.tokens_used,
              cost: doneData.cost,
              latencyMs: doneData.latency_ms
            };
            return { ...c, messages: updated };
          }
          return c;
        }));
        setIsStreaming(false);
      }
    );
  };

  const handleLikeDislike = async (messageId, status) => {
    setConversations(prev => prev.map(c => {
      if (c.id === activeConversationId) {
        return {
          ...c,
          messages: c.messages.map(m => m.id === messageId ? { ...m, feedback: m.feedback === status ? null : status } : m)
        };
      }
      return c;
    }));

    await api.likeDislikeMessage(messageId, status);
  };

  const handleAddReaction = async (messageId, emoji) => {
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

    await api.toggleReaction(messageId, emoji);
  };

  const editUserMessage = (messageId, newText) => {
    setConversations(prev => prev.map(c => {
      if (c.id === activeConversationId) {
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

  const togglePinMessage = async (message) => {
    setPinnedMessages(prev => {
      const exists = prev.some(m => m.id === message.id);
      return exists ? prev.filter(m => m.id !== message.id) : [...prev, message];
    });

    await api.pinMessage(message.id);
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
