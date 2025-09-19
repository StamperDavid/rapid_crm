import React, { useState } from 'react';
import {
  TruckIcon,
  PlusIcon,
  SearchIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  FilterIcon,
  CalendarIcon,
  CogIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  UserIcon
} from '@heroicons/react/outline';
import { Vehicle } from '../../../types/schema';
import { useCRM } from '../../../contexts/CRMContext';
import EntityForm from '../../../components/forms/EntityForm';

const Vehicles: React.FC = () => {
  const { vehicles, companies, drivers, createVehicle, updateVehicle, deleteVehicle } = useCRM();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Filter vehicles based on search term and status
  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.vin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && vehicle.status === filterStatus;
  });

  const handleCreateVehicle = async (vehicleData: any) => {
    try {
      await createVehicle(vehicleData);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating vehicle:', error);
    }
  };

  const handleUpdateVehicle = async (id: string, vehicleData: any) => {
    try {
      await updateVehicle(id, vehicleData);
      setSelectedVehicle(null);
    } catch (error) {
      console.error('Error updating vehicle:', error);
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await deleteVehicle(id);
      } catch (error) {
        console.error('Error deleting vehicle:', error);
      }
    }
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setShowCreateModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'retired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-slate-900 dark:text-slate-100 sm:truncate sm:text-3xl sm:tracking-tight">
            Vehicles
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your fleet of vehicles, trucks, and trailers
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
            Add Vehicle
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search vehicles by make, model, VIN, or license plate..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-md border-0 py-1.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Inactive">Inactive</option>
            <option value="Retired">Retired</option>
          </select>
        </div>
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredVehicles.map((vehicle) => (
          <div key={vehicle.id} className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 hover:shadow-md hover:ring-slate-300 dark:hover:ring-slate-600 transition-all duration-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 rounded-xl p-3 bg-blue-50 dark:bg-blue-900/20">
                  <TruckIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {vehicle.make} {vehicle.model}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {vehicle.year} • {vehicle.vin}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setSelectedVehicle(vehicle)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <EyeIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleEditVehicle(vehicle)}
                  className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                  title="Edit vehicle"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteVehicle(vehicle.id)}
                  className="p-1 text-slate-400 hover:text-red-600"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 dark:text-slate-400">License Plate</span>
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {vehicle.licensePlate}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 dark:text-slate-400">Status</span>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(vehicle.status || '')}`}>
                  {vehicle.status || 'Unknown'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 dark:text-slate-400">GVWR</span>
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {vehicle.gvwr || 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 dark:text-slate-400">Fuel Type</span>
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {vehicle.fuelType || 'N/A'}
                </span>
              </div>
            </div>

            {/* Maintenance Info */}
            {vehicle.nextInspectionDue && (
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                  <CalendarIcon className="h-4 w-4" />
                  <span>Next Inspection: {vehicle.nextInspectionDue}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredVehicles.length === 0 && (
        <div className="text-center py-12">
          <TruckIcon className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">No vehicles found</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by adding your first vehicle.'}
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
              >
                <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                Add Vehicle
              </button>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || selectedVehicle) && (
        <EntityForm
          entityType="vehicles"
          entity={selectedVehicle}
          onSave={selectedVehicle ? (data) => handleUpdateVehicle(selectedVehicle.id, data) : handleCreateVehicle}
          onCancel={() => {
            setShowCreateModal(false);
            setSelectedVehicle(null);
          }}
        />
      )}
    </div>
  );
};

export default Vehicles;
