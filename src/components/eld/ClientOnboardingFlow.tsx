import React, { useState, useEffect } from 'react';
import {
  UserIcon,
  BuildingOfficeIcon,
  CreditCardIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  ExclamationIcon
} from '@heroicons/react/outline';
import StripeService from '../../services/payment/StripeService';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
}

interface CompanyInfo {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  usdotNumber: string;
  mcNumber: string;
  fleetSize: number;
}

interface PlanSelection {
  planId: string;
  planName: string;
  monthlyPrice: number;
  setupFee: number;
  features: string[];
}

interface PaymentInfo {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  billingAddress: string;
}

interface ClientOnboardingFlowProps {
  onComplete: (clientData: any) => void;
  onCancel: () => void;
}

const ClientOnboardingFlow: React.FC<ClientOnboardingFlowProps> = ({
  onComplete,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [stripeService] = useState(() => new StripeService());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    usdotNumber: '',
    mcNumber: '',
    fleetSize: 1
  });

  const [selectedPlan, setSelectedPlan] = useState<PlanSelection | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: ''
  });

  useEffect(() => {
    initializeStripe();
  }, []);

  const initializeStripe = async () => {
    try {
      await stripeService.initialize();
    } catch (error) {
      console.error('Failed to initialize Stripe:', error);
      setError('Failed to initialize payment system');
    }
  };

  const steps: OnboardingStep[] = [
    {
      id: 'company',
      title: 'Company Information',
      description: 'Tell us about your company',
      component: CompanyInfoStep
    },
    {
      id: 'plan',
      title: 'Select Plan',
      description: 'Choose your ELD service package',
      component: PlanSelectionStep
    },
    {
      id: 'payment',
      title: 'Payment Information',
      description: 'Set up your billing',
      component: PaymentInfoStep
    },
    {
      id: 'confirmation',
      title: 'Confirmation',
      description: 'Review and confirm your subscription',
      component: ConfirmationStep
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setError(null);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };

  const handleComplete = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create Stripe customer
      const customer = await stripeService.createCustomer({
        email: companyInfo.email,
        name: companyInfo.contactPerson,
        companyId: companyInfo.usdotNumber,
        address: {
          line1: companyInfo.address,
          city: companyInfo.city,
          state: companyInfo.state,
          postal_code: companyInfo.zipCode,
          country: 'US'
        }
      });

      // Create subscription
      if (selectedPlan) {
        const subscription = await stripeService.createSubscription(
          customer.id,
          selectedPlan.planId
        );

        // Create setup fee payment intent
        if (selectedPlan.setupFee > 0) {
          await stripeService.createPaymentIntent(
            selectedPlan.setupFee,
            customer.id
          );
        }

        // Complete onboarding
        const clientData = {
          ...companyInfo,
          customerId: customer.id,
          subscriptionId: subscription.subscriptionId,
          plan: selectedPlan,
          status: 'active'
        };

        onComplete(clientData);
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      setError('Failed to complete setup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Client Onboarding</h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>

          {/* Step Indicator */}
          <div className="flex justify-between mt-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex flex-col items-center ${
                  index <= currentStep ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index < currentStep
                      ? 'bg-blue-600 text-white'
                      : index === currentStep
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {index < currentStep ? (
                    <CheckCircleIcon className="w-5 h-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="text-xs mt-1 text-center">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
        <div className="flex">
          <ExclamationIcon className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
          </div>
        )}

        {/* Current Step Content */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {steps[currentStep].title}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {steps[currentStep].description}
          </p>
          
          <CurrentStepComponent
            companyInfo={companyInfo}
            setCompanyInfo={setCompanyInfo}
            selectedPlan={selectedPlan}
            setSelectedPlan={setSelectedPlan}
            paymentInfo={paymentInfo}
            setPaymentInfo={setPaymentInfo}
          />
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
              currentStep === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Previous
          </button>

          {currentStep === steps.length - 1 ? (
            <button
              onClick={handleComplete}
              disabled={loading}
              className="flex items-center px-6 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Complete Setup'}
            </button>
          ) : (
            <button
              onClick={nextStep}
              className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
            >
              Next
              <ArrowRightIcon className="w-4 h-4 ml-2" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Step Components
const CompanyInfoStep: React.FC<{
  companyInfo: CompanyInfo;
  setCompanyInfo: (info: CompanyInfo) => void;
}> = ({ companyInfo, setCompanyInfo }) => {
  const handleChange = (field: keyof CompanyInfo, value: string | number) => {
    setCompanyInfo({ ...companyInfo, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company Name *
          </label>
          <input
            type="text"
            value={companyInfo.companyName}
            onChange={(e) => handleChange('companyName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact Person *
          </label>
          <input
            type="text"
            value={companyInfo.contactPerson}
            onChange={(e) => handleChange('contactPerson', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            value={companyInfo.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone *
          </label>
          <input
            type="tel"
            value={companyInfo.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Address *
        </label>
        <input
          type="text"
          value={companyInfo.address}
          onChange={(e) => handleChange('address', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City *
          </label>
          <input
            type="text"
            value={companyInfo.city}
            onChange={(e) => handleChange('city', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State *
          </label>
          <input
            type="text"
            value={companyInfo.state}
            onChange={(e) => handleChange('state', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ZIP Code *
          </label>
          <input
            type="text"
            value={companyInfo.zipCode}
            onChange={(e) => handleChange('zipCode', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            USDOT Number *
          </label>
          <input
            type="text"
            value={companyInfo.usdotNumber}
            onChange={(e) => handleChange('usdotNumber', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            MC Number
          </label>
          <input
            type="text"
            value={companyInfo.mcNumber}
            onChange={(e) => handleChange('mcNumber', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fleet Size *
          </label>
          <input
            type="number"
            min="1"
            value={companyInfo.fleetSize}
            onChange={(e) => handleChange('fleetSize', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>
    </div>
  );
};

const PlanSelectionStep: React.FC<{
  selectedPlan: PlanSelection | null;
  setSelectedPlan: (plan: PlanSelection) => void;
}> = ({ selectedPlan, setSelectedPlan }) => {
  const plans = [
    {
      id: 'basic',
      name: 'Basic ELD Compliance',
      description: 'Essential ELD tracking and basic compliance monitoring',
      monthlyPrice: 50,
      setupFee: 500,
      maxTrucks: 10,
      features: ['HOS Logging', 'Basic DVIR', 'Compliance Alerts', 'Monthly Reports']
    },
    {
      id: 'standard',
      name: 'Standard ELD Plus',
      description: 'Advanced compliance with audit support',
      monthlyPrice: 100,
      setupFee: 1000,
      maxTrucks: 50,
      features: ['All Basic Features', 'Audit Preparation', 'Driver Management', 'Quarterly Reviews']
    },
    {
      id: 'premium',
      name: 'Premium ELD Enterprise',
      description: 'Full compliance suite with dedicated support',
      monthlyPrice: 200,
      setupFee: 2000,
      maxTrucks: 200,
      features: ['All Standard Features', 'Dedicated Account Manager', '24/7 Support', 'Custom Reporting']
    }
  ];

  return (
    <div className="space-y-4">
      {plans.map((plan) => (
        <div
          key={plan.id}
          className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
            selectedPlan?.id === plan.id
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => setSelectedPlan(plan)}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h4 className="text-lg font-medium text-gray-900">{plan.name}</h4>
              <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
              <ul className="mt-3 space-y-1">
                {plan.features.map((feature, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-center">
                    <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-right ml-4">
              <div className="text-2xl font-bold text-gray-900">
                ${plan.monthlyPrice}
                <span className="text-sm font-normal text-gray-600">/month</span>
              </div>
              <div className="text-sm text-gray-600">
                Setup: ${plan.setupFee}
              </div>
              <div className="text-sm text-gray-600">
                Up to {plan.maxTrucks} trucks
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const PaymentInfoStep: React.FC<{
  paymentInfo: PaymentInfo;
  setPaymentInfo: (info: PaymentInfo) => void;
}> = ({ paymentInfo, setPaymentInfo }) => {
  const handleChange = (field: keyof PaymentInfo, value: string) => {
    setPaymentInfo({ ...paymentInfo, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <div className="flex">
          <ExclamationIcon className="h-5 w-5 text-yellow-400" />
          <div className="ml-3">
            <p className="text-sm text-yellow-800">
              This is a demo environment. No real payments will be processed.
            </p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Cardholder Name *
        </label>
        <input
          type="text"
          value={paymentInfo.cardholderName}
          onChange={(e) => handleChange('cardholderName', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Card Number *
        </label>
        <input
          type="text"
          value={paymentInfo.cardNumber}
          onChange={(e) => handleChange('cardNumber', e.target.value)}
          placeholder="1234 5678 9012 3456"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expiry Date *
          </label>
          <input
            type="text"
            value={paymentInfo.expiryDate}
            onChange={(e) => handleChange('expiryDate', e.target.value)}
            placeholder="MM/YY"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CVV *
          </label>
          <input
            type="text"
            value={paymentInfo.cvv}
            onChange={(e) => handleChange('cvv', e.target.value)}
            placeholder="123"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Billing Address *
        </label>
        <input
          type="text"
          value={paymentInfo.billingAddress}
          onChange={(e) => handleChange('billingAddress', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
    </div>
  );
};

const ConfirmationStep: React.FC<{
  companyInfo: CompanyInfo;
  selectedPlan: PlanSelection | null;
}> = ({ companyInfo, selectedPlan }) => {
  if (!selectedPlan) return null;

  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-md p-4">
        <div className="flex">
          <CheckCircleIcon className="h-5 w-5 text-green-400" />
          <div className="ml-3">
            <h4 className="text-sm font-medium text-green-800">Ready to Complete Setup</h4>
            <p className="text-sm text-green-700 mt-1">
              Review your information below and click "Complete Setup" to finish onboarding.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-3">Company Information</h4>
          <div className="space-y-2 text-sm">
            <p><strong>Company:</strong> {companyInfo.companyName}</p>
            <p><strong>Contact:</strong> {companyInfo.contactPerson}</p>
            <p><strong>Email:</strong> {companyInfo.email}</p>
            <p><strong>Phone:</strong> {companyInfo.phone}</p>
            <p><strong>USDOT:</strong> {companyInfo.usdotNumber}</p>
            <p><strong>Fleet Size:</strong> {companyInfo.fleetSize} trucks</p>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-3">Selected Plan</h4>
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h5 className="font-medium text-blue-900">{selectedPlan.name}</h5>
            <p className="text-sm text-blue-700 mt-1">{selectedPlan.description}</p>
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span>Monthly Fee:</span>
                <span className="font-medium">${selectedPlan.monthlyPrice}/month</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Setup Fee:</span>
                <span className="font-medium">${selectedPlan.setupFee}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Max Trucks:</span>
                <span className="font-medium">{selectedPlan.maxTrucks}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientOnboardingFlow;
