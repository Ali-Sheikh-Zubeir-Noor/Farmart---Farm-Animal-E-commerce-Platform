import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Search, Filter, X } from 'lucide-react';
import { fetchAnimals, setFilters, clearFilters } from '../../store/slices/animalSlice';
import AnimalCard from './AnimalCard';

const AnimalList = () => {
  const dispatch = useDispatch();
  const { animals, isLoading, filters } = useSelector((state) => state.animals);
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    dispatch(fetchAnimals(filters));
  }, [dispatch, filters]);

  const handleSearch = (e) => {
    const search = e.target.value;
    setLocalFilters({ ...localFilters, search });
    dispatch(setFilters({ search }));
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    dispatch(setFilters({ [key]: value }));
  };

  const handleClearFilters = () => {
    setLocalFilters({
      type: '',
      breed: '',
      minAge: '',
      maxAge: '',
      search: '',
    });
    dispatch(clearFilters());
  };

  const animalTypes = ['Cattle', 'Pig', 'Chicken', 'Sheep', 'Goat', 'Horse'];
  const breeds = {
    Cattle: ['Holstein', 'Angus', 'Hereford', 'Jersey'],
    Pig: ['Yorkshire', 'Duroc', 'Hampshire', 'Landrace'],
    Chicken: ['Rhode Island Red', 'Leghorn', 'Plymouth Rock', 'Brahma'],
    Sheep: ['Merino', 'Suffolk', 'Dorset', 'Romney'],
    Goat: ['Boer', 'Nubian', 'Alpine', 'Saanen'],
    Horse: ['Arabian', 'Thoroughbred', 'Quarter Horse', 'Clydesdale']
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Animals</h1>
        
        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search animals..."
              value={localFilters.search}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <input
            type="text"
            placeholder="Filter by location..."
            value={localFilters.location || ''}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-50 p-4 rounded-md mb-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Animal Type
                </label>
                <select
                  value={localFilters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">All Types</option>
                  {animalTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Breed
                </label>
                <select
                  value={localFilters.breed}
                  onChange={(e) => handleFilterChange('breed', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
                  disabled={!localFilters.type}
                >
                  <option value="">All Breeds</option>
                  {localFilters.type && breeds[localFilters.type]?.map(breed => (
                    <option key={breed} value={breed}>{breed}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min="0"
                    value={localFilters.minPrice || ''}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Min $"
                  />
                  <input
                    type="number"
                    min="0"
                    value={localFilters.maxPrice || ''}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Max $"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min="0"
                    value={localFilters.minAge || ''}
                    onChange={(e) => handleFilterChange('minAge', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Min years"
                  />
                  <input
                    type="number"
                    min="0"
                    value={localFilters.maxAge || ''}
                    onChange={(e) => handleFilterChange('maxAge', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Max years"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleClearFilters}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <X className="h-4 w-4" />
                <span>Clear Filters</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Results Count */}
        <p className="text-gray-600 mb-4">
          {animals.length} animal{animals.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Animals Grid */}
      {animals.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No animals found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {animals.map((animal) => (
            <AnimalCard key={animal.id} animal={animal} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AnimalList;