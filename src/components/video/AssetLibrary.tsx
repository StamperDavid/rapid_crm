import React, { useState, useEffect } from 'react';
import {
  PhotographIcon, VideoCameraIcon, MusicNoteIcon, DocumentTextIcon,
  PlusIcon, SearchIcon, FilterIcon, DownloadIcon, UploadIcon,
  StarIcon, HeartIcon, EyeIcon, TagIcon, FolderIcon
} from '@heroicons/react/outline';

interface Asset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'character' | 'background' | 'prop';
  category: string;
  tags: string[];
  url: string;
  thumbnailUrl?: string;
  duration?: number;
  size: number;
  resolution?: string;
  isFavorite: boolean;
  isPremium: boolean;
  createdAt: string;
  usageCount: number;
}

interface AssetLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onAssetSelect: (asset: Asset) => void;
  selectedAssets?: Asset[];
}

const AssetLibrary: React.FC<AssetLibraryProps> = ({
  isOpen,
  onClose,
  onAssetSelect,
  selectedAssets = []
}) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFavorites, setShowFavorites] = useState(false);
  const [showPremium, setShowPremium] = useState(false);

  const categories = [
    'all', 'transportation', 'business', 'technology', 'lifestyle',
    'nature', 'abstract', 'characters', 'backgrounds', 'props'
  ];

  const assetTypes = [
    'all', 'image', 'video', 'audio', 'character', 'background', 'prop'
  ];

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockAssets: Asset[] = [
      {
        id: '1',
        name: 'Professional Truck Driver',
        type: 'character',
        category: 'transportation',
        tags: ['professional', 'driver', 'trucking', 'business'],
        url: '/assets/characters/truck-driver.png',
        thumbnailUrl: '/assets/characters/truck-driver-thumb.png',
        size: 2048000,
        resolution: '1920x1080',
        isFavorite: false,
        isPremium: false,
        createdAt: '2024-01-15',
        usageCount: 12
      },
      {
        id: '2',
        name: 'Modern Office Background',
        type: 'background',
        category: 'business',
        tags: ['office', 'modern', 'professional', 'workspace'],
        url: '/assets/backgrounds/office-modern.jpg',
        thumbnailUrl: '/assets/backgrounds/office-modern-thumb.jpg',
        size: 1536000,
        resolution: '1920x1080',
        isFavorite: true,
        isPremium: false,
        createdAt: '2024-01-14',
        usageCount: 8
      },
      {
        id: '3',
        name: 'Truck Fleet Video',
        type: 'video',
        category: 'transportation',
        tags: ['trucks', 'fleet', 'transportation', 'logistics'],
        url: '/assets/videos/truck-fleet.mp4',
        thumbnailUrl: '/assets/videos/truck-fleet-thumb.jpg',
        duration: 30,
        size: 25600000,
        resolution: '1920x1080',
        isFavorite: false,
        isPremium: true,
        createdAt: '2024-01-13',
        usageCount: 5
      },
      {
        id: '4',
        name: 'Background Music - Corporate',
        type: 'audio',
        category: 'business',
        tags: ['music', 'corporate', 'background', 'professional'],
        url: '/assets/audio/corporate-bg.mp3',
        size: 5120000,
        isFavorite: false,
        isPremium: false,
        createdAt: '2024-01-12',
        usageCount: 15
      },
      {
        id: '5',
        name: 'Delivery Truck Prop',
        type: 'prop',
        category: 'transportation',
        tags: ['truck', 'delivery', 'prop', '3d'],
        url: '/assets/props/delivery-truck.obj',
        thumbnailUrl: '/assets/props/delivery-truck-thumb.png',
        size: 8192000,
        isFavorite: true,
        isPremium: true,
        createdAt: '2024-01-11',
        usageCount: 3
      }
    ];
    setAssets(mockAssets);
    setFilteredAssets(mockAssets);
  }, []);

  useEffect(() => {
    let filtered = assets;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(asset =>
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(asset => asset.category === selectedCategory);
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(asset => asset.type === selectedType);
    }

    // Favorites filter
    if (showFavorites) {
      filtered = filtered.filter(asset => asset.isFavorite);
    }

    // Premium filter
    if (showPremium) {
      filtered = filtered.filter(asset => asset.isPremium);
    }

    setFilteredAssets(filtered);
  }, [assets, searchTerm, selectedCategory, selectedType, showFavorites, showPremium]);

  const toggleFavorite = (assetId: string) => {
    setAssets(prev => prev.map(asset =>
      asset.id === assetId ? { ...asset, isFavorite: !asset.isFavorite } : asset
    ));
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'image': return PhotographIcon;
      case 'video': return VideoCameraIcon;
      case 'audio': return MusicNoteIcon;
      case 'character': return DocumentTextIcon;
      case 'background': return PhotographIcon;
      case 'prop': return DocumentTextIcon;
      default: return DocumentTextIcon;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-0 border w-11/12 max-w-7xl shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <FolderIcon className="h-8 w-8 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Asset Library</h2>
              <p className="text-sm text-gray-500">
                Browse and select assets for your video projects
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2">
              <UploadIcon className="h-5 w-5" />
              <span>Upload</span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="text-2xl">&times;</span>
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-64">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search assets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              {assetTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>

            {/* View Mode */}
            <div className="flex border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 text-sm ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
              >
                List
              </button>
            </div>

            {/* Toggle Filters */}
            <div className="flex space-x-2">
              <button
                onClick={() => setShowFavorites(!showFavorites)}
                className={`px-3 py-2 text-sm rounded-lg flex items-center space-x-1 ${
                  showFavorites ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                }`}
              >
                <StarIcon className="h-4 w-4" />
                <span>Favorites</span>
              </button>
              <button
                onClick={() => setShowPremium(!showPremium)}
                className={`px-3 py-2 text-sm rounded-lg flex items-center space-x-1 ${
                  showPremium ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                }`}
              >
                <TagIcon className="h-4 w-4" />
                <span>Premium</span>
              </button>
            </div>
          </div>
        </div>

        {/* Assets Grid/List */}
        <div className="p-6">
          {filteredAssets.length === 0 ? (
            <div className="text-center py-12">
              <FolderIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No assets found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
              {filteredAssets.map(asset => {
                const Icon = getAssetIcon(asset.type);
                const isSelected = selectedAssets.some(selected => selected.id === asset.id);
                
                return (
                  <div
                    key={asset.id}
                    className={`bg-white border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                      isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => onAssetSelect(asset)}
                  >
                    {viewMode === 'grid' ? (
                      <>
                        {/* Thumbnail */}
                        <div className="aspect-video bg-gray-100 flex items-center justify-center relative">
                          {asset.thumbnailUrl ? (
                            <img
                              src={asset.thumbnailUrl}
                              alt={asset.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Icon className="h-12 w-12 text-gray-400" />
                          )}
                          
                          {/* Overlay */}
                          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all flex items-center justify-center">
                            <div className="opacity-0 hover:opacity-100 transition-opacity flex space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(asset.id);
                                }}
                                className="bg-white bg-opacity-90 p-2 rounded-full hover:bg-opacity-100"
                              >
                                <StarIcon className={`h-5 w-5 ${asset.isFavorite ? 'text-red-500 fill-current' : 'text-gray-600'}`} />
                              </button>
                              <button className="bg-white bg-opacity-90 p-2 rounded-full hover:bg-opacity-100">
                                <EyeIcon className="h-5 w-5 text-gray-600" />
                              </button>
                            </div>
                          </div>

                          {/* Premium Badge */}
                          {asset.isPremium && (
                            <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                              Premium
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-medium text-gray-900 truncate">{asset.name}</h3>
                            <Icon className="h-5 w-5 text-gray-400 flex-shrink-0 ml-2" />
                          </div>
                          
                          <div className="text-sm text-gray-500 space-y-1">
                            <p>Type: {asset.type}</p>
                            <p>Size: {formatFileSize(asset.size)}</p>
                            {asset.duration && <p>Duration: {formatDuration(asset.duration)}</p>}
                            {asset.resolution && <p>Resolution: {asset.resolution}</p>}
                            <p>Used: {asset.usageCount} times</p>
                          </div>

                          {/* Tags */}
                          <div className="mt-3 flex flex-wrap gap-1">
                            {asset.tags.slice(0, 3).map(tag => (
                              <span
                                key={tag}
                                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                              >
                                {tag}
                              </span>
                            ))}
                            {asset.tags.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                +{asset.tags.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      /* List View */
                      <div className="flex items-center p-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                          {asset.thumbnailUrl ? (
                            <img
                              src={asset.thumbnailUrl}
                              alt={asset.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Icon className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900">{asset.name}</h3>
                            <div className="flex items-center space-x-2">
                              {asset.isPremium && (
                                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                                  Premium
                                </span>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(asset.id);
                                }}
                                className="p-1"
                              >
                                <StarIcon className={`h-5 w-5 ${asset.isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
                              </button>
                            </div>
                          </div>
                          
                          <div className="text-sm text-gray-500 mt-1">
                            {asset.type} • {formatFileSize(asset.size)} • Used {asset.usageCount} times
                          </div>
                          
                          <div className="flex flex-wrap gap-1 mt-2">
                            {asset.tags.slice(0, 5).map(tag => (
                              <span
                                key={tag}
                                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            {filteredAssets.length} of {assets.length} assets
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetLibrary;
