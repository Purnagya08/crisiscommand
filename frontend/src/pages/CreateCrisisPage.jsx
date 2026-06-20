import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Send, AlertTriangle } from 'lucide-react';
import { crisisApi } from '../services/api';
import { categoryLabels } from '../utils/helpers';
import toast from 'react-hot-toast';

const initialForm = {
  title: '', description: '', category: 'natural_disaster', severity: 'medium',
  location: '', affectedCount: '', reportedBy: '',
};

export default function CreateCrisisPage() {
  const navigate = useNavigate();
  const [form, setForm]       = useState(initialForm);
  const [submitting, setSub]  = useState(false);
  const [errors, setErrors]   = useState({});

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.title.trim())       e.title       = 'Title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.reportedBy.trim())  e.reportedBy  = 'Reporter name is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSub(true);
    try {
      const payload = {
        ...form,
        affectedCount: parseInt(form.affectedCount) || 0,
        location: { city: form.location || 'Unknown', coordinates: null },
      };
      const res = await crisisApi.create(payload);
      toast.success('Crisis reported successfully!');
      navigate(`/crises/${res.data.id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSub(false);
    }
  };

  const severityColors = {
    low: 'border-green-500', medium: 'border-yellow-500',
    high: 'border-orange-500', critical: 'border-red-500',
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <div className="mb-6">
        <Link to="/crises" className="btn-ghost text-sm mb-3 inline-flex">
          <ArrowLeft size={14} /> Back
        </Link>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <AlertTriangle size={22} className="text-red-400" /> Report New Crisis
        </h1>
        <p className="text-slate-400 text-sm mt-1">Fill in all details for the new crisis event.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div className="card">
          <h2 className="text-white font-semibold mb-4">Crisis Information</h2>
          <div className="space-y-4">
            <div>
              <label className="text-slate-300 text-sm font-medium mb-1.5 block">Crisis Title *</label>
              <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
                placeholder="e.g., Major Flooding in Downtown District"
                className={`input ${errors.title ? 'border-red-500 focus:ring-red-500' : ''}`} />
              {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="text-slate-300 text-sm font-medium mb-1.5 block">Description *</label>
              <textarea rows={4} value={form.description} onChange={e => set('description', e.target.value)}
                placeholder="Describe the crisis situation, scope, and immediate impact..."
                className={`input resize-none ${errors.description ? 'border-red-500' : ''}`} />
              {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-slate-300 text-sm font-medium mb-1.5 block">Category *</label>
                <select value={form.category} onChange={e => set('category', e.target.value)} className="select">
                  {Object.entries(categoryLabels).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-slate-300 text-sm font-medium mb-1.5 block">Severity *</label>
                <select value={form.severity} onChange={e => set('severity', e.target.value)}
                  className={`select border-l-4 ${severityColors[form.severity]}`}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">⚠️ Critical</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Location & Scale */}
        <div className="card">
          <h2 className="text-white font-semibold mb-4">Location & Scale</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-300 text-sm font-medium mb-1.5 block">City / Location</label>
              <input type="text" value={form.location} onChange={e => set('location', e.target.value)}
                placeholder="e.g., Metro City" className="input" />
            </div>
            <div>
              <label className="text-slate-300 text-sm font-medium mb-1.5 block">People Affected</label>
              <input type="number" value={form.affectedCount} onChange={e => set('affectedCount', e.target.value)}
                placeholder="Estimated count" className="input" min="0" />
            </div>
          </div>
        </div>

        {/* Reporter */}
        <div className="card">
          <h2 className="text-white font-semibold mb-4">Reporter Details</h2>
          <div>
            <label className="text-slate-300 text-sm font-medium mb-1.5 block">Reported By *</label>
            <input type="text" value={form.reportedBy} onChange={e => set('reportedBy', e.target.value)}
              placeholder="Your name or organization"
              className={`input ${errors.reportedBy ? 'border-red-500' : ''}`} />
            {errors.reportedBy && <p className="text-red-400 text-xs mt-1">{errors.reportedBy}</p>}
          </div>
        </div>

        {/* Severity Preview */}
        <div className={`rounded-xl p-4 border ${
          form.severity === 'critical' ? 'bg-red-900/20 border-red-700' :
          form.severity === 'high'     ? 'bg-orange-900/20 border-orange-700' :
          form.severity === 'medium'   ? 'bg-yellow-900/20 border-yellow-700' :
                                         'bg-green-900/20 border-green-700'
        }`}>
          <p className={`text-sm font-medium ${
            form.severity === 'critical' ? 'text-red-300' :
            form.severity === 'high'     ? 'text-orange-300' :
            form.severity === 'medium'   ? 'text-yellow-300' : 'text-green-300'
          }`}>
            {form.severity === 'critical' && '🚨 CRITICAL — Immediate command response required.'}
            {form.severity === 'high'     && '⚠️ HIGH — Urgent response needed.'}
            {form.severity === 'medium'   && '⚡ MEDIUM — Response needed within the hour.'}
            {form.severity === 'low'      && '✅ LOW — Monitor and schedule response.'}
          </p>
        </div>

        {/* Submit */}
        <div className="flex gap-3 pb-8">
          <Link to="/crises" className="btn-secondary flex-1 justify-center">Cancel</Link>
          <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center">
            <Send size={15} /> {submitting ? 'Reporting...' : 'Report Crisis'}
          </button>
        </div>
      </form>
    </div>
  );
}
