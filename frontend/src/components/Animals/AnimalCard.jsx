import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Scale, DollarSign } from 'lucide-react';

const AnimalCard = ({ animal, viewMode = 'grid' }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatAge = (ageInMonths) => {
    if (ageInMonths < 12) {
      return `${ageInMonths} months`;
    }
    const years = Math.floor(ageInMonths / 12);
    const months = ageInMonths % 12;
    return months > 0 ? `${years}y ${months}m` : `${years} years`;
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="flex">
          <div className="w-48 h-32 flex-shrink-0">
            <img
              src={animal.images?.[0] || 'https://images.pexels.com/photos/422218/pexels-photo-422218.jpeg'}
              alt={animal.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-1 p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 mr-3">{animal.name}</h3>
                  <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium capitalize">
                    {animal.animal_type}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-3 capitalize">{animal.breed}</p>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{formatAge(animal.age)}</span>
                  </div>
                  <div className="flex items-center">
                    <Scale className="h-4 w-4 mr-1" />
                    <span>{animal.weight} kg</span>
                  </div>
                  {animal.farmer?.farm_location && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{animal.farmer.farm_location}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center text-lg font-bold text-green-600 mb-3">
                  <DollarSign className="h-5 w-5" />
                  <span>{formatPrice(animal.price)}</span>
                </div>
                <Link
                  to={`/animals/${animal.id}`}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <img
          src={animal.images?.[0] || 'https://images.pexels.com/photos/422218/pexels-photo-422218.jpeg'}
          alt={animal.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2">
          <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium capitalize">
            {animal.animal_type}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{animal.name}</h3>
        <p className="text-gray-600 text-sm mb-3 capitalize">{animal.breed}</p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{formatAge(animal.age)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Scale className="h-4 w-4 mr-2" />
            <span>{animal.weight} kg</span>
          </div>
          {animal.farmer?.farm_location && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{animal.farmer.farm_location}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-lg font-bold text-green-600">
            <DollarSign className="h-5 w-5" />
            <span>{formatPrice(animal.price)}</span>
          </div>
          <Link
            to={`/animals/${animal.id}`}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AnimalCard;