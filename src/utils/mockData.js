// Mock Data for the AetherMind AI Workstation

export const MODELS = [
  { id: 'gpt-5', name: 'GPT-5 Ultra', provider: 'OpenAI', icon: 'zap', desc: 'Next-gen reasoning & complex problem solving' },
  { id: 'claude-3-7', name: 'Claude 3.7 Sonnet', provider: 'Anthropic', icon: 'shield', desc: 'Refined coding & highly accurate Markdown analysis' },
  { id: 'gemini-2-5', name: 'Gemini 2.5 Flash', provider: 'Google', icon: 'sparkles', desc: 'Multimodal processing & speed-optimized search' },
  { id: 'deepseek-r1', name: 'DeepSeek-R1', provider: 'DeepSeek', icon: 'activity', desc: 'Deep reinforcement reasoning & math proofs' },
  { id: 'llama-3-3', name: 'Llama 3.3 70B', provider: 'Meta', icon: 'globe', desc: 'Open-weights agentic workflow orchestrator' },
  { id: 'mistral-large', name: 'Mistral Large 2', provider: 'Mistral', icon: 'wind', desc: 'Advanced multi-lingual context compliance' }
];

export const WORKSPACES = [
  { id: 'personal', name: 'Personal Workspace', type: 'individual' },
  { id: 'deepmind-dev', name: 'DeepMind Dev Team', type: 'team' },
  { id: 'enterprise-rnd', name: 'Enterprise R&D', type: 'enterprise' }
];

export const TEAMS = [
  { id: 'core-ai', name: 'Core AI Eng', members: 12 },
  { id: 'product-design', name: 'UI/UX Guild', members: 4 },
  { id: 'mcp-integrations', name: 'Protocol Ops', members: 8 }
];

export const FOLDERS = [
  { id: 'f-research', name: 'AI Research & RAG', color: '#8B5CF6' },
  { id: 'f-code', name: 'System Refactoring', color: '#10B981' },
  { id: 'f-agents', name: 'MCP Agent Workflows', color: '#EC4899' }
];

export const INITIAL_CONVERSATIONS = [
  {
    id: 'chat-1',
    title: 'Optimizing RAG Embeddings',
    folderId: 'f-research',
    pinned: false,
    modelId: 'gemini-2-5',
    lastUpdated: '2 hours ago',
    messages: [
      {
        id: 'm1',
        sender: 'user',
        text: 'How can we solve vector collision issues when processing large semantic chunks of academic PDFs?',
        timestamp: '10:24 AM',
        reactions: ['👍'],
        attachments: [{ name: 'vector_indexing_guide.pdf', size: '2.4 MB', type: 'pdf', status: 'ready' }]
      },
      {
        id: 'm2',
        sender: 'assistant',
        timestamp: '10:25 AM',
        text: `Vector collisions typically happen when chunk sizes are either too small (causing loss of contextual uniqueness) or too large (averaging out semantic signals). 

Here are the primary architectural solutions:

### 1. Hierarchical Chunking (Parent-Child)
Rather than index-only chunks, separate the **indexing structure** from the **synthesizing context**:
* **Parent Chunks:** 1024–2048 tokens (retained for generation).
* **Child Chunks:** 256 tokens overlapping by 20% (indexed in vector database for retrieval).

### 2. Multi-Vector Indexing (Late Interaction)
Use ColBERT-style token-level embeddings instead of full-text embeddings:

$$\\text{Similarity}(q, d) = \\sum_{i \\in q} \\max_{j \\in d} (E_{q,i} \\cdot E_{d,j})$$

This retains specific keyword signals within broader semantic contexts.

Here is an example structure of a hybrid vector search request:

\`\`\`python
import pinecone

def search_hybrid_chunks(query, namespace="academic-papers"):
    # Generate dense vector from text-embedding-3
    dense_vector = client.embeddings.create(input=query, model="text-embedding-3-large")
    
    # Run hybrid vector search against Pinecone
    index = pinecone.Index("research-base")
    results = index.query(
        vector=dense_vector.data[0].embedding,
        top_k=5,
        namespace=namespace,
        include_metadata=True
    )
    return results
\`\`\`

Here is a visual map of the retrieval flow:
`,
        isMermaid: true,
        mermaidCode: `graph TD
    A[Raw PDF Document] --> B[Parent-Child Parser]
    B -->|Large Parent| C(Parent Context Store)
    B -->|Small Child| D(Vector DB Indexing)
    E[User Search Query] --> F[Dense Vectorizer]
    F --> G[Pinecone Vector Index]
    D -.-> G
    G -->|Nearest Match| H[Context Reconstructor]
    C -.-> H
    H --> I[AI Synthesis Layer]`,
        isChart: true,
        chartType: 'rag-match',
        reactions: ['🧠', '🔥'],
        feedback: 'like'
      }
    ]
  },
  {
    id: 'chat-2',
    title: 'React 19 System Refactor',
    folderId: 'f-code',
    pinned: false,
    modelId: 'claude-3-7',
    lastUpdated: '1 day ago',
    messages: [
      {
        id: 'm3',
        sender: 'user',
        text: 'What are the main breaking changes when refactoring context providers to React 19?',
        timestamp: 'Yesterday',
        reactions: []
      },
      {
        id: 'm4',
        sender: 'assistant',
        timestamp: 'Yesterday',
        text: `In React 19, context usage has been simplified significantly. You no longer need to use \`<ThemeContext.Provider>\` syntax. You can now use the context object directly as a provider:

\`\`\`diff
- <ThemeContext.Provider value="dark">
+ <ThemeContext value="dark">
    {children}
- </ThemeContext.Provider>
+ </ThemeContext>
\`\`\`

Additionally, you can read context inside conditions or loops using the new \`use\` hook:

\`\`\`javascript
import { use } from 'react';
import { ThemeContext } from './ThemeContext';

function Button() {
  const theme = use(ThemeContext); // Replaces useContext(ThemeContext)
  return <button className={theme}>Click Me</button>;
}
\`\`\`
`,
        reactions: []
      }
    ]
  },
  {
    id: 'chat-3',
    title: 'Model Context Protocol (MCP) Setup',
    folderId: 'f-agents',
    pinned: false,
    modelId: 'deepseek-r1',
    lastUpdated: '3 days ago',
    messages: [
      {
        id: 'm5',
        sender: 'user',
        text: 'Set up an MCP configuration connecting our PostgreSQL database to Claude.',
        timestamp: '3 days ago',
        reactions: []
      },
      {
        id: 'm6',
        sender: 'assistant',
        timestamp: '3 days ago',
        text: `To hook up PostgreSQL database access to an MCP server, edit your Claude Desktop config file:

\`\`\`json
{
  "mcpServers": {
    "postgres-db": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://localhost:5432/mcp_development"
      ]
    }
  }
}
\`\`\`
`,
        reactions: []
      }
    ]
  }
];

export const NOTIFICATIONS = [
  { id: 'n1', title: 'New Model Added', message: 'DeepSeek-R1 is now available for reasoning tests.', time: '10m ago', unread: true },
  { id: 'n2', title: 'MCP Connection Alerts', message: 'Postgres MCP Server reconnected successfully.', time: '1h ago', unread: false },
  { id: 'n3', title: 'Storage Capacity', message: 'Vector database ChromaDB is reaching 85% storage.', time: '1d ago', unread: false }
];

// Browser Tool Simulation Mock Data
export const BROWSER_AGENT_MOCK = {
  status: 'researching', // researching, idle, error
  currentUrl: 'https://arxiv.org/list/cs.CL/recent',
  searchQuery: 'late interaction multi-vector search models 2026',
  visitedPages: [
    { title: 'arXiv CS.CL Recent Submissions', url: 'https://arxiv.org/list/cs.CL/recent', status: 200 },
    { title: 'ColBERT-v2: Effective and Efficient Retrieval', url: 'https://arxiv.org/abs/2112.01488', status: 200 },
    { title: 'Multi-Vector RAG Architectures', url: 'https://cohere.com/blog/multi-vector-rag', status: 200 }
  ],
  searchResults: [
    { title: 'ColBERTv2: Effective Late Interaction Retriever', snippet: 'Introduces token-level late interaction based on ColBERT, enhancing vector retrieval matching for long queries.', url: 'https://arxiv.org/abs/2112.01488' },
    { title: 'PLAID: Parallel Late Interaction for Information Retrieval', snippet: 'Implements indexing structures that speed up token-level late interaction searches by 10x with 1% loss in recall.', url: 'https://arxiv.org/abs/2205.04356' }
  ],
  timeline: [
    { step: 'Initialize browser search query', status: 'done', time: '10:24:02' },
    { step: 'Scrape search results from DuckDuckGo API', status: 'done', time: '10:24:04' },
    { step: 'Navigate to arxiv.org and extract paper abstract metadata', status: 'done', time: '10:24:07' },
    { step: 'Parse multi-vector chunk weights and synthesize summaries', status: 'running', time: '10:24:09' }
  ],
  logs: [
    '[INFO] Browser subagent initialized on port 9222',
    '[SEARCH] Query: "late interaction multi-vector search models 2026"',
    '[GET] https://arxiv.org/list/cs.CL/recent - Status 200 OK (843ms)',
    '[PARSE] Extracted 3 paper listings for late interaction indexing',
    '[DOWNLOAD] Parsing PDF document chunk maps...'
  ]
};

// Retrieval-Augmented Generation (RAG) Simulation Mock Data
export const RAG_MOCK = {
  knowledgeBase: 'R&D Knowledge Core',
  uploadedDocs: [
    { id: 'doc-1', name: 'vector_indexing_guide.pdf', size: '2.4 MB', chunks: 142, status: 'embedded', similarity: 0.94 },
    { id: 'doc-2', name: 'react19_concurrency_guide.docx', size: '890 KB', chunks: 52, status: 'embedded', similarity: 0.81 },
    { id: 'doc-3', name: 'quarterly_financials.xlsx', size: '1.2 MB', chunks: 88, status: 'parsing', similarity: 0.00 }
  ],
  chunks: [
    { id: 'ch-1', text: '...Multi-Vector late interaction models allow search tokens to match index tokens individually, bypassing representation collapse...', score: 0.942, source: 'vector_indexing_guide.pdf [Page 4]' },
    { id: 'ch-2', text: '...Use parent-child document parsing to maintain large context windows during semantic LLM synthesis, improving citations...', score: 0.887, source: 'vector_indexing_guide.pdf [Page 12]' }
  ],
  embeddingStatus: { progress: 100, model: 'text-embedding-3-large', dimension: 3072 }
};

// Vector Database Simulation Mock Data
export const VECTOR_DB_MOCK = {
  providers: {
    pinecone: { name: 'Pinecone', collections: 3, namespaces: 8, embeddings: 420500, status: 'healthy', usage: '1.2 GB', latency: '12ms' },
    weaviate: { name: 'Weaviate Cloud', collections: 1, namespaces: 2, embeddings: 98000, status: 'healthy', usage: '340 MB', latency: '18ms' },
    qdrant: { name: 'Qdrant Cloud', collections: 2, namespaces: 4, embeddings: 154000, status: 'healthy', usage: '512 MB', latency: '15ms' },
    chroma: { name: 'ChromaDB Local', collections: 5, namespaces: 12, embeddings: 48000, status: 'warning', usage: '1.8 GB', latency: '42ms' },
    milvus: { name: 'Milvus Cluster', collections: 10, namespaces: 32, embeddings: 4500000, status: 'healthy', usage: '12.4 GB', latency: '9ms' }
  },
  activeProvider: 'pinecone'
};

// Model Context Protocol (MCP) Mock Data
export const MCP_MOCK = {
  servers: [
    { id: 's-pg', name: 'postgres-db', health: 'healthy', conn: 3, version: '1.0.4', capabilities: ['resources', 'tools'] },
    { id: 's-fs', name: 'filesystem-local', health: 'healthy', conn: 1, version: '1.1.0', capabilities: ['resources', 'tools', 'prompts'] },
    { id: 's-git', name: 'github-agent', health: 'healthy', conn: 2, version: '0.9.3', capabilities: ['tools'] },
    { id: 's-slack', name: 'slack-connector', health: 'offline', conn: 0, version: '0.8.0', capabilities: ['tools'] }
  ],
  tools: [
    { server: 'postgres-db', name: 'query_db', desc: 'Execute read-only SQL queries on the postgres database', schema: 'SELECT * FROM users LIMIT 10' },
    { server: 'filesystem-local', name: 'read_file', desc: 'Read file contents from local absolute paths', schema: 'path: string' },
    { server: 'github-agent', name: 'create_pr', desc: 'Create branch and pull request with code delta', schema: 'repo: string, branch: string, title: string' }
  ],
  logs: [
    '[10:24:10] MCP Postgres handshake initiated successfully.',
    '[10:24:11] Registered 4 tools from pg-mcp-server.',
    '[10:24:15] Server GitHub connected. API Token authenticated.',
    '[10:25:01] WARNING: Slack MCP failed handshake - timeout 5000ms.'
  ]
};

// Tools List Grid Mock Data
export const TOOLS_LIST = [
  { id: 't-browser', name: 'Browser Tool', status: 'running', duration: '2.4s', result: 'Extracted 3 research citations', icon: 'globe', type: 'system' },
  { id: 't-calc', name: 'Calculator Tool', status: 'idle', duration: '0.1s', result: 'Answer: 843,204.12', icon: 'calculator', type: 'local' },
  { id: 't-interpreter', name: 'Code Interpreter', status: 'idle', duration: '4.8s', result: 'Compiled python plot successfully', icon: 'code', type: 'sandbox' },
  { id: 't-file', name: 'File Reader', status: 'idle', duration: '0.3s', result: 'Read react19_concurrency_guide.docx (12,400 chars)', icon: 'file-text', type: 'system' },
  { id: 't-db', name: 'Database Connector', status: 'idle', duration: '1.2s', result: 'Found 4 matches in postgres.users', icon: 'database', type: 'mcp' },
  { id: 't-rag', name: 'RAG Retriever', status: 'success', duration: '0.8s', result: 'Loaded 2 chunks with >0.85 similarity', icon: 'layers', type: 'system' }
];

// Dashboard Analytics Mock Data
export const DASHBOARD_STATS = {
  summary: {
    totalChats: 142,
    messagesCount: 1845,
    tokensUsed: 1245000,
    filesUploaded: 28,
    ragSearches: 412,
    mcpCalls: 89,
    toolUsage: 310,
    apiRequests: 2405,
    responseTime: '420ms',
    userActivity: 'Active (DeepMind Dev Team)'
  },
  charts: {
    weeklyActivity: [
      { day: 'Mon', userMessages: 24, aiMessages: 25, tokens: 45000 },
      { day: 'Tue', userMessages: 32, aiMessages: 34, tokens: 68000 },
      { day: 'Wed', userMessages: 48, aiMessages: 50, tokens: 98000 },
      { day: 'Thu', userMessages: 38, aiMessages: 40, tokens: 72000 },
      { day: 'Fri', userMessages: 55, aiMessages: 58, tokens: 112000 },
      { day: 'Sat', userMessages: 18, aiMessages: 19, tokens: 35000 },
      { day: 'Sun', userMessages: 22, aiMessages: 22, tokens: 41000 }
    ],
    toolDistribution: [
      { name: 'Browser Agent', value: 45 },
      { name: 'Code Interpreter', value: 30 },
      { name: 'Postgres MCP', value: 15 },
      { name: 'Local File Reader', value: 10 }
    ],
    latencyTrend: [
      { hour: '08:00', latency: 450 },
      { hour: '10:00', latency: 380 },
      { hour: '12:00', latency: 420 },
      { hour: '14:00', latency: 480 },
      { hour: '16:00', latency: 390 },
      { hour: '18:00', latency: 350 }
    ],
    ragSimilarityDensity: [
      { score: '0.90-1.00', count: 48 },
      { score: '0.80-0.89', count: 120 },
      { score: '0.70-0.79', count: 85 },
      { score: '0.60-0.69', count: 32 },
      { score: '0.50-0.59', count: 12 }
    ]
  }
};
