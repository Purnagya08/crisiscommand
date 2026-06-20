import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Brain, FileText, ListOrdered, MessageSquare, Package, Send, Sparkles, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { aiApi } from '../services/api';
import { useCrises } from '../hooks/useCrises';
import AIResponseCard from '../components/ai/AIResponseCard';
import PageHeader from '../components/common/PageHeader';

const tabs = [
  { id: 'chat', label: 'Emergency Chat', icon: MessageSquare },
  { id: 'prioritize', label: 'Crisis Prioritization', icon: ListOrdered },
  { id: 'resources', label: 'Resource Advisor', icon: Package },
  { id: 'sitrep', label: 'SITREP Generator', icon: FileText }
];

export default function AICommandPage() {
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content: 'I can help analyze incidents, prioritize active crises, recommend resources, and generate SITREPs. Ask me anything about current operations.'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [loadingMode, setLoadingMode] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [resourceContext, setResourceContext] = useState('');
  const [sitrepCrisisId, setSitrepCrisisId] = useState('');
  const messagesEndRef = useRef(null);
  const { crises, loading: crisesLoading } = useCrises({});

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!sitrepCrisisId && crises.length > 0) {
      setSitrepCrisisId(crises[0].id);
    }
  }, [crises, sitrepCrisisId]);

  const selectedCrisis = useMemo(
    () => crises.find((crisis) => crisis.id === sitrepCrisisId) || null,
    [crises, sitrepCrisisId]
  );

  const isLoading = Boolean(loadingMode);

  const renderFormattedMessage = (content) => {
    return String(content || '')
      .split('\n')
      .map((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={index} className="h-2" />;
        if (/^#+\s/.test(trimmed)) {
          return (
            <p key={index} className="text-sm font-semibold text-amber-200">
              {trimmed.replace(/^#+\s*/, '')}
            </p>
          );
        }
        if (/^[-*]\s/.test(trimmed)) {
          return (
            <p key={index} className="ml-3 text-sm leading-6 text-slate-200">
              • {trimmed.replace(/^[-*]\s*/, '')}
            </p>
          );
        }
        if (/^\d+\.\s/.test(trimmed)) {
          return (
            <p key={index} className="ml-3 text-sm leading-6 text-slate-200">
              {trimmed}
            </p>
          );
        }
        if (/^[A-Z][A-Z\s]+:/.test(trimmed)) {
          return (
            <p key={index} className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-200">
              {trimmed}
            </p>
          );
        }
        return (
          <p key={index} className="text-sm leading-6 text-slate-200">
            {trimmed}
          </p>
        );
      });
  };

  const sendChat = async (event) => {
    event.preventDefault();
    const message = chatInput.trim();
    if (!message || isLoading) return;

    setChatInput('');
    setMessages((current) => [...current, { role: 'user', content: message }]);
    setLoadingMode('chat');

    try {
      const response = await aiApi.chat(message);
      setMessages((current) => [...current, { role: 'ai', content: response.data.reply }]);
    } catch (err) {
      toast.error(err.message);
      setMessages((current) => [...current, { role: 'ai', content: `Error: ${err.message}` }]);
    } finally {
      setLoadingMode(null);
    }
  };

  const handlePrioritize = async () => {
    setLoadingMode('prioritize');
    setAiResult(null);
    try {
      const response = await aiApi.prioritize();
      setAiResult({
        title: 'Crisis Prioritization Plan',
        content: response.data.prioritization,
        timestamp: response.data.timestamp,
        fileName: 'crisis-prioritization-plan'
      });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingMode(null);
    }
  };

  const handleResourceAdvice = async (event) => {
    event.preventDefault();
    setLoadingMode('resources');
    setAiResult(null);
    try {
      const response = await aiApi.recommendResources({ context: resourceContext || 'General emergency situation' });
      setAiResult({
        title: 'Resource Allocation Recommendations',
        content: response.data.recommendations,
        timestamp: response.data.timestamp,
        fileName: 'resource-allocation-recommendations'
      });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingMode(null);
    }
  };

  const handleGenerateSitrep = async () => {
    if (!sitrepCrisisId) {
      toast.error('Select a crisis first');
      return;
    }

    setLoadingMode('sitrep');
    setAiResult(null);
    try {
      const response = await aiApi.generateReport(sitrepCrisisId);
      setAiResult({
        title: `SITREP - ${selectedCrisis?.title || 'Crisis Report'}`,
        content: response.data.report,
        timestamp: response.data.generatedAt,
        fileName: `sitrep-${selectedCrisis?.title || sitrepCrisisId}`
      });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingMode(null);
    }
  };

  const quickPrompts = [
    'What are best practices for mass evacuation?',
    'How do I coordinate multiple teams during a flood?',
    'What resources are critical for a chemical spill?',
    'Explain the Incident Command System (ICS)'
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Command Center"
        description="Operational AI for emergency chat, prioritization, resource planning, and situation reporting."
        badge="Gemini"
      />

      <div className="flex flex-wrap gap-2 rounded-3xl border border-white/8 bg-slate-950/60 p-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setActiveTab(id);
              setAiResult(null);
            }}
            className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition ${
              activeTab === id ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'chat' && (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-white/8 bg-slate-950/60 p-5 shadow-2xl shadow-black/20">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Sparkles size={16} className="text-amber-300" />
              Emergency Chat
            </div>

            <div className="mt-5 h-[540px] space-y-4 overflow-y-auto rounded-2xl border border-white/8 bg-black/20 p-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-2xl ${message.role === 'ai' ? 'bg-violet-500/15 text-violet-200' : 'bg-rose-500/15 text-rose-200'}`}>
                    {message.role === 'ai' ? <Brain size={15} /> : 'U'}
                  </div>
                  <div className={`max-w-[80%] rounded-3xl px-4 py-3 text-sm leading-6 ${message.role === 'ai' ? 'bg-white/5 text-slate-200' : 'bg-rose-500/15 text-white'}`}>
                    {message.role === 'ai' ? renderFormattedMessage(message.content) : message.content}
                  </div>
                </div>
              ))}

              {loadingMode === 'chat' && (
                <div className="flex gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-2xl bg-violet-500/15 text-violet-200">
                    <Brain size={15} />
                  </div>
                  <div className="rounded-3xl bg-white/5 px-4 py-3 text-sm text-slate-300">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-violet-300" />
                      <span className="h-2 w-2 animate-pulse rounded-full bg-violet-300 [animation-delay:150ms]" />
                      <span className="h-2 w-2 animate-pulse rounded-full bg-violet-300 [animation-delay:300ms]" />
                      Emergency Chat typing
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setChatInput(prompt)}
                  className="rounded-full border border-white/8 bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-white/10 hover:text-white"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <form onSubmit={sendChat} className="mt-4 flex gap-3">
              <input
                type="text"
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                placeholder="Ask the AI about crisis operations..."
                className="min-w-0 flex-1 rounded-2xl border border-white/8 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none"
              />
              <button
                type="submit"
                disabled={loadingMode || !chatInput.trim()}
                className="inline-flex items-center gap-2 rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:opacity-60"
              >
                <Send size={16} />
                {loadingMode === 'chat' ? 'Sending...' : 'Send'}
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-white/8 bg-slate-950/60 p-5 shadow-2xl shadow-black/20">
              <h3 className="text-base font-semibold text-white">Command Notes</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Use the AI for response planning, triage questions, resource matching, and report generation. Keep commands concise and include context when possible.
              </p>
            </div>
            {aiResult && !isLoading && (
              <AIResponseCard
                title={aiResult.title}
                content={aiResult.content}
                timestamp={aiResult.timestamp}
                fileName={aiResult.fileName}
              />
            )}
          </div>
        </div>
      )}

      {activeTab === 'prioritize' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/8 bg-slate-950/60 p-5 shadow-2xl shadow-black/20">
            <h3 className="text-base font-semibold text-white">Crisis Prioritization</h3>
            <p className="mt-2 text-sm text-slate-400">Rank active crises and generate a response plan.</p>
            <button
              type="button"
              onClick={handlePrioritize}
              disabled={isLoading}
              className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:opacity-60"
            >
              <Zap size={15} />
              {loadingMode === 'prioritize' ? 'Analyzing...' : 'Run Prioritization AI'}
            </button>
          </div>

          {loadingMode === 'prioritize' && (
            <div className="rounded-3xl border border-white/8 bg-slate-950/60 p-8 text-center text-slate-300">
              <div className="mx-auto mb-3 flex w-fit items-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-rose-300" />
                <div className="h-2 w-2 animate-pulse rounded-full bg-rose-300 [animation-delay:150ms]" />
                <div className="h-2 w-2 animate-pulse rounded-full bg-rose-300 [animation-delay:300ms]" />
              </div>
              Processing active crises...
            </div>
          )}

          {aiResult && !isLoading && (
            <AIResponseCard
              title={aiResult.title}
              content={aiResult.content}
              timestamp={aiResult.timestamp}
              fileName={aiResult.fileName}
            />
          )}
        </div>
      )}

      {activeTab === 'resources' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/8 bg-slate-950/60 p-5 shadow-2xl shadow-black/20">
            <h3 className="text-base font-semibold text-white">Resource Advisor</h3>
            <p className="mt-2 text-sm text-slate-400">Describe the incident and get resource allocation guidance.</p>
            <form onSubmit={handleResourceAdvice} className="mt-4 space-y-4">
              <textarea
                rows={4}
                value={resourceContext}
                onChange={(event) => setResourceContext(event.target.value)}
                placeholder="Example: Major flooding affecting three districts with road closures and power loss..."
                className="w-full rounded-2xl border border-white/8 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:opacity-60"
              >
                <Package size={15} />
                {loadingMode === 'resources' ? 'Processing...' : 'Get Resource Recommendations'}
              </button>
            </form>
          </div>

          {loadingMode === 'resources' && (
            <div className="rounded-3xl border border-white/8 bg-slate-950/60 p-8 text-center text-slate-300">
              <div className="mx-auto mb-3 flex w-fit items-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-sky-300" />
                <div className="h-2 w-2 animate-pulse rounded-full bg-sky-300 [animation-delay:150ms]" />
                <div className="h-2 w-2 animate-pulse rounded-full bg-sky-300 [animation-delay:300ms]" />
              </div>
              Evaluating available resources...
            </div>
          )}

          {aiResult && !isLoading && (
            <AIResponseCard
              title={aiResult.title}
              content={aiResult.content}
              timestamp={aiResult.timestamp}
              fileName={aiResult.fileName}
            />
          )}
        </div>
      )}

      {activeTab === 'sitrep' && (
        <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-3xl border border-white/8 bg-slate-950/60 p-5 shadow-2xl shadow-black/20">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <FileText size={16} className="text-emerald-300" />
              SITREP Generator
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Select an incident and generate a situation report ready for copy or export.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-slate-500">Select crisis</label>
                <select
                  value={sitrepCrisisId}
                  onChange={(event) => setSitrepCrisisId(event.target.value)}
                  className="w-full rounded-2xl border border-white/8 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none"
                  disabled={crisesLoading || crises.length === 0}
                >
                  {crises.length === 0 ? (
                    <option value="">No crises available</option>
                  ) : (
                    crises.map((crisis) => (
                      <option key={crisis.id} value={crisis.id}>
                        {crisis.title}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {selectedCrisis && (
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                    <AlertTriangle size={13} className="text-amber-300" />
                    Incident Context
                  </div>
                  <p className="mt-2 text-sm text-slate-200">{selectedCrisis.description}</p>
                </div>
              )}

              <button
                type="button"
                onClick={handleGenerateSitrep}
                disabled={isLoading || !sitrepCrisisId || crisesLoading}
                className="inline-flex items-center gap-2 rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:opacity-60"
              >
                <FileText size={15} />
                {loadingMode === 'sitrep' ? 'Generating...' : 'Generate SITREP'}
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {loadingMode === 'sitrep' && (
              <div className="rounded-3xl border border-white/8 bg-slate-950/60 p-8 text-center text-slate-300">
                <div className="mx-auto mb-3 flex w-fit items-center gap-2">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
                  <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-300 [animation-delay:150ms]" />
                  <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-300 [animation-delay:300ms]" />
                </div>
                Building situation report...
              </div>
            )}

            {aiResult && !isLoading && (
              <AIResponseCard
                title={aiResult.title}
                content={aiResult.content}
                timestamp={aiResult.timestamp}
                fileName={aiResult.fileName}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
