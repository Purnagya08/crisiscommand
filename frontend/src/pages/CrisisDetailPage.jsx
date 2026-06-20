import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Brain, FileText, Plus, Trash2, Clock } from 'lucide-react';
import { useCrisis } from '../hooks/useCrises';
import { crisisApi, aiApi } from '../services/api';
import { SeverityBadge, StatusBadge } from '../components/crisis/StatusBadge';
import AIResponseCard from '../components/ai/AIResponseCard';
import { PageLoader } from '../components/common/LoadingSpinner';
import { categoryLabels, formatDate, formatTime, formatNumber } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function CrisisDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { crisis, loading, error, setCrisis, addTimeline } = useCrisis(id);

  const [aiLoading,  setAiLoading]  = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [aiType,     setAiType]     = useState('');
  const [timelineInput, setTimelineInput] = useState({ event: '', actor: '' });
  const [showTimeline, setShowTimeline]   = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleStatusChange = async (e) => {
    try {
      const res = await crisisApi.updateStatus(id, e.target.value);
      setCrisis(res.data);
      toast.success(`Status → ${e.target.value}`);
    } catch (err) { toast.error(err.message); }
  };

  const handleAnalyze = async () => {
    setAiLoading(true); setAiType('analysis');
    try {
      const res = await aiApi.analyze(id);
      setAiResponse({ title: '🤖 AI Crisis Analysis', content: res.data.analysis, timestamp: res.data.timestamp });
    } catch (err) { toast.error(err.message); }
    finally { setAiLoading(false); }
  };

  const handleReport = async () => {
    setAiLoading(true); setAiType('report');
    try {
      const res = await aiApi.generateReport(id);
      setAiResponse({ title: '📋 Situation Report (SITREP)', content: res.data.report, timestamp: res.data.generatedAt });
    } catch (err) { toast.error(err.message); }
    finally { setAiLoading(false); }
  };

  const handleAddTimeline = async (e) => {
    e.preventDefault();
    if (!timelineInput.event.trim()) return;
    await addTimeline(timelineInput.event, timelineInput.actor || 'Operator');
    setTimelineInput({ event: '', actor: '' });
    setShowTimeline(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this crisis? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await crisisApi.delete(id);
      toast.success('Crisis deleted');
      navigate('/crises');
    } catch (err) { toast.error(err.message); setDeleting(false); }
  };

  if (loading) return <PageLoader text="Loading crisis details..." />;
  if (error || !crisis) return (
    <div className="card text-center py-10">
      <p className="text-red-400">{error || 'Crisis not found'}</p>
      <Link to="/crises" className="btn-secondary mt-4 mx-auto">← Back to Crises</Link>
    </div>
  );

  return (
    <div className="animate-fade-in space-y-6">
      {/* Back + Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link to="/crises" className="btn-ghost text-sm mb-3 inline-flex">
            <ArrowLeft size={14} /> Back to Crises
          </Link>
          <h1 className="text-2xl font-bold text-white">{crisis.title}</h1>
          <p className="text-slate-400 text-sm mt-1">{categoryLabels[crisis.category]} • Reported by {crisis.reportedBy}</p>
        </div>
        <button onClick={handleDelete} disabled={deleting} className="btn-ghost text-red-400 hover:bg-red-900/20 shrink-0">
          <Trash2 size={15} />
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Details */}
        <div className="lg:col-span-2 space-y-5">
          {/* Info Card */}
          <div className="card">
            <div className="flex flex-wrap gap-3 mb-4">
              <SeverityBadge severity={crisis.severity} />
              <StatusBadge   status={crisis.status}   />
            </div>
            <p className="text-slate-300 leading-relaxed mb-5">{crisis.description}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div><span className="text-slate-500 block text-xs mb-1">Location</span><span className="text-white">{crisis.location?.city || '—'}</span></div>
              <div><span className="text-slate-500 block text-xs mb-1">Affected</span><span className="text-white">{formatNumber(crisis.affectedCount)}</span></div>
              <div><span className="text-slate-500 block text-xs mb-1">Teams</span><span className="text-white">{crisis.assignedTeams?.length || 0}</span></div>
              <div><span className="text-slate-500 block text-xs mb-1">Created</span><span className="text-white">{formatDate(crisis.createdAt)}</span></div>
              <div><span className="text-slate-500 block text-xs mb-1">Updated</span><span className="text-white">{formatTime(crisis.updatedAt)}</span></div>
              <div>
                <span className="text-slate-500 block text-xs mb-1">Change Status</span>
                <select value={crisis.status} onChange={handleStatusChange} className="select py-1 text-xs w-auto">
                  <option value="active">Active</option>
                  <option value="contained">Contained</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>

            {crisis.assignedTeams?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-700">
                <p className="text-slate-500 text-xs mb-2">Assigned Teams</p>
                <div className="flex flex-wrap gap-2">
                  {crisis.assignedTeams.map(t => (
                    <span key={t} className="text-xs bg-blue-900/40 text-blue-300 border border-blue-700/50 px-2 py-1 rounded-full">{t}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI Actions */}
          <div className="card">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Brain size={16} className="text-purple-400" /> AI Analysis
            </h3>
            <div className="flex gap-3 mb-4 flex-wrap">
              <button onClick={handleAnalyze} disabled={aiLoading} className="btn-primary text-sm">
                <Brain size={14} /> {aiLoading && aiType === 'analysis' ? 'Analyzing...' : 'Analyze Crisis'}
              </button>
              <button onClick={handleReport} disabled={aiLoading} className="btn-secondary text-sm">
                <FileText size={14} /> {aiLoading && aiType === 'report' ? 'Generating...' : 'Generate SITREP'}
              </button>
            </div>
            {aiLoading && (
              <div className="flex items-center gap-3 text-slate-400 text-sm py-4">
                <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                Gemini AI is processing...
              </div>
            )}
            {aiResponse && !aiLoading && (
              <AIResponseCard title={aiResponse.title} content={aiResponse.content} timestamp={aiResponse.timestamp} />
            )}
            {crisis.aiAnalysis && !aiResponse && (
              <AIResponseCard title="Last AI Analysis" content={crisis.aiAnalysis.response} timestamp={crisis.aiAnalysis.timestamp} />
            )}
          </div>
        </div>

        {/* Right: Timeline */}
        <div className="space-y-4">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Clock size={15} className="text-blue-400" /> Timeline
              </h3>
              <button onClick={() => setShowTimeline(!showTimeline)} className="btn-ghost text-xs p-1.5">
                <Plus size={14} />
              </button>
            </div>

            {showTimeline && (
              <form onSubmit={handleAddTimeline} className="mb-4 space-y-2 bg-slate-700/30 rounded-lg p-3">
                <input
                  type="text"
                  placeholder="Event description *"
                  value={timelineInput.event}
                  onChange={e => setTimelineInput(p => ({ ...p, event: e.target.value }))}
                  className="input text-sm py-1.5"
                  required
                />
                <input
                  type="text"
                  placeholder="Actor / Team (optional)"
                  value={timelineInput.actor}
                  onChange={e => setTimelineInput(p => ({ ...p, actor: e.target.value }))}
                  className="input text-sm py-1.5"
                />
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary text-xs py-1 flex-1">Add</button>
                  <button type="button" onClick={() => setShowTimeline(false)} className="btn-ghost text-xs py-1">Cancel</button>
                </div>
              </form>
            )}

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {[...(crisis.timeline || [])].reverse().map((t, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
                    {i < (crisis.timeline?.length || 0) - 1 && <div className="w-0.5 h-full bg-slate-700 mt-1" />}
                  </div>
                  <div className="pb-3">
                    <p className="text-slate-200 text-xs font-medium">{t.event}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{t.actor} · {formatTime(t.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
