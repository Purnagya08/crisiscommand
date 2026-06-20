import React, { useState } from 'react';
import { Copy, CheckCheck, Bot } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/helpers';

export default function AIResponseCard({ title, content, timestamp, type = 'analysis' }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch { toast.error('Copy failed'); }
  };

  const formatContent = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      if (line.match(/^#+\s/)) {
        return <h4 key={i} className="text-red-400 font-semibold mt-4 mb-1 text-sm">{line.replace(/^#+\s/, '')}</h4>;
      }
      if (line.match(/^\d+\.\s/)) {
        return <p key={i} className="text-slate-200 text-sm ml-3 mb-1">{line}</p>;
      }
      if (line.match(/^[-•]\s/)) {
        return <p key={i} className="text-slate-300 text-sm ml-3 mb-0.5">• {line.replace(/^[-•]\s/, '')}</p>;
      }
      if (line.trim() === '') return <br key={i} />;
      if (line.match(/^[A-Z][A-Z\s]+:/)) {
        return <h4 key={i} className="text-orange-400 font-semibold mt-3 mb-1 text-sm uppercase tracking-wide">{line}</h4>;
      }
      return <p key={i} className="text-slate-300 text-sm mb-1">{line}</p>;
    });
  };

  return (
    <div className="card border-l-4 border-l-purple-500 animate-slide-up">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-purple-900/40 rounded-lg">
            <Bot size={16} className="text-purple-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">{title}</h3>
            {timestamp && <p className="text-slate-500 text-xs">{formatDate(timestamp)}</p>}
          </div>
        </div>
        <button onClick={copy} className="btn-ghost p-1.5 text-xs gap-1 shrink-0">
          {copied ? <CheckCheck size={14} className="text-green-400" /> : <Copy size={14} />}
        </button>
      </div>
      <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700 text-sm leading-relaxed max-h-[500px] overflow-y-auto">
        {formatContent(content)}
      </div>
    </div>
  );
}
