import { useAuth } from '../../hooks/useAuth';
import { Users, Building, Shield, Calendar, History } from 'lucide-react';

export const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Admin Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">System Controls, {user?.full_name}</h2>
          <p className="text-slate-500 text-sm mt-1">Hospital management console, audit logging, and department statistics.</p>
        </div>
        <div className="bg-red-50 text-red-750 border border-red-200 rounded-lg px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 shadow-xs">
          <Shield className="h-4 w-4" /> Root Privileges Enabled
        </div>
      </div>

      {/* Main Admin Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="h-10 w-10 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center text-indigo-650 shadow-xs">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Clinicians</p>
            <p className="text-xl font-bold text-slate-800 mt-0.5">0 Active</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="h-10 w-10 bg-teal-50 border border-teal-100 rounded-lg flex items-center justify-center text-teal-650 shadow-xs">
            <Building className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Departments</p>
            <p className="text-xl font-bold text-slate-800 mt-0.5">5 Configured</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="h-10 w-10 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center text-blue-650 shadow-xs">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Appointments</p>
            <p className="text-xl font-bold text-slate-800 mt-0.5">0 Booked</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="h-10 w-10 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-slate-600 shadow-xs">
            <History className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Audit Operations</p>
            <p className="text-xl font-bold text-slate-800 mt-0.5">0 Logged</p>
          </div>
        </div>
      </div>

      {/* Main Administrative Views */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-100 shadow-xs p-6 lg:col-span-2 space-y-4">
          <h3 className="text-base font-bold text-slate-800">System Activity & Audit Log</h3>
          <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-450 flex flex-col items-center justify-center min-h-[220px]">
            <History className="h-8 w-8 text-slate-350 mb-2" />
            <p className="text-sm font-semibold">Activity log empty</p>
            <p className="text-xs text-slate-400 mt-1">Actions performed across the API will automatically trigger entry streams.</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-xs p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-800">Departments Directory</h3>
          <ul className="space-y-3.5">
            {['Cardiology', 'Pediatrics', 'General Medicine', 'Neurology', 'Orthopedics'].map((dept) => (
              <li key={dept} className="flex justify-between items-center px-4 py-3 bg-slate-50 rounded-lg border border-slate-150 hover:border-slate-300 transition-colors">
                <span className="text-sm font-semibold text-slate-750">{dept}</span>
                <span className="bg-medical-50 text-medical-600 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Active</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
