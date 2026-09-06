import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../hooks/useAuth';
import { ProtectedRoute } from './ProtectedRoute';
import { Landing } from '../pages/auth/Landing';
import { Login } from '../pages/auth/Login';
import { SignUp } from '../pages/auth/SignUp';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { PatientDashboard } from '../pages/patient/PatientDashboard';
import { SymptomChecker } from '../pages/patient/SymptomChecker';
import { MedicalReports } from '../pages/patient/MedicalReports';
import { Prescriptions as PatientPrescriptions } from '../pages/patient/Prescriptions';
import { Appointments as PatientAppointments } from '../pages/patient/Appointments';

import { DoctorDashboard } from '../pages/doctor/DoctorDashboard';
import { PatientHistory } from '../pages/doctor/PatientHistory';
import { EmergencyQueue } from '../pages/doctor/EmergencyQueue';
import { Prescriptions as DoctorPrescriptions } from '../pages/doctor/Prescriptions';
import { DoctorAppointments } from '../pages/doctor/DoctorAppointments';

import { ReceptionistDashboard } from '../pages/receptionist/ReceptionistDashboard';
import { Registrations as ReceptionistRegistrations } from '../pages/receptionist/Registrations';
import { Appointments as ReceptionistAppointments } from '../pages/receptionist/Appointments';
import { EmergencyTriage } from '../pages/receptionist/EmergencyTriage';

import { AdminDashboard } from '../pages/admin/AdminDashboard';

const RoleRedirector = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm font-medium">Verifying authentication status...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  
  switch (user.role) {
    case 'patient':
      return <Navigate to="/patient" replace />;
    case 'doctor':
      return <Navigate to="/doctor" replace />;
    case 'receptionist':
      return <Navigate to="/receptionist" replace />;
    case 'admin':
      return <Navigate to="/admin" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Landing />} />
          <Route path="/login/:role" element={<Login />} />
          <Route path="/signup/:role" element={<SignUp />} />
          <Route path="/signup" element={<Navigate to="/login" replace />} />

          {/* Protected Routes Layout Wrapper */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<RoleRedirector />} />
              
              {/* Patient Specific Routes */}
              <Route element={<ProtectedRoute allowedRoles={['patient']} />}>
                <Route path="/patient" element={<PatientDashboard />} />
                <Route path="/patient/symptoms" element={<SymptomChecker />} />
                <Route path="/patient/reports" element={<MedicalReports />} />
                <Route path="/patient/prescriptions" element={<PatientPrescriptions />} />
                <Route path="/patient/appointments" element={<PatientAppointments />} />
              </Route>

              {/* Doctor Specific Routes */}
              <Route element={<ProtectedRoute allowedRoles={['doctor']} />}>
                <Route path="/doctor" element={<DoctorDashboard />} />
                <Route path="/doctor/patients" element={<PatientHistory />} />
                <Route path="/doctor/emergency" element={<EmergencyQueue />} />
                <Route path="/doctor/prescriptions" element={<DoctorPrescriptions />} />
                <Route path="/doctor/appointments" element={<DoctorAppointments />} />
              </Route>

              {/* Receptionist Specific Routes */}
              <Route element={<ProtectedRoute allowedRoles={['receptionist']} />}>
                <Route path="/receptionist" element={<ReceptionistDashboard />} />
                <Route path="/receptionist/registrations" element={<ReceptionistRegistrations />} />
                <Route path="/receptionist/appointments" element={<ReceptionistAppointments />} />
                <Route path="/receptionist/triage" element={<EmergencyTriage />} />
              </Route>

              {/* Admin Specific Routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin" element={<AdminDashboard />} />
                {/* Fallback to dashboard for now, additional pages can be registered here */}
                <Route path="/admin/departments" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminDashboard />} />
                <Route path="/admin/audit" element={<AdminDashboard />} />
              </Route>
            </Route>
          </Route>

          {/* Catch-all redirect to base route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};
