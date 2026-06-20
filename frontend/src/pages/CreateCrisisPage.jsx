import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { crisisApi } from '../services/api';
import { categoryLabels } from '../utils/helpers';

const initialForm = {
  title: '',
  description: '',
  category: 'natural_disaster',
  severity: 'medium',
  location: '',
  affectedCount: '',
  reportedBy: ''
};

export default function CreateCrisisPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const set = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: '' }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.title.trim()) nextErrors.title = 'Title is required';
    if (!form.description.trim()) nextErrors.description = 'Description is required';
    if (!form.reportedBy.trim()) nextErrors.reportedBy = 'Reporter name is required';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const response = await crisisApi.create({
        ...form,
        affectedCount: Number.parseInt(form.affectedCount, 10) || 0,
        location: { city: form.location || 'Unknown', coordinates: null }
      });
      toast.success('Crisis reported successfully');
      navigate(`/crises/${response.data.id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const severityStyles = {
    low: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-100',
    medium: 'border-amber-500/20 bg-amber-500/10 text-amber-100',
    high: 'border-orange-500/20 bg-orange-500/10 text-orange-100',
    critical: 'border-rose-500/20 bg-rose-500/10 text-rose-100'
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to="/crises" className="inline-flex items-center gap-2 rounded-2xl border border-white/8 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10">
        <ArrowLeft size={14} />
        Back
      </Link>

      <div className="rounded-[2rem] border border-white/8 bg-slate-950/60 p-6 shadow-2xl shadow-black/20">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-rose-500/10 text-rose-200">
            <ShieldAlert size={18} />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-white">Report New Crisis</h1>
            <p className="mt-1 text-sm text-slate-400">Submit a new incident into the command workflow.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="grid gap-5 rounded-3xl border border-white/8 bg-white/[0.03] p-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Crisis Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(event) => set('title', event.target.value)}
                className="w-full rounded-2xl border border-white/8 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none"
                placeholder="Major Flooding in Downtown District"
              />
              {errors.title && <p className="mt-2 text-xs text-rose-300">{errors.title}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Description *</label>
              <textarea
                rows={5}
                value={form.description}
                onChange={(event) => set('description', event.target.value)}
                className="w-full rounded-2xl border border-white/8 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none"
                placeholder="Describe the situation, immediate impacts, and operational concerns..."
              />
              {errors.description && <p className="mt-2 text-xs text-rose-300">{errors.description}</p>}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Category *</label>
                <select value={form.category} onChange={(event) => set('category', event.target.value)} className="w-full rounded-2xl border border-white/8 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none">
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Severity *</label>
                <select
                  value={form.severity}
                  onChange={(event) => set('severity', event.target.value)}
                  className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none ${severityStyles[form.severity]}`}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid gap-5 rounded-3xl border border-white/8 bg-white/[0.03] p-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">City / Location</label>
              <input
                type="text"
                value={form.location}
                onChange={(event) => set('location', event.target.value)}
                className="w-full rounded-2xl border border-white/8 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none"
                placeholder="Metro City"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">People Affected</label>
              <input
                type="number"
                min="0"
                value={form.affectedCount}
                onChange={(event) => set('affectedCount', event.target.value)}
                className="w-full rounded-2xl border border-white/8 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none"
                placeholder="Estimated count"
              />
            </div>
          </div>

          <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
            <label className="mb-2 block text-sm font-medium text-slate-300">Reported By *</label>
            <input
              type="text"
              value={form.reportedBy}
              onChange={(event) => set('reportedBy', event.target.value)}
              className="w-full rounded-2xl border border-white/8 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none"
              placeholder="Name or agency"
            />
            {errors.reportedBy && <p className="mt-2 text-xs text-rose-300">{errors.reportedBy}</p>}
          </div>

          <div className={`rounded-3xl border p-5 ${severityStyles[form.severity]}`}>
            <p className="text-sm font-medium">
              {form.severity === 'critical' && 'Immediate command response required.'}
              {form.severity === 'high' && 'Urgent response needed.'}
              {form.severity === 'medium' && 'Response needed within the hour.'}
              {form.severity === 'low' && 'Monitor and schedule response.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 pb-4">
            <Link to="/crises" className="inline-flex flex-1 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 transition hover:bg-white/10">
              Cancel
            </Link>
            <button type="submit" disabled={submitting} className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:opacity-60">
              <Send size={15} />
              {submitting ? 'Reporting...' : 'Report Crisis'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
