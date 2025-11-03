import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { UserProvider } from './contexts/UserContext';
import { CRMProvider } from './contexts/CRMContext';
import { ClientProvider } from './contexts/ClientContext';
import { UIStateProvider } from './contexts/UIStateContext';
import { TooltipProvider } from './contexts/TooltipContext';
import { ModuleProvider } from './contexts/ModuleContext';
import Layout from './components/Layout';
import ClientLayout from './components/ClientLayout';
import ErrorBoundary from './components/ErrorBoundary';
import TooltipTest from './components/TooltipTest';

// Import modules directly (not lazy loaded for now)
import DashboardModule from './modules/Dashboard/index';
import Companies from './modules/CRM/pages/Companies';
import CompanyDetail from './modules/CRM/pages/CompanyDetail';
import Services from './modules/CRM/pages/Services';
import EditService from './modules/CRM/pages/EditService';
import Leads from './modules/CRM/pages/Leads';
import Deals from './modules/CRM/pages/Deals';
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
import AIControlCenter from './components/AIControlCenter';
import AIAdminPage from './pages/AIAdminPage';
import RegulationTrainingDashboard from './components/training/RegulationTrainingDashboard';
import USDOTRegistrationTrainingCenter from './components/training/USDOTRegistrationTrainingCenter';
import AgentPerformanceMonitoringDashboard from './components/training/AgentPerformanceMonitoringDashboard';
import CriticalPathTestCenter from './components/training/CriticalPathTestCenter';
import AlexTrainingCenter from './components/training/AlexTrainingCenter';
import ClientPortal from './pages/ClientPortal';
import ClientLogin from './pages/ClientLogin';
import OnboardingAgent from './pages/OnboardingAgent';
import QualifiedStatesManagement from './pages/QualifiedStatesManagement';
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
                <ModuleProvider>
                  <QueryClientProvider client={queryClient}>
              <Router>
              <div className="min-h-screen">
                <ClaudeEventListener />
                <Routes>
                  {/* Client Login Route */}
                  <Route path="/client-login" element={<ClientLogin />} />
                  
                  {/* Client Login Preview Route (for admin testing) */}
                  <Route path="/preview-login" element={<ClientLogin />} />
                  
                  {/* Client Portal Routes - Use ClientLayout (No Admin Interface) */}
                  <Route path="/portal" element={
                    <ClientLayout>
                      <ClientPortal />
                    </ClientLayout>
                  } />
                  <Route path="/onboarding" element={
                    <ClientLayout>
                      <OnboardingAgent />
                    </ClientLayout>
                  } />
                  
                  {/* Admin Routes - Use Layout (Full Admin Interface) */}
                  <Route path="/*" element={
                    <ErrorBoundary>
                      <Layout>
                        <Routes>
                        {/* Core Dashboard - Always loaded */}
                        <Route path="/" element={<DashboardModule />} />
                        <Route path="/tooltip-test" element={<TooltipTest />} />
                        
                        {/* CRM Pages - Direct routing like HubSpot/Salesforce */}
                        <Route path="/companies" element={<Companies />} />
                        <Route path="/companies/:id" element={<CompanyDetail />} />
                        <Route path="/leads" element={<Leads />} />
                        <Route path="/deals" element={<Deals />} />
                        <Route path="/services" element={<Services />} />
                        <Route path="/services/edit/:id" element={<EditService />} />
                        <Route path="/compliance" element={<ComplianceModule />} />
                        <Route path="/tasks" element={<Tasks />} />
                        <Route path="/conversations" element={<Conversations />} />
                        <Route path="/settings/api-keys" element={<ApiKeys />} />
                        <Route path="/database" element={<DatabaseManagement />} />
                        <Route path="/users" element={<UserManagement />} />
                        <Route path="/qualified-states" element={<QualifiedStatesManagement />} />
                        
                        {/* Reports */}
                        <Route path="/reports" element={<AnalyticsModule />} />
                        
                        {/* Theme Customizer - Editor access only */}
                        <Route path="/theme" element={<ThemeCustomizer />} />
                        
                        {/* Client Portal Designer - Editor access only */}
                        <Route path="/client-portal" element={<ClientPortalDesigner />} />
                        
                        {/* AI Administration - Admin access only */}
                        <Route path="/admin/ai-control" element={<AIControlCenter />} />
                        <Route path="/ai-admin" element={<AIAdminPage />} />
                        
                        {/* Training Environment Routes - Admin/Trainer access only */}
                        <Route path="/training" element={<RegulationTrainingDashboard />} />
                        <Route path="/training/alex" element={<AlexTrainingCenter />} />
                        <Route path="/training/usdot" element={<USDOTRegistrationTrainingCenter />} />
                        <Route path="/training/monitoring" element={<AgentPerformanceMonitoringDashboard />} />
                        <Route path="/training/critical-path" element={<CriticalPathTestCenter />} />
                        
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
                    </ErrorBoundary>
                  } />
                </Routes>
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
                </ModuleProvider>
              </UIStateProvider>
            </ClientProvider>
          </CRMProvider>
        </UserProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
