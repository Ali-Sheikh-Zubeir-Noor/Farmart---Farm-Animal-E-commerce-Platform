import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const FarmerDashboard = () => {
  // Mocked farmer and animals data
  const [farmer, setFarmer] = useState({
    name: "John Doe",
    location: "Nakuru, Kenya",
  });

  const [animals, setAnimals] = useState([
    {
      id: 1,
      name: "Boer Goat",
      species: "Goat",
      price: 8000,
      image: "https://via.placeholder.com/100",
    },
    {
      id: 2,
      name: "Friesian Cow",
      species: "Cow",
      price: 35000,
      image: "https://via.placeholder.com/100",
    },
  ]);

  // Delete handler
  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this animal?")) {
      setAnimals((prev) => prev.filter((animal) => animal.id !== id));
      // You would also send a DELETE request to backend here
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Farmer Dashboard</h1>
      <p className="text-gray-600 mb-6">
        <strong>Name:</strong> {farmer.name} <br />
        <strong>Location:</strong> {farmer.location}
      </p>

      <h2 className="text-2xl font-semibold mb-4">Your Animals</h2>

      <div className="grid gap-4">
        {animals.map((animal) => (
          <div
            key={animal.id}
            className="bg-white rounded-xl shadow p-4 flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <img
                src={animal.image}
                alt={animal.name}
                className="w-24 h-24 object-cover rounded"
              />
              <div>
                <h3 className="text-xl font-medium">{animal.name}</h3>
                <p className="text-gray-600">{animal.species}</p>
                <p className="text-green-700 font-bold">KSh {animal.price}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Link
                to={`/edit-animal/${animal.id}`}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDelete(animal.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <Link
        to="/add-animal"
        className="mt-6 inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl"
      >
        + Add New Animal
      </Link>
    </div>
  );
};

export default FarmerDashboard;
