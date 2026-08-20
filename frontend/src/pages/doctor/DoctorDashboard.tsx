import { useAuth } from '../../hooks/useAuth';
import { Users, Calendar, HeartPulse, FileText, AlertTriangle, ShieldCheck } from 'lucide-react';

export const DoctorDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Greeting Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Welcome, {user?.full_name}</h2>
          <p className="text-slate-500 text-sm mt-1">Review clinical alerts, emergency queue, and active outpatient records.</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3.5 py-1.5 border border-emerald-200 rounded-lg text-xs font-semibold shadow-xs">
          <ShieldCheck className="h-4 w-4" /> CDSS System Verified
        </div>
      </div>

      {/* Clinical Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="h-10 w-10 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center text-blue-650 shadow-xs">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Today's Visits</p>
            <p className="text-xl font-bold text-slate-800 mt-0.5">0 Scheduled</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="h-10 w-10 bg-red-50 border border-red-100 rounded-lg flex items-center justify-center text-red-600 shadow-xs">
            <HeartPulse className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Emergency Queue</p>
            <p className="text-xl font-bold text-slate-800 mt-0.5">0 Active</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="h-10 w-10 bg-teal-50 border border-teal-100 rounded-lg flex items-center justify-center text-teal-650 shadow-xs">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Assigned Patients</p>
            <p className="text-xl font-bold text-slate-800 mt-0.5">0 Registered</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="h-10 w-10 bg-amber-50 border border-amber-100 rounded-lg flex items-center justify-center text-amber-600 shadow-xs">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Reports to Review</p>
            <p className="text-xl font-bold text-slate-800 mt-0.5">0 Pending</p>
          </div>
        </div>
      </div>

      {/* Main Clinical Outlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointments Queue */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-xs p-6 lg:col-span-2 space-y-4">
          <h3 className="text-base font-bold text-slate-800">Outpatient Consultation List</h3>
          <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400 flex flex-col items-center justify-center min-h-[220px]">
            <Calendar className="h-8 w-8 text-slate-300 mb-2" />
            <p className="text-sm font-semibold">No appointments scheduled for today</p>
            <p className="text-xs text-slate-400 mt-1">New check-ins will automatically pop up here.</p>
          </div>
        </div>

        {/* Emergency Triage Quick View */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-xs p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-800">Critical Priority Queue</h3>
            <span className="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Emergency</span>
          </div>
          <div className="border border-dashed border-slate-200 rounded-xl p-6 text-center text-slate-400 flex flex-col items-center justify-center min-h-[220px]">
            <AlertTriangle className="h-8 w-8 text-red-300 mb-2" />
            <p className="text-sm font-semibold text-slate-650">Emergency Queue Clear</p>
            <p className="text-xs text-slate-400 mt-1">High severity patients registered by reception will trigger alert audio.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
