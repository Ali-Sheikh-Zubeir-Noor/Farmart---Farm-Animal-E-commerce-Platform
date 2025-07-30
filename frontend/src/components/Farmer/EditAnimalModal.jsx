import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { X, Save, Upload } from 'lucide-react';
import { updateAnimal } from '../../store/slices/animalSlice';
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

const EditAnimalModal = ({ animal, onClose }) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState(animal.images || []);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: animal.name,
      type: animal.type,
      breed: animal.breed,
      age: animal.age,
      weight: animal.weight,
      price: animal.price,
      description: animal.description,
      healthStatus: animal.healthStatus,
      vaccinationStatus: animal.vaccinationStatus,
    },
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
      await dispatch(updateAnimal({ id: animal.id, data: animalData })).unwrap();
      toast.success('Animal updated successfully!');
      onClose();
    } catch (error) {
      toast.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Edit Animal</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Animal Name
            </label>
            <input
              {...register('name')}
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
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
                id="image-upload-edit"
              />
              <label
                htmlFor="image-upload-edit"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                <Upload className="h-8 w-8 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {uploading ? 'Uploading...' : 'Click to upload more images'}
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
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || uploading || uploadedImages.length === 0}
              className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditAnimalModal;