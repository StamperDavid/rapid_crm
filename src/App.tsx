import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { UserProvider } from './contexts/UserContext';
import { CRMProvider } from './contexts/CRMContext';
import { ClientProvider } from './contexts/ClientContext';
import { UIStateProvider } from './contexts/UIStateContext';
import { TooltipProvider } from './contexts/TooltipContext';
import Layout from './components/Layout';

// Import modules directly (not lazy loaded for now)
import DashboardModule from './modules/Dashboard/index';
import Companies from './modules/CRM/pages/Companies';
import CompanyDetail from './modules/CRM/pages/CompanyDetail';
import Services from './modules/CRM/pages/Services';
import Leads from './modules/CRM/pages/Leads';
import Deals from './modules/CRM/pages/Deals';
import Integrations from './modules/CRM/pages/Integrations';
import UserManagement from './modules/CRM/pages/UserManagement';
import Tasks from './modules/CRM/pages/Tasks';
import Conversations from './modules/CRM/pages/ConversationsScalable';
import ApiKeys from './modules/CRM/pages/ApiKeys';
import DatabaseManagement from './modules/CRM/pages/DatabaseManagement';
import SystemMonitoringModule from './modules/SystemMonitoring/index';
import ComplianceModule from './modules/Compliance/index';
import AnalyticsModule from './modules/Analytics/index';
import DataManagement from './pages/DataManagement';
import SchemaManagement from './pages/SchemaManagement';
import ClientPortalDesigner from './modules/CRM/pages/ClientPortalDesigner';
import ThemeCustomizer from './modules/CRM/pages/ThemeCustomizer';
import AIAdminPage from './pages/AIAdminPage';
import ClientPortal from './pages/ClientPortal';
import OnboardingAgent from './pages/OnboardingAgent';
import ClaudeEventListener from './components/ClaudeEventListener';
// import CursorAICollaborationPanel from './components/CursorAICollaborationPanel'; // Component not found
import WorkflowOptimizationDemo from './components/WorkflowOptimizationDemo';
import RapidCRMAIProfile from './components/RapidCRMAIProfile';

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
      <TooltipProvider>
        <UserProvider>
          <CRMProvider>
            <ClientProvider>
              <UIStateProvider>
              <QueryClientProvider client={queryClient}>
              <Router>
              <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
                <ClaudeEventListener />
                <Layout>
                  <Routes>
                    {/* Core Dashboard - Always loaded */}
                    <Route path="/" element={<DashboardModule />} />
                    
                    {/* CRM Pages - Direct routing like HubSpot/Salesforce */}
                    <Route path="/companies" element={<Companies />} />
                    <Route path="/companies/:id" element={<CompanyDetail />} />
                    <Route path="/leads" element={<Leads />} />
                    <Route path="/deals" element={<Deals />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/compliance" element={<ComplianceModule />} />
                    <Route path="/tasks" element={<Tasks />} />
                    <Route path="/conversations" element={<Conversations />} />
                    <Route path="/settings/api-keys" element={<ApiKeys />} />
                    <Route path="/database" element={<DatabaseManagement />} />
                    <Route path="/integrations" element={<Integrations />} />
                    <Route path="/users" element={<UserManagement />} />
                    
                    {/* Reports */}
                    <Route path="/reports" element={<AnalyticsModule />} />
                    
                    {/* Theme Customizer - Editor access only */}
                    <Route path="/theme" element={<ThemeCustomizer />} />
                    
                    {/* Client Portal Designer - Editor access only */}
                    <Route path="/client-portal" element={<ClientPortalDesigner />} />
                    
                    {/* Live Client Portal - For testing onboarding agent */}
                    <Route path="/portal" element={<ClientPortal />} />
                    <Route path="/onboarding" element={<OnboardingAgent />} />
                    
                    {/* AI Administration - Admin access only */}
                    <Route path="/admin/ai-control" element={<AIAdminPage />} />
                    
                    {/* AI Collaboration - True AI-to-AI communication */}
                    {/* <Route path="/ai-collaboration" element={<CursorAICollaborationPanel />} /> */}
                    <Route path="/workflow-optimization" element={<WorkflowOptimizationDemo />} />
                    
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
            </UIStateProvider>
          </ClientProvider>
        </CRMProvider>
      </UserProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
