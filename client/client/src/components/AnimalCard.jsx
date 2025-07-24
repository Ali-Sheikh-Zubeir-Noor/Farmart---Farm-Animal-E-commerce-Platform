import React from 'react';

export default function AnimalCard({ name, breed, price, image, onBuy }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out overflow-hidden">
      <div className="relative">
        <img
          src={image}
          alt={name}
          className="w-full h-64 object-cover transform hover:scale-105 transition-transform duration-300"
        />
        <span className="absolute top-2 left-2 bg-green-600 text-white text-xs px-3 py-1 rounded-full">
          {breed}
        </span>
      </div>

      <div className="p-4">
        <h2 className="text-xl font-semibold text-gray-800">{name}</h2>
        <p className="text-sm text-gray-600 mt-1 mb-3">Ksh {price.toLocaleString()}</p>

        <button
          onClick={onBuy}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors duration-200"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}
