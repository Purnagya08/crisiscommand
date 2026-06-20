import React, { useState } from 'react';
import { Bot, CheckCheck, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/helpers';

export default function AIResponseCard({ title, content, timestamp }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content || '');
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Copy failed');
    }
  };

  const renderContent = (text) => {
    if (!text) return null;

    return text.split('\n').map((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={index} className="h-2" />;
      if (trimmed.startsWith('#')) {
        return (
          <h4 key={index} className="mt-4 text-sm font-semibold text-red-200">
            {trimmed.replace(/^#+\s*/, '')}
          </h4>
        );
      }
      if (/^\d+\./.test(trimmed)) {
        return (
          <p key={index} className="ml-4 text-sm leading-6 text-slate-200">
            {trimmed}
          </p>
        );
      }
      if (/^[-*]/.test(trimmed)) {
        return (
          <p key={index} className="ml-4 text-sm leading-6 text-slate-300">
            • {trimmed.replace(/^[-*]\s*/, '')}
          </p>
        );
      }
      if (/^[A-Z][A-Z\s]+:/.test(trimmed)) {
        return (
          <h4 key={index} className="mt-3 text-xs font-semibold uppercase tracking-[0.25em] text-orange-200">
            {trimmed}
          </h4>
        );
      }
      return (
        <p key={index} className="text-sm leading-6 text-slate-300">
          {trimmed}
        </p>
      );
    });
  };

  return (
    <div className="rounded-3xl border border-white/8 bg-slate-950/60 p-5 shadow-2xl shadow-black/20">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-violet-500/10 text-violet-300">
            <Bot size={18} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">{title}</h3>
            {timestamp && <p className="text-xs text-slate-500">{formatDate(timestamp)}</p>}
          </div>
        </div>
        <button
          type="button"
          onClick={copy}
          className="rounded-xl border border-white/8 bg-white/5 px-3 py-2 text-xs text-slate-200 transition hover:bg-white/10"
        >
          <span className="inline-flex items-center gap-2">
            {copied ? <CheckCheck size={14} className="text-emerald-300" /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy'}
          </span>
        </button>
      </div>

      <div className="max-h-[540px] overflow-y-auto rounded-2xl border border-white/8 bg-black/20 p-4">
        {renderContent(content)}
      </div>
    </div>
  );
}
