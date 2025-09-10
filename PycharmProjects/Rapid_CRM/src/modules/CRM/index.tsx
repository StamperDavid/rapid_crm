import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';

// Lazy load CRM pages for better performance
const CRMDashboard = lazy(() => import('./pages/Dashboard'));
const Companies = lazy(() => import('./pages/Companies'));
const Contacts = lazy(() => import('./pages/Contacts'));
const Deals = lazy(() => import('./pages/Deals'));
const Integrations = lazy(() => import('./pages/Integrations'));

const CRMModule: React.FC = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<CRMDashboard />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/deals" element={<Deals />} />
        <Route path="/integrations" element={<Integrations />} />
      </Routes>
    </Suspense>
  );
};

export default CRMModule;