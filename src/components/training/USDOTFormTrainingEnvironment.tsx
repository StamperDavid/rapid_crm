/**
 * USDOT Form Training Environment
 * Integrates real captured HTML pages for training
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  PlayIcon,
  PauseIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  RefreshIcon,
  DocumentTextIcon,
  EyeIcon
} from '@heroicons/react/outline';
// Scenario interface (matches database schema)
interface USDOTApplicationScenario {
  id: string;
  legalBusinessName: string;
  doingBusinessAs: string;
  formOfBusiness: string;
  ein: string;
  businessPhone: string;
  principalAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
  };
  companyContact: {
    firstName: string;
    lastName: string;
    title: string;
    email: string;
    phone: string;
  };
  receiveCompensationForTransport: string;
  transportNonHazardousInterstate: string;
  propertyType: string;
  transportHazardousMaterials: string;
  operationType: string;
  vehicles: {
    straightTrucks: { owned: number; termLeased: number };
    truckTractors: { owned: number; termLeased: number };
    trailers: { owned: number; termLeased: number };
  };
  complianceRequirements: {
    usdotRequired: boolean;
    mcAuthorityRequired: boolean;
    hazmatEndorsementRequired: boolean;
    iftaRequired: boolean;
    stateRegistrationRequired: boolean;
    reasoning: string;
  };
}

interface TrainingState {
  currentScenarioIndex: number;
  isPlaying: boolean;
  isCompleted: boolean;
  answers: Record<string, string>;
  accuracy: number;
  totalScenarios: number;
  completedScenarios: number;
}

const USDOTFormTrainingEnvironment: React.FC = () => {
  const [scenarios, setScenarios] = useState<USDOTApplicationScenario[]>([]);
  const [trainingState, setTrainingState] = useState<TrainingState>({
    currentScenarioIndex: 0,
    isPlaying: false,
    isCompleted: false,
    answers: {},
    accuracy: 0,
    totalScenarios: 0,
    completedScenarios: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    loadScenarios();
  }, []);

  const loadScenarios = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Loading scenarios from database...');
      
      // Fetch scenarios from the database via API
      const response = await fetch('/api/alex-training/all-scenarios');
      const data = await response.json();
      
      if (data.scenarios) {
        console.log(`📊 Loaded ${data.scenarios.length} scenarios from database`);
        setScenarios(data.scenarios);
        setTrainingState(prev => ({
          ...prev,
          totalScenarios: data.scenarios.length
        }));
        console.log(`✅ Training environment ready with ${data.scenarios.length} scenarios`);
      }
    } catch (error) {
      console.error('❌ Error loading scenarios:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentScenario = scenarios[trainingState.currentScenarioIndex];

  const handleAnswer = (questionId: string, answer: string) => {
    setTrainingState(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: answer
      }
    }));
  };

  const nextScenario = () => {
    if (trainingState.currentScenarioIndex < scenarios.length - 1) {
      setTrainingState(prev => ({
        ...prev,
        currentScenarioIndex: prev.currentScenarioIndex + 1,
        completedScenarios: prev.completedScenarios + 1
      }));
    }
  };

  const previousScenario = () => {
    if (trainingState.currentScenarioIndex > 0) {
      setTrainingState(prev => ({
        ...prev,
        currentScenarioIndex: prev.currentScenarioIndex - 1
      }));
    }
  };

  const togglePlay = () => {
    setTrainingState(prev => ({
      ...prev,
      isPlaying: !prev.isPlaying
    }));
  };

  const resetTraining = () => {
    setTrainingState({
      currentScenarioIndex: 0,
      isPlaying: false,
      isCompleted: false,
      answers: {},
      accuracy: 0,
      totalScenarios: scenarios.length,
      completedScenarios: 0
    });
  };

  const renderScenarioContent = () => {
    if (!currentScenario) return null;

    return (
      <div className="w-full h-full bg-white p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {currentScenario.legalBusinessName}
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Business Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-3">Business Information</h2>
              <div className="space-y-2 text-sm">
                <p><strong>Legal Name:</strong> {currentScenario.legalBusinessName}</p>
                <p><strong>DBA:</strong> {currentScenario.doingBusinessAs}</p>
                <p><strong>Business Type:</strong> {currentScenario.formOfBusiness}</p>
                <p><strong>EIN:</strong> {currentScenario.ein}</p>
                <p><strong>Phone:</strong> {currentScenario.businessPhone}</p>
              </div>
            </div>

            {/* Address Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-3">Address Information</h2>
              <div className="space-y-2 text-sm">
                <p><strong>Principal Address:</strong></p>
                <p>{currentScenario.principalAddress.street}</p>
                <p>{currentScenario.principalAddress.city}, {currentScenario.principalAddress.state} {currentScenario.principalAddress.postalCode}</p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-3">Contact Information</h2>
              <div className="space-y-2 text-sm">
                <p><strong>Name:</strong> {currentScenario.companyContact.firstName} {currentScenario.companyContact.lastName}</p>
                <p><strong>Title:</strong> {currentScenario.companyContact.title}</p>
                <p><strong>Email:</strong> {currentScenario.companyContact.email}</p>
                <p><strong>Phone:</strong> {currentScenario.companyContact.phone}</p>
              </div>
            </div>

            {/* Operation Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-3">Operation Details</h2>
              <div className="space-y-2 text-sm">
                <p><strong>Operation Type:</strong> {currentScenario.operationType}</p>
                <p><strong>For Hire:</strong> {currentScenario.receiveCompensationForTransport}</p>
                <p><strong>Interstate:</strong> {currentScenario.transportNonHazardousInterstate}</p>
                <p><strong>Property Type:</strong> {currentScenario.propertyType}</p>
                <p><strong>Hazmat:</strong> {currentScenario.transportHazardousMaterials}</p>
              </div>
            </div>

            {/* Fleet Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-3">Fleet Information</h2>
              <div className="space-y-2 text-sm">
                <p><strong>Straight Trucks:</strong> {currentScenario.vehicles.straightTrucks.owned} owned, {currentScenario.vehicles.straightTrucks.termLeased} leased</p>
                <p><strong>Truck Tractors:</strong> {currentScenario.vehicles.truckTractors.owned} owned, {currentScenario.vehicles.truckTractors.termLeased} leased</p>
                <p><strong>Trailers:</strong> {currentScenario.vehicles.trailers.owned} owned, {currentScenario.vehicles.trailers.termLeased} leased</p>
              </div>
            </div>

            {/* Compliance Requirements */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-3">Compliance Requirements</h2>
              <div className="space-y-2 text-sm">
                <p><strong>USDOT Required:</strong> {currentScenario.complianceRequirements.usdotRequired ? 'Yes' : 'No'}</p>
                <p><strong>MC Authority Required:</strong> {currentScenario.complianceRequirements.mcAuthorityRequired ? 'Yes' : 'No'}</p>
                <p><strong>Hazmat Endorsement:</strong> {currentScenario.complianceRequirements.hazmatEndorsementRequired ? 'Yes' : 'No'}</p>
                <p><strong>IFTA Required:</strong> {currentScenario.complianceRequirements.iftaRequired ? 'Yes' : 'No'}</p>
                <p><strong>State Registration:</strong> {currentScenario.complianceRequirements.stateRegistrationRequired ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>

          {/* Reasoning */}
          <div className="mt-6 bg-blue-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-3">Compliance Reasoning</h2>
            <p className="text-sm text-gray-700">{currentScenario.complianceRequirements.reasoning}</p>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshIcon className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading USDOT form pages...</p>
        </div>
      </div>
    );
  }

  if (scenarios.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <DocumentTextIcon className="h-8 w-8 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">No training scenarios loaded</p>
          <button
            onClick={loadScenarios}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reload Scenarios
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              USDOT Scenario Training Environment
            </h2>
            <p className="text-sm text-gray-600">
              Scenario {trainingState.currentScenarioIndex + 1} of {trainingState.totalScenarios}
              {currentScenario && ` - ${currentScenario.legalBusinessName}`}
            </p>
            <p className="text-xs text-gray-500">
              Debug: {scenarios.length} scenarios loaded, {trainingState.totalScenarios} in state
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Progress */}
            <div className="text-sm text-gray-600">
              {trainingState.completedScenarios}/{trainingState.totalScenarios} completed
            </div>
            
            {/* Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={previousScenario}
                disabled={trainingState.currentScenarioIndex === 0}
                className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeftIcon className="h-4 w-4" />
              </button>
              
              <button
                onClick={togglePlay}
                className="p-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
              >
                {trainingState.isPlaying ? (
                  <PauseIcon className="h-4 w-4" />
                ) : (
                  <PlayIcon className="h-4 w-4" />
                )}
              </button>
              
              <button
                onClick={nextScenario}
                disabled={trainingState.currentScenarioIndex === scenarios.length - 1}
                className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowRightIcon className="h-4 w-4" />
              </button>
              
              <button
                onClick={resetTraining}
                className="p-2 rounded-md bg-gray-100 hover:bg-gray-200"
              >
                <RefreshIcon className="h-4 w-4" />
              </button>
              
              <button
                onClick={loadScenarios}
                className="p-2 rounded-md bg-blue-100 hover:bg-blue-200 text-blue-600"
                title="Reload all scenarios"
              >
                <RefreshIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((trainingState.currentScenarioIndex + 1) / trainingState.totalScenarios) * 100}%`
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Scenario Display */}
        <div className="flex-1 p-4">
          <div className="bg-white rounded-lg shadow-sm h-full overflow-hidden">
            {renderScenarioContent()}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Scenario Details</h3>
          
          {currentScenario && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Scenario ID</h4>
                <div className="mt-2 text-sm text-gray-600">
                  <p><strong>ID:</strong> {currentScenario.id}</p>
                  <p><strong>Type:</strong> {currentScenario.operationType}</p>
                  <p><strong>State:</strong> {currentScenario.principalAddress.state}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700">Business Details</h4>
                <div className="mt-2 text-sm text-gray-600">
                  <p><strong>Company:</strong> {currentScenario.legalBusinessName}</p>
                  <p><strong>DBA:</strong> {currentScenario.doingBusinessAs}</p>
                  <p><strong>Business Type:</strong> {currentScenario.formOfBusiness}</p>
                  <p><strong>EIN:</strong> {currentScenario.ein}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700">Operation Details</h4>
                <div className="mt-2 text-sm text-gray-600">
                  <p><strong>For Hire:</strong> {currentScenario.receiveCompensationForTransport}</p>
                  <p><strong>Interstate:</strong> {currentScenario.transportNonHazardousInterstate}</p>
                  <p><strong>Property Type:</strong> {currentScenario.propertyType}</p>
                  <p><strong>Hazmat:</strong> {currentScenario.transportHazardousMaterials}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700">Fleet Details</h4>
                <div className="mt-2 text-sm text-gray-600">
                  <p><strong>Straight Trucks:</strong> {currentScenario.vehicles.straightTrucks.owned} owned</p>
                  <p><strong>Truck Tractors:</strong> {currentScenario.vehicles.truckTractors.owned} owned</p>
                  <p><strong>Trailers:</strong> {currentScenario.vehicles.trailers.owned} owned</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700">Compliance Requirements</h4>
                <div className="mt-2 text-sm text-gray-600">
                  <p><strong>USDOT:</strong> {currentScenario.complianceRequirements.usdotRequired ? 'Yes' : 'No'}</p>
                  <p><strong>MC Authority:</strong> {currentScenario.complianceRequirements.mcAuthorityRequired ? 'Yes' : 'No'}</p>
                  <p><strong>Hazmat:</strong> {currentScenario.complianceRequirements.hazmatEndorsementRequired ? 'Yes' : 'No'}</p>
                  <p><strong>IFTA:</strong> {currentScenario.complianceRequirements.iftaRequired ? 'Yes' : 'No'}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700">Training Status</h4>
                <div className="mt-2 text-sm text-gray-600">
                  <p><strong>Accuracy:</strong> {trainingState.accuracy.toFixed(1)}%</p>
                  <p><strong>Progress:</strong> {trainingState.completedScenarios}/{trainingState.totalScenarios}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700">Compliance Reasoning</h4>
                <div className="mt-2 text-sm text-gray-600">
                  <p className="text-xs">{currentScenario.complianceRequirements.reasoning}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default USDOTFormTrainingEnvironment;
