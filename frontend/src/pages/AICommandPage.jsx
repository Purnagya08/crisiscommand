import React, { useState, useRef, useEffect } from 'react';
import { Brain, Send, Zap, ListOrdered, Package, MessageSquare } from 'lucide-react';
import { aiApi } from '../services/api';
import AIResponseCard from '../components/ai/AIResponseCard';
import PageHeader from '../components/common/PageHeader';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'chat',      label: 'AI Chat',          icon: MessageSquare },
  { id: 'prioritize',label: 'Prioritize Crises', icon: ListOrdered   },
  { id: 'resources', label: 'Resource Advisor',  icon: Package       },
];

export default function AICommandPage() {
  const [activeTab, setActiveTab] = useState('chat');
  const [messages,  setMessages]  = useState([
    { role: 'ai', content: "Hello, I'm CrisisCommand AI — powered by Google Gemini. I can help you analyze crises, prioritize responses, allocate resources, and answer emergency management questions. How can I assist?" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [loading,   setLoading]   = useState(false);
  const [aiResult,  setAiResult]  = useState(null);
  const [resContext, setResContext] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendChat = async (e) => {
    e.preventDefault();
    const msg = chatInput.trim();
    if (!msg || loading) return;
    setChatInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setLoading(true);
    try {
      const res = await aiApi.chat(msg);
      setMessages(prev => [...prev, { role: 'ai', content: res.data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', content: `❌ Error: ${err.message}` }]);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrioritize = async () => {
    setLoading(true); setAiResult(null);
    try {
      const res = await aiApi.prioritize();
      setAiResult({ title: '🎯 Crisis Prioritization Plan', content: res.data.prioritization, timestamp: res.data.timestamp });
      toast.success(`Prioritized ${res.data.activeCrisesCount} crises`);
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const handleResourceAdvice = async (e) => {
    e.preventDefault();
    setLoading(true); setAiResult(null);
    try {
      const res = await aiApi.recommendResources({ context: resContext || 'General emergency situation' });
      setAiResult({ title: '📦 Resource Allocation Recommendations', content: res.data.recommendations, timestamp: res.data.timestamp });
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const quickPrompts = [
    'What are best practices for mass evacuation?',
    'How do I coordinate multiple teams during a flood?',
    'What resources are critical for a chemical spill?',
    'Explain the Incident Command System (ICS)',
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="AI Command Center"
        description="Powered by Google Gemini — your AI emergency management advisor"
        badge="Gemini AI"
      />

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800 p-1 rounded-xl mb-6 w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { setActiveTab(id); setAiResult(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === id
                ? 'bg-red-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* ── Chat Tab ───────────────────────────────────── */}
      {activeTab === 'chat' && (
        <div className="flex flex-col h-[600px]">
          <div className="card flex-1 overflow-y-auto mb-4 space-y-4" id="chat-window">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${
                  m.role === 'ai' ? 'bg-purple-700 text-white' : 'bg-red-700 text-white'
                }`}>
                  {m.role === 'ai' ? <Brain size={15} /> : 'U'}
                </div>
                <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === 'ai'
                    ? 'bg-slate-700 text-slate-200 rounded-tl-sm'
                    : 'bg-red-700/80 text-white rounded-tr-sm'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center">
                  <Brain size={15} className="text-white" />
                </div>
                <div className="bg-slate-700 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                  <div className="flex gap-1">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                  <span className="text-slate-400 text-xs">Gemini is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="flex gap-2 mb-3 flex-wrap">
            {quickPrompts.map(p => (
              <button key={p} onClick={() => setChatInput(p)}
                className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1.5 rounded-full transition-colors">
                {p}
              </button>
            ))}
          </div>

          <form onSubmit={sendChat} className="flex gap-3">
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder="Ask the AI anything about crisis management..."
              className="input flex-1"
              disabled={loading}
            />
            <button type="submit" disabled={loading || !chatInput.trim()} className="btn-primary shrink-0">
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      {/* ── Prioritize Tab ─────────────────────────────── */}
      {activeTab === 'prioritize' && (
        <div className="space-y-5">
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-900/40 rounded-lg"><ListOrdered size={18} className="text-orange-400" /></div>
              <div>
                <h3 className="text-white font-semibold">Crisis Prioritization</h3>
                <p className="text-slate-400 text-sm">AI will rank all active crises and create an action plan.</p>
              </div>
            </div>
            <button onClick={handlePrioritize} disabled={loading} className="btn-primary">
              <Zap size={15} /> {loading ? 'AI is analyzing...' : 'Run Prioritization AI'}
            </button>
          </div>
          {loading && (
            <div className="card text-center py-10">
              <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-slate-400">Gemini AI is analyzing all active crises...</p>
            </div>
          )}
          {aiResult && !loading && (
            <AIResponseCard title={aiResult.title} content={aiResult.content} timestamp={aiResult.timestamp} />
          )}
        </div>
      )}

      {/* ── Resource Advisor Tab ───────────────────────── */}
      {activeTab === 'resources' && (
        <div className="space-y-5">
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-900/40 rounded-lg"><Package size={18} className="text-blue-400" /></div>
              <div>
                <h3 className="text-white font-semibold">AI Resource Advisor</h3>
                <p className="text-slate-400 text-sm">Get resource allocation recommendations for your situation.</p>
              </div>
            </div>
            <form onSubmit={handleResourceAdvice} className="space-y-3">
              <textarea
                rows={3}
                value={resContext}
                onChange={e => setResContext(e.target.value)}
                placeholder="Describe the situation (optional) — e.g., 'Major flooding affecting 3 districts, critical infrastructure down...'"
                className="input resize-none text-sm"
              />
              <button type="submit" disabled={loading} className="btn-primary">
                <Package size={15} /> {loading ? 'AI is processing...' : 'Get Resource Recommendations'}
              </button>
            </form>
          </div>
          {loading && (
            <div className="card text-center py-10">
              <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-slate-400">Gemini AI is analyzing available resources...</p>
            </div>
          )}
          {aiResult && !loading && (
            <AIResponseCard title={aiResult.title} content={aiResult.content} timestamp={aiResult.timestamp} />
          )}
        </div>
      )}
    </div>
  );
}
