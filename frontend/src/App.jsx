import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/common/Layout';
import Dashboard from './pages/Dashboard';
import CrisesPage from './pages/CrisesPage';
import CrisisDetailPage from './pages/CrisisDetailPage';
import CreateCrisisPage from './pages/CreateCrisisPage';
import ResourcesPage from './pages/ResourcesPage';
import AICommandPage from './pages/AICommandPage';
import AnalyticsPage from './pages/AnalyticsPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="crises" element={<CrisesPage />} />
        <Route path="crises/new" element={<CreateCrisisPage />} />
        <Route path="crises/:id" element={<CrisisDetailPage />} />
        <Route path="resources" element={<ResourcesPage />} />
        <Route path="ai" element={<AICommandPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
