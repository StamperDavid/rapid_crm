import React, { useState, useEffect } from 'react';
import {
  CalculatorIcon,
  MapIcon,
  CurrencyDollarIcon,
  TruckIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/outline';

interface StateTaxRate {
  state: string;
  stateCode: string;
  fuelTaxRate: number; // cents per gallon
  lastUpdated: string;
}

interface FuelPurchase {
  id: string;
  date: string;
  state: string;
  stateCode: string;
  gallons: number;
  fuelType: 'diesel' | 'gasoline';
  pricePerGallon: number;
  totalCost: number;
  taxPaid: number;
  receiptNumber: string;
  location: string;
  odometerReading: number;
}

interface MileageRecord {
  id: string;
  date: string;
  state: string;
  stateCode: string;
  miles: number;
  vehicleId: string;
  vehicleNumber: string;
  route: string;
  odometerStart: number;
  odometerEnd: number;
}

interface TaxCalculation {
  state: string;
  stateCode: string;
  miles: number;
  gallons: number;
  mpg: number;
  taxRate: number;
  taxDue: number;
  taxPaid: number;
  netTax: number;
}

const FuelTaxCalculator: React.FC = () => {
  const [stateTaxRates, setStateTaxRates] = useState<StateTaxRate[]>([]);
  const [fuelPurchases, setFuelPurchases] = useState<FuelPurchase[]>([]);
  const [mileageRecords, setMileageRecords] = useState<MileageRecord[]>([]);
  const [calculations, setCalculations] = useState<TaxCalculation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'calculator' | 'purchases' | 'mileage' | 'results'>('calculator');
  const [selectedQuarter, setSelectedQuarter] = useState('Q1 2024');
  const [selectedYear, setSelectedYear] = useState('2024');

  useEffect(() => {
    fetchIFTAData();
  }, []);

  const fetchIFTAData = async () => {
    try {
      setLoading(true);
      
      // Mock state tax rates - in real implementation, these would be from an API
      setStateTaxRates([
        { state: 'California', stateCode: 'CA', fuelTaxRate: 51.1, lastUpdated: '2024-01-01' },
        { state: 'Texas', stateCode: 'TX', fuelTaxRate: 20.0, lastUpdated: '2024-01-01' },
        { state: 'Florida', stateCode: 'FL', fuelTaxRate: 35.0, lastUpdated: '2024-01-01' },
        { state: 'New York', stateCode: 'NY', fuelTaxRate: 46.0, lastUpdated: '2024-01-01' },
        { state: 'Illinois', stateCode: 'IL', fuelTaxRate: 39.2, lastUpdated: '2024-01-01' },
        { state: 'Pennsylvania', stateCode: 'PA', fuelTaxRate: 58.7, lastUpdated: '2024-01-01' },
        { state: 'Ohio', stateCode: 'OH', fuelTaxRate: 38.5, lastUpdated: '2024-01-01' },
        { state: 'Georgia', stateCode: 'GA', fuelTaxRate: 31.2, lastUpdated: '2024-01-01' },
        { state: 'North Carolina', stateCode: 'NC', fuelTaxRate: 36.1, lastUpdated: '2024-01-01' },
        { state: 'Michigan', stateCode: 'MI', fuelTaxRate: 27.2, lastUpdated: '2024-01-01' }
      ]);

      // Mock fuel purchases
      setFuelPurchases([
        {
          id: '1',
          date: '2024-01-15',
          state: 'California',
          stateCode: 'CA',
          gallons: 100,
          fuelType: 'diesel',
          pricePerGallon: 4.25,
          totalCost: 425.00,
          taxPaid: 51.10,
          receiptNumber: 'RCP-001',
          location: 'Los Angeles, CA',
          odometerReading: 125430
        },
        {
          id: '2',
          date: '2024-01-20',
          state: 'Texas',
          stateCode: 'TX',
          gallons: 80,
          fuelType: 'diesel',
          pricePerGallon: 3.85,
          totalCost: 308.00,
          taxPaid: 16.00,
          receiptNumber: 'RCP-002',
          location: 'Houston, TX',
          odometerReading: 125680
        }
      ]);

      // Mock mileage records
      setMileageRecords([
        {
          id: '1',
          date: '2024-01-15',
          state: 'California',
          stateCode: 'CA',
          miles: 250,
          vehicleId: '1',
          vehicleNumber: 'TRK-001',
          route: 'LA to San Francisco',
          odometerStart: 125430,
          odometerEnd: 125680
        },
        {
          id: '2',
          date: '2024-01-20',
          state: 'Texas',
          stateCode: 'TX',
          miles: 180,
          vehicleId: '1',
          vehicleNumber: 'TRK-001',
          route: 'Houston to Dallas',
          odometerStart: 125680,
          odometerEnd: 125860
        }
      ]);

      // Calculate taxes
      calculateTaxes();
    } catch (error) {
      console.error('Error fetching IFTA data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTaxes = () => {
    const stateCalculations: { [key: string]: TaxCalculation } = {};

    // Aggregate mileage by state
    mileageRecords.forEach(record => {
      if (!stateCalculations[record.stateCode]) {
        stateCalculations[record.stateCode] = {
          state: record.state,
          stateCode: record.stateCode,
          miles: 0,
          gallons: 0,
          mpg: 0,
          taxRate: 0,
          taxDue: 0,
          taxPaid: 0,
          netTax: 0
        };
      }
      stateCalculations[record.stateCode].miles += record.miles;
    });

    // Aggregate fuel purchases by state
    fuelPurchases.forEach(purchase => {
      if (stateCalculations[purchase.stateCode]) {
        stateCalculations[purchase.stateCode].gallons += purchase.gallons;
        stateCalculations[purchase.stateCode].taxPaid += purchase.taxPaid;
      }
    });

    // Calculate tax due and net tax
    Object.values(stateCalculations).forEach(calc => {
      const taxRate = stateTaxRates.find(rate => rate.stateCode === calc.stateCode)?.fuelTaxRate || 0;
      calc.taxRate = taxRate;
      calc.mpg = calc.miles > 0 ? calc.miles / calc.gallons : 0;
      calc.taxDue = (calc.miles / calc.mpg) * (taxRate / 100);
      calc.netTax = calc.taxDue - calc.taxPaid;
    });

    setCalculations(Object.values(stateCalculations));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getNetTaxColor = (netTax: number) => {
    if (netTax > 0) return 'text-red-600 bg-red-100';
    if (netTax < 0) return 'text-green-600 bg-green-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getNetTaxLabel = (netTax: number) => {
    if (netTax > 0) return 'TAX DUE';
    if (netTax < 0) return 'REFUND';
    return 'BALANCED';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">IFTA Fuel Tax Calculator</h2>
          <p className="text-gray-600">Calculate fuel taxes by state and jurisdiction</p>
        </div>
        <div className="flex space-x-4">
          <select
            value={selectedQuarter}
            onChange={(e) => setSelectedQuarter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="Q1 2024">Q1 2024</option>
            <option value="Q2 2024">Q2 2024</option>
            <option value="Q3 2024">Q3 2024</option>
            <option value="Q4 2024">Q4 2024</option>
          </select>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Generate Report
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'calculator', name: 'Tax Calculator', icon: CalculatorIcon },
            { id: 'purchases', name: 'Fuel Purchases', icon: TruckIcon },
            { id: 'mileage', name: 'Mileage Records', icon: MapIcon },
            { id: 'results', name: 'Tax Results', icon: DocumentTextIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tax Calculator Tab */}
      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Summary Cards */}
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Tax Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Miles:</span>
                  <span className="font-medium">{mileageRecords.reduce((sum, record) => sum + record.miles, 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Gallons:</span>
                  <span className="font-medium">{fuelPurchases.reduce((sum, purchase) => sum + purchase.gallons, 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average MPG:</span>
                  <span className="font-medium">
                    {mileageRecords.length > 0 && fuelPurchases.length > 0 
                      ? (mileageRecords.reduce((sum, record) => sum + record.miles, 0) / 
                         fuelPurchases.reduce((sum, purchase) => sum + purchase.gallons, 0)).toFixed(1)
                      : '0.0'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Tax Due:</span>
                  <span className="font-medium text-red-600">
                    {formatCurrency(calculations.reduce((sum, calc) => sum + calc.taxDue, 0))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Tax Paid:</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(calculations.reduce((sum, calc) => sum + calc.taxPaid, 0))}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="text-gray-900 font-medium">Net Tax:</span>
                  <span className={`font-bold ${
                    calculations.reduce((sum, calc) => sum + calc.netTax, 0) > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {formatCurrency(calculations.reduce((sum, calc) => sum + calc.netTax, 0))}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">State Tax Rates</h3>
              <div className="space-y-2">
                {stateTaxRates.slice(0, 5).map((rate) => (
                  <div key={rate.stateCode} className="flex justify-between text-sm">
                    <span className="text-gray-600">{rate.state}</span>
                    <span className="font-medium">{rate.fuelTaxRate}¢/gal</span>
                  </div>
                ))}
                <div className="text-xs text-gray-500 pt-2">
                  Showing top 5 states. {stateTaxRates.length - 5} more states available.
                </div>
              </div>
            </div>
          </div>

          {/* Quick Add Forms */}
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Add Fuel Purchase</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">State</label>
                    <select className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                      <option>Select State</option>
                      {stateTaxRates.map((rate) => (
                        <option key={rate.stateCode} value={rate.stateCode}>
                          {rate.state}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Gallons</label>
                    <input type="number" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price/Gallon</label>
                    <input type="number" step="0.01" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Receipt #</label>
                    <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
                  </div>
                </div>
                <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">
                  Add Purchase
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Add Mileage</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">State</label>
                    <select className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                      <option>Select State</option>
                      {stateTaxRates.map((rate) => (
                        <option key={rate.stateCode} value={rate.stateCode}>
                          {rate.state}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Miles</label>
                    <input type="number" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Route</label>
                  <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
                </div>
                <button className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700">
                  Add Mileage
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fuel Purchases Tab */}
      {activeTab === 'purchases' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Fuel Purchase Records</h3>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
              <PlusIcon className="h-5 w-5" />
              <span>Add Purchase</span>
            </button>
          </div>
          
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gallons</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price/Gal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tax Paid</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {fuelPurchases.map((purchase) => (
                  <tr key={purchase.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{purchase.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{purchase.state}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{purchase.gallons}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(purchase.pricePerGallon)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(purchase.taxPaid)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{purchase.receiptNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mileage Records Tab */}
      {activeTab === 'mileage' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Mileage Records</h3>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
              <PlusIcon className="h-5 w-5" />
              <span>Add Mileage</span>
            </button>
          </div>
          
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Miles</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mileageRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.state}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.miles}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.vehicleNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.route}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tax Results Tab */}
      {activeTab === 'results' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Tax Calculation Results</h3>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2">
              <DocumentTextIcon className="h-5 w-5" />
              <span>Export Report</span>
            </button>
          </div>
          
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Miles</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gallons</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MPG</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tax Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tax Due</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tax Paid</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Tax</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {calculations.map((calc) => (
                  <tr key={calc.stateCode} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{calc.state}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{calc.miles.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{calc.gallons.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{calc.mpg.toFixed(1)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{calc.taxRate}¢/gal</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(calc.taxDue)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(calc.taxPaid)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getNetTaxColor(calc.netTax)}`}>
                        {getNetTaxLabel(calc.netTax)} {formatCurrency(Math.abs(calc.netTax))}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default FuelTaxCalculator;
