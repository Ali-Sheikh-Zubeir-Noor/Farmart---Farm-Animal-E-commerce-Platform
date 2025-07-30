import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Edit, Save, X, Upload } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    location: user?.location || '',
    profileImage: user?.profileImage || ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('image', file);
      
      const response = await api.post('/upload-image', formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setFormData(prev => ({
        ...prev,
        profileImage: response.data.imageUrl
      }));
      toast.success('Profile image uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      await api.put('/profile', formData);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      // Update user in Redux store if needed
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      location: user?.location || '',
      profileImage: user?.profileImage || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-md overflow-hidden"
      >
        <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center overflow-hidden">
                  {formData.profileImage ? (
                    <img
                      src={formData.profileImage}
                      alt={user?.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-10 w-10 text-green-600" />
                  )}
                </div>
                {isEditing && (
                  <div className="absolute -bottom-2 -right-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="profile-image-upload"
                    />
                    <label
                      htmlFor="profile-image-upload"
                      className="bg-white text-green-600 p-2 rounded-full shadow-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <Upload className="h-4 w-4" />
                    </label>
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
                <p className="text-green-100 capitalize">{user?.userType}</p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              disabled={uploading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
            >
              <Edit className="h-4 w-4" />
              <span>{uploading ? 'Uploading...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
                />
              ) : (
                <div className="flex items-center space-x-2 text-gray-900">
                  <User className="h-5 w-5 text-gray-400" />
                  <span>{user?.name}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="flex items-center space-x-2 text-gray-900">
                <Mail className="h-5 w-5 text-gray-400" />
                <span>{user?.email}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
                />
              ) : (
                <div className="flex items-center space-x-2 text-gray-900">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <span>{user?.phone}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
                />
              ) : (
                <div className="flex items-center space-x-2 text-gray-900">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <span>{user?.location}</span>
                </div>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;