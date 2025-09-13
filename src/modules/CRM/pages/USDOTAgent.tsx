import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChatIcon,
  UserIcon,
  OfficeBuildingIcon,
  TruckIcon,
  ExclamationIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  MicrophoneIcon,
  SpeakerphoneIcon,
  DocumentTextIcon
} from '@heroicons/react/outline';
import { useCRM } from '../../../contexts/CRMContext';

interface USDOTApplicationData {
  // Part 1: Company and Business Information
  legalBusinessName: string;
  dbaName: string;
  principalAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  mailingAddress: {
    isDifferent: boolean;
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  primaryContact: {
    fullName: string;
    title: string;
    phone: string;
    fax: string;
    email: string;
  };
  companyOfficial: {
    fullName: string;
    title: string;
    phone: string;
    email: string;
  };
  businessType: 'Sole Proprietor' | 'Partnership' | 'Corporation' | 'LLC' | 'Other';
  ein: string;
  dunsNumber: string;
  
  // Part 2: Operations and Authority
  operationTypes: string[];
  carrierOperationTypes: string[];
  
  // Part 3: Fleet and Cargo Information
  powerUnits: {
    owned: number;
    termLeased: number;
    tripLeased: number;
  };
  drivers: {
    employees: number;
    ownerOperators: number;
  };
  operationClassifications: string[];
  cargoClassifications: string[];
  hazardousMaterials: {
    classifications: string[];
    hmClasses: string[];
  };
  
  // Part 4: Financial and Safety Information
  marketerOfTransportationServices: boolean;
  applicationDate: string;
  signature: string;
  officialTitle: string;
}

interface ConversationStep {
  id: string;
  question: string;
  field: string;
  type: 'text' | 'select' | 'multiselect' | 'number' | 'boolean' | 'address';
  options?: string[];
  required: boolean;
  conditional?: {
    field: string;
    value: any;
  };
  followUpQuestions?: ConversationStep[];
}

const USDOTAgent: React.FC = () => {
  const navigate = useNavigate();
  const { createCompany } = useCRM();
  
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [conversationHistory, setConversationHistory] = useState<Array<{
    type: 'agent' | 'client';
    message: string;
    timestamp: Date;
  }>>([]);
  const [formData, setFormData] = useState<USDOTApplicationData>({
    legalBusinessName: '',
    dbaName: '',
    principalAddress: { street: '', city: '', state: '', zip: '' },
    mailingAddress: { isDifferent: false, street: '', city: '', state: '', zip: '' },
    primaryContact: { fullName: '', title: '', phone: '', fax: '', email: '' },
    companyOfficial: { fullName: '', title: '', phone: '', email: '' },
    businessType: 'LLC',
    ein: '',
    dunsNumber: '',
    operationTypes: [],
    carrierOperationTypes: [],
    powerUnits: { owned: 0, termLeased: 0, tripLeased: 0 },
    drivers: { employees: 0, ownerOperators: 0 },
    operationClassifications: [],
    cargoClassifications: [],
    hazardousMaterials: { classifications: [], hmClasses: [] },
    marketerOfTransportationServices: false,
    applicationDate: new Date().toISOString().split('T')[0],
    signature: '',
    officialTitle: ''
  });

  const conversationSteps: ConversationStep[] = [
    // Part 1: Company Information
    {
      id: 'legalBusinessName',
      question: "Hello! I'm here to help you apply for a USDOT number. Let's start with your company information. What is your legal business name?",
      field: 'legalBusinessName',
      type: 'text',
      required: true
    },
    {
      id: 'dbaName',
      question: "Do you operate under a 'Doing Business As' or DBA name that's different from your legal business name?",
      field: 'dbaName',
      type: 'text',
      required: false
    },
    {
      id: 'businessType',
      question: "What type of business entity are you? Are you a Sole Proprietor, Partnership, Corporation, LLC, or Other?",
      field: 'businessType',
      type: 'select',
      options: ['Sole Proprietor', 'Partnership', 'Corporation', 'LLC', 'Other'],
      required: true
    },
    {
      id: 'ein',
      question: "What is your Employer Identification Number or EIN? This is a 9-digit number that looks like XX-XXXXXXX.",
      field: 'ein',
      type: 'text',
      required: true
    },
    {
      id: 'principalAddress',
      question: "Now let's get your principal place of business address. What is your street address?",
      field: 'principalAddress',
      type: 'address',
      required: true
    },
    {
      id: 'mailingAddress',
      question: "Is your mailing address different from your principal business address?",
      field: 'mailingAddress',
      type: 'boolean',
      required: false
    },
    
    // Part 2: Operations
    {
      id: 'operationTypes',
      question: "What type of transportation operations will you be conducting? You can select multiple options: Motor Carrier, Broker, Freight Forwarder, Intermodal Equipment Provider, Cargo Tank Facility, Shipper, or Receiver?",
      field: 'operationTypes',
      type: 'multiselect',
      options: ['Motor Carrier', 'Broker', 'Freight Forwarder', 'Intermodal Equipment Provider (IEP)', 'Cargo Tank Facility', 'Shipper', 'Receiver'],
      required: true
    },
    {
      id: 'carrierOperationTypes',
      question: "Since you selected Motor Carrier, what type of carrier operations will you conduct? Are you a For-Hire Carrier (Interstate or Intrastate), Private Carrier (Interstate or Intrastate), Exempt For-Hire Carrier, Private Passenger Carrier, or Migrant Worker Carrier?",
      field: 'carrierOperationTypes',
      type: 'multiselect',
      options: ['For-Hire Carrier: Interstate', 'For-Hire Carrier: Intrastate', 'Private Carrier: Interstate', 'Private Carrier: Intrastate', 'Exempt For-Hire Carrier: Interstate', 'Private Passenger Carrier: Non-Business', 'Migrant Worker Carrier', 'Other'],
      required: true,
      conditional: {
        field: 'operationTypes',
        value: 'Motor Carrier'
      }
    },
    
    // Part 3: Fleet Information (conditional)
    {
      id: 'powerUnits',
      question: "Let's talk about your fleet. How many power units do you own?",
      field: 'powerUnits.owned',
      type: 'number',
      required: true,
      conditional: {
        field: 'operationTypes',
        value: 'Motor Carrier'
      }
    },
    {
      id: 'termLeased',
      question: "How many power units do you have under term lease?",
      field: 'powerUnits.termLeased',
      type: 'number',
      required: true,
      conditional: {
        field: 'operationTypes',
        value: 'Motor Carrier'
      }
    },
    {
      id: 'tripLeased',
      question: "How many power units do you have under trip lease?",
      field: 'powerUnits.tripLeased',
      type: 'number',
      required: true,
      conditional: {
        field: 'operationTypes',
        value: 'Motor Carrier'
      }
    },
    {
      id: 'drivers',
      question: "How many driver employees do you have?",
      field: 'drivers.employees',
      type: 'number',
      required: true,
      conditional: {
        field: 'operationTypes',
        value: 'Motor Carrier'
      }
    },
    {
      id: 'ownerOperators',
      question: "How many owner-operators work with you?",
      field: 'drivers.ownerOperators',
      type: 'number',
      required: true,
      conditional: {
        field: 'operationTypes',
        value: 'Motor Carrier'
      }
    },
    {
      id: 'operationClassifications',
      question: "What types of operations will you conduct? Select all that apply: General Freight, Household Goods, Passengers, Oilfield Equipment, Livestock, Motor Vehicles, Metal, Building Materials, Water Well Drilling, Agricultural, Grain/Feed/Hay, Construction, or Other?",
      field: 'operationClassifications',
      type: 'multiselect',
      options: ['General Freight', 'Household Goods', 'Passengers', 'Oilfield Equipment', 'Livestock', 'Motor Vehicles', 'Metal (Sheet, Coils, Rolls)', 'Building Materials', 'Water Well Drilling', 'Agricultural', 'Grain, Feed, Hay', 'Construction', 'Other'],
      required: true,
      conditional: {
        field: 'operationTypes',
        value: 'Motor Carrier'
      }
    },
    {
      id: 'cargoClassifications',
      question: "What types of cargo will you transport? Select all that apply: General Freight, Household Goods, Commodities Requiring Special Handling, Refrigerated Food, Liquids/Gases, Dry Bulk, Forest Products, Machinery/Large Objects, Garbage/Refuse, or US Mail?",
      field: 'cargoClassifications',
      type: 'multiselect',
      options: ['General Freight', 'Household Goods', 'Commodities Requiring Special Handling', 'Refrigerated Food', 'Liquids/Gases', 'Dry Bulk', 'Forest Products', 'Machinery, Large Objects', 'Garbage/Refuse', 'US Mail'],
      required: true,
      conditional: {
        field: 'carrierOperationTypes',
        value: 'For-Hire Carrier: Interstate'
      }
    },
    {
      id: 'hazardousMaterials',
      question: "Will you be transporting hazardous materials? If yes, what classifications apply: C (Cargo Tank), S (Non-Cargo Tank), B (Bulk), or NB (Non-Bulk)?",
      field: 'hazardousMaterials.classifications',
      type: 'multiselect',
      options: ['C: Cargo Tank', 'S: Non-Cargo Tank', 'B: Bulk', 'NB: Non-Bulk'],
      required: false,
      conditional: {
        field: 'operationTypes',
        value: 'Motor Carrier'
      }
    },
    
    // Part 4: Financial and Safety
    {
      id: 'marketerOfTransportationServices',
      question: "Are you a marketer of transportation services?",
      field: 'marketerOfTransportationServices',
      type: 'boolean',
      required: true
    },
    {
      id: 'signature',
      question: "Finally, what is the full name of the company official who will be signing this application?",
      field: 'signature',
      type: 'text',
      required: true
    },
    {
      id: 'officialTitle',
      question: "What is the title of this company official?",
      field: 'officialTitle',
      type: 'text',
      required: true
    }
  ];

  const getCurrentStep = () => {
    const step = conversationSteps[currentStep];
    if (!step) return null;
    
    // Check if this step should be shown based on conditional logic
    if (step.conditional) {
      const conditionalField = step.conditional.field;
      const conditionalValue = step.conditional.value;
      
      if (conditionalField.includes('.')) {
        const [parent, child] = conditionalField.split('.');
        const fieldValue = formData[parent as keyof USDOTApplicationData];
        if (typeof fieldValue === 'object' && fieldValue !== null) {
          const nestedValue = (fieldValue as any)[child];
          if (Array.isArray(nestedValue)) {
            if (!nestedValue.includes(conditionalValue)) return null;
          } else if (nestedValue !== conditionalValue) {
            return null;
          }
        }
      } else {
        const fieldValue = formData[conditionalField as keyof USDOTApplicationData];
        if (Array.isArray(fieldValue)) {
          if (!fieldValue.includes(conditionalValue)) return null;
        } else if (fieldValue !== conditionalValue) {
          return null;
        }
      }
    }
    
    return step;
  };

  const handleClientResponse = (response: string) => {
    const step = getCurrentStep();
    if (!step) return;

    // Add client response to conversation history
    setConversationHistory(prev => [...prev, {
      type: 'client',
      message: response,
      timestamp: new Date()
    }]);

    // Process the response based on step type
    let processedValue: any = response;

    if (step.type === 'number') {
      processedValue = parseInt(response) || 0;
    } else if (step.type === 'boolean') {
      processedValue = response.toLowerCase().includes('yes') || response.toLowerCase().includes('true');
    } else if (step.type === 'select') {
      // Find the closest matching option
      const option = step.options?.find(opt => 
        opt.toLowerCase().includes(response.toLowerCase()) || 
        response.toLowerCase().includes(opt.toLowerCase())
      );
      processedValue = option || response;
    } else if (step.type === 'multiselect') {
      // Parse multiple selections
      const selections = response.split(',').map(s => s.trim());
      processedValue = selections;
    }

    // Update form data
    if (step.field.includes('.')) {
      const [parent, child] = step.field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof USDOTApplicationData] as any),
          [child]: processedValue
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [step.field]: processedValue
      }));
    }

    // Move to next step
    setTimeout(() => {
      setCurrentStep(prev => prev + 1);
    }, 1000);
  };

  const startConversation = () => {
    setIsActive(true);
    setCurrentStep(0);
    setConversationHistory([{
      type: 'agent',
      message: "Hello! I'm your USDOT application assistant. I'll guide you through the process of applying for a USDOT number. This will take about 10-15 minutes. Are you ready to begin?",
      timestamp: new Date()
    }]);
  };

  const submitApplication = async () => {
    try {
      // Convert to company format
      const companyData = {
        legalBusinessName: formData.legalBusinessName,
        dbaName: formData.dbaName,
        businessType: formData.businessType,
        ein: formData.ein,
        physicalStreetAddress: formData.principalAddress.street,
        physicalCity: formData.principalAddress.city,
        physicalState: formData.principalAddress.state,
        physicalZip: formData.principalAddress.zip,
        physicalCountry: 'United States',
        isMailingAddressSame: formData.mailingAddress.isDifferent ? 'No' : 'Yes',
        mailingStreetAddress: formData.mailingAddress.street,
        mailingCity: formData.mailingAddress.city,
        mailingState: formData.mailingAddress.state,
        mailingZip: formData.mailingAddress.zip,
        mailingCountry: 'United States',
        classification: formData.operationTypes.includes('Motor Carrier') ? 'Carrier' : 
                       formData.operationTypes.includes('Broker') ? 'Broker' : 'Freight Forwarder',
        operationType: formData.carrierOperationTypes.includes('For-Hire Carrier: Interstate') ? 'Long-Haul' : 'Regional',
        interstateIntrastate: formData.carrierOperationTypes.some(type => type.includes('Interstate')) ? 'Interstate' : 'Intrastate',
        operationClass: 'Class A',
        numberOfVehicles: formData.powerUnits.owned + formData.powerUnits.termLeased + formData.powerUnits.tripLeased,
        numberOfDrivers: formData.drivers.employees + formData.drivers.ownerOperators,
        fleetType: 'Owned',
        gvwr: '80,000 lbs',
        vehicleTypes: 'Trucks,Trailers',
        cargoTypes: formData.cargoClassifications.join(','),
        hazmatRequired: formData.hazardousMaterials.classifications.length > 0 ? 'Yes' : 'No',
        phmsaWork: 'No',
        hasDunsBradstreetNumber: formData.dunsNumber ? 'Yes' : 'No',
        dunsBradstreetNumber: formData.dunsNumber
      };

      await createCompany(companyData);
      
      setConversationHistory(prev => [...prev, {
        type: 'agent',
        message: "Excellent! I've successfully submitted your USDOT application. You should receive your USDOT number within 1-2 business days. Is there anything else I can help you with?",
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Failed to submit application:', error);
      setConversationHistory(prev => [...prev, {
        type: 'agent',
        message: "I'm sorry, there was an error submitting your application. Please try again or contact support for assistance.",
        timestamp: new Date()
      }]);
    }
  };

  useEffect(() => {
    if (isActive && currentStep < conversationSteps.length) {
      const step = getCurrentStep();
      if (step) {
        setTimeout(() => {
          setConversationHistory(prev => [...prev, {
            type: 'agent',
            message: step.question,
            timestamp: new Date()
          }]);
        }, 500);
      } else {
        // Skip this step and move to next
        setCurrentStep(prev => prev + 1);
      }
    } else if (isActive && currentStep >= conversationSteps.length) {
      // All questions completed, submit application
      submitApplication();
    }
  }, [currentStep, isActive]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/companies')}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Companies
          </button>
          
          <div className="flex items-center">
            <ChatIcon className="h-12 w-12 text-blue-600 mr-4" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                USDOT Application Agent
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Conversational USDOT Number Application Assistant
              </p>
            </div>
          </div>
        </div>

        {/* Agent Status */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Agent Status: {isActive ? 'Active' : 'Standby'}
                </span>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Progress: {currentStep} / {conversationSteps.length} questions
              </div>
            </div>
          </div>
        </div>

        {/* Conversation Interface */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8">
          <div className="h-96 overflow-y-auto mb-4 space-y-4">
            {conversationHistory.map((message, index) => (
              <div key={index} className={`flex ${message.type === 'agent' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.type === 'agent'
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                }`}>
                  <p className="text-sm">{message.message}</p>
                  <p className="text-xs opacity-75 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {!isActive ? (
            <div className="text-center">
              <button
                onClick={startConversation}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <MicrophoneIcon className="h-5 w-5 mr-2" />
                Start USDOT Application
              </button>
            </div>
          ) : (
            <div className="flex space-x-4">
              <input
                type="text"
                placeholder="Type your response here..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    handleClientResponse(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
              <button
                onClick={() => {
                  const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                  if (input && input.value.trim()) {
                    handleClientResponse(input.value);
                    input.value = '';
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Send
              </button>
            </div>
          )}
        </div>

        {/* Data Preview */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Application Data Preview
          </h3>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <pre className="text-sm text-gray-700 dark:text-gray-300 overflow-auto">
              {JSON.stringify(formData, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default USDOTAgent;
