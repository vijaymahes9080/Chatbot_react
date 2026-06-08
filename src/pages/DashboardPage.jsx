import React from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  MessageSquare, Cpu, HardDrive, RefreshCw, Layers, 
  Activity, Clock, UserCheck, Play, Box
} from 'lucide-react';
import { DASHBOARD_STATS } from '../utils/mockData';

const DashboardPage = () => {
  const stats = DASHBOARD_STATS.summary;
  const charts = DASHBOARD_STATS.charts;

  // Chart Palettes
  const PIE_COLORS = ['#6366F1', '#A855F7', '#EC4899', '#10B981'];

  const metricCards = [
    { label: 'Conversations', val: stats.totalChats, desc: 'Total chat nodes', icon: <MessageSquare className="h-4 w-4 text-indigo-400" /> },
    { label: 'Tokens Ingested', val: stats.tokensUsed.toLocaleString(), desc: 'Calculated embeddings', icon: <Cpu className="h-4 w-4 text-purple-400" /> },
    { label: 'Files Uploaded', val: stats.filesUploaded, desc: 'Knowledge attachments', icon: <HardDrive className="h-4 w-4 text-pink-400" /> },
    { label: 'RAG Lookups', val: stats.ragSearches, desc: 'Semantic retrieval hits', icon: <Layers className="h-4 w-4 text-emerald-400" /> },
    { label: 'MCP Requests', val: stats.mcpCalls, desc: 'Exposed node executions', icon: <RefreshCw className="h-4 w-4 text-teal-400" /> },
    { label: 'Latency Rate', val: stats.responseTime, desc: 'Average query response', icon: <Clock className="h-4 w-4 text-amber-400" /> }
  ];

  return (
    <div className="h-full overflow-y-auto px-6 py-6 space-y-6 select-none bg-[#05070f]">
      {/* Header Title */}
      <div className="flex items-center justify-between border-b border-chat-border/60 pb-4">
        <div>
          <h1 className="text-xl font-bold font-sans text-slate-100">Analytics Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">Monitor token consumption, RAG searches, and tool response latency profiles.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 font-semibold font-mono">
          <UserCheck className="h-4 w-4" />
          <span>{stats.userActivity}</span>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {metricCards.map((card, idx) => (
          <div key={idx} className="glass-card p-4 rounded-xl border border-white/5 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{card.label}</span>
              {card.icon}
            </div>
            <div>
              <h3 className="text-lg font-bold font-mono text-slate-100">{card.val}</h3>
              <p className="text-[9px] text-slate-500 mt-0.5 truncate">{card.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Layer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Weekly Message Chart */}
        <div className="glass-card p-5 rounded-xl border border-white/5 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Weekly Chat Volumes</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Compares user message entries vs simulated assistant replies.</p>
          </div>
          <div className="h-64 text-slate-400">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.weeklyActivity}>
                <XAxis dataKey="day" stroke="#475569" fontSize={10} tickLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: '#0f172a', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                  itemStyle={{ fontSize: '10px' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                <Bar name="User Queries" dataKey="userMessages" fill="#6366F1" radius={[4, 4, 0, 0]} />
                <Bar name="AI Syntheses" dataKey="aiMessages" fill="#EC4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Latency Trend Area Chart */}
        <div className="glass-card p-5 rounded-xl border border-white/5 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Response Latency (24h)</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Monitors network response durations across scheduling offsets.</p>
          </div>
          <div className="h-64 text-slate-400">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.latencyTrend}>
                <defs>
                  <linearGradient id="latencyGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="hour" stroke="#475569" fontSize={10} tickLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} unit="ms" />
                <Tooltip 
                  contentStyle={{ background: '#0f172a', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                  itemStyle={{ fontSize: '10px' }}
                />
                <Area type="monotone" name="Roundtrip Latency" dataKey="latency" stroke="#8B5CF6" strokeWidth={2} fillOpacity={1} fill="url(#latencyGlow)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tool Ingestion Share Pie Chart */}
        <div className="glass-card p-5 rounded-xl border border-white/5 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Tool Execution Distribution</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Breakdown of tool invocations across workspaces.</p>
          </div>
          <div className="h-64 flex items-center justify-center">
            <div className="w-[60%] h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.toolDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {charts.toolDistribution.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ background: '#0f172a', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '8px' }}
                    itemStyle={{ fontSize: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Custom Legend to match glass aesthetic */}
            <div className="w-[40%] text-slate-300 space-y-2 pr-4 text-[10px]">
              {charts.toolDistribution.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[idx] }} />
                  <span className="truncate flex-1">{item.name}</span>
                  <span className="font-mono text-slate-400">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RAG Similarity Score Density */}
        <div className="glass-card p-5 rounded-xl border border-white/5 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Similarity Score Density</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Aggregates RAG match volumes grouped by score bounds.</p>
          </div>
          <div className="h-64 text-slate-400">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.ragSimilarityDensity} layout="vertical">
                <XAxis type="number" stroke="#475569" fontSize={10} tickLine={false} />
                <YAxis dataKey="score" type="category" stroke="#475569" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: '#0f172a', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '10px' }}
                />
                <Bar name="Matches Count" dataKey="count" fill="#10B981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;
