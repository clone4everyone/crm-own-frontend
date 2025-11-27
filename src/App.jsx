import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import SplashScreen from './components/SplashScreen'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/dashboard/Dashboard'
import ProtectedRoute from './routes/ProtectedRoute'
import VerifyEmail from './pages/auth/VerifyEmail'
import Navbar from './components/Navbar'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SplashScreen />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />

        <Route element={<ProtectedRoute allowedRoles={['super_admin','sales','designer','developer','client']} />}>
      
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        <Route path="/unauthorized" element={<div className="p-6">Unauthorized</div>} />
      </Routes>
    </Router>
  )
}
