import { useAuth } from '../../hooks/useAuth';
import { Users, Calendar, PlusCircle, ArrowUpRight, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ReceptionistDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Welcome & Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Administrative desk, {user?.full_name}</h2>
          <p className="text-slate-500 text-sm mt-1">Manage outpatient registry, schedule check-ins, or process triage onboarding.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/receptionist/registrations" className="flex items-center gap-1.5 bg-medical-600 hover:bg-medical-700 text-white px-3.5 py-2 border border-transparent rounded-lg text-sm font-semibold transition-colors shadow-xs">
            <PlusCircle className="h-4 w-4" /> Register Patient
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="h-10 w-10 bg-teal-50 border border-teal-100 rounded-lg flex items-center justify-center text-teal-650 shadow-xs">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Patients</p>
            <p className="text-xl font-bold text-slate-800 mt-0.5">0 Active</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="h-10 w-10 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center text-blue-650 shadow-xs">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Scheduled Today</p>
            <p className="text-xl font-bold text-slate-800 mt-0.5">0 Booked</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="h-10 w-10 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 shadow-xs">
            <ArrowUpRight className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Triage Cases</p>
            <p className="text-xl font-bold text-slate-800 mt-0.5">0 Pending</p>
          </div>
        </div>
      </div>

      {/* Central Search Card */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-xs p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-800">Quick Patient Lookup</h3>
        <div className="relative max-w-xl">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4.5 w-4.5" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500 focus:border-medical-500 text-sm placeholder-slate-400 bg-slate-50 focus:bg-white transition-colors"
            placeholder="Search by full name, record ID, or phone number..."
          />
        </div>
      </div>

      {/* Grid Worksheets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-100 shadow-xs p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-800">Clinic Scheduling Log</h3>
          <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-450 flex flex-col items-center justify-center min-h-[180px]">
            <Calendar className="h-7 w-7 text-slate-300 mb-2" />
            <p className="text-sm font-semibold">No appointments booked today</p>
            <p className="text-xs text-slate-400 mt-1">Book or assign patients using the Scheduling tools.</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-xs p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-800">Recent Registrations</h3>
          <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-450 flex flex-col items-center justify-center min-h-[180px]">
            <Users className="h-7 w-7 text-slate-300 mb-2" />
            <p className="text-sm font-semibold">No patients registered today</p>
            <p className="text-xs text-slate-400 mt-1">Newly created patient accounts will appear here.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
