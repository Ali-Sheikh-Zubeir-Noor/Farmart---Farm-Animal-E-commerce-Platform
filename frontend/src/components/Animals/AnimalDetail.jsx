import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Scale, 
  ShoppingCart, 
  Phone, 
  Mail,
  Heart,
  Share2,
  Shield,
  Award
} from 'lucide-react';
import { addToCart } from '../../store/slices/cartSlice';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AnimalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [animal, setAnimal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchAnimal();
  }, [id]);

  const fetchAnimal = async () => {
    try {
      const response = await api.get(`/animals/${id}`);
      setAnimal(response.data);
    } catch (error) {
      toast.error('Animal not found');
      navigate('/animals');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    dispatch(addToCart({ animalId: animal.id }))
      .unwrap()
      .then(() => {
        toast.success('Added to cart!');
      })
      .catch((error) => {
        toast.error(error);
      });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${animal.name} - ${animal.type}`,
        text: animal.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Animal not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Animals</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-w-4 aspect-h-3 rounded-lg overflow-hidden bg-gray-100">
              <img
                src={animal.images[selectedImage] || animal.images[0]}
                alt={animal.name}
                className="w-full h-96 object-cover"
              />
            </div>
            {animal.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {animal.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-green-500' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${animal.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Animal Details */}
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{animal.name}</h1>
                <p className="text-xl text-gray-600">{animal.type} - {animal.breed}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleShare}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Share2 className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-600 hover:text-red-500 hover:bg-gray-100 rounded-full transition-colors">
                  <Heart className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="text-3xl font-bold text-green-600">
              ${animal.price.toLocaleString()}
            </div>

            {/* Status Badges */}
            <div className="flex space-x-2">
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                animal.status === 'available' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {animal.status}
              </span>
              <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800 flex items-center">
                <Shield className="h-4 w-4 mr-1" />
                {animal.healthStatus}
              </span>
              <span className="px-3 py-1 text-sm font-semibold rounded-full bg-purple-100 text-purple-800 flex items-center">
                <Award className="h-4 w-4 mr-1" />
                {animal.vaccinationStatus}
              </span>
            </div>

            {/* Animal Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2 text-gray-600">
                <Calendar className="h-5 w-5" />
                <span>{animal.age} years old</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Weight className="h-5 w-5" />
                <span>{animal.weight} lbs</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <MapPin className="h-5 w-5" />
                <span>{animal.farmerLocation}</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">{animal.description}</p>
            </div>

            {/* Farmer Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Farmer Information</h3>
              <div className="space-y-2">
                <p className="font-medium text-gray-900">{animal.farmerName}</p>
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{animal.farmerLocation}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{animal.farmerPhone}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {user?.userType === 'buyer' && animal.status === 'available' && (
              <div className="space-y-3">
                <button
                  onClick={handleAddToCart}
                  className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 transition-colors"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>Add to Cart</span>
                </button>
                <button className="w-full border border-green-600 text-green-600 py-3 px-6 rounded-md hover:bg-green-50 transition-colors">
                  Contact Farmer
                </button>
              </div>
            )}

            {!user && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-center">
                  <button
                    onClick={() => navigate('/login')}
                    className="font-medium underline hover:no-underline"
                  >
                    Login
                  </button>
                  {' '}or{' '}
                  <button
                    onClick={() => navigate('/register')}
                    className="font-medium underline hover:no-underline"
                  >
                    register
                  </button>
                  {' '}to purchase this animal
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Health Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Health Status:</span>
                <span className="font-medium capitalize">{animal.healthStatus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Vaccination:</span>
                <span className="font-medium capitalize">{animal.vaccinationStatus}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Specifications</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium">{animal.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Breed:</span>
                <span className="font-medium">{animal.breed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Age:</span>
                <span className="font-medium">{animal.age} years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Weight:</span>
                <span className="font-medium">{animal.weight} lbs</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Listing Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Listed:</span>
                <span className="font-medium">
                  {new Date(animal.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Updated:</span>
                <span className="font-medium">
                  {new Date(animal.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AnimalDetail;