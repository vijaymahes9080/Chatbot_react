import React, { useState, useEffect } from 'react';
import { 
  Upload, FileText, CheckCircle, Clock, Trash2, Search,
  Compass, ChevronDown, ChevronUp, AlertCircle
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { RAG_MOCK } from '../../utils/mockData';
import { api } from '../../utils/api';

const RagDashboard = () => {
  const { uploadedFiles, handleFileUpload, deleteUploadedFile } = useChat();
  const [ragState] = useState(RAG_MOCK);
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [queryTerm, setQueryTerm] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [similarityResults, setSimilarityResults] = useState(ragState.chunks);

  const loadFiles = async () => {
    try {
      const files = await api.getFiles();
      setUploadedDocs(files);
    } catch (err) {
      console.error('Failed to load RAG files from API', err);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [uploadedFiles]);

  const onDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files) handleFileUpload(e.dataTransfer.files);
  };
  const handleFileChange = (e) => {
    if (e.target.files) handleFileUpload(e.target.files);
  };

  const handleSearchChunks = async (e) => {
    e.preventDefault();
    if (!queryTerm.trim()) {
      setSimilarityResults(ragState.chunks);
      return;
    }
    // Search simulation or live endpoint query
    const matches = uploadedDocs.filter(c => 
      c.name.toLowerCase().includes(queryTerm.toLowerCase())
    );
    setSimilarityResults(matches.map(m => ({
      id: m.id,
      text: `File: ${m.name} size: ${m.size} in DB.`,
      score: m.similarity || 0.85,
      source: m.name
    })));
  };

  const activeUploads = uploadedFiles.filter(f => f.status === 'uploading' || f.status === 'ready');

  return (
    <div className="p-4 space-y-4 select-none font-sans text-xs">
      {/* File Upload drag and drop */}
      <div 
        onDragOver={onDragOver}
        onDrop={handleDrop}
        className="border-2 border-dashed border-white/5 hover:border-indigo-500/20 rounded-xl p-4 text-center cursor-pointer hover:bg-indigo-500/5 transition-all group relative"
      >
        <input 
          type="file" 
          multiple 
          onChange={handleFileChange}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
        <Upload className="h-5 w-5 text-slate-500 group-hover:text-indigo-400 mx-auto transition-colors" />
        <p className="mt-1.5 text-xs font-semibold text-slate-300">Add custom documents</p>
        <p className="text-[9px] text-slate-500 mt-0.5">Attach to feed context (PDF, DOCX, TXT)</p>
      </div>

      {/* Active Ingested Document List */}
      <div className="space-y-1.5">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Documents</h4>
        <div className="space-y-1 max-h-36 overflow-y-auto">
          {uploadedDocs.map(doc => (
            <div key={doc.id} className="p-2 rounded bg-slate-900 border border-white/5 flex items-center justify-between text-[11px]">
              <span className="font-medium text-slate-200 truncate max-w-[200px]">{doc.name}</span>
              <span className="text-[9px] text-indigo-400 font-mono">{(doc.similarity * 100).toFixed(0)}% Match</span>
            </div>
          ))}
        </div>
      </div>

      {/* Ingestion Queue */}
      {activeUploads.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Ingestion Queue</p>
          <div className="space-y-1">
            {activeUploads.map(file => (
              <div key={file.id} className="p-1.5 rounded bg-slate-950 border border-white/5 flex items-center justify-between text-[10px]">
                <span className="truncate max-w-[180px]">{file.name}</span>
                <div className="flex items-center gap-1">
                  {file.status === 'ready' ? (
                    <CheckCircle className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <Clock className="h-3 w-3 text-amber-400 animate-spin" />
                  )}
                  <button onClick={() => deleteUploadedFile(file.id)} className="text-slate-500 hover:text-rose-400">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Advanced diagnostics collapsible */}
      <button 
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="w-full flex items-center justify-between py-1.5 text-slate-400 hover:text-slate-200 text-[10px] font-bold uppercase tracking-wider border-t border-white/5 pt-3"
      >
        <span>Advanced parameters</span>
        {showAdvanced ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>

      {showAdvanced && (
        <div className="space-y-4 animate-fade-in border-l border-white/5 pl-2 ml-1 mt-2">
          {/* Vectorizer detail */}
          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 bg-slate-950 p-2 rounded">
            <div>
              <p className="text-[8px] text-slate-500 uppercase font-bold">Model</p>
              <p className="font-mono mt-0.5">{ragState.embeddingStatus.model}</p>
            </div>
            <div>
              <p className="text-[8px] text-slate-500 uppercase font-bold">Dims</p>
              <p className="font-mono mt-0.5">{ragState.embeddingStatus.dimension}</p>
            </div>
          </div>

          {/* Test Semantic Matches */}
          <div className="space-y-2">
            <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Semantic Query Test</p>
            <form onSubmit={handleSearchChunks} className="flex gap-1">
              <input
                type="text"
                placeholder="Query query..."
                value={queryTerm}
                onChange={(e) => setQueryTerm(e.target.value)}
                className="flex-1 px-2 py-1 rounded bg-slate-900 border border-white/5 text-[11px] outline-none"
              />
              <button type="submit" className="p-1 bg-slate-800 rounded border border-white/5 text-slate-200">
                <Search className="h-3.5 w-3.5" />
              </button>
            </form>
            <div className="space-y-1">
              {similarityResults.slice(0, 2).map((chunk) => (
                <div key={chunk.id} className="p-1.5 rounded bg-slate-950/80 border border-white/5 text-[9px]">
                  <div className="flex justify-between text-slate-500">
                    <span className="truncate max-w-[150px]">{chunk.source}</span>
                    <span className="text-indigo-400">{(chunk.score * 100).toFixed(0)}%</span>
                  </div>
                  <p className="text-slate-400 leading-normal line-clamp-1 italic mt-0.5">"{chunk.text}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RagDashboard;
