import React from 'react';
import { BarChart, Bar, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const severityPalette = {
  critical: '#f43f5e',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e'
};

const categoryPalette = ['#fb7185', '#38bdf8', '#34d399', '#f59e0b', '#a78bfa', '#f472b6'];

export default function KPICharts({ severityData = [], categoryData = [] }) {
  const severityChart = severityData.map((item) => ({
    name: item.severity,
    value: item.count,
    fill: severityPalette[item.severity] || '#64748b'
  }));

  const categoryChart = categoryData.map((item, index) => ({
    name: item.category.replace(/_/g, ' '),
    value: item.count,
    fill: categoryPalette[index % categoryPalette.length]
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-3xl border border-white/8 bg-slate-950/60 p-5 shadow-2xl shadow-black/20">
        <h3 className="mb-4 text-base font-semibold text-white">Crises by Severity</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={severityChart}
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={55}
                dataKey="value"
                paddingAngle={3}
              >
                {severityChart.map((entry, index) => (
                  <Cell key={`severity-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: '#020617',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 16,
                  color: '#e2e8f0'
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-3xl border border-white/8 bg-slate-950/60 p-5 shadow-2xl shadow-black/20">
        <h3 className="mb-4 text-base font-semibold text-white">Crises by Category</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryChart} margin={{ top: 5, right: 16, left: -18, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: '#020617',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 16,
                  color: '#e2e8f0'
                }}
              />
              <Bar dataKey="value" radius={[14, 14, 0, 0]}>
                {categoryChart.map((entry, index) => (
                  <Cell key={`category-${index}`} fill={entry.fill} />
                ))}
              </Bar>
              <Legend />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
