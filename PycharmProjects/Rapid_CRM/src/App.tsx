import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';

// Import modules directly (not lazy loaded for now)
import CRMModule from './modules/CRM/index';
import SystemMonitoringModule from './modules/SystemMonitoring/index';
import ComplianceModule from './modules/Compliance/index';
import AnalyticsModule from './modules/Analytics/index';
import DashboardModule from './modules/Dashboard/index';
import DataManagement from './pages/DataManagement';
import SchemaManagement from './pages/SchemaManagement';

// Optimized query client with performance settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
      refetchOnMount: false,
    },
  },
});

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <Layout>
              <Routes>
                {/* Core Dashboard - Always loaded */}
                <Route path="/" element={<DashboardModule />} />
                
                {/* CRM Module */}
                <Route path="/crm/*" element={<CRMModule />} />
                
                {/* Data Management */}
                <Route path="/data" element={<DataManagement />} />
                
                {/* Schema Management */}
                <Route path="/schema" element={<SchemaManagement />} />
                
                {/* System Monitoring Module */}
                <Route path="/monitoring/*" element={<SystemMonitoringModule />} />
                
                {/* Compliance Module */}
                <Route path="/compliance/*" element={<ComplianceModule />} />
                
                {/* Analytics Module */}
                <Route path="/analytics/*" element={<AnalyticsModule />} />
              </Routes>
            </Layout>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1f2937',
                  color: '#f9fafb',
                  border: '1px solid #374151',
                },
              }}
            />
          </div>
        </Router>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;