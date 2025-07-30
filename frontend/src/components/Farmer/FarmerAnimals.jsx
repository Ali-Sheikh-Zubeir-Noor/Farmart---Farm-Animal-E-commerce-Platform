import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { fetchAnimals } from '../../store/slices/animalSlice';
import AnimalCard from '../Animals/AnimalCard';
import EditAnimalModal from './EditAnimalModal';

const FarmerAnimals = () => {
  const dispatch = useDispatch();
  const { animals, isLoading } = useSelector((state) => state.animals);
  const { user } = useSelector((state) => state.auth);
  const [editingAnimal, setEditingAnimal] = useState(null);

  // Filter animals to show only those belonging to the current farmer
  const farmerAnimals = animals.filter(animal => animal.farmerId === user?.id);

  useEffect(() => {
    dispatch(fetchAnimals());
  }, [dispatch]);

  const handleEdit = (animal) => {
    setEditingAnimal(animal);
  };

  const handleCloseEdit = () => {
    setEditingAnimal(null);
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Animals</h1>
          <p className="text-gray-600 mt-2">Manage your livestock listings</p>
        </div>
        <Link
          to="/farmer/add-animal"
          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Add New Animal</span>
        </Link>
      </div>

      {farmerAnimals.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="bg-gray-50 rounded-lg p-8">
            <Plus className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No animals listed yet</h3>
            <p className="text-gray-600 mb-4">
              Start by adding your first animal to the marketplace
            </p>
            <Link
              to="/farmer/add-animal"
              className="inline-flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Add Your First Animal</span>
            </Link>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {farmerAnimals.map((animal) => (
            <AnimalCard
              key={animal.id}
              animal={animal}
              onEdit={handleEdit}
              showActions={true}
            />
          ))}
        </div>
      )}

      {editingAnimal && (
        <EditAnimalModal
          animal={editingAnimal}
          onClose={handleCloseEdit}
        />
      )}
    </div>
  );
};

export default FarmerAnimals;