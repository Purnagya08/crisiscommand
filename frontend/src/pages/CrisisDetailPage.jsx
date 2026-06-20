import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Brain, FileText, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCrisis } from '../hooks/useCrises';
import { aiApi, crisisApi } from '../services/api';
import { SeverityBadge, StatusBadge } from '../components/crisis/StatusBadge';
import AIResponseCard from '../components/ai/AIResponseCard';
import TimelinePanel from '../components/common/TimelinePanel';
import { PageLoader } from '../components/common/LoadingSpinner';
import { categoryLabels, formatDate, formatNumber, formatTime } from '../utils/helpers';

export default function CrisisDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { crisis, loading, error, setCrisis, addTimeline } = useCrisis(id);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [timelineInput, setTimelineInput] = useState({ event: '', actor: '' });
  const [showTimelineForm, setShowTimelineForm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleStatusChange = async (event) => {
    try {
      const response = await crisisApi.updateStatus(id, event.target.value);
      setCrisis(response.data);
      toast.success('Status updated');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleAnalyze = async () => {
    setAiLoading(true);
    try {
      const response = await aiApi.analyze(id);
      setAiResponse({
        title: 'AI Crisis Analysis',
        content: response.data.analysis,
        timestamp: response.data.timestamp
      });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleReport = async () => {
    setAiLoading(true);
    try {
      const response = await aiApi.generateReport(id);
      setAiResponse({
        title: 'Situation Report (SITREP)',
        content: response.data.report,
        timestamp: response.data.generatedAt
      });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddTimeline = async (event) => {
    event.preventDefault();
    if (!timelineInput.event.trim()) return;

    await addTimeline(timelineInput.event, timelineInput.actor || 'Command Center');
    setTimelineInput({ event: '', actor: '' });
    setShowTimelineForm(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this crisis? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await crisisApi.delete(id);
      toast.success('Crisis deleted');
      navigate('/crises');
    } catch (err) {
      toast.error(err.message);
      setDeleting(false);
    }
  };

  if (loading) return <PageLoader text="Loading crisis details..." />;

  if (error || !crisis) {
    return (
      <div className="rounded-3xl border border-white/8 bg-slate-950/60 p-8 text-center">
        <p className="text-rose-200">{error || 'Crisis not found'}</p>
        <Link to="/crises" className="mt-4 inline-flex rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10">
          Back to Crises
        </Link>
      </div>
    );
  }

  const timelineEvents = [...(crisis.timeline || [])].reverse();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link to="/crises" className="inline-flex items-center gap-2 rounded-2xl border border-white/8 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10">
            <ArrowLeft size={14} />
            Back to Crises
          </Link>
          <h1 className="mt-4 text-3xl font-semibold text-white">{crisis.title}</h1>
          <p className="mt-2 text-sm text-slate-400">
            {categoryLabels[crisis.category] || crisis.category} • Reported by {crisis.reportedBy}
          </p>
        </div>

        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="inline-flex items-center gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-sm text-rose-100 transition hover:bg-rose-500/20 disabled:opacity-60"
        >
          <Trash2 size={15} />
          Delete
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.85fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/8 bg-slate-950/60 p-6 shadow-2xl shadow-black/20">
            <div className="flex flex-wrap gap-3">
              <SeverityBadge severity={crisis.severity} />
              <StatusBadge status={crisis.status} />
            </div>

            <p className="mt-5 text-sm leading-7 text-slate-300">{crisis.description}</p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Location</p>
                <p className="mt-2 text-sm text-white">{crisis.location?.city || 'Unknown'}</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Affected</p>
                <p className="mt-2 text-sm text-white">{formatNumber(crisis.affectedCount)}</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Updated</p>
                <p className="mt-2 text-sm text-white">{formatTime(crisis.updatedAt)}</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Created</p>
                <p className="mt-2 text-sm text-white">{formatDate(crisis.createdAt)}</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Teams</p>
                <p className="mt-2 text-sm text-white">{crisis.assignedTeams?.length || 0}</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Status</p>
                <select
                  value={crisis.status}
                  onChange={handleStatusChange}
                  className="mt-2 w-full rounded-xl border border-white/8 bg-white/5 px-3 py-2 text-sm text-white outline-none"
                >
                  <option value="active">Active</option>
                  <option value="contained">Contained</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>

            {crisis.assignedTeams?.length > 0 && (
              <div className="mt-6 border-t border-white/8 pt-5">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Assigned Teams</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {crisis.assignedTeams.map((team) => (
                    <span key={team} className="rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs text-sky-200">
                      {team}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-white/8 bg-slate-950/60 p-6 shadow-2xl shadow-black/20">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-white">AI Analysis</h3>
                <p className="mt-1 text-sm text-slate-400">Use Gemini-backed AI for analysis and situation reporting.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={handleAnalyze} disabled={aiLoading} className="inline-flex items-center gap-2 rounded-2xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:opacity-60">
                  <Brain size={15} />
                  Analyze
                </button>
                <button type="button" onClick={handleReport} disabled={aiLoading} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 transition hover:bg-white/10 disabled:opacity-60">
                  <FileText size={15} />
                  SITREP
                </button>
              </div>
            </div>

            {aiLoading && (
              <div className="mt-5 rounded-2xl border border-white/8 bg-black/20 p-4 text-sm text-slate-400">
                Gemini AI is processing the incident context...
              </div>
            )}

            {!aiLoading && aiResponse && (
              <div className="mt-5">
                <AIResponseCard title={aiResponse.title} content={aiResponse.content} timestamp={aiResponse.timestamp} />
              </div>
            )}

            {!aiLoading && !aiResponse && crisis.aiAnalysis && (
              <div className="mt-5">
                <AIResponseCard title="Last AI Analysis" content={crisis.aiAnalysis.response} timestamp={crisis.aiAnalysis.timestamp} />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-white/8 bg-slate-950/60 p-6 shadow-2xl shadow-black/20">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-white">Timeline</h3>
                <p className="mt-1 text-sm text-slate-400">Incident updates and field actions.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowTimelineForm((value) => !value)}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 transition hover:bg-white/10"
              >
                <Plus size={15} />
                Add
              </button>
            </div>

            {showTimelineForm && (
              <form onSubmit={handleAddTimeline} className="mt-5 space-y-3 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <input
                  type="text"
                  placeholder="Event description"
                  value={timelineInput.event}
                  onChange={(event) => setTimelineInput((value) => ({ ...value, event: event.target.value }))}
                  className="w-full rounded-xl border border-white/8 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="Actor or team"
                  value={timelineInput.actor}
                  onChange={(event) => setTimelineInput((value) => ({ ...value, actor: event.target.value }))}
                  className="w-full rounded-xl border border-white/8 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none"
                />
                <div className="flex gap-2">
                  <button type="submit" className="rounded-2xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white">
                    Save
                  </button>
                  <button type="button" onClick={() => setShowTimelineForm(false)} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100">
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          <TimelinePanel events={timelineEvents} title="Event Log" />
        </div>
      </div>
    </div>
  );
}
