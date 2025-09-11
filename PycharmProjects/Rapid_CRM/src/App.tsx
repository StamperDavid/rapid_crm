import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { UserProvider } from './contexts/UserContext';
import { CRMProvider } from './contexts/CRMContext';
import Layout from './components/Layout';

// Import modules directly (not lazy loaded for now)
import DashboardModule from './modules/Dashboard/index';
import Companies from './modules/CRM/pages/Companies';
import Deals from './modules/CRM/pages/Deals';
import Invoices from './modules/CRM/pages/Invoices';
import Integrations from './modules/CRM/pages/Integrations';
import UserManagement from './modules/CRM/pages/UserManagement';
import Tasks from './modules/CRM/pages/Tasks';
import Conversations from './modules/CRM/pages/Conversations';
import Agents from './modules/CRM/pages/Agents';
import SystemMonitoringModule from './modules/SystemMonitoring/index';
import ComplianceModule from './modules/Compliance/index';
import AnalyticsModule from './modules/Analytics/index';
import DataManagement from './pages/DataManagement';
import SchemaManagement from './pages/SchemaManagement';

// Optimized query client with performance settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
      refetchOnMount: false,
    },
  },
});

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <CRMProvider>
          <QueryClientProvider client={queryClient}>
            <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
              <Layout>
                <Routes>
                  {/* Core Dashboard - Always loaded */}
                  <Route path="/" element={<DashboardModule />} />
                  
                  {/* CRM Pages - Direct routing like HubSpot/Salesforce */}
                  <Route path="/companies" element={<Companies />} />
                  <Route path="/deals" element={<Deals />} />
                  <Route path="/invoices" element={<Invoices />} />
                  <Route path="/tasks" element={<Tasks />} />
                  <Route path="/conversations" element={<Conversations />} />
                  <Route path="/agents" element={<Agents />} />
                  <Route path="/integrations" element={<Integrations />} />
                  <Route path="/users" element={<UserManagement />} />
                  
                  {/* Reports */}
                  <Route path="/reports" element={<AnalyticsModule />} />
                  
                  {/* Legacy routes for backward compatibility */}
                  <Route path="/data" element={<DataManagement />} />
                  <Route path="/schema" element={<SchemaManagement />} />
                  <Route path="/monitoring/*" element={<SystemMonitoringModule />} />
                  <Route path="/compliance/*" element={<ComplianceModule />} />
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
        </CRMProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;