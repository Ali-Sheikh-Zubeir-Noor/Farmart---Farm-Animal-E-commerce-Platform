import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function RegistrationForm() {
  const [activeTab, setActiveTab] = useState('user');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    farmName: '',
    location: '',
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(`${activeTab} registered:`, formData);
    // Handle actual registration logic here
  };

  const inputStyles = "w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-white p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg">
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setActiveTab('user')}
            className={`px-4 py-2 rounded-full font-semibold transition ${activeTab === 'user' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-green-100'}`}
          >
            User
          </button>
          <button
            onClick={() => setActiveTab('farmer')}
            className={`px-4 py-2 rounded-full font-semibold transition ${activeTab === 'farmer' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-green-100'}`}
          >
            Farmer
          </button>
        </div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputStyles} required />
          </div>

          {activeTab === 'farmer' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Farm Name</label>
                <input type="text" name="farmName" value={formData.farmName} onChange={handleChange} className={inputStyles} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} className={inputStyles} required />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputStyles} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} className={inputStyles} required />
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            type="submit"
            className="w-full bg-green-500 text-white py-2 rounded-md shadow-md hover:bg-green-600 transition"
          >
            Register as {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </motion.button>
        </motion.form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already registered? <a href="/" className="text-green-600 font-medium hover:underline">Login here</a>
        </p>
      </div>
    </div>
  );
}
