import React, { useState, useEffect } from 'react';
import { Play, Square, Trash2, Check, Mic, X } from 'lucide-react';

const VoiceRecorderUI = ({ onClose }) => {
  const [seconds, setSeconds] = useState(0);
  const [isRecording, setIsRecording] = useState(true);

  // Timer simulation
  useEffect(() => {
    if (!isRecording) return;
    const interval = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleStop = () => {
    setIsRecording(false);
  };

  const handleSave = () => {
    // Save simulation - close recorder
    onClose();
  };

  return (
    <div className="p-3 bg-slate-900 border border-white/5 rounded-2xl flex items-center justify-between gap-4 animate-fade-in">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          {isRecording && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
          )}
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
        </span>
        <span className="font-mono text-xs text-slate-300">Recording: {formatTime(seconds)}</span>
      </div>

      {/* Futuristic animated Waveform simulation */}
      <div className="flex items-end gap-1.5 h-6 flex-1 px-4 overflow-hidden">
        {Array.from({ length: 24 }).map((_, idx) => (
          <div
            key={idx}
            className={`w-0.5 bg-indigo-500 rounded-full transition-all duration-300 ${
              isRecording ? 'animate-pulse' : 'h-1.5'
            }`}
            style={{
              height: isRecording ? `${Math.max(10, Math.floor(Math.random() * 100))}%` : '6px',
              animationDelay: `${idx * 0.05}s`
            }}
          />
        ))}
      </div>

      <div className="flex items-center gap-2">
        {isRecording ? (
          <button 
            onClick={handleStop}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white"
          >
            <Square className="h-3.5 w-3.5" />
          </button>
        ) : (
          <button 
            onClick={handleSave}
            className="p-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-medium text-xs flex items-center gap-1"
          >
            <Check className="h-3.5 w-3.5" /> Use Audio
          </button>
        )}

        <button 
          onClick={onClose}
          className="p-1.5 bg-slate-800 hover:bg-slate-700 hover:text-rose-400 rounded-lg text-slate-400"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

export default VoiceRecorderUI;
