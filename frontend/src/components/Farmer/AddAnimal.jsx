import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { Plus, Upload, X } from 'lucide-react';
import { addAnimal } from '../../store/slices/animalSlice';
import api from '../../services/api';
import toast from 'react-hot-toast';

const schema = yup.object({
  name: yup.string().required('Animal name is required'),
  type: yup.string().required('Animal type is required'),
  breed: yup.string().required('Breed is required'),
  age: yup.number().positive('Age must be positive').required('Age is required'),
  weight: yup.number().positive('Weight must be positive').required('Weight is required'),
  price: yup.number().positive('Price must be positive').required('Price is required'),
  description: yup.string().required('Description is required'),
  healthStatus: yup.string().required('Health status is required'),
  vaccinationStatus: yup.string().required('Vaccination status is required'),
});

const AddAnimal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const selectedType = watch('type');

  const animalTypes = ['Cattle', 'Pig', 'Chicken', 'Sheep', 'Goat', 'Horse'];
  const breeds = {
    Cattle: ['Holstein', 'Angus', 'Hereford', 'Jersey'],
    Pig: ['Yorkshire', 'Duroc', 'Hampshire', 'Landrace'],
    Chicken: ['Rhode Island Red', 'Leghorn', 'Plymouth Rock', 'Brahma'],
    Sheep: ['Merino', 'Suffolk', 'Dorset', 'Romney'],
    Goat: ['Boer', 'Nubian', 'Alpine', 'Saanen'],
    Horse: ['Arabian', 'Thoroughbred', 'Quarter Horse', 'Clydesdale']
  };

  const healthStatuses = ['excellent', 'good', 'fair', 'needs_attention'];
  const vaccinationStatuses = ['up_to_date', 'partial', 'overdue', 'unknown'];

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await api.post('/upload-image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        return response.data.imageUrl;
      });

      const imageUrls = await Promise.all(uploadPromises);
      setUploadedImages(prev => [...prev, ...imageUrls]);
      toast.success(`${imageUrls.length} image(s) uploaded successfully!`);
    } catch (error) {
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    if (uploadedImages.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    setIsLoading(true);
    try {
      const animalData = {
        ...data,
        images: uploadedImages
      };
      await dispatch(addAnimal(animalData)).unwrap();
      toast.success('Animal added successfully!');
      navigate('/farmer/animals');
    } catch (error) {
      toast.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Animal</h1>
          <p className="text-gray-600">List your animal for sale on Farmart</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Animal Name
              </label>
              <input
                {...register('name')}
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter animal name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Animal Type
                </label>
                <select
                  {...register('type')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select type</option>
                  {animalTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.type && (
                  <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Breed
                </label>
                <select
                  {...register('breed')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
                  disabled={!selectedType}
                >
                  <option value="">Select breed</option>
                  {selectedType && breeds[selectedType]?.map(breed => (
                    <option key={breed} value={breed}>{breed}</option>
                  ))}
                </select>
                {errors.breed && (
                  <p className="mt-1 text-sm text-red-600">{errors.breed.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age (years)
                </label>
                <input
                  {...register('age')}
                  type="number"
                  min="0"
                  step="0.1"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="0"
                />
                {errors.age && (
                  <p className="mt-1 text-sm text-red-600">{errors.age.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (lbs)
                </label>
                <input
                  {...register('weight')}
                  type="number"
                  min="0"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="0"
                />
                {errors.weight && (
                  <p className="mt-1 text-sm text-red-600">{errors.weight.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price ($)
                </label>
                <input
                  {...register('price')}
                  type="number"
                  min="0"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="0"
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Animal Images
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <Upload className="h-8 w-8 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {uploading ? 'Uploading...' : 'Click to upload images'}
                  </span>
                  <span className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB each
                  </span>
                </label>
              </div>
              
              {uploadedImages.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-4">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-24 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Health Status
                </label>
                <select
                  {...register('healthStatus')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select health status</option>
                  {healthStatuses.map(status => (
                    <option key={status} value={status}>
                      {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
                {errors.healthStatus && (
                  <p className="mt-1 text-sm text-red-600">{errors.healthStatus.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vaccination Status
                </label>
                <select
                  {...register('vaccinationStatus')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select vaccination status</option>
                  {vaccinationStatuses.map(status => (
                    <option key={status} value={status}>
                      {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
                {errors.vaccinationStatus && (
                  <p className="mt-1 text-sm text-red-600">{errors.vaccinationStatus.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Describe your animal's health, characteristics, and any other relevant information..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/farmer/animals')}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || uploading || uploadedImages.length === 0}
                className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>{isLoading ? 'Adding...' : 'Add Animal'}</span>
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AddAnimal;