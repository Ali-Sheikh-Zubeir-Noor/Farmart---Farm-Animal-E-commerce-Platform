import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import RegistrationForm from './pages/RegistrationForm'
import LoginForm from './pages/LoginForm'
import HomePage from './pages/Home'
import RoleProtectedRoute from './components/ProtectedRoute'
import FarmerDashboard from './pages/FarmerDashboard'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'

export default function App() {
  return (
    <Router>
      <Routes>
          <Route path='/login' element={<LoginForm />} />
          <Route path='/register' element ={<RegistrationForm />} />
      </Routes>
    </Router>
  );
}
