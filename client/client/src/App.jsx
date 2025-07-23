import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import RegistrationForm from './pages/RegistrationForm'
import LoginForm from './pages/LoginForm'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<LoginForm />} />
        <Route path='/register' element ={<RegistrationForm />} />
      </Routes>
    </Router>
  );
}
