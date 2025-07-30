import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
// If the file is named configureStore.js
import store from "./store/configureStore";
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import Hero from './components/Home/Hero';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import Profile from './components/Profile/Profile';
import AnimalList from './components/Animals/AnimalList';
import AnimalDetail from './components/Animals/AnimalDetail';
import AddAnimal from './components/Farmer/AddAnimal';
import FarmerAnimals from './components/Farmer/FarmerAnimals';
import Cart from './components/Cart/Cart';
import Checkout from './components/Checkout/Checkout';
import Orders from './components/Orders/Orders';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Hero />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route path="/animals" element={<AnimalList />} />
              <Route path="/animals/:id" element={<AnimalDetail />} />
              <Route 
                path="/farmer/add-animal" 
                element={
                  <ProtectedRoute requiredUserType="farmer">
                    <AddAnimal />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/farmer/animals" 
                element={
                  <ProtectedRoute requiredUserType="farmer">
                    <FarmerAnimals />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/cart" 
                element={
                  <ProtectedRoute requiredUserType="buyer">
                    <Cart />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/checkout" 
                element={
                  <ProtectedRoute requiredUserType="buyer">
                    <Checkout />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/orders" 
                element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
          <Footer />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#10B981',
                },
              },
              error: {
                style: {
                  background: '#EF4444',
                },
              },
            }}
          />
        </div>
      </Router>
    </Provider>
  );
}

export default App;