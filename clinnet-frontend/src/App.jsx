import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PatientListPage from './pages/PatientListPage';
import PatientDetailPage from './pages/PatientDetailPage';
import SchedulePage from './pages/SchedulePage';
import UserManagementPage from './pages/UserManagementPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import { useAuth } from './hooks/useAuth'; // Import useAuth

function App() {
  const { user } = useAuth(); // Get user from context

  return (
    <div className="App">
      <Navbar />
      <main style={{ padding: '20px' }}> {/* Add some padding */}
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/patients" element={
            <ProtectedRoute allowedRoles={['admin', 'doctor', 'frontdesk']}> {/* Example role check */}
              <PatientListPage />
            </ProtectedRoute>
          } />
           <Route path="/patients/:patientId" element={ // Dynamic route for patient details
            <ProtectedRoute allowedRoles={['admin', 'doctor']}>
              <PatientDetailPage />
            </ProtectedRoute>
          } />
          <Route path="/schedule" element={
            <ProtectedRoute allowedRoles={['admin', 'doctor', 'frontdesk']}>
              <SchedulePage />
            </ProtectedRoute>
          } />

          {/* Admin Only Routes */}
          <Route path="/users" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UserManagementPage />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <SettingsPage />
            </ProtectedRoute>
          } />

          {/* Not Found Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;