import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon, 
  ChartBarIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  ExclamationIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  InformationCircleIcon,
  EyeIcon,
  PencilIcon,
  ThumbUpIcon,
  ThumbDownIcon
} from '@heroicons/react/outline';
import type { USDOTApplicationScenario } from '../../services/training/ScenarioGenerator';

interface USDOTApplicationData {
  // 3rd Party Service Provider
  isThirdPartyProvider: string;
  
  // Business Information
  legalBusinessName: string;
  dbaName: string;
  principalAddressSame: string;
  principalAddress: {
    country: string;
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  mailingAddress: {
    country: string;
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  phone: string;
  ein: string;
  isGovernmentUnit: string;
  formOfBusiness: string;
  ownershipControl: string;
  
  // Company Contact
  contactFirstName: string;
  contactMiddleName: string;
  contactLastName: string;
  contactSuffix: string;
  contactTitle: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: {
    country: string;
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  
  // Operations
  intermodalEquipmentProvider: string;
  transportProperty: string;
  receiveCompensation: string;
  propertyType: string;
  interstateCommerce: string;
  transportOwnProperty: string;
  transportPassengers: string;
  brokerServices: string;
  freightForwarder: string;
  cargoTankFacility: string;
  driveaway: string;
  towaway: string;
  cargoClassifications: string[];
  
  // Vehicle Summary
  nonCMVProperty: string;
  ownedVehicles: {
    straightTrucks: string;
    truckTractors: string;
    trailers: string;
    iepTrailerChassis: string;
  };
  termLeasedVehicles: {
    straightTrucks: string;
    truckTractors: string;
    trailers: string;
    iepTrailerChassis: string;
  };
  tripLeasedVehicles: {
    straightTrucks: string;
    truckTractors: string;
    trailers: string;
    iepTrailerChassis: string;
  };
  towDriveawayVehicles: {
    straightTrucks: string;
    truckTractors: string;
    trailers: string;
    iepTrailerChassis: string;
  };
  canadaVehicles: string;
  mexicoVehicles: string;
  interstateVehicles: string;
  intrastateVehicles: string;
  
  // Driver Summary
  interstateDrivers100Mile: string;
  interstateDriversBeyond100Mile: string;
  intrastateDrivers100Mile: string;
  intrastateDriversBeyond100Mile: string;
  cdlDrivers: string;
  canadaDrivers: string;
  mexicoDrivers: string;
  
  // Affiliations
  hasAffiliations: string;
  
  // Compliance Certifications
  complianceCertifications: {
    willingAble: string;
    produceDocuments: string;
    notDisqualified: string;
    processAgent: string;
    notSuspended: string;
    deficienciesCorrected: string;
  };
  
  // Electronic Signature
  electronicSignature: string;
}

interface TrainingSession {
  id: string;
  agentId: string;
  startTime: Date;
  endTime?: Date;
  currentStep: number;
  totalSteps: number;
  score: number;
  mistakes: string[];
  completed: boolean;
  applicationData: Partial<USDOTApplicationData>;
  scenario?: USDOTApplicationScenario;
}

interface FieldComparison {
  fieldName: string;
  expected: any;
  actual: any;
  isCorrect: boolean;
  fieldPath: string;
}

const USDOTRegistrationTrainingCenter: React.FC = () => {
  const [trainingSession, setTrainingSession] = useState<TrainingSession | null>(null);
  const [currentScenario, setCurrentScenario] = useState<USDOTApplicationScenario | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [applicationData, setApplicationData] = useState<Partial<USDOTApplicationData>>({});
  const [sessionHistory, setSessionHistory] = useState<TrainingSession[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [fieldComparisons, setFieldComparisons] = useState<FieldComparison[]>([]);
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [agentId, setAgentId] = useState<string>('usdot_rpa_agent');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [autoFillSpeed, setAutoFillSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [sessionStats, setSessionStats] = useState({
    totalScenarios: 0,
    completed: 0,
    averageAccuracy: 0
  });

  // Get agent ID from URL parameters and load session stats
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const agentIdParam = urlParams.get('agentId');
    if (agentIdParam) {
      setAgentId(agentIdParam);
    }
    loadSessionStats();
  }, []);

  // Load session statistics
  const loadSessionStats = async () => {
    try {
      const response = await fetch('/api/usdot-rpa-training/stats');
      if (response.ok) {
        const data = await response.json();
        setSessionStats(data);
      }
    } catch (error) {
      console.error('Error loading session stats:', error);
    }
  };

  // Load a random scenario from the database
  const loadNextScenario = async () => {
    try {
      const response = await fetch('/api/alex-training/next-scenario');
      if (response.ok) {
        const data = await response.json();
        if (data.scenario) {
          setCurrentScenario(data.scenario);
          return data.scenario;
        }
      }
    } catch (error) {
      console.error('Error loading scenario:', error);
    }
    return null;
  };

  // Map scenario data to USDOT form format
  const mapScenarioToFormData = (scenario: USDOTApplicationScenario): Partial<USDOTApplicationData> => {
    return {
      isThirdPartyProvider: 'N',
      legalBusinessName: scenario.legalBusinessName,
      dbaName: scenario.doingBusinessAs,
      principalAddressSame: scenario.principalAddressSameAsContact,
      principalAddress: {
        country: scenario.principalAddress.country,
        street: scenario.principalAddress.street,
        city: scenario.principalAddress.city,
        state: scenario.principalAddress.state,
        zip: scenario.principalAddress.postalCode
      },
      mailingAddress: {
        country: scenario.mailingAddress.country,
        street: scenario.mailingAddress.street,
        city: scenario.mailingAddress.city,
        state: scenario.mailingAddress.state,
        zip: scenario.mailingAddress.postalCode
      },
      phone: scenario.businessPhone,
      ein: scenario.ein,
      isGovernmentUnit: scenario.isUnitOfGovernment,
      formOfBusiness: scenario.formOfBusiness,
      ownershipControl: scenario.ownershipControl,
      contactFirstName: scenario.companyContact.firstName,
      contactMiddleName: scenario.companyContact.middleName,
      contactLastName: scenario.companyContact.lastName,
      contactSuffix: scenario.companyContact.suffix,
      contactTitle: scenario.companyContact.title,
      contactEmail: scenario.companyContact.email,
      contactPhone: scenario.companyContact.phone,
      contactAddress: {
        country: scenario.companyContact.address.country,
        street: scenario.companyContact.address.street,
        city: scenario.companyContact.address.city,
        state: scenario.companyContact.address.state,
        zip: scenario.companyContact.address.postalCode
      },
      intermodalEquipmentProvider: scenario.operateAsIntermodalEquipmentProvider,
      transportProperty: scenario.transportProperty,
      receiveCompensation: scenario.receiveCompensationForTransport,
      propertyType: scenario.propertyType,
      interstateCommerce: scenario.transportNonHazardousInterstate,
      transportOwnProperty: scenario.transportOwnProperty,
      transportPassengers: scenario.transportPassengers,
      brokerServices: scenario.provideBrokerServices,
      freightForwarder: scenario.provideFreightForwarderServices,
      cargoTankFacility: scenario.operateCargoTankFacility,
      driveaway: scenario.operateAsDriveaway,
      towaway: scenario.operateAsTowaway,
      cargoClassifications: scenario.cargoClassifications,
      nonCMVProperty: scenario.nonCMVProperty.toString(),
      ownedVehicles: {
        straightTrucks: scenario.vehicles.straightTrucks.owned.toString(),
        truckTractors: scenario.vehicles.truckTractors.owned.toString(),
        trailers: scenario.vehicles.trailers.owned.toString(),
        iepTrailerChassis: scenario.vehicles.iepTrailerChassis.owned.toString()
      },
      termLeasedVehicles: {
        straightTrucks: scenario.vehicles.straightTrucks.termLeased.toString(),
        truckTractors: scenario.vehicles.truckTractors.termLeased.toString(),
        trailers: scenario.vehicles.trailers.termLeased.toString(),
        iepTrailerChassis: scenario.vehicles.iepTrailerChassis.termLeased.toString()
      },
      tripLeasedVehicles: {
        straightTrucks: scenario.vehicles.straightTrucks.tripLeased.toString(),
        truckTractors: scenario.vehicles.truckTractors.tripLeased.toString(),
        trailers: scenario.vehicles.trailers.tripLeased.toString(),
        iepTrailerChassis: scenario.vehicles.iepTrailerChassis.tripLeased.toString()
      },
      towDriveawayVehicles: {
        straightTrucks: scenario.vehicles.straightTrucks.towDriveway.toString(),
        truckTractors: scenario.vehicles.truckTractors.towDriveway.toString(),
        trailers: scenario.vehicles.trailers.towDriveway.toString(),
        iepTrailerChassis: scenario.vehicles.iepTrailerChassis.towDriveway.toString()
      },
      canadaVehicles: scenario.vehiclesInCanada.toString(),
      mexicoVehicles: scenario.vehiclesInMexico.toString(),
      interstateVehicles: scenario.cmvInterstateOnly.toString(),
      intrastateVehicles: scenario.cmvIntrastateOnly.toString(),
      interstateDrivers100Mile: scenario.driversInterstate.within100Miles.toString(),
      interstateDriversBeyond100Mile: scenario.driversInterstate.beyond100Miles.toString(),
      intrastateDrivers100Mile: scenario.driversIntrastate.within100Miles.toString(),
      intrastateDriversBeyond100Mile: scenario.driversIntrastate.beyond100Miles.toString(),
      cdlDrivers: scenario.driversWithCDL.toString(),
      canadaDrivers: scenario.driversInCanada.toString(),
      mexicoDrivers: scenario.driversInMexico.toString(),
      hasAffiliations: scenario.hasAffiliations,
      complianceCertifications: {
        willingAble: scenario.certifyWillingAndAble,
        produceDocuments: scenario.certifyProduceDocuments,
        notDisqualified: scenario.certifyNotDisqualified,
        processAgent: scenario.certifyUnderstandProcessAgent,
        notSuspended: scenario.certifyNotUnderSuspension,
        deficienciesCorrected: scenario.certifyDeficienciesCorrected
      },
      electronicSignature: scenario.electronicSignature
    };
  };

  // Simulate RPA auto-filling fields with delay
  const autoFillField = async (fieldName: string, value: any, delay: number) => {
    await new Promise(resolve => setTimeout(resolve, delay));
    setApplicationData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  // Auto-fill all fields for current step
  const autoFillCurrentStep = async () => {
    if (!currentScenario) return;
    
    setIsAutoFilling(true);
    const formData = mapScenarioToFormData(currentScenario);
    const speed = autoFillSpeed === 'slow' ? 1000 : autoFillSpeed === 'normal' ? 500 : 200;

    // Auto-fill based on current step
    switch (currentStep) {
      case 1: // 3rd Party
        await autoFillField('isThirdPartyProvider', formData.isThirdPartyProvider, speed);
        break;
      case 2: // Business Info
        await autoFillField('legalBusinessName', formData.legalBusinessName, speed);
        await autoFillField('dbaName', formData.dbaName, speed);
        await autoFillField('formOfBusiness', formData.formOfBusiness, speed);
        break;
      // Add more cases for other steps...
    }

    setIsAutoFilling(false);
  };

  // Application steps configuration
  const applicationSteps = [
    { id: 1, title: '3rd Party Service Provider', section: 'thirdParty' },
    { id: 2, title: 'Business Information', section: 'businessInfo' },
    { id: 3, title: 'Company Contact', section: 'companyContact' },
    { id: 4, title: 'Operations Classification', section: 'operations' },
    { id: 5, title: 'Vehicle Summary', section: 'vehicles' },
    { id: 6, title: 'Driver Summary', section: 'drivers' },
    { id: 7, title: 'Affiliations', section: 'affiliations' },
    { id: 8, title: 'Compliance Certifications', section: 'compliance' },
    { id: 9, title: 'Electronic Signature', section: 'signature' }
  ];

  const totalSteps = applicationSteps.length;

  // Start training session
  const startTrainingSession = () => {
    const session: TrainingSession = {
      id: `session_${Date.now()}`,
      agentId: agentId || 'default_agent',
      startTime: new Date(),
      currentStep: 1,
      totalSteps: totalSteps,
      score: 0,
      mistakes: [],
      completed: false,
      applicationData: {}
    };

    setTrainingSession(session);
    setIsTraining(true);
    setCurrentStep(1);
    setApplicationData({});
    setShowResults(false);
  };

  // Update application data
  const updateApplicationData = (field: string, value: any) => {
    setApplicationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Navigate to next step
  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      if (trainingSession) {
        setTrainingSession(prev => prev ? {
          ...prev,
          currentStep: currentStep + 1,
          applicationData: applicationData
        } : null);
      }
    } else {
      completeTrainingSession();
    }
  };

  // Navigate to previous step
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      if (trainingSession) {
        setTrainingSession(prev => prev ? {
          ...prev,
          currentStep: currentStep - 1
        } : null);
      }
    }
  };

  // Complete training session
  const completeTrainingSession = () => {
    if (!trainingSession) return;

    const completedSession: TrainingSession = {
      ...trainingSession,
      endTime: new Date(),
      completed: true,
      applicationData: applicationData
    };

    setSessionHistory(prev => [...prev, completedSession]);
    setIsTraining(false);
    setShowResults(true);
  };

  // Reset training
  const resetTraining = () => {
    setTrainingSession(null);
    setIsTraining(false);
    setCurrentStep(1);
    setApplicationData({});
    setShowResults(false);
  };

  // Render the FMCSA interface for the current step
  const renderCurrentStep = () => {
    const currentStepData = applicationSteps.find(step => step.id === currentStep);
    
    return (
      <div className="bg-white border-2 border-gray-300 rounded-lg shadow-lg p-6">
        {/* FMCSA Header */}
        <div className="bg-blue-900 text-white p-4 rounded-t-lg mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">FMCSA</h1>
              <p className="text-sm">Federal Motor Carrier Safety Administration</p>
            </div>
            <div className="text-sm">
              <p>United States Department of Transportation</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step Title */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Step {currentStep}: {currentStepData?.title}
          </h2>
        </div>

        {/* Form Content */}
        <div className="bg-gray-50 p-6 rounded-lg">
          {renderStepContent()}
        </div>

        {/* Navigation Menu */}
        <div className="mt-6 flex justify-between items-center">
          <div className="flex space-x-2">
            <button 
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50" 
              disabled={currentStep === 1}
              onClick={handlePrevious}
            >
              <ArrowLeftIcon className="h-4 w-4 inline mr-1" />
              PREVIOUS
            </button>
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              onClick={handleNext}
            >
              NEXT
              <ArrowRightIcon className="h-4 w-4 inline ml-1" />
            </button>
          </div>
          
          <div className="flex space-x-2">
            <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300">
              SAVE
            </button>
            <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300">
              HELP
            </button>
            <button className="px-3 py-1 bg-red-200 text-red-700 rounded text-sm hover:bg-red-300">
              LOGOUT
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render content for the current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderThirdPartyStep();
      case 2:
        return renderBusinessInfoStep();
      case 3:
        return renderCompanyContactStep();
      case 4:
        return renderOperationsStep();
      case 5:
        return renderVehicleStep();
      case 6:
        return renderDriverStep();
      case 7:
        return renderAffiliationsStep();
      case 8:
        return renderComplianceStep();
      case 9:
        return renderSignatureStep();
      default:
        return <div>Step content not implemented</div>;
    }
  };

  // Step 1: 3rd Party Service Provider
  const renderThirdPartyStep = () => {
    return (
      <div>
        <label className="block text-lg font-medium text-gray-900 mb-4">
          Are you a 3rd Party Service provider ?
        </label>
        
        <div className="space-y-3">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="thirdPartyProvider"
              value="Y"
              checked={applicationData.isThirdPartyProvider === 'Y'}
              onChange={(e) => updateApplicationData('isThirdPartyProvider', e.target.value)}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-gray-900">Yes</span>
          </label>
          
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="thirdPartyProvider"
              value="N"
              checked={applicationData.isThirdPartyProvider === 'N'}
              onChange={(e) => updateApplicationData('isThirdPartyProvider', e.target.value)}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-gray-900">No</span>
          </label>
        </div>
      </div>
    );
  };

  // Step 2: Business Information
  const renderBusinessInfoStep = () => {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Legal Business Name
          </label>
          <input
            type="text"
            value={applicationData.legalBusinessName || ''}
            onChange={(e) => updateApplicationData('legalBusinessName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter legal business name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Doing Business As Name (if different)
          </label>
          <input
            type="text"
            value={applicationData.dbaName || ''}
            onChange={(e) => updateApplicationData('dbaName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter DBA name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Form of Business
          </label>
          <select
            value={applicationData.formOfBusiness || ''}
            onChange={(e) => updateApplicationData('formOfBusiness', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select business form</option>
            <option value="sole_proprietor">Sole Proprietor</option>
            <option value="partnership">Partnership</option>
            <option value="llc">Limited Liability Company</option>
            <option value="corporation">Corporation</option>
            <option value="llp">Limited Liability Partnership</option>
            <option value="trust">Trust</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
    );
  };

  // Placeholder for other steps
  const renderCompanyContactStep = () => (
    <div className="text-center py-8">
      <InformationCircleIcon className="h-12 w-12 text-blue-500 mx-auto mb-4" />
      <p className="text-gray-600">Company Contact Information</p>
      <p className="text-sm text-gray-500">Step implementation in progress...</p>
    </div>
  );

  const renderOperationsStep = () => (
    <div className="text-center py-8">
      <InformationCircleIcon className="h-12 w-12 text-blue-500 mx-auto mb-4" />
      <p className="text-gray-600">Operations Classification</p>
      <p className="text-sm text-gray-500">Step implementation in progress...</p>
    </div>
  );

  const renderVehicleStep = () => (
    <div className="text-center py-8">
      <InformationCircleIcon className="h-12 w-12 text-blue-500 mx-auto mb-4" />
      <p className="text-gray-600">Vehicle Summary</p>
      <p className="text-sm text-gray-500">Step implementation in progress...</p>
    </div>
  );

  const renderDriverStep = () => (
    <div className="text-center py-8">
      <InformationCircleIcon className="h-12 w-12 text-blue-500 mx-auto mb-4" />
      <p className="text-gray-600">Driver Summary</p>
      <p className="text-sm text-gray-500">Step implementation in progress...</p>
    </div>
  );

  const renderAffiliationsStep = () => (
    <div className="text-center py-8">
      <InformationCircleIcon className="h-12 w-12 text-blue-500 mx-auto mb-4" />
      <p className="text-gray-600">Affiliations</p>
      <p className="text-sm text-gray-500">Step implementation in progress...</p>
    </div>
  );

  const renderComplianceStep = () => (
    <div className="text-center py-8">
      <InformationCircleIcon className="h-12 w-12 text-blue-500 mx-auto mb-4" />
      <p className="text-gray-600">Compliance Certifications</p>
      <p className="text-sm text-gray-500">Step implementation in progress...</p>
    </div>
  );

  const renderSignatureStep = () => (
    <div className="text-center py-8">
      <InformationCircleIcon className="h-12 w-12 text-blue-500 mx-auto mb-4" />
      <p className="text-gray-600">Electronic Signature</p>
      <p className="text-sm text-gray-500">Step implementation in progress...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            USDOT Registration Training Center
          </h1>
          <p className="text-gray-600">
            Complete start-to-finish USDOT application process - Agent: {agentId || 'Not Selected'}
          </p>
        </div>

        {!isTraining ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <DocumentTextIcon className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Start USDOT Application Training
            </h2>
            <p className="text-gray-600 mb-6">
              This will open a complete USDOT registration process that looks exactly like the real FMCSA website.
              The agent will go through all 9 steps of the application process.
            </p>
            <button
              onClick={startTrainingSession}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-2 mx-auto"
            >
              <PlayIcon className="h-5 w-5" />
              <span>Start Training Session</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Application Interface */}
            <div className="lg:col-span-3">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  USDOT Application Training
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    Step {currentStep} of {totalSteps}
                  </span>
                  <button
                    onClick={resetTraining}
                    className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                  >
                    Stop Training
                  </button>
                </div>
              </div>
              
              {renderCurrentStep()}
            </div>

            {/* Training Progress Sidebar */}
            <div className="space-y-6">
              {/* Current Session Stats */}
              {trainingSession && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Training Progress</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Progress:</span>
                      <span className="text-sm font-medium">
                        {Math.round((currentStep / totalSteps) * 100)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Current Step:</span>
                      <span className="text-sm font-medium">{currentStep}/{totalSteps}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Agent ID:</span>
                      <span className="text-sm font-medium">{agentId}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Application Steps */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Application Steps</h3>
                <div className="space-y-2">
                  {applicationSteps.map((step) => (
                    <div 
                      key={step.id}
                      className={`flex items-center space-x-2 p-2 rounded ${
                        step.id === currentStep 
                          ? 'bg-blue-100 text-blue-800' 
                          : step.id < currentStep 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {step.id < currentStep ? (
                        <CheckCircleIcon className="h-4 w-4" />
                      ) : step.id === currentStep ? (
                        <ClockIcon className="h-4 w-4" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                      )}
                      <span className="text-sm">{step.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Session History */}
              {sessionHistory.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Recent Sessions</h3>
                  <div className="space-y-2">
                    {sessionHistory.slice(-3).map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <div className="text-sm font-medium">
                            Session {session.id.slice(-4)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {session.startTime.toLocaleTimeString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {session.completed ? 'Completed' : 'In Progress'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {session.mistakes.length} mistakes
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Training Results */}
        {showResults && trainingSession && (
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Training Session Complete</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                <span className="text-sm">
                  Application completed successfully
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Duration:</span> 
                  {trainingSession.endTime && trainingSession.startTime ? 
                    ` ${Math.round((trainingSession.endTime.getTime() - trainingSession.startTime.getTime()) / 1000)}s` : 
                    ' N/A'
                  }
                </div>
                <div>
                  <span className="font-medium">Steps Completed:</span> {currentStep}/{totalSteps}
                </div>
              </div>
              
              <button
                onClick={resetTraining}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Start New Training Session
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default USDOTRegistrationTrainingCenter;
