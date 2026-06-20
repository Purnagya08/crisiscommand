import React, { useEffect, useRef, useState } from 'react';
import { Brain, ListOrdered, MessageSquare, Package, Send, Sparkles, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { aiApi } from '../services/api';
import AIResponseCard from '../components/ai/AIResponseCard';
import PageHeader from '../components/common/PageHeader';

const tabs = [
  { id: 'chat', label: 'AI Chat', icon: MessageSquare },
  { id: 'prioritize', label: 'Prioritize Crises', icon: ListOrdered },
  { id: 'resources', label: 'Resource Advisor', icon: Package }
];

export default function AICommandPage() {
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content: "I can help analyze incidents, prioritize active crises, and recommend resources. Ask me anything about current operations."
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [resourceContext, setResourceContext] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendChat = async (event) => {
    event.preventDefault();
    const message = chatInput.trim();
    if (!message || loading) return;

    setChatInput('');
    setMessages((current) => [...current, { role: 'user', content: message }]);
    setLoading(true);

    try {
      const response = await aiApi.chat(message);
      setMessages((current) => [...current, { role: 'ai', content: response.data.reply }]);
    } catch (err) {
      toast.error(err.message);
      setMessages((current) => [...current, { role: 'ai', content: `Error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handlePrioritize = async () => {
    setLoading(true);
    setAiResult(null);
    try {
      const response = await aiApi.prioritize();
      setAiResult({
        title: 'Crisis Prioritization Plan',
        content: response.data.prioritization,
        timestamp: response.data.timestamp
      });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResourceAdvice = async (event) => {
    event.preventDefault();
    setLoading(true);
    setAiResult(null);
    try {
      const response = await aiApi.recommendResources({ context: resourceContext || 'General emergency situation' });
      setAiResult({
        title: 'Resource Allocation Recommendations',
        content: response.data.recommendations,
        timestamp: response.data.timestamp
      });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
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
        description="Operational AI for analysis, prioritization, and recommendations."
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
              Conversational AI
            </div>

            <div className="mt-5 h-[540px] space-y-4 overflow-y-auto rounded-2xl border border-white/8 bg-black/20 p-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-2xl ${message.role === 'ai' ? 'bg-violet-500/15 text-violet-200' : 'bg-rose-500/15 text-rose-200'}`}>
                    {message.role === 'ai' ? <Brain size={15} /> : 'U'}
                  </div>
                  <div className={`max-w-[80%] rounded-3xl px-4 py-3 text-sm leading-6 ${message.role === 'ai' ? 'bg-white/5 text-slate-200' : 'bg-rose-500/15 text-white'}`}>
                    {message.content}
                  </div>
                </div>
              ))}
              {loading && activeTab === 'chat' && (
                <div className="flex gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-2xl bg-violet-500/15 text-violet-200">
                    <Brain size={15} />
                  </div>
                  <div className="rounded-3xl bg-white/5 px-4 py-3 text-sm text-slate-400">Gemini is thinking...</div>
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
              <button type="submit" disabled={loading || !chatInput.trim()} className="inline-flex items-center gap-2 rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:opacity-60">
                <Send size={16} />
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-white/8 bg-slate-950/60 p-5 shadow-2xl shadow-black/20">
              <h3 className="text-base font-semibold text-white">Command Notes</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Use the AI for response planning, triage questions, and resource matching. Keep commands concise and include context when possible.
              </p>
            </div>
            {aiResult && !loading && (
              <AIResponseCard title={aiResult.title} content={aiResult.content} timestamp={aiResult.timestamp} />
            )}
          </div>
        </div>
      )}

      {activeTab === 'prioritize' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/8 bg-slate-950/60 p-5 shadow-2xl shadow-black/20">
            <h3 className="text-base font-semibold text-white">Crisis Prioritization</h3>
            <p className="mt-2 text-sm text-slate-400">Rank active crises and generate a response plan.</p>
            <button type="button" onClick={handlePrioritize} disabled={loading} className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:opacity-60">
              <Zap size={15} />
              {loading ? 'AI is analyzing...' : 'Run Prioritization AI'}
            </button>
          </div>

          {loading && (
            <div className="rounded-3xl border border-white/8 bg-slate-950/60 p-8 text-center text-slate-400">Processing active crises...</div>
          )}

          {aiResult && !loading && (
            <AIResponseCard title={aiResult.title} content={aiResult.content} timestamp={aiResult.timestamp} />
          )}
        </div>
      )}

      {activeTab === 'resources' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/8 bg-slate-950/60 p-5 shadow-2xl shadow-black/20">
            <h3 className="text-base font-semibold text-white">AI Resource Advisor</h3>
            <p className="mt-2 text-sm text-slate-400">Describe the incident and get resource allocation guidance.</p>
            <form onSubmit={handleResourceAdvice} className="mt-4 space-y-4">
              <textarea
                rows={4}
                value={resourceContext}
                onChange={(event) => setResourceContext(event.target.value)}
                placeholder="Example: Major flooding affecting three districts with road closures and power loss..."
                className="w-full rounded-2xl border border-white/8 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none"
              />
              <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:opacity-60">
                <Package size={15} />
                {loading ? 'AI is processing...' : 'Get Resource Recommendations'}
              </button>
            </form>
          </div>

          {loading && (
            <div className="rounded-3xl border border-white/8 bg-slate-950/60 p-8 text-center text-slate-400">Evaluating available resources...</div>
          )}

          {aiResult && !loading && (
            <AIResponseCard title={aiResult.title} content={aiResult.content} timestamp={aiResult.timestamp} />
          )}
        </div>
      )}
    </div>
  );
}
