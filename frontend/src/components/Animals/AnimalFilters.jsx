import React from 'react';
import { motion } from 'framer-motion';
import { X, Filter } from 'lucide-react';

const AnimalFilters = ({ 
  filters, 
  onFilterChange, 
  onClearFilters, 
  showFilters, 
  onToggleFilters 
}) => {
  const animalTypes = ['Cattle', 'Pig', 'Chicken', 'Sheep', 'Goat', 'Horse'];
  const breeds = {
    Cattle: ['Holstein', 'Angus', 'Hereford', 'Jersey'],
    Pig: ['Yorkshire', 'Duroc', 'Hampshire', 'Landrace'],
    Chicken: ['Rhode Island Red', 'Leghorn', 'Plymouth Rock', 'Brahma'],
    Sheep: ['Merino', 'Suffolk', 'Dorset', 'Romney'],
    Goat: ['Boer', 'Nubian', 'Alpine', 'Saanen'],
    Horse: ['Arabian', 'Thoroughbred', 'Quarter Horse', 'Clydesdale']
  };

  return (
    <>
      <button
        onClick={onToggleFilters}
        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
      >
        <Filter className="h-5 w-5" />
        <span>Filters</span>
      </button>

      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-gray-50 p-4 rounded-md"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Animal Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => onFilterChange('type', e.target.value)}
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
                value={filters.breed}
                onChange={(e) => onFilterChange('breed', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
                disabled={!filters.type}
              >
                <option value="">All Breeds</option>
                {filters.type && breeds[filters.type]?.map(breed => (
                  <option key={breed} value={breed}>{breed}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Age (years)
              </label>
              <input
                type="number"
                min="0"
                value={filters.minAge}
                onChange={(e) => onFilterChange('minAge', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Age (years)
              </label>
              <input
                type="number"
                min="0"
                value={filters.maxAge}
                onChange={(e) => onFilterChange('maxAge', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Any"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={onClearFilters}
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <X className="h-4 w-4" />
              <span>Clear Filters</span>
            </button>
          </div>
        </motion.div>
      )}
    </>
  );
};

export default AnimalFilters;