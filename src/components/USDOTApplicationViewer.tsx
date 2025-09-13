import React from 'react';
import { USDOTApplication } from '../types/schema';
import {
  DocumentTextIcon,
  OfficeBuildingIcon,
  TruckIcon,
  ExclamationIcon,
  CheckCircleIcon,
  LockClosedIcon
} from '@heroicons/react/outline';

interface USDOTApplicationViewerProps {
  application: USDOTApplication;
  showHeader?: boolean;
}

const USDOTApplicationViewer: React.FC<USDOTApplicationViewerProps> = ({ 
  application, 
  showHeader = true 
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderSection = (title: string, icon: React.ComponentType<any>, children: React.ReactNode) => (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
      <div className="flex items-center mb-4">
        <icon className="h-6 w-6 text-blue-600 mr-3" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{title}</h3>
        {application.isReadOnly && (
          <div className="ml-auto flex items-center text-sm text-gray-500 dark:text-gray-400">
            <LockClosedIcon className="h-4 w-4 mr-1" />
            Read-Only
          </div>
        )}
      </div>
      {children}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      {showHeader && (
        <div className="mb-8">
          <div className="flex items-center">
            <DocumentTextIcon className="h-12 w-12 text-blue-600 mr-4" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                USDOT Application (MCS-150)
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Motor Carrier Identification Report
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Submitted on {formatDate(application.createdAt)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Part 1: Company and Business Information */}
      {renderSection('Company and Business Information', OfficeBuildingIcon, (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Legal Business Name
            </label>
            <p className="text-gray-900 dark:text-gray-100">{application.legalBusinessName}</p>
          </div>
          
          {application.dbaName && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                DBA Name
              </label>
              <p className="text-gray-900 dark:text-gray-100">{application.dbaName}</p>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Business Type
            </label>
            <p className="text-gray-900 dark:text-gray-100">{application.businessType}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              EIN
            </label>
            <p className="text-gray-900 dark:text-gray-100">{application.ein}</p>
          </div>
          
          {application.dunsNumber && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                DUNS Number
              </label>
              <p className="text-gray-900 dark:text-gray-100">{application.dunsNumber}</p>
            </div>
          )}
        </div>
      ))}

      {/* Principal Address */}
      {renderSection('Principal Place of Business Address', OfficeBuildingIcon, (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Street Address
            </label>
            <p className="text-gray-900 dark:text-gray-100">{application.principalAddress.street}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              City
            </label>
            <p className="text-gray-900 dark:text-gray-100">{application.principalAddress.city}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              State
            </label>
            <p className="text-gray-900 dark:text-gray-100">{application.principalAddress.state}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              ZIP Code
            </label>
            <p className="text-gray-900 dark:text-gray-100">{application.principalAddress.zip}</p>
          </div>
        </div>
      ))}

      {/* Mailing Address (if different) */}
      {application.mailingAddress.isDifferent && (
        renderSection('Mailing Address', OfficeBuildingIcon, (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Street Address
              </label>
              <p className="text-gray-900 dark:text-gray-100">{application.mailingAddress.street}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                City
              </label>
              <p className="text-gray-900 dark:text-gray-100">{application.mailingAddress.city}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                State
              </label>
              <p className="text-gray-900 dark:text-gray-100">{application.mailingAddress.state}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ZIP Code
              </label>
              <p className="text-gray-900 dark:text-gray-100">{application.mailingAddress.zip}</p>
            </div>
          </div>
        ))
      )}

      {/* Part 2: Operations and Authority */}
      {renderSection('Operations and Authority', TruckIcon, (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Type of Company Operation
            </label>
            <div className="flex flex-wrap gap-2">
              {application.operationTypes.map((type, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>

          {application.carrierOperationTypes.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Type of Carrier Operation
              </label>
              <div className="flex flex-wrap gap-2">
                {application.carrierOperationTypes.map((type, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Part 3: Fleet and Cargo Information */}
      {application.operationTypes.includes('Motor Carrier') && (
        renderSection('Fleet and Cargo Information', ExclamationIcon, (
          <div className="space-y-6">
            {/* Fleet Information */}
            <div>
              <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4">
                Fleet Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Owned Power Units
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">{application.powerUnits.owned}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Term Leased Power Units
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">{application.powerUnits.termLeased}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Trip Leased Power Units
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">{application.powerUnits.tripLeased}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Driver Employees
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">{application.drivers.employees}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Owner-Operators
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">{application.drivers.ownerOperators}</p>
                </div>
              </div>
            </div>

            {/* Operation Classification */}
            {application.operationClassifications.length > 0 && (
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Operation Classification
                </h4>
                <div className="flex flex-wrap gap-2">
                  {application.operationClassifications.map((classification, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                    >
                      {classification}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Cargo Classification */}
            {application.cargoClassifications.length > 0 && (
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Cargo Classification
                </h4>
                <div className="flex flex-wrap gap-2">
                  {application.cargoClassifications.map((classification, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                    >
                      {classification}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Hazardous Materials */}
            {(application.hazardousMaterials.classifications.length > 0 || application.hazardousMaterials.hmClasses.length > 0) && (
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Hazardous Materials Classification
                </h4>
                <div className="space-y-4">
                  {application.hazardousMaterials.classifications.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        HM Classification
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {application.hazardousMaterials.classifications.map((classification, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          >
                            {classification}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {application.hazardousMaterials.hmClasses.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        HM Classes
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {application.hazardousMaterials.hmClasses.map((hmClass, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          >
                            {hmClass}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))
      )}

      {/* Part 4: Financial and Safety Information */}
      {renderSection('Financial and Safety Information', CheckCircleIcon, (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Marketer of Transportation Services
            </label>
            <p className="text-gray-900 dark:text-gray-100">
              {application.marketerOfTransportationServices ? 'Yes' : 'No'}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Application Date
            </label>
            <p className="text-gray-900 dark:text-gray-100">{formatDate(application.applicationDate)}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Signature of Company Official
            </label>
            <p className="text-gray-900 dark:text-gray-100">{application.signature}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title of Company Official
            </label>
            <p className="text-gray-900 dark:text-gray-100">{application.officialTitle}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default USDOTApplicationViewer;

