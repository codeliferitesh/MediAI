import React, { useState } from 'react';
import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Activity,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Stethoscope,
  FileText,
  Calendar,
  Pill,
  HeartPulse,
  Users,
  Building,
  History
} from 'lucide-react';

interface SidebarItem {
  name: string;
  path: string;
  icon: React.ComponentType<any>;
}

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) return null;

  // Define dynamic menu items based on role
  const getSidebarItems = (): SidebarItem[] => {
    switch (user.role) {
      case 'patient':
        return [
          { name: 'Dashboard', path: '/patient', icon: LayoutDashboard },
          { name: 'Symptom Checker', path: '/patient/symptoms', icon: Stethoscope },
          { name: 'Medical Reports', path: '/patient/reports', icon: FileText },
          { name: 'Prescriptions', path: '/patient/prescriptions', icon: Pill },
          { name: 'Appointments', path: '/patient/appointments', icon: Calendar },
        ];
      case 'doctor':
        return [
          { name: 'Dashboard', path: '/doctor', icon: LayoutDashboard },
          { name: 'Patient History', path: '/doctor/patients', icon: Users },
          { name: 'Emergency Queue', path: '/doctor/emergency', icon: HeartPulse },
          { name: 'Prescriptions', path: '/doctor/prescriptions', icon: Pill },
          { name: 'Appointments', path: '/doctor/appointments', icon: Calendar },
        ];
      case 'receptionist':
        return [
          { name: 'Dashboard', path: '/receptionist', icon: LayoutDashboard },
          { name: 'Registrations', path: '/receptionist/registrations', icon: Users },
          { name: 'Appointments', path: '/receptionist/appointments', icon: Calendar },
          { name: 'Emergency Triage', path: '/receptionist/triage', icon: HeartPulse },
        ];
      case 'admin':
        return [
          { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
          { name: 'Departments', path: '/admin/departments', icon: Building },
          { name: 'User Access Control', path: '/admin/users', icon: Users },
          { name: 'System Audit Logs', path: '/admin/audit', icon: History },
        ];
      default:
        return [];
    }
  };

  const menuItems = getSidebarItems();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'doctor': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'receptionist': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-medical-50 text-medical-700 border-medical-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-150">
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="h-9 w-9 bg-medical-50 border border-medical-100 rounded-lg flex items-center justify-center text-medical-600 shadow-sm">
            <Activity className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg text-slate-800 tracking-tight">MediAI</span>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-medical-50 text-medical-700 font-semibold'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-850'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-medical-600' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Profile Card & Logout */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="h-9 w-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 font-bold border border-slate-200">
              {user.full_name[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{user.full_name}</p>
              <span className={`inline-block px-2 py-0.5 mt-1 border rounded text-[10px] uppercase font-bold tracking-wider ${getRoleColor(user.role)}`}>
                {user.role}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-red-650 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4.5 w-4.5 text-red-500" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-350 ease-out md:hidden flex flex-col ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-medical-50 border border-medical-100 rounded-lg flex items-center justify-center text-medical-600 shadow-sm">
              <Activity className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg text-slate-850">MediAI</span>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-medical-50 text-medical-700 font-semibold'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-medical-600' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="h-9 w-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 font-bold border border-slate-200">
              {user.full_name[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-850 truncate">{user.full_name}</p>
              <span className={`inline-block px-2 py-0.5 mt-1 border rounded text-[10px] uppercase font-bold tracking-wider ${getRoleColor(user.role)}`}>
                {user.role}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4.5 w-4.5 text-red-500" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 z-30">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="text-slate-500 hover:text-slate-800 md:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="hidden md:flex items-center gap-2">
            <h1 className="text-base font-semibold text-slate-700">Clinical Support Dashboard</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-800">{user.full_name}</p>
                <p className="text-xs text-slate-400 font-medium capitalize">{user.role}</p>
              </div>
              <div className="h-9 w-9 bg-medical-500/10 border border-medical-500/25 text-medical-600 font-bold rounded-lg flex items-center justify-center">
                {user.full_name[0].toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Route Page Container */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-[1400px] mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
