import React, { useState } from 'react';
import { motion } from 'framer-motion';
// import jwtDecode from 'jwt-decode'

export default function LoginForm() {
    const [activeTab, setActiveTab] = useState('user');
    const [credentials, setCredentials] = useState({
        email: '',
        password: '',
    });

    const handleChange = (e) => {
        setCredentials((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(`Logging in as ${activeTab}:`, credentials);
        // Send credentials to backend via fetch/axios
        // const res = await fetch("/login", { method: 'POST', body: JSON.stringify({ email, password }) });
        // const data = await res.json();
        // const token = data.access_token;

        // const decoded = jwtDecode(token);
        // localStorage.setItem("token", token);
        // localStorage.setItem("role", decoded.role);

        // if (decoded.role === 'farmer') {
        //     navigate("/farmer");
        // } else {
        //     navigate("/user");
        // }
    };

    const inputStyles = "w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500";

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-white p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
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
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" name="email" value={credentials.email} onChange={handleChange} className={inputStyles} required />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input type="password" name="password" value={credentials.password} onChange={handleChange} className={inputStyles} required />
                    </div>

                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ scale: 1.02 }}
                        type="submit"
                        className="w-full bg-green-500 text-white py-2 rounded-md shadow-md hover:bg-green-600 transition"
                    >
                        Login as {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                    </motion.button>
                </motion.form>

                <p className="text-center text-sm text-gray-500 mt-4">
                    Don't have an account? <a href="/register" className="text-green-600 font-medium hover:underline">Register</a>
                </p>
            </div>
        </div>
    );
}
