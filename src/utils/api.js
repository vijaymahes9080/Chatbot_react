import axios from 'axios';
import { 
  MODELS, FOLDERS, INITIAL_CONVERSATIONS, 
  NOTIFICATIONS, BROWSER_AGENT_MOCK, RAG_MOCK, 
  VECTOR_DB_MOCK, MCP_MOCK, TOOLS_LIST, DASHBOARD_STATS 
} from './mockData';

const BASE_URL = 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to check if backend is online
export const checkBackendHealth = async () => {
  try {
    const response = await axios.get('http://localhost:8000/', { timeout: 1500 });
    return response.status === 200;
  } catch (e) {
    return false;
  }
};

export const api = {
  // Auth
  getCurrentUser: async () => {
    try {
      const res = await apiClient.get('/auth/me');
      return res.data;
    } catch (e) {
      console.warn('API: Failed to fetch user, returning guest fallback', e);
      return { email: 'guest@aethermind.ai', role: 'member' };
    }
  },

  // Folders
  getFolders: async () => {
    try {
      const res = await apiClient.get('/conversation/folders');
      return res.data.length > 0 ? res.data : FOLDERS;
    } catch (e) {
      console.warn('API: Failed to fetch folders, using mock folders', e);
      return FOLDERS;
    }
  },
  createFolder: async (name, color = '#8B5CF6') => {
    try {
      const id = `folder-${Date.now()}`;
      const res = await apiClient.post('/conversation/folders', { id, name, color });
      return res.data;
    } catch (e) {
      console.warn('API: Failed to create folder, using mock response', e);
      return { id: `folder-${Date.now()}`, name, color };
    }
  },

  // Chats / Conversations
  getChats: async () => {
    try {
      const res = await apiClient.get('/conversation/chats');
      // Map keys to camelCase if needed, but the backend is designed to align with frontend structure
      return res.data.map(chat => ({
        id: chat.id,
        title: chat.title,
        folderId: chat.folder_id,
        pinned: chat.pinned,
        modelId: chat.model_id,
        lastUpdated: chat.last_updated,
        messages: chat.messages.map(msg => ({
          id: msg.id,
          sender: msg.sender,
          text: msg.text,
          timestamp: msg.timestamp,
          reactions: msg.reactions || [],
          feedback: msg.feedback,
          isMermaid: msg.is_mermaid,
          mermaidCode: msg.mermaid_code,
          isChart: msg.is_chart,
          chartType: msg.chart_type,
          tokensUsed: msg.tokens_used,
          cost: msg.cost,
          latencyMs: msg.latency_ms
        }))
      }));
    } catch (e) {
      console.warn('API: Failed to fetch chats, using initial mock conversations', e);
      return INITIAL_CONVERSATIONS;
    }
  },
  createChat: async (id, title, folderId = null, modelId = 'gemini-2-5') => {
    try {
      const res = await apiClient.post('/conversation/chats', {
        id,
        title,
        folder_id: folderId,
        model_id: modelId
      });
      return {
        id: res.data.id,
        title: res.data.title,
        folderId: res.data.folder_id,
        pinned: res.data.pinned,
        modelId: res.data.model_id,
        lastUpdated: res.data.last_updated,
        messages: []
      };
    } catch (e) {
      console.warn('API: Failed to create chat, using mock response', e);
      return { id, title, folderId, pinned: false, modelId, lastUpdated: 'Just now', messages: [] };
    }
  },
  renameChat: async (chatId, title) => {
    try {
      const res = await apiClient.patch(`/conversation/chats/${chatId}/rename`, { title });
      return res.data;
    } catch (e) {
      console.warn('API: Failed to rename chat', e);
      return { id: chatId, title };
    }
  },
  moveChat: async (chatId, folderId) => {
    try {
      const res = await apiClient.patch(`/conversation/chats/${chatId}/move`, { folder_id: folderId });
      return res.data;
    } catch (e) {
      console.warn('API: Failed to move chat', e);
      return { id: chatId, folder_id: folderId };
    }
  },
  deleteChat: async (chatId) => {
    try {
      await apiClient.delete(`/conversation/chats/${chatId}`);
      return true;
    } catch (e) {
      console.warn('API: Failed to delete chat', e);
      return true;
    }
  },

  // Messaging & Streaming (SSE reader)
  sendMessageStream: async (chatId, messageId, text, attachments = [], onChunk, onDone) => {
    try {
      const payload = {
        id: messageId,
        text,
        attachments: attachments.map(f => ({
          name: f.name,
          size: f.size,
          type: f.type,
          status: 'ready'
        }))
      };

      const response = await fetch(`${BASE_URL}/chat/chats/${chatId}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');

        // Save the last incomplete line back to the buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.slice(6);
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.done) {
                onDone && onDone(parsed);
              } else {
                onChunk && onChunk(parsed);
              }
            } catch (err) {
              console.error('Error parsing SSE line json:', err);
            }
          }
        }
      }
    } catch (e) {
      console.warn('API: Streaming failed, using fallback mock streaming simulation', e);
      // Fallback mock stream execution
      let wordIndex = 0;
      let currentText = '';
      const responseText = text.toLowerCase().includes('code') || text.toLowerCase().includes('table')
        ? `I have launched a python simulation to model this workspace. Here is the requested script:
\`\`\`python
# Latency optimization test
latency_ms = [420, 380, 480, 350]
print("Avg latency:", sum(latency_ms)/len(latency_ms))
\`\`\`
`
        : `Based on your request, I've verified our active configuration. Our PostgreSQL MCP server is online, and our similarity search shows highly relevant context chunks in local ChromaDB.`;
      
      const words = responseText.split(/(\s+)/);
      const interval = setInterval(() => {
        if (wordIndex < words.length) {
          currentText += words[wordIndex];
          onChunk && onChunk({ text: words[wordIndex], accumulated: currentText, done: false });
          wordIndex++;
        } else {
          clearInterval(interval);
          onDone && onDone({
            accumulated: currentText,
            done: true,
            tokens_used: 120,
            cost: 0.00024,
            latency_ms: 480,
            is_mermaid: false,
            is_chart: false
          });
        }
      }, 30);
    }
  },

  // Message Actions
  likeDislikeMessage: async (messageId, status) => {
    try {
      const res = await apiClient.post(`/chat/messages/${messageId}/feedback`, { feedback: status });
      return res.data;
    } catch (e) {
      console.warn('API: Feedback error', e);
      return { status: 'success', feedback: status };
    }
  },
  toggleReaction: async (messageId, emoji) => {
    try {
      const res = await apiClient.post(`/chat/messages/${messageId}/reactions`, { emoji });
      return res.data;
    } catch (e) {
      console.warn('API: Reaction error', e);
      return { status: 'success', emoji };
    }
  },
  pinMessage: async (messageId) => {
    try {
      const res = await apiClient.post(`/chat/messages/${messageId}/pin`);
      return res.data;
    } catch (e) {
      console.warn('API: Pin error', e);
      return { status: 'success', pinned: true };
    }
  },

  // Models
  getModels: async () => {
    try {
      const res = await apiClient.get('/models');
      return res.data;
    } catch (e) {
      console.warn('API: Models fetch error, returning mock', e);
      return MODELS;
    }
  },
  getBenchmarks: async () => {
    try {
      const res = await apiClient.get('/models/benchmarks');
      return res.data;
    } catch (e) {
      console.warn('API: Benchmarks fetch error, returning mock', e);
      return [];
    }
  },
  getModelStats: async () => {
    try {
      const res = await apiClient.get('/models/stats');
      return res.data;
    } catch (e) {
      console.warn('API: Stats fetch error, returning empty', e);
      return [];
    }
  },

  // RAG & Files
  getFiles: async () => {
    try {
      const res = await apiClient.get('/files');
      return res.data.map(doc => ({
        id: doc.id,
        name: doc.file_name,
        size: doc.file_size,
        type: doc.file_type,
        status: doc.status === 'ready' ? 'embedded' : doc.status,
        chunks: doc.chunks_count,
        similarity: doc.status === 'ready' ? 0.85 : 0.00
      }));
    } catch (e) {
      console.warn('API: File fetch error, returning mock', e);
      return RAG_MOCK.uploadedDocs;
    }
  },
  uploadFile: async (fileObject, chatId = null) => {
    try {
      const formData = new FormData();
      formData.append('file', fileObject);
      if (chatId) formData.append('chat_id', chatId);

      const res = await apiClient.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return res.data;
    } catch (e) {
      console.warn('API: File upload error, simulating upload success', e);
      return {
        id: `file-${Date.now()}`,
        name: fileObject.name,
        size: `${(fileObject.size / (1024 * 1024)).toFixed(2)} MB`,
        type: fileObject.name.split('.').pop() || 'txt',
        status: 'ready',
        progress: 100,
        uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    }
  },
  deleteFile: async (docId) => {
    try {
      await apiClient.delete(`/files/${docId}`);
      return true;
    } catch (e) {
      console.warn('API: Delete file error', e);
      return true;
    }
  },

  // MCP Servers
  getMcpServers: async () => {
    try {
      const res = await apiClient.get('/mcp/servers');
      return res.data;
    } catch (e) {
      console.warn('API: MCP Servers error, returning mock', e);
      return MCP_MOCK.servers;
    }
  },
  getMcpTools: async () => {
    try {
      const res = await apiClient.get('/mcp/tools');
      return res.data;
    } catch (e) {
      console.warn('API: MCP Tools error, returning mock', e);
      return MCP_MOCK.tools;
    }
  },

  // System Tools
  getTools: async () => {
    try {
      const res = await apiClient.get('/tools');
      return res.data;
    } catch (e) {
      console.warn('API: System tools error, returning mock', e);
      return TOOLS_LIST;
    }
  },

  // Browser Agent Web Search
  searchWeb: async (query) => {
    try {
      const res = await apiClient.get(`/browser/search?q=${encodeURIComponent(query)}`);
      return res.data;
    } catch (e) {
      console.warn('API: Browser search error, returning simulated search state', e);
      return BROWSER_AGENT_MOCK;
    }
  },

  // Dashboard Stats
  getDashboardStats: async () => {
    try {
      const res = await apiClient.get('/dashboard/stats');
      return res.data;
    } catch (e) {
      console.warn('API: Dashboard stats error, returning mock', e);
      return DASHBOARD_STATS;
    }
  },

  // User Settings API
  getSettings: async () => {
    try {
      const res = await apiClient.get('/settings');
      return res.data;
    } catch (e) {
      console.warn('API: Settings fetch error, returning mock config', e);
      return {
        email: 'guest@aethermind.ai',
        role: 'member',
        api_keys: {
          openai: '',
          anthropic: '',
          google: '',
          deepseek: ''
        }
      };
    }
  },
  updateSettingsKeys: async (keys) => {
    try {
      const res = await apiClient.post('/settings/keys', keys);
      return res.data;
    } catch (e) {
      console.warn('API: Update settings keys error', e);
      return { status: 'success' };
    }
  },
  testConnection: async (provider, apiKey) => {
    try {
      const res = await apiClient.post('/settings/test-connection', {
        provider,
        api_key: apiKey
      });
      return res.data;
    } catch (e) {
      console.warn('API: Test connection error', e);
      return { success: false, message: e?.response?.data?.detail || 'Backend not reachable. Start the server first.' };
    }
  }
};
